import { spawn, execSync, exec } from 'node:child_process';
import { createConnection } from 'node:net';

console.log('\x1b[32m======================================================\x1b[0m');
console.log('\x1b[1;36m             🌳 WikiTree 桌面啟動器 🌳                \x1b[0m');
console.log('\x1b[32m======================================================\x1b[0m\n');

// 第一步：檢查並同步 Git 最新版本
console.log('\x1b[33m[1/3] 正在同步 Git 最新進度 (git pull)...\x1b[0m');
try {
  const pullOutput = execSync('git pull', { encoding: 'utf-8', stdio: 'pipe' });
  console.log(pullOutput.trim());
  console.log('\x1b[32m✔ Git 同步完成！\x1b[0m\n');
} catch (err) {
  console.log('\x1b[31m⚠ Git 同步遇到狀況或無網路，將使用本機最新代碼繼續啟動。\x1b[0m\n');
}

// 第二步：檢查 5173 是否已在運行，若無則啟動本機服務
console.log('\x1b[33m[2/3] 正在準備 WikiTree 本機服務...\x1b[0m');

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
    console.log('\x1b[32m✔ 偵測到服務已在背景運行中！\x1b[0m\n');
    return;
  }

  console.log('啟動 node dev-all.mjs...');
  devProcess = spawn('node', ['dev-all.mjs'], {
    stdio: 'inherit',
    shell: true,
  });

  // 等待伺服器就緒
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await checkPort(5173)) {
      console.log('\x1b[32m✔ 本機服務就緒！\x1b[0m\n');
      return;
    }
  }
  console.log('\x1b[31m⚠ 等候超時，直接嘗試喚起視窗...\x1b[0m\n');
}

await ensureServerRunning();

// 第三步：以獨立 App 視窗模式喚起（無瀏覽器網址列、無分頁欄）
console.log('\x1b[33m[3/3] 正在開啟 WikiTree 獨立視窗...\x1b[0m');

const targetUrl = 'http://localhost:5173/?mode=app';

function launchAppWindow() {
  const edgeCmd = 'start msedge --app="' + targetUrl + '"';
  const chromeCmd = 'start chrome --app="' + targetUrl + '"';
  const defaultCmd = 'start ' + targetUrl;

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

launchAppWindow();

console.log('\x1b[32m======================================================\x1b[0m');
console.log('\x1b[1;32m   🎉 WikiTree 已啟動！獨立視窗已彈出。             \x1b[0m');
console.log('\x1b[90m   你可以保持此視窗開啟以觀察日誌，按 Ctrl+C 可關閉服務。\x1b[0m');
console.log('\x1b[32m======================================================\x1b[0m\n');

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
