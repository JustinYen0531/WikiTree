# AI 廠商、模型與首次登入

## 目前可用連線

WikiTree 目前只保留 OpenAI · Codex。先前透過 Antigravity／`agy` 使用 Google Gemini 的方式已完整停用，不會再由一般對話、探索任務或終端入口呼叫。

1. 更新後執行 `npm install`，再執行 `npm run dev`。若本機服務已在執行，請先關閉後重新啟動。
2. 在 AI 工作台的設定區按「登入／重新連線」。
3. 開啟官方登入頁面，使用包含 Codex 權限的 ChatGPT 帳號授權。
4. 登入完成後，從官方工具回傳的模型中選擇，再送出問題。

舊探索任務若曾使用 Antigravity，讀取時會自動保持暫停，也不能立即執行。使用者必須編輯任務、確認 OpenAI 模型並儲存後，才能重新啟用。

## 資料與安全邊界

- OpenAI 使用官方 Codex App Server，模型清單取自 `model/list`。
- 官方工具自行處理登入與憑證更新；WikiTree 不收密碼，也不把憑證傳到前端或寫入專案。
- Codex 授權資料由官方工具存放在使用者家目錄下 `.wikitree/ai/openai`。
- 前端只記住廠商與模型名稱；登入網址只在登入期間顯示。
- Codex 使用唯讀限制並關閉 shell。一般筆記對話不能瀏覽網路；只有探索模式能使用受限制的搜尋。
- AI 登入、模型、生成與探索變更入口只接受本機 WikiTree 的專用請求。
- 未來若恢復 Google Gemini，必須改用 Google 明確允許的官方 API／SDK 與使用者自己的憑證，不會恢復 Antigravity 轉接。

## 驗證

- `node scripts/check-ai-providers.mjs`：檢查 OpenAI 登入、模型、串流、取消、錯誤與憑證隔離。
- `node scripts/check-exploration-scheduler.mjs`：檢查舊 Antigravity 任務會被暫停且無法新增。
- `node scripts/check-chat-stream.mjs`：檢查前端串流解析與中斷處理。
- `npm run build`、`git diff --check`：確認型別、建置與差異格式。

驗證不會代替使用者登入，也不會送出真實模型請求。實際模型權限、額度與組織政策仍以登入帳號為準。

## 官方資料

- [Codex App Server：登入與模型清單](https://learn.chatgpt.com/docs/app-server)
