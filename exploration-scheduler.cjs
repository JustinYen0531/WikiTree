const fs = require('node:fs');
const path = require('node:path');

function pad(value) { return String(value).padStart(2, '0'); }

function localMinuteKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isoWeekday(date) { return date.getDay() === 0 ? 7 : date.getDay(); }

function isLastDayOfMonth(date) {
  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  return next.getMonth() !== date.getMonth();
}

function matchesSchedule(task, date) {
  if (task.status !== 'active' || task.schedule?.kind === 'manual') return false;
  const [hour, minute] = String(task.schedule?.localTime || '').split(':').map(Number);
  if (date.getHours() !== hour || date.getMinutes() !== minute) return false;
  if (task.schedule.kind === 'daily') return true;
  if (task.schedule.kind === 'weekdays' || task.schedule.kind === 'weekly') return (task.schedule.daysOfWeek || []).includes(isoWeekday(date));
  if (task.schedule.kind === 'monthly') {
    const requested = task.schedule.dayOfMonth || 1;
    return date.getDate() === requested || (requested > date.getDate() && isLastDayOfMonth(date));
  }
  return false;
}

function nextRunAt(task, from = new Date()) {
  if (task.status !== 'active' || task.schedule?.kind === 'manual') return null;
  const probe = new Date(from);
  probe.setSeconds(0, 0);
  probe.setMinutes(probe.getMinutes() + 1);
  const limit = 370 * 24 * 60;
  for (let index = 0; index < limit; index += 1) {
    if (matchesSchedule(task, probe)) return probe.toISOString();
    probe.setMinutes(probe.getMinutes() + 1);
  }
  return null;
}

function dueTasks(store, now = new Date()) {
  const due = [];
  for (const registered of store.listWorkspaces()) {
    if (!registered?.path || !fs.existsSync(registered.path)) continue;
    for (const task of store.listTasks(registered.path)) {
      if (!matchesSchedule(task, now)) continue;
      const scheduledFor = localMinuteKey(now);
      const alreadyHandled = store.listRuns(registered.path, { taskId: task.id, limit: 100 }).some(run => run.scheduledFor === scheduledFor);
      if (!alreadyHandled) due.push({ workspace: path.resolve(registered.path), task, scheduledFor });
    }
  }
  return due;
}

async function runDueTasks({ store, execute, now = new Date(), onEvent }) {
  const results = [];
  for (const due of dueTasks(store, now)) {
    onEvent?.({ type: 'started', ...due });
    try {
      const run = await execute(due);
      results.push({ ...due, status: run.status, runId: run.id });
      onEvent?.({ type: 'completed', ...due, run });
    } catch (error) {
      results.push({ ...due, status: 'failed', error: error.message });
      onEvent?.({ type: 'failed', ...due, error });
    }
  }
  return results;
}

function startCoordinator(options) {
  const intervalMs = Math.max(10000, Number(options.intervalMs) || 30000);
  let stopped = false;
  let running = false;
  const tick = async () => {
    if (stopped || running) return;
    running = true;
    try { await runDueTasks({ ...options, now: new Date() }); }
    finally { running = false; }
  };
  const timer = setInterval(() => void tick(), intervalMs);
  void tick();
  return { stop() { stopped = true; clearInterval(timer); } };
}

module.exports = { dueTasks, localMinuteKey, matchesSchedule, nextRunAt, runDueTasks, startCoordinator };
