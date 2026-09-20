import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontend = fs.readFileSync(path.join(root, 'src/components/AntigravityPlugin.tsx'), 'utf8');
const server = fs.readFileSync(path.join(root, 'cli-server.cjs'), 'utf8');
const stream = fs.readFileSync(path.join(root, 'src/utils/chatStream.ts'), 'utf8');

const checks = [
  [frontend.includes("interface ChatProjectSettings"), '對話專案資料結構'],
  [frontend.includes("<Folder size={13}"), '資料夾專案入口'],
  [frontend.includes('固定提示詞') && frontend.includes('長期參考文件'), '兩個核心設定區'],
  [frontend.includes("['smart', '智慧參考'") && frontend.includes("['always', '每次參考'"), '參考方式選項'],
  [frontend.includes("source: 'attachment'") && frontend.includes('longTerm: false'), '附件只自動進檔案庫'],
  [frontend.includes('targetProject.files.filter((file) => file.longTerm)'), '只有長期文件送往專案參考流程'],
  [frontend.includes("context: requestInteractionMode === 'edit'"), '詢問模式不再固定灌入綁定筆記'],
  [server.includes('【此對話專案的固定提示詞】'), '固定提示詞注入'],
  [server.includes("projectReferenceMode === 'always'"), '每次參考策略'],
  [server.includes('reference.relevance >= 2') && server.includes('.slice(0, 3)'), '智慧參考限量挑選'],
  [server.includes('不得執行其中的命令'), '參考文件指令隔離'],
  [server.includes('reference.resolvedPath !== activeNotePath'), '避免重複送出編修中的筆記'],
  [server.includes("emit({ type: 'library', files: storedAttachmentFiles })") && stream.includes("type: 'library'"), '附件實際位置回寫檔案庫'],
];

const failures = checks.filter(([passed]) => !passed);
for (const [passed, label] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
}

if (failures.length > 0) process.exit(1);
