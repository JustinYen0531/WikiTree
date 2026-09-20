export type ChatMessageKind = 'note' | 'answer' | 'status';
export type ChatMessageDelivery = 'streaming' | 'incomplete';

export interface ChatMessagePolicyInput {
  id?: string;
  role: 'user' | 'arborist';
  content: string;
  kind?: ChatMessageKind;
  delivery?: ChatMessageDelivery;
}

const LEGACY_STATUS_MARKERS = [
  '【操作目標已切換】',
  'AI 未回傳可用內容',
  'AI 未回傳文字',
];

/**
 * 舊版對話沒有 kind 欄位，因此只辨識 WikiTree 曾經寫入對話的明確系統提示。
 * 不用模糊關鍵字猜測，避免把真正的短筆記誤判成狀態通知。
 */
export function isStatusMessage(message: ChatMessagePolicyInput): boolean {
  if (message.kind === 'status') return true;
  if (message.kind === 'note' || message.kind === 'answer') return false;

  const content = message.content.trim();
  return message.role === 'arborist'
    && (message.id?.startsWith('sys-') === true
      || LEGACY_STATUS_MARKERS.some((marker) => content.includes(marker)));
}

/**
 * 寫入筆記採正向許可：必須是完整送達、有實際文字、且不是介面狀態的 Arborist 成果。
 */
export function canInsertKnowledgeNote(message: ChatMessagePolicyInput): boolean {
  return message.role === 'arborist'
    && !message.delivery
    && message.kind !== 'answer'
    && message.content.trim().length > 0
    && !isStatusMessage(message);
}
