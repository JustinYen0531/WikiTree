import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const { canInsertKnowledgeNote, isStatusMessage } = await vite.ssrLoadModule('/src/utils/chatMessagePolicy.ts');
  const completedNote = { id: 'bot-1', role: 'arborist', kind: 'note', content: '# 有意義的筆記' };

  assert.equal(canInsertKnowledgeNote(completedNote), true);
  assert.equal(canInsertKnowledgeNote({ ...completedNote, delivery: 'streaming' }), false);
  assert.equal(canInsertKnowledgeNote({ ...completedNote, delivery: 'incomplete' }), false);
  assert.equal(canInsertKnowledgeNote({ ...completedNote, content: '   ' }), false);
  assert.equal(canInsertKnowledgeNote({ role: 'user', content: '# 使用者輸入' }), false);
  assert.equal(canInsertKnowledgeNote({ id: 'sys-1', role: 'arborist', content: '任何舊版系統提示' }), false);

  const completedAnswer = { id: 'bot-ask-1', role: 'arborist', kind: 'answer', content: '這是一段直接回答。' };
  assert.equal(isStatusMessage(completedAnswer), false);
  assert.equal(canInsertKnowledgeNote(completedAnswer), false);

  const currentStatus = { role: 'arborist', kind: 'status', content: '**操作目標已切換**' };
  const legacyStatus = { role: 'arborist', content: '🔄 **【操作目標已切換】**\n已切換。' };
  const emptyResult = { role: 'arborist', content: 'AI 未回傳可用內容。' };
  assert.equal(isStatusMessage(currentStatus), true);
  assert.equal(isStatusMessage(legacyStatus), true);
  assert.equal(isStatusMessage(emptyResult), true);
  assert.equal(canInsertKnowledgeNote(currentStatus), false);
  assert.equal(canInsertKnowledgeNote(legacyStatus), false);
  assert.equal(canInsertKnowledgeNote(emptyResult), false);

  const component = readFileSync(new URL('../src/components/AntigravityPlugin.tsx', import.meta.url), 'utf8');
  assert.match(component, /kind: 'status'[\s\S]*?操作目標已切換/);
  assert.match(component, /if \(isStatusMessage\(msg\)\)/);
  assert.match(component, /if \(!canInsertKnowledgeNote\(msg\)\) return null;/);
  assert.match(component, /role="tablist" aria-label="對話方式"/);
  assert.match(component, />\s*詢問\s*<\/button>/);
  assert.match(component, />\s*編修\s*<\/button>/);
  assert.match(component, /interactionMode: requestInteractionMode/);
  assert.match(component, /msg\.kind === 'answer'/);

  const server = readFileSync(new URL('../cli-server.cjs', import.meta.url), 'utf8');
  const providers = readFileSync(new URL('../ai-providers.cjs', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(server, /payload\.interactionMode === 'ask'/);
  assert.match(server, /【詢問模式】/);
  assert.match(server, /不得假設使用者要建立或修改筆記/);
  assert.match(providers, /options\.mode === 'ask'/);
  assert.match(css, /\.arborist-mode-switch/);
  console.log('PASS only completed knowledge-note messages can expose note actions');
  console.log('PASS current and saved target-switch notices render as non-insertable status messages');
  console.log('PASS ask answers remain separate from edit-mode note actions');
  console.log('PASS the composer exposes a two-option ask/edit switch');
} finally {
  await vite.close();
}
