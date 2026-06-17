const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

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
      workspace: process.cwd(),
      platform: process.platform,
      nodeVersion: process.version
    }));
    return;
  }

  // Route: POST /api/chat
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { message, context } = payload;
        
        let responseText = '';
        
        // Check if user has set up Gemini API key in environmental variables
        if (process.env.GEMINI_API_KEY) {
          responseText = await callGeminiAPI(process.env.GEMINI_API_KEY, message, context);
        } else {
          // Fallback: Smart local workspace assistant
          let contextInfo = '';
          if (context && context.path) {
            const filePath = path.join(process.cwd(), context.path);
            let size = 0;
            try {
              size = fs.statSync(filePath).size;
            } catch(e) {}
            contextInfo = `\n\nI detected that you attached the note **${context.path}** (${size} bytes on disk).`;
          }

          responseText = `### Antigravity Local CLI Server
I received your query: "${message}"${contextInfo}

**Note**: To enable real AI responses, please set the Gemini API Key in your terminal before starting the CLI:
\`\`\`bash
# On Windows PowerShell:
$env:GEMINI_API_KEY="your_api_key_here"
node cli-server.cjs
\`\`\`

Currently, I am running in **Workspace Integration Mode**. I can read files in \`${process.cwd()}\` and execute commands on your behalf!`;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: responseText }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload: ' + e.message }));
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

        // Run the command directly in the host shell
        exec(command, (error, stdout, stderr) => {
          const output = stdout + (stderr ? '\n' + stderr : '') + (error ? '\nError: ' + error.message : '');
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
        $f = New-Object System.Windows.Forms.FolderBrowserDialog
        $f.Description = "選擇或建立您的工作區資料夾"
        $f.ShowNewFolderButton = $true
        if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            Write-Output $f.SelectedPath
        }
      `.trim();
      
      try {
        fs.writeFileSync(tempFilePath, '\ufeff' + psScript, 'utf8');
        const command = `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${tempFilePath}"`;
        
        exec(command, (error, stdout, stderr) => {
          // Clean up temp file
          try {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          } catch(err) {
            console.error('Failed to delete temp ps1 file', err);
          }

          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
          
          const selectedPath = stdout.trim();
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

// Helper to query Gemini API using fetch
async function callGeminiAPI(apiKey, prompt, context) {
  try {
    let systemInstruction = 'You are Antigravity, a helpful assistant integrated into a local markdown editor.';
    if (context && context.path) {
      systemInstruction += ` You have access to the user\'s currently opened note. Path: ${context.path}. Note Content:\n"""\n${context.content}\n"""`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } else {
      const errText = await response.text();
      return `Gemini API returned error: ${errText}`;
    }
  } catch (e) {
    return `Failed to query Gemini API: ${e.message}`;
  }
}

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

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Antigravity CLI Server Daemon started on port ${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}`);
  console.log(`📂 Tracking workspace: ${process.cwd()}`);
  console.log(`====================================================`);
  console.log(`To configure a real AI key, start with:`);
  console.log(`  $env:GEMINI_API_KEY="AIzaSy..." ; node cli-server.cjs`);
  console.log(`====================================================`);
});
