import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { AiRpc } = require('../ai-rpc.cjs');
const { AiProviders, PROVIDERS, subscriptionEnv } = require('../ai-providers.cjs');
const { trustedAiRequest } = require('../ai-security.cjs');
const quickPickerSource = readFileSync(new URL('../src/components/AiQuickModelPicker.tsx', import.meta.url), 'utf8');
const providerOptionsSource = readFileSync(new URL('../src/utils/aiProviderOptions.ts', import.meta.url), 'utf8');
const pluginSource = readFileSync(new URL('../src/components/AntigravityPlugin.tsx', import.meta.url), 'utf8');
assert.match(providerOptionsSource, /id: 'agy', name: 'Google Gemini'/);
assert.doesNotMatch(providerOptionsSource, /Google.*Gemini.*google|\['google'/i);
assert.equal(pluginSource.split('<AiProviderPicker').length - 1, 1);
assert.ok(pluginSource.indexOf('<AiProviderPicker') > pluginSource.indexOf('設定面板'));
assert.equal(pluginSource.indexOf('<AiProviderPicker'), pluginSource.lastIndexOf('<AiProviderPicker'));
console.log('PASS provider picker is unique, named Google Gemini, and rendered inside the settings panel');

assert.equal(pluginSource.split('<AiQuickModelPicker').length - 1, 1);
assert.ok(pluginSource.indexOf('<AiQuickModelPicker') > pluginSource.indexOf('arborist-composer-tools'));
assert.match(quickPickerSource, /AI_PROVIDER_OPTIONS\.map\(provider =>/);
assert.match(quickPickerSource, /onChange\(\{ provider, model \}\)/);
assert.match(quickPickerSource, /role="listbox" aria-label="快速切換 AI 模型"/);
assert.match(quickPickerSource, /尚未連線，請先至設定連線/);
console.log('PASS quick model picker groups live models by provider and switches provider with the model');

const request = (origin, remote = '127.0.0.1', host = 'localhost:18080', header = '1') => ({
  socket: { remoteAddress: remote }, headers: { origin, host, 'x-wikitree-ai': header },
});
assert.ok(trustedAiRequest(request('http://localhost:5173')));
assert.ok(trustedAiRequest(request('http://127.0.0.1:5174', '::ffff:127.0.0.1')));
for (const req of [request('https://evil.test'), request('null'), request('http://localhost.evil.test'), request('http://localhost:5173', '192.168.1.2'), request(undefined, '127.0.0.1', 'evil.test:18080'), request(undefined, '127.0.0.1', 'localhost:18080', null)]) assert.equal(trustedAiRequest(req), false);
console.log('PASS login and model endpoints reject foreign origins, remote hosts and missing client header');

let child;
const sent = [];
const rpc = new AiRpc('fake', [], {}, () => {
  child = new EventEmitter();
  child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
  child.stdin = new EventEmitter(); child.stdin.write = line => sent.push(JSON.parse(line));
  child.kill = () => { child.killed = true; };
  return child;
});
const answer = rpc.request('test');
for (const byte of Buffer.from(JSON.stringify({ id: 1, result: { text: '中文模型' } }) + '\n')) child.stdout.emit('data', Buffer.from([byte]));
assert.deepEqual(await answer, { text: '中文模型' });
rpc.receive({ id: 80, method: 'session/request_permission', params: {} });
assert.equal(sent.at(-1).result.outcome.outcome, 'cancelled');
const errorResult = rpc.request('test');
rpc.receive({ id: 2, error: { code: 401, message: 'secret-token-private-diagnostic' } });
await assert.rejects(errorResult, error => !error.message.includes('secret-token'));
const closedResult = rpc.request('test');
rpc.close(); await assert.rejects(closedResult, /中斷/);
assert.ok(child.killed);
console.log('PASS UTF-8 RPC framing, permission refusal, safe errors and process cancellation');

const root = mkdtempSync(path.join(os.tmpdir(), 'wikitree-ai-mock-'));
const clients = [];
class FakeRpc extends EventEmitter {
  constructor() { super(); this.calls = []; this.loggedIn = false; this.closed = false; }
  send() {}
  async request(method, params) {
    this.calls.push({ method, params });
    if (method === 'initialize') return { authMethods: [{ id: 'oauth-personal' }] };
    if (method === 'account/read') return { account: this.loggedIn ? { type: 'chatgpt', email: 'private@example.test' } : null };
    if (method === 'account/login/start') return { authUrl: 'https://auth.openai.com/authorize?state=mock', loginId: 'login-1' };
    if (method === 'authenticate') { this.loggedIn = true; return {}; }
    if (method === 'model/list') return { data: [{ model: 'test-model', displayName: '測試模型', isDefault: true }], nextCursor: null };
    if (method === 'session/new') return { sessionId: 's1', models: { availableModels: [{ modelId: 'test-model', name: '測試模型' }], currentModelId: 'test-model' } };
    if (method === 'thread/start') return { thread: { id: 't1' } };
    if (method === 'turn/start' && !this.hold) {
      this.emit('notification', { method: 'item/agentMessage/delta', params: { threadId: 't1', delta: '即時文字' } });
      this.emit('notification', { method: 'turn/completed', params: { threadId: 't1', turn: { status: 'completed' } } });
    }
    if (method === 'session/prompt') {
      this.emit('notification', { method: 'session/update', params: { sessionId: 's1', update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'Google 文字' } } } });
      return { stopReason: 'end_turn' };
    }
    return {};
  }
  close() { if (!this.closed) { this.closed = true; this.emit('closed'); } }
}
const manager = new AiProviders({ root, rpcFactory: () => { const client = new FakeRpc(); clients.push(client); return client; } });
try {
  assert.deepEqual(PROVIDERS.map(provider => provider.id), ['agy', 'openai']);
  assert.equal(PROVIDERS.find(provider => provider.id === 'agy').name, 'Google Gemini');
  assert.equal(PROVIDERS.some(provider => provider.id === 'google'), false);
  const legacyGoogle = await manager.state('agy');
  assert.equal(legacyGoogle.status, 'connected');
  assert.equal(legacyGoogle.models[0].id, 'default');
  await assert.rejects(manager.state('google'), /有效/);
  console.log('PASS Anti-Gravity is exposed once as Google Gemini; duplicate Gemini provider is unavailable');
  assert.equal((await manager.state('openai')).status, 'disconnected');
  await assert.rejects(manager.run('openai', 'test-model', 'private note', () => {}, new AbortController().signal), /先登入/);
  assert.equal((await manager.login('openai')).status, 'pending');
  const codex = clients[0]; codex.loggedIn = true;
  codex.emit('notification', { method: 'account/login/completed', params: { success: true } });
  const state = await manager.state('openai');
  assert.equal(state.status, 'connected');
  assert.equal(state.models[0].id, 'test-model');
  assert.ok(!JSON.stringify(state).includes('private@example'));
  await assert.rejects(manager.run('openai', 'made-up-model', 'note', () => {}, new AbortController().signal), /模型/);
  const events = [];
  assert.equal(await manager.run('openai', 'test-model', 'private note', event => events.push(event), new AbortController().signal), '即時文字');
  assert.equal(events[0].text, '即時文字');
  const thread = codex.calls.find(call => call.method === 'thread/start');
  assert.equal(thread.params.sandbox, 'read-only');
  assert.ok(thread.params.cwd.startsWith(root));
  codex.hold = true;
  const controller = new AbortController();
  const pending = manager.run('openai', 'test-model', 'note', () => {}, controller.signal);
  await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(manager.run('openai', 'test-model', 'note', () => {}, new AbortController().signal), /進行中/);
  controller.abort(); await assert.rejects(pending, /中斷|停止/);
  assert.ok(codex.closed);
  await manager.disconnect('openai');
  assert.equal((await manager.state('openai')).status, 'disconnected');
  console.log('PASS Codex login gating, real model selection, privacy, streaming, concurrency and Stop');

  await assert.rejects(manager.run('unknown', 'test-model', 'note', () => {}, new AbortController().signal), /有效/);
  console.log('PASS only Google Gemini and OpenAI Codex remain; unknown providers never fall back');
  for (const provider of ['openai']) {
    const env = subscriptionEnv(provider, root);
    assert.equal(env.OPENAI_API_KEY, undefined);
    assert.equal(env.GEMINI_API_KEY, undefined);
    assert.equal(env.CODEX_HOME, root);
  }
  console.log('PASS isolated subscription credentials and no implicit API billing fallback');
} finally { manager.close(); }
