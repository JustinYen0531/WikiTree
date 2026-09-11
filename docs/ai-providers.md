# AI 廠商、模型與首次登入

## 本機使用

1. 更新後執行 `npm install`，再執行 `npm run dev`。若原本的本機 AI 服務還在執行，須先重新啟動。
2. 在 AI 側邊欄的「應用程式模式」，到輸入區下方選擇廠商。
3. Google Gemini：這是目前既有 Anti-Gravity 服務的正式顯示名稱，沿用原本連線與模型，不需要再登入第二個 Google 服務。
4. OpenAI：電腦需有官方 Codex CLI。按「登入／重新連線」，再按「開啟官方登入頁面」，使用包含 Codex 權限的 ChatGPT 帳號授權。
5. 登入完成後，選擇官方工具回傳的模型，再送出問題。廠商、模型選擇會記住；每次請求都使用所選廠商，不自動改用其他廠商或 API。
6. 授權仍有效時會沿用，不必每次重新登入；Google 在本機服務重啟後需按一次「登入／重新連線」恢復連線。過期、撤銷或更換帳號時可能要重新授權。
7. 「取消登入」停止這次登入；「中斷連線」結束本機連線，但不撤銷已儲存的授權。若要撤銷授權，請到廠商的帳號安全設定管理。

「Google Gemini」就是目前的 Anti-Gravity 服務；設定裡不再顯示兩個 Google 選項，也不會把它誤標成另一個 Gemini CLI 帳號。

## 資料與實作範圍

- 目前的 Google Gemini 使用既有 Anti-Gravity 服務；OpenAI 使用官方 Codex App Server。OpenAI 模型清單取自 `model/list`。
- 官方工具自行處理登入與憑證更新，WikiTree 不收密碼、不把憑證傳到前端或寫入專案。Codex 授權資料由官方工具存放在使用者家目錄下 `.wikitree/ai/openai`，不與其他登入混用。
- 前端只記住廠商與模型名稱。登入網址只在登入期間顯示；帳號 email 與原始錯誤診斷不傳到前端。
- 新廠商的提問包含目前筆記內容，工作目錄使用獨立暫存區，不把整個筆記資料夾交給工具。生成文字仍需透過原有確認插入流程進入筆記。
- Codex 使用唯讀限制並關閉 shell。送到 WikiTree 的工具執行與檔案操作請求會被拒絕。Google Gemini 沿用原有 Anti-Gravity 行為。
- 新登入、模型與生成入口只接受本機來源與專用請求標記。生成中不能切換廠商；同一廠商的重複生成會被拒絕。

## 驗證

`node scripts/check-ai-providers.mjs`：使用模擬官方介面，檢查登入、模型選擇、串流、取消、錯誤、來源限制與憑證隔離。

`node scripts/check-chat-stream.mjs`、`npm run build`、`git diff --check`：確認原有串流與建置。

已用安裝在本機的 Codex 0.136.0 確認介面初始化；未代替使用者登入、未送出真實模型生成、未做瀏覽器外觀或互動驗證。官方工具與帳號方案不同，實際登入、模型權限、額度或組織政策仍需使用者授權後確認。

## 官方資料

- [Codex App Server：登入與模型清單](https://learn.chatgpt.com/docs/app-server)
