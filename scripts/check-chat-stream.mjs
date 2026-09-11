import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';
import vm from 'node:vm';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
let child;
const sandbox = { module: { exports: {} }, setTimeout, clearTimeout,
  require: name => name === 'node:child_process' ? { spawn: () => {
    child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.kill = () => { child.killed = true; }; return child;
  } } : require(name),
};
vm.runInNewContext(readFileSync(new URL('../agy-stream.cjs', import.meta.url), 'utf8'), sandbox);
const { runAgyStream } = sandbox.module.exports;
const events = [];
let pending = runAgyStream('mock', 'test', '.', event => events.push(event), new AbortController().signal);
const delta = JSON.stringify({ event: 'step_update', step_update: { step_type: 'agent_response', text_delta: '你好筆記' } }) + '\n';
for (const byte of Buffer.from(delta)) child.stdout.emit('data', Buffer.from([byte]));
assert.equal(events[0].text, '你好筆記'); // visible before result and process exit
child.stdout.emit('data', Buffer.from(JSON.stringify({ event: 'result', result: { status: 'SUCCESS', response: '你好筆記' } })));
child.emit('close', 0);
assert.equal(await pending, '你好筆記');
assert.equal(events.length, 1);
console.log('PASS immediate Chinese output across byte boundaries; final result is not duplicated');

pending = runAgyStream('mock', 'test', '.', () => {}, new AbortController().signal);
const incomplete = assert.rejects(pending, /未完整/);
child.emit('close', 0);
await incomplete;
const controller = new AbortController();
pending = runAgyStream('mock', 'test', '.', () => {}, controller.signal);
const aborted = assert.rejects(pending, /停止/);
controller.abort(); await aborted; assert.equal(child.killed, true);
console.log('PASS unfinished output rejected; cancellation stops child process');

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { readChatStream } = await vite.ssrLoadModule('/src/utils/chatStream.ts');
  let streamController;
  const stream = new ReadableStream({ start(value) { streamController = value; } });
  const received = [];
  const reading = readChatStream(new Response(stream), event => received.push(event));
  const encoder = new TextEncoder();
  for (const byte of encoder.encode(JSON.stringify({ type: 'delta', text: '逐步顯示' }) + '\n')) streamController.enqueue(new Uint8Array([byte]));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(received[0].text, '逐步顯示');
  streamController.enqueue(encoder.encode(JSON.stringify({ type: 'done', text: '逐步顯示' })));
  streamController.close(); await reading;
  assert.equal(received.length, 2);
  await assert.rejects(readChatStream(new Response('{"type":"delta","text":"保留"}\n'), () => {}), /連線中斷/);
  await assert.rejects(readChatStream(new Response('{"type":"error","text":"測試錯誤"}\n'), () => {}), /測試錯誤/);
  console.log('PASS client displays text before stream ends and detects interrupted/error responses');
} finally { await vite.close(); }
