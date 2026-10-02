import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createConnection } from 'node:net';
import { isCompatibleCliStatus } from './launcher-health.mjs';

// A separate local entrance keeps the desktop checkout and its running services intact.
const root = path.dirname(fileURLToPath(import.meta.url));
const webPort = 5174, cliPort = 18180;
const webUrl = `http://localhost:${webPort}/`;
const cliUrl = `http://localhost:${cliPort}/api/status`;
const portOpen = port => new Promise(resolve => {
  const socket = createConnection({ port, host: 'localhost' });
  socket.once('connect', () => { socket.destroy(); resolve(true); });
  socket.once('error', () => resolve(false));
});
const status = async () => {
  try {
    const response = await fetch(cliUrl, { signal: AbortSignal.timeout(1500) });
    return response.ok ? response.json() : null;
  } catch { return null; }
};
let child;
const stop = () => { if (child && !child.killed) child.kill(); };
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });

try {
  const [webRunning, cliRunning, cliStatus] = await Promise.all([portOpen(webPort), portOpen(cliPort), status()]);
  if (webRunning || cliRunning) {
    if (!webRunning || !isCompatibleCliStatus(cliStatus, root)) throw Error('試用入口已被其他程式占用，請先關閉之前的試用服務。');
  } else {
    child = spawn(process.execPath, ['dev-all.mjs'], {
      cwd: root, stdio: 'inherit', windowsHide: true,
      env: { ...process.env, WIKITREE_CLI_PORT: String(cliPort), WIKITREE_WEB_PORT: String(webPort), VITE_WIKITREE_CLI_PORT: String(cliPort) },
    });
    child.once('error', error => { console.error(error.message); process.exitCode = 1; });
    child.once('exit', code => { console.log('試用服務已關閉。'); process.exit(code || 0); });
    let ready = false;
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw Error('試用服務尚未完成啟動就停止了。');
      if (await portOpen(webPort) && isCompatibleCliStatus(await status(), root)) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!ready) throw Error('試用服務未能在 30 秒內完成啟動。');
  }
  console.log(`HTML 講義閱讀試用已就緒：${webUrl}`);
  console.log('這個入口與原桌面版本並存，使用同一份「文件／WikiTree」筆記；請避免同時編輯同一份筆記。');
  if (process.env.WIKITREE_SKIP_SPLASH !== '1') {
    execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${webUrl}'`], { windowsHide: true });
  }
} catch (error) {
  stop();
  console.error(error.message);
  process.exitCode = 1;
}
