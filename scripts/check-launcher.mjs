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
assert.match(launcher, /stopStaleCli/);
assert.match(launcher, /checkPort\(5173\).*isCompatibleCliStatus/s);
assert.match(launcher, /spawnBackground\('cli-server\.cjs'\)/);
console.log('PASS launcher replaces a stale same-workspace core and independently restores a missing core');

const splash = readFileSync(new URL('../splash.html', import.meta.url), 'utf8');
assert.match(splash, /127\.0\.0\.1:18080\/api\/status/);
assert.match(splash, /cliStatus\.managedLibrary/);
assert.match(splash, /cliStatus\.libraryImport/);
assert.doesNotMatch(splash, /isServerReady\s*=\s*true;\s*\}\s*,\s*15000/);
console.log('PASS splash waits for both the web screen and current note core without a false-ready timeout');
