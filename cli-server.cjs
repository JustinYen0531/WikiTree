const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, spawn } = require('child_process');

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
function runAgy(prompt, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const child = spawn(AGY_PATH, ['--print', prompt, '--print-timeout', '110s'], {
      cwd: currentWorkspace,
      windowsHide: true,
    });

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
      if (code === 0 || out) {
        resolve(out || '（agy 沒有回傳內容）');
      } else {
        reject(new Error(errText || `agy 結束代碼 ${code}`));
      }
    });
  });
}

const PORT = 18080;

let currentWorkspace = process.cwd();

// Simple HTTP server to act as the Antigravity CLI daemon
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route: GET /api/status
  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'connected',
      version: '1.2.4',
      workspace: currentWorkspace,
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
      if (!message || typeof message !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'message is required.' }));
        return;
      }

      // Build the prompt, optionally including the open note's content so the
      // AI can answer about whatever the user is looking at.
      let prompt = message;
      if (context && context.path) {
        const filePath = path.join(currentWorkspace, context.path);
        try {
          const noteContent = fs.readFileSync(filePath, 'utf8');
          prompt =
            `以下是使用者目前開啟的筆記「${context.path}」內容：\n\n` +
            `"""\n${noteContent}\n"""\n\n` +
            `請依據上面的筆記回答以下問題或要求：\n${message}`;
        } catch (e) {
          // Note unreadable — fall back to the bare message.
        }
      }

      try {
        const reply = await runAgy(prompt);
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
          fs.mkdirSync(targetPath, { recursive: true });
        }
        currentWorkspace = targetPath;
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
        files: filesList
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
