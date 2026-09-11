const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { AiRpc } = require('./ai-rpc.cjs');

const PROVIDERS = [
  { id: 'agy', name: 'Antigravity（原有服務）' },
  { id: 'google', name: 'Google · Gemini' },
  { id: 'openai', name: 'OpenAI · Codex' },
  { id: 'claude', name: 'Anthropic · Claude' },
];
const CLAUDE_NOTICE = 'Claude 訂閱目前不開放第三方應用程式登入；此入口尚不能生成，也不會改用另外計費的 API。';

function subscriptionEnv(provider, home) {
  const env = { ...process.env };
  // Never silently fall back to separately billed API credentials or a proxy.
  for (const key of Object.keys(env)) {
    if (/^(OPENAI_|CODEX_|GEMINI_|GOOGLE_|ANTHROPIC_|CLAUDE_)/i.test(key)) delete env[key];
  }
  if (provider === 'openai') env.CODEX_HOME = home;
  else {
    env.GEMINI_CLI_HOME = home;
    env.GEMINI_FORCE_FILE_STORAGE = 'true';
  }
  return env;
}

function codexBinary() {
  if (process.env.WIKITREE_CODEX_BINARY) return process.env.WIKITREE_CODEX_BINARY;
  const candidate = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', 'OpenAI', 'Codex', 'bin', 'codex.exe');
  return process.platform === 'win32' && fs.existsSync(candidate) ? candidate : 'codex';
}

class AiProviders {
  constructor({ root = path.join(os.homedir(), '.wikitree', 'ai'), rpcFactory = (...args) => new AiRpc(...args) } = {}) {
    this.root = root;
    this.rpcFactory = rpcFactory;
    this.clients = new Map();
    this.states = new Map();
    this.models = new Map();
    this.busy = new Set();
  }

  validate(provider) {
    if (!PROVIDERS.some(item => item.id === provider)) throw new Error('請選擇有效的 AI 廠商。');
    if (provider === 'claude') throw new Error(CLAUDE_NOTICE);
  }

  async client(provider) {
    this.validate(provider);
    if (this.clients.has(provider)) return this.clients.get(provider);
    const pending = this.startClient(provider);
    this.clients.set(provider, pending);
    try { return await pending; }
    catch (error) { this.clients.delete(provider); throw error; }
  }

  async startClient(provider) {
    const home = path.join(this.root, provider);
    const cwd = path.join(home, 'session');
    fs.mkdirSync(cwd, { recursive: true, mode: 0o700 });
    const env = subscriptionEnv(provider, home);
    let command, args;
    if (provider === 'openai') {
      command = codexBinary();
      args = ['app-server', '--listen', 'stdio://', '-c', 'features.shell_tool=false', '-c', 'web_search="disabled"'];
    } else {
      command = process.execPath;
      const pkg = require.resolve('@google/gemini-cli/package.json');
      args = [path.join(path.dirname(pkg), 'bundle', 'gemini.js'), '--acp'];
      const settingsDir = path.join(home, '.gemini');
      fs.mkdirSync(settingsDir, { recursive: true, mode: 0o700 });
      const settingsPath = path.join(settingsDir, 'settings.json');
      let settings = {};
      try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch {}
      // An explicit non-matching allowlist disables built-in tools. Only the
      // note text supplied in the request is needed for generation.
      settings.tools = { core: ['__wikitree_text_only__'] };
      settings.mcpServers = {};
      settings.hooks = {};
      fs.writeFileSync(settingsPath, JSON.stringify(settings), { mode: 0o600 });
    }
    const rpc = this.rpcFactory(command, args, { cwd, env });
    rpc.cwd = cwd;
    rpc.on('closed', () => {
      clearTimeout(rpc.loginTimer);
      this.clients.delete(provider);
      this.models.delete(provider);
      this.states.set(provider, { status: 'disconnected', message: '連線已結束；可重新連線，仍有效的授權會沿用。' });
    });
    rpc.on('notification', event => {
      if (provider === 'openai' && event.method === 'account/login/completed') {
        clearTimeout(rpc.loginTimer);
        this.states.set(provider, { status: event.params.success ? 'connected' : 'error', message: event.params.success ? '登入完成。' : '登入未完成，請重試。' });
      }
    });
    try {
      if (provider === 'openai') {
        await rpc.request('initialize', { clientInfo: { name: 'wikitree', title: 'WikiTree', version: '1.0.0' } });
        rpc.send({ method: 'initialized', params: {} });
      } else {
        const init = await rpc.request('initialize', { protocolVersion: 1, clientInfo: { name: 'wikitree', version: '1.0.0' }, clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false } });
        if (!init.authMethods?.some(method => method.id === 'oauth-personal')) throw new Error('此版本未提供 Google 帳號登入。');
      }
      return rpc;
    } catch (error) { rpc.close(); throw error; }
  }

  async state(provider) {
    if (provider === 'claude') return { status: 'unsupported', message: CLAUDE_NOTICE, models: [] };
    this.validate(provider);
    if (provider === 'agy') return { status: 'connected', message: '沿用原有 Antigravity 登入與模型設定。', models: [{ id: 'default', name: '目前預設模型' }] };
    let state = this.states.get(provider) || { status: 'disconnected', message: '首次使用請登入並授權。' };
    if (provider === 'openai' && state.status !== 'pending' && !state.manualDisconnect) {
      try {
        const rpc = await this.client(provider);
        const account = await rpc.request('account/read', { refreshToken: false });
        state = { status: account.account?.type === 'chatgpt' ? 'connected' : 'disconnected', message: account.account?.type === 'chatgpt' ? 'ChatGPT 帳號已連線。' : '首次使用請登入 ChatGPT 並授權。' };
        this.states.set(provider, state);
      } catch { state = { status: 'error', message: '無法啟動 Codex，請安裝或更新官方 Codex CLI 後重試。' }; }
    }
    if (state.status === 'connected' && !this.models.has(provider)) {
      try { await this.loadModels(provider); }
      catch { return { status: 'error', message: '無法取得模型，請重新連線或檢查帳號權限。', models: [] }; }
    }
    return { ...state, models: this.models.get(provider) || [] };
  }

  async loadModels(provider) {
    const rpc = await this.client(provider);
    if (provider === 'openai') {
      const models = [];
      let cursor;
      do {
        const result = await rpc.request('model/list', { limit: 100, includeHidden: false, ...(cursor ? { cursor } : {}) });
        models.push(...result.data.filter(model => !model.hidden).map(model => ({ id: model.model, name: model.displayName || model.model, isDefault: model.isDefault })));
        cursor = result.nextCursor;
      } while (cursor);
      this.models.set(provider, models);
    } else {
      const session = await rpc.request('session/new', { cwd: rpc.cwd, mcpServers: [] }, 60000);
      rpc.preparedSession = session;
      this.models.set(provider, (session.models?.availableModels || []).map(model => ({ id: model.modelId, name: model.name || model.modelId, isDefault: model.modelId === session.models.currentModelId })));
    }
  }

  async login(provider) {
    this.validate(provider);
    if (provider === 'agy') return this.state(provider);
    if (this.busy.has(provider)) throw new Error('請先停止目前的回覆，再調整登入。');
    if (this.states.get(provider)?.status === 'pending') return this.state(provider);
    const rpc = await this.client(provider);
    this.models.delete(provider);
    this.states.set(provider, { status: 'pending', message: '請在廠商的登入頁面完成授權。' });
    rpc.loginTimer = setTimeout(() => rpc.close(), 300000);
    if (provider === 'openai') {
      try {
        const login = await rpc.request('account/login/start', { type: 'chatgpt' });
        const url = new URL(login.authUrl);
        if (url.protocol !== 'https:' || !['auth.openai.com', 'auth0.openai.com', 'chatgpt.com'].includes(url.hostname)) throw new Error('登入網址無法確認。');
        if (this.states.get(provider)?.status === 'pending') {
          this.states.set(provider, { status: 'pending', message: '開啟官方登入頁面，完成後此處會自動更新。', authUrl: url.href });
        }
      } catch {
        clearTimeout(rpc.loginTimer);
        this.states.set(provider, { status: 'error', message: '無法開始登入，請取消後重試。' });
      }
    } else {
      // Gemini opens its own official browser login; WikiTree never handles the token.
      void rpc.request('authenticate', { methodId: 'oauth-personal' }, 300000).then(async () => {
        await this.loadModels(provider);
        clearTimeout(rpc.loginTimer);
        if (rpc.closed) return;
        this.states.set(provider, { status: 'connected', message: 'Google 帳號已連線。' });
      }).catch(() => {
        clearTimeout(rpc.loginTimer);
        if (rpc.closed) return;
        this.states.set(provider, { status: 'error', message: 'Google 登入或模型讀取未完成，請重新連線。' });
      });
    }
    return this.state(provider);
  }

  async disconnect(provider) {
    this.validate(provider);
    if (this.busy.has(provider)) throw new Error('請先停止目前的回覆。');
    if (this.clients.has(provider)) (await this.clients.get(provider)).close();
    this.models.delete(provider);
    this.states.set(provider, { status: 'disconnected', manualDisconnect: true, message: '已中斷連線；下次會沿用仍有效的授權。' });
    return { ...this.states.get(provider), models: [] };
  }

  async run(provider, model, prompt, emit, signal) {
    this.validate(provider);
    if (this.busy.has(provider)) throw new Error('這個廠商已有一則回覆進行中，請稍後再試。');
    this.busy.add(provider);
    let rpc;
    try {
      const state = await this.state(provider);
      if (state.status !== 'connected') throw new Error('請先登入所選廠商。');
      if (!state.models.some(item => item.id === model)) throw new Error('所選模型已不可用，請重新選擇。');
      if (signal.aborted) throw new Error('回覆已停止。');
      rpc = await this.client(provider);
      return await this.generate(provider, rpc, model, prompt, emit, signal);
    } finally { this.busy.delete(provider); }
  }

  async generate(provider, rpc, model, prompt, emit, signal) {
    let text = '';
    let sessionId;
    let finish;
    const result = new Promise((resolve, reject) => { finish = error => error ? reject(error) : resolve(text); });
    // Attach rejection handling before starting asynchronous setup.
    result.catch(() => {});
    const cancel = () => { rpc.close(); finish(new Error('回覆已停止，已收到的文字仍保留。')); };
    const closed = () => finish(new Error('AI 連線中斷，已收到的文字仍保留。'));
    const timeout = setTimeout(cancel, 180000);
    const notification = event => {
      const params = event.params || {};
      if (provider === 'openai' && params.threadId === sessionId) {
        if (event.method === 'item/agentMessage/delta') { text += params.delta; emit({ type: 'delta', text: params.delta }); }
        if (event.method === 'turn/completed') finish(params.turn.status === 'completed' ? null : new Error('廠商未完成回覆，請確認額度或稍後重試。'));
      }
      if (provider === 'google' && params.sessionId === sessionId && params.update?.sessionUpdate === 'agent_message_chunk' && params.update.content?.type === 'text') {
        const delta = params.update.content.text;
        text += delta; emit({ type: 'delta', text: delta });
      }
    };
    rpc.on('notification', notification);
    rpc.on('closed', closed);
    signal.addEventListener('abort', cancel, { once: true });
    try {
      if (signal.aborted) throw new Error('回覆已停止。');
      if (provider === 'openai') {
        const session = await rpc.request('thread/start', { model, cwd: rpc.cwd, sandbox: 'read-only', approvalPolicy: 'never', ephemeral: true, developerInstructions: 'You generate WikiTree note text only. Do not execute commands, use tools, read files, or write files. Use only the context in the user message.' });
        sessionId = session.thread.id;
        await rpc.request('turn/start', { threadId: sessionId, input: [{ type: 'text', text: prompt, text_elements: [] }] });
      } else {
        const session = rpc.preparedSession || await rpc.request('session/new', { cwd: rpc.cwd, mcpServers: [] }, 60000);
        rpc.preparedSession = null;
        sessionId = session.sessionId;
        await rpc.request('session/set_model', { sessionId, modelId: model });
        void rpc.request('session/prompt', { sessionId, prompt: [{ type: 'text', text: prompt }] }, 180000)
          .then(value => finish(value.stopReason === 'end_turn' ? null : new Error('回覆尚未完成，請重試。'))).catch(finish);
      }
      const reply = await result;
      if (!reply.trim()) throw new Error('廠商未回傳文字。');
      return reply;
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', cancel);
      rpc.removeListener('notification', notification);
      rpc.removeListener('closed', closed);
    }
  }

  close() { for (const pending of this.clients.values()) void pending.then(rpc => rpc.close()).catch(() => {}); }
}

module.exports = { AiProviders, PROVIDERS, subscriptionEnv };
