import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ExplorationStore } = require('../exploration-store.cjs');
const { runExploration } = require('../exploration-runner.cjs');
const { dueTasks, localMinuteKey, matchesSchedule, nextRunAt, runDueTasks } = require('../exploration-scheduler.cjs');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wikitree-exploration-scheduler-'));
const workspace = path.join(root, 'workspace');
fs.mkdirSync(workspace);
const fixed = new Date(2026, 8, 14, 9, 0, 0);
const store = new ExplorationStore({ root: path.join(root, 'data'), now: () => fixed });
const fixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'fixtures', 'exploration', 'mock-run.json'), 'utf8'));

function task(name, schedule) {
  return store.saveTask(workspace, { name, topic: `${name} topic`, itemCount: 1, schedule, provider: 'agy' });
}

try {
  const daily = task('daily', { kind: 'daily', localTime: '09:00' });
  const weekly = task('weekly', { kind: 'weekly', localTime: '09:00', daysOfWeek: [1] });
  const later = task('later', { kind: 'daily', localTime: '10:00' });
  assert.equal(matchesSchedule(daily, fixed), true);
  assert.equal(matchesSchedule(weekly, fixed), true);
  assert.equal(matchesSchedule(later, fixed), false);
  assert.equal(matchesSchedule({ ...daily, status: 'paused' }, fixed), false);
  assert.equal(matchesSchedule({ ...daily, schedule: { kind: 'manual', localTime: '09:00' } }, fixed), false);
  assert.equal(matchesSchedule({ ...daily, schedule: { kind: 'monthly', localTime: '09:00', dayOfMonth: 31 } }, new Date(2026, 8, 30, 9, 0)), true);
  assert.equal(dueTasks(store, new Date(2026, 8, 14, 9, 1)).length, 0, 'missed minute must not catch up');
  assert.ok(nextRunAt(daily, fixed));
  console.log('PASS fake-clock schedule rhythms and missed-run policy');

  let active = 0;
  let maximum = 0;
  const results = await runDueTasks({
    store,
    now: fixed,
    execute: async ({ task: current }) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise(resolve => setTimeout(resolve, 5));
      active -= 1;
      return { id: current.id, status: 'completed' };
    },
  });
  assert.equal(results.length, 2);
  assert.equal(maximum, 1, 'simultaneous tasks must execute serially');
  store.writeRun(workspace, { taskId: daily.id, scheduledFor: localMinuteKey(fixed), status: 'completed' });
  assert.equal(dueTasks(store, fixed).some(entry => entry.task.id === daily.id), false);
  console.log('PASS serial execution and same-slot deduplication');

  const runnerTask = store.saveTask(workspace, { name: 'runner', topic: 'runner topic', itemCount: 1, schedule: { kind: 'manual' }, provider: 'agy', sources: { connectorIds: ['smithsonian'] } });
  let attempts = 0;
  let generatedPrompt = '';
  const run = await runExploration({
    store,
    workspace,
    taskId: runnerTask.id,
    now: new Date('2026-09-14T01:00:00.000Z'),
    collect: async () => ({ candidates: [], snapshot: { connectors: [], candidateCount: 0 } }),
    generate: async prompt => {
      generatedPrompt = prompt;
      attempts += 1;
      if (attempts === 1) return 'not-json';
      return JSON.stringify(fixture.aiReply);
    },
    verify: async items => ({ items: items.map(item => ({ ...item, urlCheck: { accessible: true, status: 200 } })), checks: items.map(item => ({ url: item.source.url, accessible: true, status: 200 })) }),
  });
  assert.equal(attempts, 2);
  assert.equal(run.status, 'completed');
  assert.equal(run.attempts.length, 2);
  assert.match(generatedPrompt, /來源範圍：Smithsonian Magazine/);
  assert.match(generatedPrompt, /不可為湊數擴大範圍/);
  const saved = store.getItem(workspace, run.itemIds[0]);
  assert.equal(saved.origin, 'scheduled_ai_exploration');
  assert.equal(saved.source.provenance.generatedBy, 'agy');
  assert.equal(saved.sourceSupported.includes('directly'), true);
  assert.equal(saved.editorialSynthesis.includes('may'), true);
  console.log('PASS mock AI retry, parsing, URL checks, lineage and separated claims');

  const shortTask = store.saveTask(workspace, { name: 'shortfall', topic: 'shortfall topic', itemCount: 3, schedule: { kind: 'manual' } });
  const shortRun = await runExploration({
    store, workspace, taskId: shortTask.id, now: new Date('2026-09-14T01:00:00.000Z'),
    collect: async () => ({ candidates: [], snapshot: { connectors: [], candidateCount: 0 } }),
    generate: async () => JSON.stringify({ items: [] }),
    verify: async items => ({ items, checks: [] }),
  });
  assert.equal(shortRun.status, 'complete_with_shortfall');
  assert.match(shortRun.shortfallReason, /要求 3 筆，實際保存 0 筆/);
  console.log('PASS honest shortfall without fabricated filler');

  const providerSource = fs.readFileSync(path.join(process.cwd(), 'ai-providers.cjs'), 'utf8');
  assert.match(providerSource, /web_search="live"/);
  assert.match(providerSource, /You may use web search only/);
  assert.match(providerSource, /browse the web/);
  assert.match(providerSource, /features\.shell_tool=false/);
  const adminScript = fs.readFileSync(path.join(process.cwd(), 'scripts', 'manage-exploration-scheduler.ps1'), 'utf8');
  assert.match(adminScript, /New-ScheduledTaskTrigger -AtLogOn/);
  assert.match(adminScript, /StartWhenAvailable:\$false/);
  assert.match(adminScript, /LogonType Interactive/);
  const serverSource = fs.readFileSync(path.join(process.cwd(), 'cli-server.cjs'), 'utf8');
  for (const route of ['tasks', 'runs', 'items', 'basket', 'scheduler']) assert.match(serverSource, new RegExp(`/api/exploration/${route}`));
  for (const flag of ['scheduledExploration', 'explorationScheduler', 'sourceBasket']) assert.match(serverSource, new RegExp(flag));
  console.log('PASS restricted AI mode, Windows coordinator and local API contracts');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
