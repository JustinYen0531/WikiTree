import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ensureLibrary, importNotes, normalizeImportPath, resolveLibraryPath } = require('../library-service.cjs');

const tempBase = path.resolve(os.tmpdir());
const testRoot = fs.mkdtempSync(path.join(tempBase, 'wikitree-library-test-'));
const libraryPath = path.join(testRoot, 'Documents', 'WikiTree');

try {
  assert.equal(resolveLibraryPath({ homeDir: testRoot }), libraryPath);

  const options = {
    configuredPath: libraryPath,
    randomUUID: () => 'library-test-id',
    now: () => '2026-09-16T00:00:00.000Z',
  };
  const first = ensureLibrary(options);
  assert.equal(first.created, true);
  assert.equal(first.id, 'library-test-id');
  assert.ok(fs.statSync(path.join(libraryPath, '我的森林')).isDirectory());
  assert.ok(fs.statSync(path.join(libraryPath, '收件苗圃')).isDirectory());
  assert.match(fs.readFileSync(path.join(libraryPath, '歡迎來到 WikiTree.md'), 'utf8'), /屬於你的知識天地/);

  fs.writeFileSync(path.join(libraryPath, '歡迎來到 WikiTree.md'), 'user-edited', 'utf8');
  const reopened = ensureLibrary(options);
  assert.equal(reopened.created, false);
  assert.equal(fs.readFileSync(path.join(libraryPath, '歡迎來到 WikiTree.md'), 'utf8'), 'user-edited');
  console.log('PASS managed library path, first-run structure, stable identity, and non-destructive reopen');

  fs.writeFileSync(path.join(libraryPath, '收件苗圃', '同名.md'), 'existing', 'utf8');
  const result = importNotes({
    destination: '收件苗圃',
    files: [
      { path: '同名.md', content: 'new note' },
      { path: '課堂資料/重點.txt', content: 'plain text' },
      { path: '課堂資料/圖片.png', content: 'not imported' },
    ],
  }, options);
  assert.deepEqual(result.imported, ['收件苗圃/同名 (2).md', '收件苗圃/課堂資料/重點.md']);
  assert.equal(result.skipped.length, 1);
  assert.equal(fs.readFileSync(path.join(libraryPath, '收件苗圃', '同名.md'), 'utf8'), 'existing');
  assert.equal(fs.readFileSync(path.join(libraryPath, '收件苗圃', '同名 (2).md'), 'utf8'), 'new note');
  assert.equal(fs.readFileSync(path.join(libraryPath, '收件苗圃', '課堂資料', '重點.md'), 'utf8'), 'plain text');
  assert.throws(() => normalizeImportPath('../outside.md'), /無法使用/);
  assert.throws(() => importNotes({ destination: '../outside', files: [{ path: 'note.md', content: 'x' }] }, options), /無法使用/);
  console.log('PASS import preview contract: copies notes, converts text, preserves folders, skips unsupported files, blocks traversal, and never overwrites');

  const [server, app, sidebar, modal, plan] = [
    'cli-server.cjs',
    'src/App.tsx',
    'src/components/Sidebar.tsx',
    'src/components/ImportToWikiTreeModal.tsx',
    'docs/WIKITREE_OWNED_LIBRARY_PLAN.md',
  ].map(file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
  assert.match(server, /\/api\/library/);
  assert.match(server, /managedLibrary: true/);
  assert.match(app, /getManagedLibrary\(\)/);
  assert.doesNotMatch(app, /showDirectoryPicker/);
  assert.match(sidebar, /收進 WikiTree/);
  assert.match(sidebar, /我的 WIKITREE/);
  assert.match(modal, /外部原檔會保留/);
  assert.match(modal, /收進哪裡？/);
  assert.match(plan, /本次第一版製作程度/);
  assert.match(plan, /長期完整願景製作程度/);
  console.log('PASS WikiTree-owned entry, local copy promise, destination choice, and progress document');
} finally {
  const resolvedTestRoot = path.resolve(testRoot);
  if (!resolvedTestRoot.startsWith(`${tempBase}${path.sep}`)) throw new Error('Refusing to remove a path outside the test temp directory.');
  fs.rmSync(resolvedTestRoot, { recursive: true, force: true });
}
