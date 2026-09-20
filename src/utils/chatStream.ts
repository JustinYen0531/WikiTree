export type ChatStreamEvent =
  | { type: 'status' | 'delta' | 'done' | 'error'; text: string }
  | { type: 'library'; files: Array<{ id: string; path: string }> };

export async function readChatStream(response: Response, onEvent: (event: ChatStreamEvent) => void): Promise<void> {
  if (!response.body) throw new Error('無法接收即時回覆');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let completed = false;
  const consume = (line: string) => {
    if (!line.trim() || completed) return;
    const event = JSON.parse(line) as ChatStreamEvent;
    if (event.type === 'error') throw new Error(event.text);
    if (event.type === 'done') completed = true;
    onEvent(event);
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = pending.split('\n');
      pending = lines.pop() || '';
      for (const line of lines) consume(line);
      if (done) { consume(pending); break; }
    }
    if (!completed) throw new Error('連線中斷，已收到的文字仍保留。');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
