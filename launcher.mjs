import { spawn, execSync, exec } from 'node:child_process';
import { createConnection } from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const splashUrl = pathToFileURL(path.join(__dirname, 'splash.html')).href;
const targetUrl = 'http://localhost:5173/?mode=app';

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

// 第三步：檢查 5173 是否已在運行，若無則啟動本機服務
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

let devProcess = null;

async function ensureServerRunning() {
  const isRunning = await checkPort(5173);
  if (isRunning) {
    return;
  }

  devProcess = spawn('node', ['dev-all.mjs'], {
    stdio: 'ignore',
    shell: true,
  });

  // 等待伺服器就緒（最多等候 30 秒）
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await checkPort(5173)) {
      return;
    }
  }
}

await ensureServerRunning();

function cleanup() {
  if (devProcess && !devProcess.killed) {
    try {
      devProcess.kill();
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

