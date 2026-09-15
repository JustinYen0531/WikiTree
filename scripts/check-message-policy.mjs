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
  console.log('PASS only completed knowledge-note messages can expose note actions');
  console.log('PASS current and saved target-switch notices render as non-insertable status messages');
} finally {
  await vite.close();
}
