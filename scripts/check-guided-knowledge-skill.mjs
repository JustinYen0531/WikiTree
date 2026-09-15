import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const skillId = 'guided-knowledge-construction';
const rawSkill = readFileSync(new URL(`../skills/${skillId}/SKILL.md`, import.meta.url), 'utf8');

assert.match(rawSkill, new RegExp(`^---\\s*\\nname: ${skillId}\\n`));
assert.match(rawSkill, /Ask → Interpret → Enrich → Integrate → Continue/);
assert.match(rawSkill, /guided-knowledge-state/);

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const { DEFAULT_SKILLS, GUIDED_KNOWLEDGE_CONSTRUCTION_SKILL_ID } = await vite.ssrLoadModule('/src/utils/learningSkills.ts');
  assert.equal(GUIDED_KNOWLEDGE_CONSTRUCTION_SKILL_ID, skillId);
  const skill = DEFAULT_SKILLS.find(item => item.id === skillId);
  assert.ok(skill, '內建技能清單缺少引導式知識建構');
  assert.equal(skill.title, '引導式知識建構');
  assert.equal(skill.rawContent, rawSkill);
  assert.ok(Array.isArray(skill.overview) && skill.overview.length >= 2);
} finally {
  await vite.close();
}

const serverSource = readFileSync(new URL('../cli-server.cjs', import.meta.url), 'utf8');
assert.match(serverSource, /loadBundledSkill\('guided-knowledge-construction'\)/);
assert.match(serverSource, /guidedKnowledgeMode/);
assert.match(serverSource, /conversationHistorySection/);

const require = createRequire(new URL('../cli-server.cjs', import.meta.url));
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const isolatedWorkspace = path.join(projectRoot, '__guided-knowledge-test-workspace__');
const isolatedProcess = new Proxy(process, {
  get(target, property) {
    if (property === 'cwd') return () => isolatedWorkspace;
    return Reflect.get(target, property);
  },
});
let handler;
vm.runInNewContext(serverSource, {
  __dirname: projectRoot,
  require: name => {
    if (name === 'http') {
      return { createServer: callback => {
        handler = callback;
        return { on() {}, listen() {} };
      } };
    }
    if (name === 'os') {
      return { ...require(name), homedir: () => isolatedWorkspace };
    }
    return require(name);
  },
  process: isolatedProcess,
  TextDecoder,
  Buffer,
  URL,
  console,
  setTimeout,
  clearTimeout,
});

const skillsResponse = await new Promise(resolve => {
  const req = new EventEmitter();
  Object.assign(req, { url: '/api/skills', method: 'GET', headers: {} });
  const res = {
    status: 200,
    setHeader() {},
    writeHead(status) { this.status = status; },
    end(data) { resolve({ status: this.status, body: JSON.parse(data) }); },
  };
  handler(req, res);
});
assert.equal(skillsResponse.status, 200);
const serverSkill = skillsResponse.body.skills.find(item => item.id === skillId);
assert.ok(serverSkill, '本機服務沒有載入引導式知識建構');
assert.equal(serverSkill.title, '引導式知識建構');
assert.match(serverSkill.content, /每輪循環/);

const panelSource = readFileSync(new URL('../src/components/AntigravityPlugin.tsx', import.meta.url), 'utf8');
assert.match(panelSource, /GUIDED_KNOWLEDGE_CONSTRUCTION_SKILL_ID/);
assert.match(panelSource, /history: guidedHistory/);

console.log('PASS 引導式知識建構已進入內建庫、保留多輪對話，並套用專屬逐輪回覆規則');
