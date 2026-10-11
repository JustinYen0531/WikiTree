import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = path.dirname(fileURLToPath(import.meta.url));
const name = 'OpenAI_初級會計財務分析_2026';
const source = fs.readFileSync(path.join(root, `${name}.md`), 'utf8');
const text = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^# .+\r?\n/m, '');
const toc = [];
marked.use({ renderer: {
  heading({ tokens, depth }) {
    const label = this.parser.parseInline(tokens);
    if (depth !== 2) return `<h${depth}>${label}</h${depth}>\n`;
    const id = `chapter-${String(toc.length + 1).padStart(2, '0')}`;
    toc.push({ id, label });
    return `<h2 id="${id}">${label}</h2>\n`;
  }
} });
let content = marked.parse(text, { gfm: true });
content = content.replace(/<table>[\s\S]*?<\/table>/g, table => `<div class="table-wrap">${table}</div>`);
const chunks = content.split(/(?=<h2 id="chapter-)/);
content = chunks.map((chunk, index) => `<section${index === 0 ? ' class="opening"' : ''}>${chunk}</section>`).join('\n');
const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="description" content="使用公開的合作方2026財報，以收入、費用、資產、負債與現金流分析OpenAI；含白話說明、完整三表假設例題與練習。">
<meta name="wikitree-domain" content="商學">
<meta name="wikitree-parent" content="初級會計：收入、費用與現金流">
<title>用初級會計看懂 OpenAI 的財務狀況｜2026 公開合作方財報</title>
<style>${style}
.layout{max-width:1500px;grid-template-columns:250px minmax(0,1fr);gap:clamp(2rem,4vw,4rem)}section{max-width:960px}.hero h1{max-width:21ch}.opening{padding-bottom:1rem;border-bottom:1px solid var(--line)}blockquote{margin:1.3rem 0;padding:1rem 1.25rem;border-left:4px solid var(--accent);background:#edf5f2}blockquote p:last-child{margin-bottom:0}.money-map{display:grid;grid-template-columns:1fr;gap:.55rem;margin:1.5rem 0}.money-map>div{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.2rem;background:#f0f5f1;border:1px solid var(--line);border-radius:8px}.money-map span{color:var(--muted);font-size:.92rem}.money-map .map-center{background:#dfeee6;border-color:var(--accent)}.money-map .map-investor{background:#fbf3e5}.summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.5rem 0}.summary-grid>div{padding:1rem 1.2rem;background:white;border:1px solid var(--line);border-radius:8px}.summary-grid p{margin:.4rem 0 0}.exam summary{list-style:revert}.exam strong{display:inline}.worked summary{cursor:pointer;font-weight:700;color:var(--accent)}.toc a{font-size:.85rem}.sources-foot{padding-top:1rem;border-top:1px solid var(--line)}@media(max-width:850px){.layout{display:block}.summary-grid{grid-template-columns:1fr}.money-map>div{display:block}.money-map span{display:block;margin-top:.3rem}}@media print{section{max-width:none}h2{break-after:avoid}.exam{break-inside:avoid}details> :not(summary){display:block!important}.money-map>div,.summary-grid>div{break-inside:avoid}table{font-size:9pt}.table-wrap{overflow:visible}.toc{display:none}}
</style>
</head>
<body>
<header class="hero">
<div class="eyebrow">Accounting in real life · OpenAI · 2026</div>
<h1>用初級會計看懂<br>OpenAI 的財務狀況</h1>
<p class="subtitle">收入、獲利、現金與募資：把四件事分開，財經新聞就不容易把你繞暈。</p>
<p class="meta">公開合作方財報為主｜資料查核：2026/10/11｜主案例報導日：2026/6/30｜繁體中文、白話案例、可列印</p>
</header>
<div class="layout">
<nav class="toc" aria-label="講義章節"><b>學習路線</b>${toc.map(({id,label}) => `<a href="#${id}">${label}</a>`).join('')}</nav>
<main>${content}
<footer class="sources-foot">本講義為自主學習教材。數字的資料主體、報導期間與假設界線均於正文標示；閱讀與列印不需網路，開啟外部原始來源則需要網路。</footer>
</main>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(root, `${name}.html`), html, 'utf8');
console.log(JSON.stringify({ output: `${name}.html`, chapters: toc.length, bytes: Buffer.byteLength(html) }));
