const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const LIBRARY_VERSION = 1;
const SUPPORTED_NOTE_EXTENSIONS = new Set(['.md', '.markdown', '.txt']);

function resolveLibraryPath(options = {}) {
  const configured = options.configuredPath || process.env.WIKITREE_LIBRARY_PATH;
  if (configured) return path.resolve(configured);
  const home = options.homeDir || os.homedir();
  return path.join(home, 'Documents', 'WikiTree');
}

function ensureLibrary(options = {}) {
  const fileSystem = options.fs || fs;
  const libraryPath = resolveLibraryPath(options);
  const metadataDir = path.join(libraryPath, '.wikitree');
  const metadataPath = path.join(metadataDir, 'library.json');
  const created = !fileSystem.existsSync(metadataPath);

  fileSystem.mkdirSync(metadataDir, { recursive: true });

  let metadata;
  if (created) {
    metadata = {
      version: LIBRARY_VERSION,
      id: (options.randomUUID || crypto.randomUUID)(),
      name: '我的 WikiTree',
      createdAt: (options.now || (() => new Date().toISOString()))(),
    };
    fileSystem.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    fileSystem.mkdirSync(path.join(libraryPath, '我的森林'), { recursive: true });
    fileSystem.mkdirSync(path.join(libraryPath, '收件苗圃'), { recursive: true });

    const welcomePath = path.join(libraryPath, '歡迎來到 WikiTree.md');
    fileSystem.writeFileSync(welcomePath, [
      '---',
      'title: "歡迎來到 WikiTree"',
      'domain: "WikiTree"',
      'branch: "起點"',
      'parent: "root"',
      'tags: ["開始", "WikiTree"]',
      'summary: "這裡是由 WikiTree 管理、屬於你的知識天地。"',
      '---',
      '',
      '# 歡迎來到你的 WikiTree',
      '',
      '你可以直接建立筆記與資料夾，也可以使用「收進 WikiTree」把外部文件複製進來。',
      '',
      '> 外部原檔會保留；收進來的版本會在 WikiTree 裡獨立成長。',
      '',
    ].join('\n'), 'utf8');
  } else {
    metadata = JSON.parse(fileSystem.readFileSync(metadataPath, 'utf8'));
  }

  return {
    id: metadata.id,
    name: metadata.name || '我的 WikiTree',
    version: metadata.version || LIBRARY_VERSION,
    path: libraryPath,
    created,
  };
}

function normalizeImportPath(value) {
  if (typeof value !== 'string') throw new Error('匯入項目缺少名稱。');
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = normalized.split('/').filter(Boolean);
  if (!parts.length || parts.some(part => part === '.' || part === '..' || /[\0<>:"|?*]/.test(part))) {
    throw new Error(`無法使用這個匯入路徑：${value}`);
  }
  return parts.join('/');
}

function normalizeDestination(value) {
  if (!value) return '收件苗圃';
  return normalizeImportPath(value);
}

function asMarkdownPath(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (!SUPPORTED_NOTE_EXTENSIONS.has(extension)) return null;
  return extension === '.md' ? relativePath : `${relativePath.slice(0, -extension.length)}.md`;
}

function uniqueTarget(fileSystem, targetPath) {
  if (!fileSystem.existsSync(targetPath)) return targetPath;
  const extension = path.extname(targetPath);
  const stem = targetPath.slice(0, -extension.length);
  for (let index = 2; index < 10_000; index += 1) {
    const candidate = `${stem} (${index})${extension}`;
    if (!fileSystem.existsSync(candidate)) return candidate;
  }
  throw new Error('同名文件過多，請先整理目的資料夾。');
}

function importNotes(payload, options = {}) {
  const fileSystem = options.fs || fs;
  const library = ensureLibrary({ ...options, fs: fileSystem });
  const files = Array.isArray(payload?.files) ? payload.files : [];
  if (!files.length) throw new Error('請先選擇要收進 WikiTree 的文件。');
  if (files.length > 500) throw new Error('一次最多收進 500 個文件。');

  const destination = normalizeDestination(payload.destination);
  const destinationPath = path.resolve(library.path, ...destination.split('/'));
  const relativeDestination = path.relative(library.path, destinationPath);
  if (relativeDestination.startsWith('..') || path.isAbsolute(relativeDestination)) {
    throw new Error('目的地必須位於 WikiTree 裡。');
  }
  fileSystem.mkdirSync(destinationPath, { recursive: true });

  const imported = [];
  const skipped = [];
  for (const item of files) {
    const relativeSource = normalizeImportPath(item?.path);
    const markdownPath = asMarkdownPath(relativeSource);
    if (!markdownPath) {
      skipped.push({ path: relativeSource, reason: '第一版只收進 Markdown 與純文字文件。' });
      continue;
    }
    if (typeof item.content !== 'string') throw new Error(`${relativeSource} 沒有可讀取的文字內容。`);
    if (Buffer.byteLength(item.content, 'utf8') > 2_000_000) {
      skipped.push({ path: relativeSource, reason: '文件超過 2 MB。' });
      continue;
    }

    const requestedTarget = path.resolve(destinationPath, ...markdownPath.split('/'));
    const relativeTarget = path.relative(library.path, requestedTarget);
    if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
      throw new Error('匯入文件不能離開 WikiTree。');
    }
    fileSystem.mkdirSync(path.dirname(requestedTarget), { recursive: true });
    const target = uniqueTarget(fileSystem, requestedTarget);
    fileSystem.writeFileSync(target, item.content, 'utf8');
    imported.push(path.relative(library.path, target).replace(/\\/g, '/'));
  }

  return { library, imported, skipped };
}

module.exports = {
  LIBRARY_VERSION,
  SUPPORTED_NOTE_EXTENSIONS,
  resolveLibraryPath,
  ensureLibrary,
  normalizeImportPath,
  importNotes,
};
