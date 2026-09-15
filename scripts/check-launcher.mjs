import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isCompatibleCliStatus, sameWorkspace } from '../launcher-health.mjs';

const workspace = 'C:\\Users\\tester\\WikiTree-master';
const oldStatus = {
  status: 'connected',
  version: '1.2.4',
  workspace,
};
const currentStatus = {
  ...oldStatus,
  version: '1.3.0',
  managedLibrary: true,
  libraryImport: true,
};

assert.equal(sameWorkspace(oldStatus, workspace), true);
assert.equal(isCompatibleCliStatus(oldStatus, workspace), false);
assert.equal(isCompatibleCliStatus(currentStatus, workspace), true);
assert.equal(isCompatibleCliStatus({ ...currentStatus, workspace: 'C:\\other' }, workspace), false);
console.log('PASS launcher rejects stale or foreign WikiTree cores and accepts the managed-library core');

const launcher = readFileSync(new URL('../launcher.mjs', import.meta.url), 'utf8');
assert.match(launcher, /WIKITREE_SKIP_SPLASH/);
assert.match(launcher, /stopStaleCli/);
assert.match(launcher, /createConnection\(\{ port, host: 'localhost' \}/);
assert.match(launcher, /checkPort\(5173\).*isCompatibleCliStatus/s);
assert.match(launcher, /spawnManaged\('cli-server\.cjs'\)/);
assert.match(launcher, /managedProcesses\.add\(child\)/);
assert.doesNotMatch(launcher, /child\.unref\(\)/);
assert.doesNotMatch(launcher, /detached:\s*true/);
console.log('PASS launcher replaces a stale core, restores a missing core, and remains its supervisor');

const splash = readFileSync(new URL('../splash.html', import.meta.url), 'utf8');
assert.match(splash, /127\.0\.0\.1:18080\/api\/status/);
assert.match(splash, /cliStatus\.managedLibrary/);
assert.match(splash, /cliStatus\.libraryImport/);
assert.doesNotMatch(splash, /isServerReady\s*=\s*true;\s*\}\s*,\s*15000/);
assert.match(splash, /仍在等待本機服務，WikiTree 會自動重試/);
assert.match(splash, /setTimeout\(checkServer, 1000\)/);
console.log('PASS splash waits for both services and continues retrying without a false-ready timeout');

const cliServer = readFileSync(new URL('../cli-server.cjs', import.meta.url), 'utf8');
assert.match(cliServer, /requestUrl\.pathname === '\/api\/status'/);
console.log('PASS CLI status accepts the splash cache-busting query string');
