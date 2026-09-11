const { spawn } = require('node:child_process');
const { StringDecoder } = require('node:string_decoder');

function createEventDecoder(onEvent) {
  const decoder = new StringDecoder('utf8');
  let pending = '';
  function consume(text, final = false) {
    pending += text;
    const lines = pending.split('\n');
    pending = final ? '' : lines.pop();
    for (const line of lines) if (line.trim()) onEvent(JSON.parse(line));
  }
  return { write: chunk => consume(decoder.write(chunk)), end: () => consume(decoder.end(), true) };
}

function runAgyStream(binary, prompt, workspace, emit, signal, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error('已停止接收回覆'));
    const child = spawn(binary, ['--print', prompt, '--output-format', 'stream-json', '--dangerously-skip-permissions', '--print-timeout', '110s'], { cwd: workspace, windowsHide: true });
    let settled = false;
    let result = null;
    let text = '';
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      if (error) { child.kill(); reject(error); }
      else resolve(result.response ?? text);
    };
    const abort = () => finish(new Error('已停止接收回覆'));
    const timer = setTimeout(() => finish(new Error('回覆逾時，已收到的文字仍保留。')), timeoutMs);
    signal.addEventListener('abort', abort, { once: true });
    const parser = createEventDecoder(event => {
      if (settled) return;
      if (event.event === 'init') emit({ type: 'status', text: 'AI 已啟動，等待文字輸出…' });
      if (event.event === 'step_update') {
        const step = event.step_update || {};
        if (step.step_type === 'agent_response' && typeof step.text_delta === 'string' && step.text_delta) {
          text += step.text_delta;
          emit({ type: 'delta', text: step.text_delta });
        } else if (step.step_type === 'tool') {
          emit({ type: 'status', text: step.state === 'DONE' ? '一項工作已完成，繼續產生回覆…' : 'AI 正在執行工作…' });
        }
      }
      if (event.event === 'result') {
        result = event.result;
        if (result?.status !== 'SUCCESS') finish(new Error(result?.error || 'AI 未完成回覆，已收到的文字仍保留。'));
      }
    });
    child.stdout.on('data', chunk => {
      try { parser.write(chunk); } catch { finish(new Error('即時回覆格式無法讀取，已收到的文字仍保留。')); }
    });
    // Drain diagnostics without exposing raw commands or authentication details to the UI.
    child.stderr.on('data', () => {});
    child.on('error', () => finish(new Error('無法啟動本機 AI，請確認 Antigravity 已安裝。')));
    child.on('close', code => {
      if (settled) return;
      try { parser.end(); } catch { finish(new Error('即時回覆中斷，已收到的文字仍保留。')); return; }
      if (settled) return;
      if (!result || code !== 0) finish(new Error('AI 回覆未完整結束，已收到的文字仍保留。'));
      else finish();
    });
  });
}

module.exports = { createEventDecoder, runAgyStream };
