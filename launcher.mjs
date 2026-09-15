import { spawn, execSync, exec, execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isCompatibleCliStatus, readCliStatus, sameWorkspace } from './launcher-health.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const splashUrl = pathToFileURL(path.join(__dirname, 'splash.html')).href;

// 第一步：立即開啟黑白開場動畫視窗（無終端機黑框，中央 Logo + 下方進度條）
function launchSplashWindow() {
  const edgeCmd = `start msedge --app="${splashUrl}"`;
  const chromeCmd = `start chrome --app="${splashUrl}"`;
  const defaultCmd = `start "" "${splashUrl}"`;

  exec(edgeCmd, (err) => {
    if (err) {
      exec(chromeCmd, (err2) => {
        if (err2) {
          exec(defaultCmd);
        }
      });
    }
  });
}

launchSplashWindow();

// 第二步：檢查並在背景同步 Git 最新版本
try {
  execSync('git pull', { encoding: 'utf-8', stdio: 'pipe' });
} catch (err) {
  // 無網路或同步失敗時直接跳過，不影響本機啟動
}

// 第三步：同時確認畫面與筆記核心都是目前版本
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

function stopStaleCli() {
  if (process.platform !== 'win32') {
    throw new Error('偵測到舊版 WikiTree 核心，請先關閉舊服務後再重新啟動。');
  }

  const command = [
    "$listeners = Get-NetTCPConnection -LocalPort 18080 -State Listen -ErrorAction SilentlyContinue",
    "foreach ($listener in $listeners) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop }",
  ].join('; ');

  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
    cwd: __dirname,
    stdio: 'ignore',
    windowsHide: true,
  });
}

function spawnBackground(script) {
  const child = spawn(process.execPath, [script], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
}

async function ensureServerRunning() {
  const webRunning = await checkPort(5173);
  const cliStatus = await readCliStatus();

  if (webRunning && isCompatibleCliStatus(cliStatus, __dirname)) {
    return;
  }

  if (cliStatus && !isCompatibleCliStatus(cliStatus, __dirname)) {
    if (!sameWorkspace(cliStatus, __dirname)) {
      throw new Error('另一個 WikiTree 工作區正在使用筆記核心，請先關閉它。');
    }
    stopStaleCli();
  } else if (!cliStatus && await checkPort(18080)) {
    throw new Error('筆記核心的連接埠被其他程式占用，請先關閉占用程式。');
  }

  if (webRunning) {
    spawnBackground('cli-server.cjs');
  } else {
    spawnBackground('dev-all.mjs');
  }

  // 等待畫面與目前版本的筆記核心就緒（最多等候 30 秒）
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const nextStatus = await readCliStatus();
    if (await checkPort(5173) && isCompatibleCliStatus(nextStatus, __dirname)) {
      return;
    }
  }

  throw new Error('WikiTree 未能在 30 秒內完成啟動。');
}

await ensureServerRunning();
