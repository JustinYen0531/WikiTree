// Launches the Vite dev server and the Antigravity CLI daemon together,
// so `npm run dev` brings up everything the AI panel needs in one command.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const node = process.execPath;

// Resolve Vite's CLI entry so we can run it through Node directly. This avoids
// spawning `npx.cmd`, which fails with EINVAL on Windows + recent Node.
const vitePkgPath = require.resolve('vite/package.json');
const viteBin = join(dirname(vitePkgPath), require(vitePkgPath).bin.vite);

const procs = [
  // `critical: false` -> if the CLI exits (e.g. a daemon is already running on
  // this port) we keep the web server alive instead of tearing everything down.
  { name: 'cli ', color: '\x1b[36m', cmd: node, args: ['cli-server.cjs'], critical: false },
  { name: 'web ', color: '\x1b[35m', cmd: node, args: [viteBin], critical: true },
];

const children = [];

for (const p of procs) {
  const child = spawn(p.cmd, p.args, { stdio: ['inherit', 'pipe', 'pipe'], shell: false });
  const prefix = `${p.color}[${p.name}]\x1b[0m `;

  const pipe = (stream, out) => {
    stream.on('data', (chunk) => {
      const text = chunk.toString();
      for (const line of text.split(/\r?\n/)) {
        if (line.length) out.write(prefix + line + '\n');
      }
    });
  };

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code) => {
    process.stdout.write(`${prefix}exited with code ${code}\n`);
    if (p.critical) shutdown();
  });

  children.push(child);
}

function shutdown() {
  for (const c of children) {
    if (!c.killed) {
      try { c.kill(); } catch {}
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
