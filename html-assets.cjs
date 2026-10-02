const fs = require('fs');
const path = require('path');

// Only static lecture resources are exposed, never notes or private app data.
const ASSET_TYPES = Object.freeze({
  '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.avif': 'image/avif',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
});

function readHtmlAsset(workspace, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) {
    throw new Error('附件路徑無效。');
  }
  const parts = relativePath.replace(/\\/g, '/').split('/');
  if (parts.some(part => !part || part.startsWith('.') || part.includes(':'))) {
    throw new Error('附件必須位於筆記資料夾裡。');
  }
  const type = ASSET_TYPES[path.extname(relativePath).toLowerCase()];
  if (!type) throw new Error('這個檔案不是支援的講義附件。');
  const root = fs.realpathSync(workspace);
  const target = fs.realpathSync(path.resolve(root, ...parts));
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('附件不能離開筆記資料夾。');
  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.size > 20_000_000) throw new Error('附件無法讀取或超過 20 MB。');
  return { type, bytes: fs.readFileSync(target) };
}

module.exports = { ASSET_TYPES, readHtmlAsset };
