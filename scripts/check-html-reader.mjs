import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { DOMParser } from 'linkedom';
import { createServer } from 'vite';

// Static DOM parsing only. No browser, no lecture script execution or live AI.
globalThis.DOMParser = DOMParser;
const require = createRequire(import.meta.url);
const { importNotes } = require('../library-service.cjs');
const { readHtmlAsset } = require('../html-assets.cjs');
const tempBase = path.resolve(os.tmpdir());
const testRoot = fs.mkdtempSync(path.join(tempBase, 'wikitree-html-test-'));
const library = path.join(testRoot, 'library');
const options = { configuredPath: library };
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { prepareHtmlLecture, resolveLecturePath } = await vite.ssrLoadModule('/src/utils/htmlReader.ts');
  const { renamedNoteName } = await vite.ssrLoadModule('/src/utils/noteFormat.ts');
  assert.equal(renamedNoteName('講義.HTM', '新名稱.md'), '新名稱.HTM');
  assert.equal(renamedNoteName('講義.html', '新名稱.html'), '新名稱.html');
  assert.equal(renamedNoteName('筆記.md', '新名稱'), '新名稱.md');
  assert.equal(resolveLecturePath('../圖檔/圖片.png', '講義/pages/index.html'), '講義/圖檔/圖片.png');
  assert.equal(resolveLecturePath('images/a%23b.png', 'index.html'), 'images/a#b.png');
  assert.equal(resolveLecturePath('https://example.com/a.js', 'index.html'), null);
  assert.equal(resolveLecturePath('../.wikitree/key.js', 'pages/index.html'), null);

  const html = '<!doctype html><html><head><title>課堂</title><style>.card{color:blue;background:url(images/圖.png)}</style><link rel="stylesheet" href="styles/main.css"></head><body><h1 id="intro">原標題</h1><a href="#intro">目錄</a><details class="learning-note"><summary>問題</summary><p>原回答</p></details><img src="images/圖.png"><script>globalThis.lectureWasExecuted=true;</script><script src="js/toggle.js"></script><a href="next.html">下一頁</a><a href="https://example.com">來源</a></body></html>';
  const image = Buffer.from([0, 255, 128, 1, 2]);
  const files = [
    { path: '課堂/index.html', base64: Buffer.from(html).toString('base64') },
    { path: '課堂/next.html', content: '<html><head></head><body>另一頁</body></html>' },
    { path: '課堂/images/圖.png', base64: image.toString('base64') },
    { path: '課堂/styles/main.css', content: '@import "other.css"; .x{background:url(../images/圖.png)}' },
    { path: '課堂/styles/other.css', content: '.y{font-weight:700}' },
    { path: '課堂/js/toggle.js', content: 'document.querySelector("details").open=true;' },
  ];
  const first = importNotes({ files, destination: '收件苗圃' }, options);
  const second = importNotes({ files, destination: '收件苗圃' }, options);
  assert.equal(first.imported[0], '收件苗圃/課堂/index.html');
  assert.equal(second.imported[0], '收件苗圃/課堂 (2)/index.html');
  assert.equal(fs.readFileSync(path.join(library, first.imported[0]), 'utf8'), html);
  assert.deepEqual(fs.readFileSync(path.join(library, second.imported[2])), image);
  assert.equal(first.skipped.length, 0);
  assert.equal(fs.existsSync(path.join(library, '收件苗圃/課堂/index.md')), false);
  console.log('PASS HTML imports preserve bytes, attachments, relative folders, and independent repeat copies');

  const blobs = new Map();
  const result = await prepareHtmlLecture(html, first.imported[0], async relative => {
    const asset = readHtmlAsset(library, relative);
    return new Blob([asset.bytes], { type: asset.type });
  }, blob => { const url = `blob:https://app.test/${blobs.size}`; blobs.set(url, blob); return url; });
  const doc = new DOMParser().parseFromString(result.srcDoc, 'text/html');
  assert.equal(doc.querySelector('h1').textContent, '原標題');
  assert.equal(doc.querySelector('details').outerHTML, '<details class="learning-note"><summary>問題</summary><p>原回答</p></details>');
  assert.ok(result.srcDoc.includes('globalThis.lectureWasExecuted=true;'));
  assert.equal(globalThis.lectureWasExecuted, undefined);
  assert.equal(doc.querySelector('a').getAttribute('href'), '#intro');
  assert.equal(doc.querySelector('[data-wikitree-note]').getAttribute('data-wikitree-note'), '收件苗圃/課堂/next.html');
  assert.match(doc.head.firstElementChild.content, /connect-src 'none'/);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(Buffer.from(await blobs.get(doc.querySelector('img').getAttribute('src')).arrayBuffer()), image);
  const cssText = await blobs.get(doc.querySelector('link').getAttribute('href')).text();
  assert.match(cssText, /@import url\("blob:/);
  assert.match(cssText, /background:url\("blob:/);
  console.log('PASS static HTML preparation retains layout markers, folding, scripts, anchors, CSS imports and binary images');

  const doorHtml = '<html><head><style>.door{border:2px solid red}</style></head><body><a class="door" href="世界/下一份.html"><span>世界的門</span></a></body></html>';
  const door = await prepareHtmlLecture(doorHtml, '講義/index.html', async () => { throw Error('no assets needed'); });
  const doorDoc = new DOMParser().parseFromString(door.srcDoc, 'text/html');
  assert.equal(doorDoc.querySelector('.door').getAttribute('data-wikitree-note'), '講義/世界/下一份.html');
  assert.equal(doorDoc.querySelector('.door').innerHTML, '<span>世界的門</span>');
  assert.equal(doorDoc.querySelector('style').textContent, '.door{border:2px solid red}');
  console.log('PASS styled world-door links keep their presentation and target HTML inside child folders');

  const missing = await prepareHtmlLecture(html.replace('images/圖.png', 'missing.png'), first.imported[0], async relative => {
    const asset = readHtmlAsset(library, relative); return new Blob([asset.bytes], { type: asset.type });
  }, () => 'blob:test');
  assert.ok(missing.missing.some(item => item.endsWith('/missing.png')));
  for (const relative of ['../outside.css', '.wikitree/key.js', '歡迎來到 WikiTree.md', 'C:/secret.css']) {
    assert.throws(() => readHtmlAsset(library, relative));
  }
  const outside = path.join(testRoot, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'secret.css'), 'secret');
  fs.symlinkSync(outside, path.join(library, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => readHtmlAsset(library, 'escape/secret.css'), /不能離開/);

  let handler;
  vm.runInNewContext(fs.readFileSync(new URL('../cli-server.cjs', import.meta.url), 'utf8'), {
    require: name => name === 'http' ? { createServer: fn => { handler = fn; return { on() {}, listen() {} }; } }
      : name === './library-service.cjs' ? { ...require('../library-service.cjs'), ensureLibrary: () => ({ id: 'test-library', path: library }) }
      : require(name.startsWith('./') ? `../${name.slice(2)}` : name),
    process, TextDecoder, Buffer, URL, console, setTimeout, clearTimeout,
  });
  const request = (url, headers = {}, body = {}, method = 'POST') => new Promise(resolve => {
    const req = new EventEmitter();
    Object.assign(req, { url, method, headers });
    const res = { status: 200, setHeader() {}, writeHead(status) { this.status = status; }, end(data) { resolve({ status: this.status, data }); } };
    handler(req, res);
    req.emit('data', Buffer.from(JSON.stringify(body))); req.emit('end');
  });
  for (const endpoint of ['/api/workspace/read', '/api/workspace/write', '/api/workspace/delete', '/api/workspace/html-asset', '/api/library/import', '/api/ai/state']) {
    assert.equal((await request(endpoint, { origin: 'null' })).status, 403);
    assert.equal((await request(endpoint, { 'sec-fetch-site': 'cross-site' })).status, 403);
  }
  assert.equal((await request('/api/status?t=1', { origin: 'null' }, {}, 'GET')).status, 200);
  const assetResponse = await request('/api/workspace/html-asset', { origin: 'http://localhost:5173', 'x-wikitree-workspace': encodeURIComponent(library) }, { path: first.imported[2] });
  assert.equal(assetResponse.status, 200);
  assert.deepEqual(assetResponse.data, image);
  console.log('PASS isolated lectures cannot call note APIs; attachment traversal and junction escapes are blocked; splash still works');

  const { getFlatFileState } = await vite.ssrLoadModule('/src/utils/versionControl.ts');
  let imageReads = 0;
  const state = await getFlatFileState('unused', [
    { kind: 'file', name: 'note.html', path: 'note.html', handle: { getFile: async () => ({ text: async () => html }) } },
    { kind: 'file', name: 'image.png', path: 'image.png', handle: { getFile: async () => { imageReads++; throw Error('must not read binary as text'); } } },
  ]);
  assert.equal(imageReads, 0); assert.equal(state.get('note.html'), html);
  const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const open = app.slice(app.indexOf('const openFile ='), app.indexOf('const handleConvertHtmlCopy ='));
  assert.doesNotMatch(open, /writeFileContent|createFile|notionHtmlToMarkdown/);
  assert.match(app, /if \(!rootHandle \|\| !activeFile \|\| isHtmlReading\) return/);
  const reader = fs.readFileSync(new URL('../src/components/HtmlNoteReader.tsx', import.meta.url), 'utf8');
  assert.match(reader, /sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"/);
  assert.doesNotMatch(reader, /allow-same-origin|allow-forms|allow-top-navigation/);
  console.log('PASS opening HTML never writes a note, HTML saving is guarded, and binary assets stay out of text history');

  // Optional real handouts are read only and copied into the disposable test library.
  for (const source of process.argv.slice(2)) {
    const original = fs.readFileSync(source);
    const imported = importNotes({ destination: '講義核對', files: [{ path: path.basename(source), base64: original.toString('base64') }] }, options);
    assert.deepEqual(fs.readFileSync(path.join(library, imported.imported[0])), original);
    const prepared = await prepareHtmlLecture(original.toString('utf8'), imported.imported[0], async () => { throw Error('standalone handout'); }, () => 'blob:fixture');
    const before = new DOMParser().parseFromString(original.toString('utf8'), 'text/html');
    const after = new DOMParser().parseFromString(prepared.srcDoc, 'text/html');
    assert.equal(after.querySelectorAll('details').length, before.querySelectorAll('details').length);
    assert.equal(after.querySelectorAll('style').length, before.querySelectorAll('style').length);
    assert.equal(after.querySelectorAll('h1,h2,h3').length, before.querySelectorAll('h1,h2,h3').length);
    assert.deepEqual(fs.readFileSync(source), original);
    console.log(`PASS real handout static preservation: ${path.basename(source)} (${before.querySelectorAll('details').length} folding sections)`);
  }
} finally {
  await vite.close();
  if (!path.resolve(testRoot).startsWith(`${tempBase}${path.sep}`)) throw Error('Refusing cleanup outside temp directory.');
  fs.rmSync(testRoot, { recursive: true, force: true });
}
