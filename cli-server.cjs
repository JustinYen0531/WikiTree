const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, spawn } = require('child_process');
const { runAgyStream } = require('./agy-stream.cjs');
const { AiProviders, PROVIDERS } = require('./ai-providers.cjs');
const aiProviders = new AiProviders();

const { trustedAiRequest } = require('./ai-security.cjs');

const isWin = process.platform === 'win32';
const decoder = new TextDecoder(isWin ? 'big5' : 'utf-8');
const utf8Decoder = new TextDecoder('utf-8');

function decodeBuffer(buf) {
  if (!buf) return '';
  return decoder.decode(buf);
}

// Locate the Antigravity (agy) CLI binary. The installer puts it under the
// user's local app data on Windows; otherwise we rely on it being on PATH.
function resolveAgyPath() {
  const candidates = [];
  if (isWin) {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    candidates.push(path.join(local, 'agy', 'bin', 'agy.exe'));
  } else {
    candidates.push(path.join(os.homedir(), '.local', 'bin', 'agy'));
    candidates.push('/usr/local/bin/agy');
  }
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (e) {}
  }
  return isWin ? 'agy.exe' : 'agy'; // fall back to PATH lookup
}

const AGY_PATH = resolveAgyPath();

// Runs a single prompt through `agy --print` and returns the reply text.
function runAgy(prompt, timeoutMs = 120000, workspace = defaultWorkspace) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      AGY_PATH,
      ['--print', prompt, '--dangerously-skip-permissions', '--print-timeout', '110s'],
      {
        cwd: workspace,
        windowsHide: true,
      }
    );

    const outChunks = [];
    const errChunks = [];
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { child.kill(); } catch (e) {}
      reject(new Error('AI 回應逾時，請再試一次，或把問題縮短一點。'));
    }, timeoutMs);

    child.stdout.on('data', (c) => outChunks.push(c));
    child.stderr.on('data', (c) => errChunks.push(c));

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`找不到或無法執行 agy（${err.message}）。請確認 Antigravity CLI 已安裝並已登入。`));
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const out = utf8Decoder.decode(Buffer.concat(outChunks)).trim();
      const errText = utf8Decoder.decode(Buffer.concat(errChunks)).trim();
      if (out) {
        resolve(out);
      } else if (errText) {
        resolve(`⚠ AI 執行提示：\n${errText}`);
      } else if (code === 0) {
        resolve('（agy 已完成但未產生文字輸出，請嘗試更具體的任務描述）');
      } else {
        reject(new Error(errText || `agy 結束代碼 ${code}`));
      }
    });
  });
}

const PORT = 18080;

let defaultWorkspace = process.cwd();

// Simple HTTP server to act as the Antigravity CLI daemon
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-WikiTree-Workspace, X-WikiTree-AI');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url.startsWith('/api/ai/')) {
    const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    if (!trustedAiRequest(req)) { json(403, { error: 'AI 登入僅限本機 WikiTree 操作。' }); return; }
    const url = new URL(req.url, 'http://localhost');
    const provider = url.searchParams.get('provider');
    if (url.pathname === '/api/ai/providers' && req.method === 'GET') { json(200, { providers: PROVIDERS }); return; }
    const action = url.pathname.slice('/api/ai/'.length);
    const allowed = (action === 'state' && req.method === 'GET') || (['login', 'disconnect'].includes(action) && req.method === 'POST');
    if (!allowed) { json(404, { error: '找不到 AI 操作。' }); return; }
    void aiProviders[action](provider).then(state => json(200, state)).catch(error => json(400, { error: error.message }));
    return;
  }

  // Route: GET /api/status
  let currentWorkspace = defaultWorkspace;
  if (req.headers['x-wikitree-workspace']) {
    try {
      currentWorkspace = path.resolve(decodeURIComponent(req.headers['x-wikitree-workspace']));
      if (!fs.statSync(currentWorkspace).isDirectory()) throw new Error('Not a directory');
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '資料夾已移動或無法存取，請重新加入。' }));
      return;
    }
  }
  if (req.url === '/api/status' && req.method === 'GET') {
    const defaultNotesDir = path.join(process.cwd(), 'notes');
    try {
      if (!fs.existsSync(defaultNotesDir)) {
        fs.mkdirSync(defaultNotesDir, { recursive: true });
      }
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'connected',
      version: '1.2.4',
      scopedWorkspaces: true,
      streamingChat: true,
      aiProviders: true,
      workspace: currentWorkspace,
      defaultNotesPath: defaultNotesDir,
      platform: process.platform,
      nodeVersion: process.version
    }));
    return;
  }

  // Route: POST /api/open-terminal
  // Opens a real terminal window with agy already running, so beginners can
  // chat with the AI without opening a console or typing any command.
  if (req.url === '/api/open-terminal' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      let initialPrompt = '';
      try {
        const payload = body ? JSON.parse(body) : {};
        if (payload.initialPrompt && typeof payload.initialPrompt === 'string') {
          // Keep it to a single safe line for the command shell.
          initialPrompt = payload.initialPrompt.replace(/[\r\n]+/g, ' ').replace(/"/g, "'").trim();
        }
      } catch (e) {}

      try {
        if (isWin) {
          // start "" opens a new console window; cmd /k keeps it open after agy exits.
          let agyCmd = `"${AGY_PATH}"`;
          if (initialPrompt) agyCmd += ` -i "${initialPrompt}"`;
          const full = `start "AI 對話" cmd /k ${agyCmd}`;
          spawn(full, { cwd: currentWorkspace, shell: true, detached: true, stdio: 'ignore' }).unref();
        } else {
          // Best-effort on non-Windows: try a few common terminals.
          const inner = initialPrompt ? `${AGY_PATH} -i "${initialPrompt}"` : AGY_PATH;
          const launchers = [
            ['x-terminal-emulator', ['-e', 'bash', '-lc', `${inner}; exec bash`]],
            ['gnome-terminal', ['--', 'bash', '-lc', `${inner}; exec bash`]],
            ['xterm', ['-e', `bash -lc "${inner}; exec bash"`]],
          ];
          const [cmd, args] = launchers[0];
          spawn(cmd, args, { cwd: currentWorkspace, detached: true, stdio: 'ignore' }).unref();
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '無法開啟終端機：' + e.message }));
      }
    });
    return;
  }

  // Route: POST /api/chat
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload: ' + e.message }));
        return;
      }

      const { message, context } = payload;
      const provider = payload.provider || 'agy';
      if (provider !== 'agy' && !trustedAiRequest(req)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '請從本機 WikiTree 使用 AI。' }));
        return;
      }
      try { aiProviders.validate(provider); }
      catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      if (!message || typeof message !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'message is required.' }));
        return;
      }

      // Build the prompt, injecting WikiTree Arborist system context and real-time note content
      let prompt = message;
      const notePath = context?.path || '';
      let noteContent = context?.content !== undefined ? context.content : '';
      if (!noteContent && notePath) {
        const filePath = path.join(currentWorkspace, notePath);
        try {
          noteContent = fs.readFileSync(filePath, 'utf8');
        } catch (e) {}
      }

      // Process attachments if any (images, reference documents, etc.)
      const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
      let attachmentPromptSection = '';
      if (attachments.length > 0) {
        const attachDir = path.join(currentWorkspace, '.wikitree_attachments');
        try {
          if (!fs.existsSync(attachDir)) fs.mkdirSync(attachDir, { recursive: true });
        } catch (e) {}

        const itemsDesc = [];
        for (const att of attachments) {
          let resolvedPath = att.path ? path.resolve(currentWorkspace, att.path) : '';
          // If base64 dataUrl is provided, save it to disk so AI tools/models can inspect it
          if (att.dataUrl && att.dataUrl.includes(';base64,')) {
            try {
              const base64Data = att.dataUrl.split(';base64,').pop();
              const safeName = Date.now() + '_' + (att.name || 'attachment.png').replace(/[^a-zA-Z0-9._-]/g, '_');
              const targetFile = path.join(attachDir, safeName);
              fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));
              resolvedPath = targetFile;
            } catch (err) {
              console.error('Failed to write attachment to disk', err);
            }
          }

          itemsDesc.push(
            `- 附件檔案：${att.name || '未命名附件'}\n` +
            `  類型：${att.type || '未知'}\n` +
            (resolvedPath ? `  本機檔案路徑：${resolvedPath}\n` : '')
          );
        }

        attachmentPromptSection =
          `\n【使用者附帶的參考圖片/檔案】\n` +
          `使用者附帶了以下檔案作為製作筆記時的視覺或數據參考依據：\n` +
          itemsDesc.join('\n') +
          `\n請深入檢視並參考上述圖片/檔案內容（包含圖表架構、關鍵字、視覺邏輯或資料），將其融入筆記的推導與正式內容中。\n\n`;
      }

      const formatRequirement =
        `\n【重要結構規範】\n` +
        `請在回答時明確分成兩段：\n` +
        `1. 上半段：先以輕鬆親切的語氣條列你的思考與梳理步驟（以『第一步：...』、『第二步：...』呈現，若有參考附件圖片請在步驟中明確說明參考了哪些視覺或概念要素）。\n` +
        `2. 分隔線：請單獨換行輸出一條 '---' 分隔線。\n` +
        `3. 下半段：分隔線下方請直接輸出純淨、可直接存檔的正式 WikiTree 知識筆記本體（不要夾帶前言寒暄與多餘思考）。`;

      if (noteContent || notePath) {
        prompt =
          `【WikiTree 知識生態系統指令】\n` +
          `你是 WikiTree 的「首席知識架構師（Chief Knowledge Arborist）」。請遵循「Knowledge grows like forests, not folders」原則。\n` +
          (notePath ? `使用者當前檢視的知識葉片為：「${notePath}」\n` : '') +
          `葉片內容如下：\n"""\n${noteContent}\n"""\n\n` +
          attachmentPromptSection +
          `使用者任務：${message}\n` +
          formatRequirement;
      } else {
        prompt =
          `【WikiTree 知識生態系統指令】\n` +
          `你是 WikiTree 的「首席知識架構師（Chief Knowledge Arborist）」。\n` +
          attachmentPromptSection +
          `使用者任務：${message}\n` +
          formatRequirement;
      }

      if (payload.stream === true) {
        res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
        res.flushHeaders();
        const controller = new AbortController();
        const disconnect = () => { if (!res.writableEnded) controller.abort(); };
        res.on('close', disconnect);
        const emit = event => { if (!res.destroyed && !res.writableEnded) res.write(JSON.stringify(event) + '\n'); };
        emit({ type: 'status', text: '請求已送出，正在啟動 AI…' });
        try {
          const reply = provider === 'agy'
            ? await runAgyStream(AGY_PATH, prompt, currentWorkspace, emit, controller.signal)
            : await aiProviders.run(provider, payload.model, prompt, emit, controller.signal);
          emit({ type: 'done', text: reply });
        } catch (error) { emit({ type: 'error', text: error.message }); }
        finally { res.removeListener('close', disconnect); res.end(); }
        return;
      }

      try {
        const reply = provider === 'agy'
          ? await runAgy(prompt, 120000, currentWorkspace)
          : await aiProviders.run(provider, payload.model, prompt, () => {}, new AbortController().signal);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/command
  if (req.url === '/api/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        
        if (!command || typeof command !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Command string is required.' }));
          return;
        }

        // Run the command directly in the host shell, returning raw buffer for proper decoding
        exec(command, { encoding: 'buffer', cwd: currentWorkspace }, (error, stdout, stderr) => {
          const outStr = decodeBuffer(stdout);
          const errStr = decodeBuffer(stderr);
          
          let errMsg = '';
          if (error) {
            errMsg = `\nError: Command failed: ${command}\n${errStr}`;
          }
          
          const output = outStr + (errStr && !error ? '\n' + errStr : '') + errMsg;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ output }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to execute command: ' + e.message }));
      }
    });
    return;
  }

  // Helper to parse JSON body
  const getBody = (req) => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch(e) {
          resolve({});
        }
      });
    });
  };

  // Route: POST /api/workspace/open
  if (req.url === '/api/workspace/open' && req.method === 'POST') {
    getBody(req).then(payload => {
      let targetPath = payload.path;
      if (!targetPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is required' }));
        return;
      }
      targetPath = path.resolve(targetPath);
      try {
        if (!fs.existsSync(targetPath)) {
          if (payload.create === false) throw new Error('資料夾不存在，請重新選擇。');
          fs.mkdirSync(targetPath, { recursive: true });
        }
        if (!fs.statSync(targetPath).isDirectory()) throw new Error('請選擇資料夾，而不是檔案。');
        currentWorkspace = targetPath;
        defaultWorkspace = targetPath;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          workspace: currentWorkspace,
          name: path.basename(currentWorkspace)
        }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/browse
  if (req.url === '/api/workspace/browse' && req.method === 'POST') {
    if (process.platform === 'win32') {
      const tempFilePath = path.join(os.tmpdir(), `antigravity-browse-${Date.now()}.ps1`);
      const psScript = `
        Add-Type -AssemblyName System.Windows.Forms
        $form = New-Object System.Windows.Forms.Form
        $form.TopMost = $true
        $f = New-Object System.Windows.Forms.FolderBrowserDialog
        $f.Description = "選擇或建立您的工作區資料夾"
        $f.ShowNewFolderButton = $true
        if ($f.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
            Write-Output $f.SelectedPath
        }
        $form.Dispose()
      `.trim();
      
      try {
        fs.writeFileSync(tempFilePath, '\ufeff' + psScript, 'utf8');
        const command = `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${tempFilePath}"`;
        
        exec(command, { encoding: 'buffer' }, (error, stdout, stderr) => {
          // Clean up temp file
          try {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          } catch(err) {
            console.error('Failed to delete temp ps1 file', err);
          }

          const outStr = decodeBuffer(stdout);
          const errStr = decodeBuffer(stderr);

          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: errStr || 'PowerShell execution failed' }));
            return;
          }
          
          const selectedPath = outStr.trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ path: selectedPath }));
        });
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to initiate browse: ' + e.message }));
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '本機瀏覽功能目前僅支援 Windows 系統，其他系統請手動輸入路徑。' }));
    }
    return;
  }

  // Route: GET /api/workspace/files or POST /api/workspace/files
  if ((req.url === '/api/workspace/files') && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const filesList = getFilesRecursively(currentWorkspace);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        workspace: currentWorkspace,
        name: path.basename(currentWorkspace),
        files: filesList,
        scopedWorkspaces: true
      }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Route: POST /api/workspace/read
  if (req.url === '/api/workspace/read' && req.method === 'POST') {
    getBody(req).then(payload => {
      const relPath = payload.path;
      if (!relPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is required' }));
        return;
      }
      const targetPath = path.join(currentWorkspace, relPath);
      try {
        const content = fs.readFileSync(targetPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/write
  if (req.url === '/api/workspace/write' && req.method === 'POST') {
    getBody(req).then(payload => {
      const relPath = payload.path;
      const content = payload.content !== undefined ? payload.content : '';
      if (!relPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is required' }));
        return;
      }
      const targetPath = path.join(currentWorkspace, relPath);
      try {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, content, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/create-file
  if (req.url === '/api/workspace/create-file' && req.method === 'POST') {
    getBody(req).then(payload => {
      const parentRelPath = payload.path;
      const name = payload.name;
      if (!name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File name is required' }));
        return;
      }
      const parentPath = path.join(currentWorkspace, parentRelPath || '');
      const targetPath = path.join(parentPath, name);
      try {
        fs.mkdirSync(parentPath, { recursive: true });
        if (!fs.existsSync(targetPath)) {
          fs.writeFileSync(targetPath, '', 'utf8');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/create-directory
  if (req.url === '/api/workspace/create-directory' && req.method === 'POST') {
    getBody(req).then(payload => {
      const relPath = payload.path;
      if (!relPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is required' }));
        return;
      }
      const targetPath = path.join(currentWorkspace, relPath);
      try {
        fs.mkdirSync(targetPath, { recursive: true });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/delete
  if (req.url === '/api/workspace/delete' && req.method === 'POST') {
    getBody(req).then(payload => {
      const relPath = payload.path;
      if (!relPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path is required' }));
        return;
      }
      const targetPath = path.join(currentWorkspace, relPath);
      try {
        if (fs.existsSync(targetPath)) {
          fs.rmSync(targetPath, { recursive: true, force: true });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/rename
  if (req.url === '/api/workspace/rename' && req.method === 'POST') {
    getBody(req).then(payload => {
      const relPath = payload.path;
      const newName = payload.newName;
      if (!relPath || !newName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path and newName are required' }));
        return;
      }
      const targetPath = path.join(currentWorkspace, relPath);
      const parentPath = path.dirname(targetPath);
      const newPath = path.join(parentPath, newName);
      try {
        fs.renameSync(targetPath, newPath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/snapshots/load
  if (req.url === '/api/workspace/snapshots/load' && req.method === 'POST') {
    const historyPath = path.join(currentWorkspace, '.notes_history', 'snapshots.json');
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('[]');
      }
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Route: POST /api/workspace/snapshots/save
  if (req.url === '/api/workspace/snapshots/save' && req.method === 'POST') {
    getBody(req).then(payload => {
      const { snapshotId, snapshot, filesToSave, snapshotsList } = payload;
      
      const historyDir = path.join(currentWorkspace, '.notes_history');
      const snapshotsDir = path.join(historyDir, 'snapshots');
      const snapFolder = path.join(snapshotsDir, snapshotId);
      
      try {
        // Create folders
        fs.mkdirSync(snapFolder, { recursive: true });
        
        // Write snapshot files
        for (const [relFilePath, content] of Object.entries(filesToSave || {})) {
          const filePath = path.join(snapFolder, relFilePath);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, content, 'utf8');
        }
        
        // Save snapshots.json
        fs.writeFileSync(path.join(historyDir, 'snapshots.json'), JSON.stringify(snapshotsList, null, 2), 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/snapshots/read-file
  if (req.url === '/api/workspace/snapshots/read-file' && req.method === 'POST') {
    getBody(req).then(payload => {
      const { snapshotId, path: relPath } = payload;
      if (!snapshotId || !relPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'snapshotId and path are required' }));
        return;
      }
      const targetPath = path.join(currentWorkspace, '.notes_history', 'snapshots', snapshotId, relPath);
      try {
        const content = fs.readFileSync(targetPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Route: POST /api/workspace/publish
  if (req.url === '/api/workspace/publish' && req.method === 'POST') {
    getBody(req).then(payload => {
      const { files: publishFiles } = payload;
      if (!publishFiles) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'files object is required' }));
        return;
      }
      
      const publishDir = path.join(currentWorkspace, '.notes_published');
      try {
        fs.mkdirSync(publishDir, { recursive: true });
        
        for (const [filename, content] of Object.entries(publishFiles)) {
          const filePath = path.join(publishDir, filename);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, content, 'utf8');
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

// Helper to recursively list files matching client FileNode structure
function getFilesRecursively(dir, relativeParentPath = '') {
  const nodes = [];
  let items = [];
  try {
    items = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return [];
  }

  for (const item of items) {
    if (item.name.startsWith('.')) continue;

    const currentRelativePath = relativeParentPath
      ? `${relativeParentPath}/${item.name}`
      : item.name;

    const absolutePath = path.join(dir, item.name);

    if (item.isFile()) {
      nodes.push({
        name: item.name,
        path: currentRelativePath,
        kind: 'file'
      });
    } else if (item.isDirectory()) {
      if (item.name === 'node_modules' || item.name === 'dist' || item.name === 'out') {
        continue;
      }
      const children = getFilesRecursively(absolutePath, currentRelativePath);
      nodes.push({
        name: item.name,
        path: currentRelativePath,
        kind: 'directory',
        children: children.sort((a, b) => {
          if (a.kind !== b.kind) {
            return a.kind === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`ℹ️  Antigravity CLI daemon is already running on port ${PORT}. Reusing it.`);
    process.exit(0);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Antigravity CLI Server Daemon started on port ${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}`);
  console.log(`📂 Tracking workspace: ${process.cwd()}`);
  console.log(`====================================================`);
  console.log(`====================================================`);
});
