# AI 串流回覆

桌面版送出問題後，側邊欄會立即顯示等待狀態。OpenAI Codex App Server 一有回覆文字，就會更新同一則訊息，不必等待整段完成。

本機服務使用 NDJSON 把狀態、文字片段、完成與錯誤事件傳到前端。前端會保留已收到的文字，並在連線中斷時顯示真實錯誤。

先前專屬於 `agy` 的串流執行器已刪除。現在只有 OpenAI App Server 能產生 AI 回覆；探索模式仍使用相同的受限制執行邊界。

驗證：`node scripts/check-chat-stream.mjs`、`node scripts/check-ai-providers.mjs`、`node --check cli-server.cjs`、`npm run build`。所有檢查使用模擬事件，不會啟動真實 AI 請求，也不進行瀏覽器視覺驗證。
