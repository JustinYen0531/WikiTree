const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { AiProviders } = require('./ai-providers.cjs');
const { runAgyStream } = require('./agy-stream.cjs');
const { runExploration } = require('./exploration-runner.cjs');
const { notifyWindows } = require('./exploration-notify.cjs');

function resolveAgyPath() {
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const candidates = process.platform === 'win32'
    ? [path.join(local, 'agy', 'bin', 'agy.exe')]
    : [path.join(os.homedir(), '.local', 'bin', 'agy'), '/usr/local/bin/agy'];
  return candidates.find(candidate => fs.existsSync(candidate)) || (process.platform === 'win32' ? 'agy.exe' : 'agy');
}

async function withProviderLock(root, action) {
  fs.mkdirSync(root, { recursive: true });
  const lockFile = path.join(root, 'provider.lock');
  try {
    const stat = fs.statSync(lockFile);
    if (Date.now() - stat.mtimeMs > 10 * 60 * 1000) fs.unlinkSync(lockFile);
  } catch {}
  let handle;
  try { handle = fs.openSync(lockFile, 'wx', 0o600); }
  catch { throw new Error('另一個探索或 AI 回覆正在執行，請稍後再試。'); }
  try { return await action(); }
  finally {
    try { fs.closeSync(handle); } catch {}
    try { fs.unlinkSync(lockFile); } catch {}
  }
}

function createExplorationExecutor(options) {
  const store = options.store;
  const providers = options.aiProviders || new AiProviders();
  const agyPath = options.agyPath || resolveAgyPath();
  const notify = options.notify || notifyWindows;
  return async ({ workspace, task, scheduledFor = null, origin = 'scheduled_ai_exploration', runId }) => {
    const generate = (prompt, emit) => withProviderLock(store.rootPath(), async () => {
      const session = path.join(store.rootPath(), 'sessions', crypto.randomUUID());
      fs.mkdirSync(session, { recursive: true, mode: 0o700 });
      const controller = new AbortController();
      try {
        if (task.provider === 'agy') return await runAgyStream(agyPath, prompt, session, emit, controller.signal, 180000);
        return await providers.runExploration(task.provider, task.model, prompt, emit, controller.signal);
      } finally {
        const sessionsRoot = path.resolve(store.rootPath(), 'sessions');
        const target = path.resolve(session);
        if (target.startsWith(`${sessionsRoot}${path.sep}`)) {
          try { fs.rmSync(target, { recursive: true, force: true }); } catch {}
        }
      }
    });
    const run = await runExploration({
      store,
      workspace,
      taskId: task.id,
      scheduledFor,
      origin,
      runId,
      generate,
      onEvent: options.onEvent,
    });
    if (task.notificationEnabled) notify('WikiTree 探索苗圃', `${task.name}：已收進 ${run.itemIds.length} 筆新素材。`);
    return run;
  };
}

module.exports = { createExplorationExecutor, resolveAgyPath, withProviderLock };
