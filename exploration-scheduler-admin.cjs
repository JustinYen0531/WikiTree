const path = require('node:path');
const { execFile } = require('node:child_process');

const TASK_NAME = 'WikiTree Exploration Scheduler';
const SCRIPT = path.join(__dirname, 'scripts', 'manage-exploration-scheduler.ps1');

function powershell(args) {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, ...args], { windowsHide: true, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) reject(new Error(String(stderr || stdout || error.message).trim().slice(0, 1000)));
      else resolve(String(stdout || '').trim());
    });
  });
}

async function schedulerStatus() {
  if (process.platform !== 'win32') return { supported: false, installed: false, status: 'unsupported', error: '第一版排程只支援 Windows。' };
  try {
    const raw = await powershell(['-Action', 'Status', '-TaskName', TASK_NAME]);
    return { supported: true, installed: true, status: raw || 'Ready', error: '' };
  } catch (error) {
    if (/not_found/i.test(error.message)) return { supported: true, installed: false, status: 'not_installed', error: '' };
    return { supported: true, installed: false, status: 'error', error: error.message };
  }
}

async function installScheduler() {
  if (process.platform !== 'win32') throw new Error('第一版排程只支援 Windows。');
  await powershell(['-Action', 'Install', '-TaskName', TASK_NAME, '-ProjectRoot', __dirname]);
  return schedulerStatus();
}

async function uninstallScheduler() {
  if (process.platform !== 'win32') throw new Error('第一版排程只支援 Windows。');
  await powershell(['-Action', 'Uninstall', '-TaskName', TASK_NAME]);
  return schedulerStatus();
}

module.exports = { TASK_NAME, installScheduler, schedulerStatus, uninstallScheduler };
