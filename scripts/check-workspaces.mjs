import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

// In-memory tests only: no browser, no listening server, no user's files touched.
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { workspaceId, readWorkspaceMemory, writeWorkspaceMemory } = await vite.ssrLoadModule('/src/utils/workspaceMemory.ts');
  const a = { id: workspaceId('C:\\Notes'), name: 'Notes', handle: 'C:\\Notes' };
  const b = { id: workspaceId('D:\\Notes'), name: 'Notes', handle: 'D:\\Notes' };
  assert.equal(workspaceId('c:/NOTES/'), a.id);
  assert.notEqual(a.id, b.id);
  writeWorkspaceMemory([a, b], b.id);
  assert.deepEqual(readWorkspaceMemory().folders.map(item => item.id), [a.id, b.id]);
  assert.equal(readWorkspaceMemory().activeId, b.id);
  writeWorkspaceMemory([a], a.id);
  assert.equal(readWorkspaceMemory().folders.length, 1);
  writeWorkspaceMemory([], null);
  assert.equal(readWorkspaceMemory().folders.length, 0);
  storage.set('wikitree-folders-v1:http://localhost:18080', '{broken');
  assert.equal(readWorkspaceMemory().folders.length, 0);
  console.log('PASS folder memory, duplicate paths, same names, removal, malformed storage');
  const { loadNoteAssignments, saveNoteAssignments } = await vite.ssrLoadModule('/src/utils/noteCatalog.ts');
  storage.set('nccu_hub_note_assignments', JSON.stringify([{ notePath: 'same.md', id: 'old' }]));
  const legacy = loadNoteAssignments(a.id);
  saveNoteAssignments(legacy, a.id);
  assert.equal(loadNoteAssignments(a.id).length, 1);
  assert.equal(loadNoteAssignments(b.id).length, 0);
  saveNoteAssignments([{ notePath: 'same.md', id: 'other' }], b.id);
  assert.equal(loadNoteAssignments(a.id)[0].id, 'old');
  console.log('PASS same-name note categories stay separate; legacy categories preserved');

  const fsClient = await vite.ssrLoadModule('/src/utils/fileSystem.ts');
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ scopedWorkspaces: true, files: [{ name: 'note.md', path: 'note.md', kind: 'file' }], content: 'text' }) };
  };
  const [node] = await fsClient.getFilesRecursively(a.handle);
  await fsClient.writeFileContent(node.handle, 'new');
  const parent = await fsClient.getDirectoryHandleByPath(a.handle, '');
  const created = await fsClient.createFile(parent, 'new.md');
  await fsClient.writeFileContent(created, 'new');
  for (const call of calls) assert.equal(decodeURIComponent(call.options.headers['X-WikiTree-Workspace']), a.handle);
  console.log('PASS folder identity follows listed and newly created files');

  const { default: React } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Sidebar } = await vite.ssrLoadModule('/src/components/Sidebar.tsx');
  const noop = () => {};
  const markup = renderToStaticMarkup(React.createElement(Sidebar, {
    workspaceFolders: [a, b], activeWorkspaceId: a.id, workspaceBusy: false,
    rootHandle: a.handle, workspaceName: a.name, files: [{ name: 'hidden-note.md', path: 'hidden-note.md', kind: 'file' }], activeFile: null,
    activeTab: 'files', setActiveTab: noop, onAddWorkspace: noop, onExpandWorkspace: noop, onActivateWorkspace: noop,
    onRemoveWorkspace: noop, onSelectWorkspaceFile: noop, onSelectFile: noop, onCreateFile: noop, onCreateFolder: noop, onRename: noop, onDelete: noop,
  }));
  assert.equal((markup.match(/aria-expanded="false"/g) || []).length, 2);
  assert.ok(!markup.includes('hidden-note'));
  assert.ok(markup.includes('不刪除檔案'));
  console.log('PASS two sidebar roots start collapsed and offer non-deleting removal');
} finally { await vite.close(); }

const require = createRequire(new URL('../cli-server.cjs', import.meta.url));
const rootA = path.resolve('mock-folder-A');
const rootB = path.resolve('mock-folder-B');
const dirs = new Set([rootA, rootB]);
const writes = new Map();
const fakeFs = {
  existsSync: target => dirs.has(target) || writes.has(target),
  statSync: target => { if (!dirs.has(target)) throw Error('missing'); return { isDirectory: () => true }; },
  mkdirSync: target => dirs.add(target),
  readdirSync: () => [],
  writeFileSync: (target, value) => writes.set(target, value),
  readFileSync: target => writes.get(target) || '',
};
let handler;
vm.runInNewContext(readFileSync(new URL('../cli-server.cjs', import.meta.url), 'utf8'), {
  require: name => name === 'fs' ? fakeFs : name === 'http' ? { createServer: fn => { handler = fn; return { on() {}, listen() {} }; } } : require(name),
  process, TextDecoder, Buffer, URL, console, setTimeout, clearTimeout,
});
const request = (url, body, root) => new Promise(resolve => {
  const req = new EventEmitter();
  Object.assign(req, { url, method: 'POST', headers: root ? { 'x-wikitree-workspace': encodeURIComponent(root) } : {} });
  const res = { status: 200, setHeader() {}, writeHead(code) { this.status = code; }, end(data) { resolve({ status: this.status, data }); } };
  handler(req, res);
  req.emit('data', JSON.stringify(body));
  req.emit('end');
});
await request('/api/workspace/open', { path: rootB });
assert.equal((await request('/api/workspace/write', { path: 'same.md', content: 'A' }, rootA)).status, 200);
assert.equal((await request('/api/workspace/write', { path: 'same.md', content: 'B' }, rootB)).status, 200);
assert.equal(writes.get(path.join(rootA, 'same.md')), 'A');
assert.equal(writes.get(path.join(rootB, 'same.md')), 'B');
const missing = path.resolve('mock-missing');
assert.equal((await request('/api/workspace/files', {}, missing)).status, 404);
assert.ok(!dirs.has(missing));
assert.equal((await request('/api/workspace/open', { path: missing, create: false })).status, 500);
assert.ok(!dirs.has(missing));
console.log('PASS desktop requests stay in their folders; missing folders are not recreated');
