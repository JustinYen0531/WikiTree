import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Optional folder/module arguments allow preparation outside the WikiTree repo.
const here = path.dirname(fileURLToPath(import.meta.url));
const folder = process.argv[2] || here;
const { marked } = await import(process.argv[3] || 'marked');
const source = fs.readFileSync(path.join(folder, 'Ch01_IFRS_學生版文字稿.md'), 'utf8');
const archive = fs.readFileSync(path.join(folder, 'Ch01_IFRS_學習講義_舊版_2026-10-14.html'), 'utf8');
const oldStyle = archive.match(/<style>([\s\S]*?)<\/style>/)[1];
const escape = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// Explicitly render paired bold markers so Chinese punctuation adjoining them
// cannot make a CommonMark parser leave literal asterisks in the handout.
const render = text => marked.parse(text.replace(/\*\*([^*\n]+)\*\*/g, (_, inner) => `<strong>${escape(inner)}</strong>`), { gfm: true }).replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
const chunks = source.trim().split(/^# /m).filter(Boolean).map(chunk => {
  const [title, ...lines] = chunk.split('\n');
  return { title: title.trim(), content: lines.join('\n').replace(/\n---\s*$/, '') };
});
const intro = chunks.shift();
const ids = ['lo1','lo2','lo3','lo4','lo5','lo6','lo7','integration','quick-review','original-quiz','exam','glossary'];
if (chunks.length !== ids.length) throw new Error(`Unexpected section count: ${chunks.length}`);

function practice(content, short) {
  const pattern = short ? /^## Short Answer \d+\s*$/m : /^## 第 \d+ 題\s*$/m;
  const start = content.search(pattern);
  if (start < 0) throw new Error('Missing practice questions');
  const preface = render(content.slice(0, start));
  const items = content.slice(start).split(/^## /m).filter(Boolean);
  const expected = short ? 12 : 20;
  if (items.length !== expected) throw new Error(`Unexpected question count: ${items.length}`);
  return preface + items.map((item, index) => {
    const [heading, ...lines] = item.split('\n');
    const body = lines.join('\n');
    const divider = short ? /\*\*參考答案（展開內容）：\*\*\s*/ : /\*\*答案與解析（展開內容）\*\*\s*/;
    const marker = body.match(divider);
    if (!marker) throw new Error(`Missing answer: ${heading}`);
    const question = body.slice(0, marker.index);
    const answer = body.slice(marker.index + marker[0].length);
    const id = `${short ? 'sa' : 'q'}${String(index + 1).padStart(2, '0')}`;
    return `<article class="exam" id="${id}"><h3>${escape(heading.trim())}</h3>${render(question)}<details><summary>${short ? '參考答案' : '答案與解析'}</summary>${render(answer)}</details></article>`;
  }).join('\n');
}

const sections = chunks.map((chunk, index) => {
  let content = chunk.content;
  if (ids[index] === 'glossary') {
    content = content.trim().split('\n');
    content.splice(1, 0, '--- | --- | ---');
    content = content.join('\n');
  }
  // The source uses H2/H3 inside its H1 sections; shift them by one level.
  content = content.replace(/^(#{2,3}) /gm, '$1# ');
  // Practice parsing uses the original question headings.
  const body = ids[index] === 'original-quiz' ? practice(chunk.content, false)
    : ids[index] === 'exam' ? practice(chunk.content, true) : render(content);
  return `<section id="${ids[index]}"><h2>${escape(chunk.title)}</h2>${body}</section>`;
}).join('\n');

const extraStyle = `
  .exam strong{display:inline}.exam>h3{margin-top:0}.exam details{margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--line)}.exam summary{padding:.25rem 0}.exam details>p:first-of-type{margin-top:1rem}.exam ul{padding-left:1.4em}.exam{scroll-margin-top:1.5rem}h2{font-size:clamp(1.4rem,3vw,1.85rem)}blockquote{margin:1.2rem 0;padding:.6rem 1.2rem;border-left:4px solid var(--accent);background:#edf5f2}blockquote p{margin:.3rem 0}td,th{overflow-wrap:anywhere}main p,main li{overflow-wrap:anywhere}.toc a{white-space:normal}hr{border:0;border-top:1px solid var(--line);margin:2rem 0}.intro-en{font-size:1.15rem}section h3{font-size:1.22rem}section h4{font-size:1.06rem;margin-top:1.4rem}
  @media(max-width:850px){.toc{display:block;white-space:normal;padding-bottom:1rem}.toc a{display:inline-block;padding:.4rem .65rem .4rem 0}.hero{padding:2rem 5vw}.exam{padding:1rem}.table-wrap{max-width:100%}table{min-width:460px}.intro-en{font-size:1rem}}
  @media print{.exam{break-inside:auto}.exam details:not([open])> :not(summary){display:block!important}.exam summary{color:inherit}.table-wrap{overflow:visible}table{min-width:0}}
`;
let introBody = intro.content.replace(/^## (.+)$/m, '<p class="intro-en">$1</p>');
const nav = chunks.map((chunk, index) => `<a href="#${ids[index]}">${escape(chunk.title)}</a>`).join('\n');
const result = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(intro.title)}</title><style>${oldStyle}${extraStyle}</style></head>
<body><header class="hero"><div class="eyebrow">Intermediate Accounting · IFRS · Chapter 1</div><h1>${escape(intro.title)}</h1></header>
<div class="layout"><nav class="toc" aria-label="章節導覽"><b>本章導覽</b><a href="#start">本章導讀</a>${nav}</nav><main><section id="start">${render(introBody)}</section>${sections}</main></div></body></html>\n`;
fs.writeFileSync(path.join(folder, 'Ch01_IFRS_學習講義.html'), result.replace(/[\t ]+$/gm, ''), 'utf8');
console.log(JSON.stringify({ sections: ids.length, originalQuestions: 20, shortAnswers: 12, output: path.join(folder, 'Ch01_IFRS_學習講義.html') }));
