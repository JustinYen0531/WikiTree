import assert from 'node:assert/strict';
import { createServer } from 'vite';

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
