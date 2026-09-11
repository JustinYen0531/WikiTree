const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');
const { StringDecoder } = require('node:string_decoder');

// Official local CLI protocols only. Never forward diagnostics or credentials.
class AiRpc extends EventEmitter {
  constructor(command, args, options, spawnProcess = spawn) {
    super();
    this.pending = new Map();
    this.sequence = 0;
    this.closed = false;
    this.child = spawnProcess(command, args, { ...options, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], shell: false });
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    this.child.stdout.on('data', chunk => {
      buffer += decoder.write(chunk);
      if (buffer.length > 8 * 1024 * 1024) return this.close();
      let boundary;
      while ((boundary = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 1);
        if (!line.trim()) continue;
        try { this.receive(JSON.parse(line)); }
        catch { this.close(); return; }
      }
    });
    this.child.stderr.on('data', () => {});
    this.child.stdin.on('error', () => this.close());
    this.child.on('error', () => this.close());
    this.child.on('close', () => this.close());
  }

  send(message) {
    if (this.closed) throw new Error('本機 AI 已中斷，請重新連線。');
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');
  }

  request(method, params = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('AI 服務等待逾時，請重試。'));
      }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      try { this.send({ id, method, params }); }
      catch (error) { clearTimeout(timer); this.pending.delete(id); reject(error); }
    });
  }

  receive(message) {
    if (message.method) {
      if (message.id !== undefined) {
        // Note generation has no permission to execute commands or change files.
        if (message.method === 'session/request_permission') {
          this.send({ id: message.id, result: { outcome: { outcome: 'cancelled' } } });
        } else {
          this.send({ id: message.id, error: { code: -32601, message: 'WikiTree only accepts generated text.' } });
        }
      } else this.emit('notification', message);
      return;
    }
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    clearTimeout(pending.timer);
    if (message.error) {
      const error = new Error('廠商未完成請求，請確認登入、模型權限或剩餘額度。');
      error.code = message.error.code;
      pending.reject(error);
    } else pending.resolve(message.result);
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.child.kill();
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error('本機 AI 已中斷，請重新連線。'));
    }
    this.pending.clear();
    this.emit('closed');
  }
}

module.exports = { AiRpc };
