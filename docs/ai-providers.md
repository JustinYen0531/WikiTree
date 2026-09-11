# AI 廠商、模型與首次登入

## 本機使用

1. 更新後執行 `npm install`，再執行 `npm run dev`。若原本的本機 AI 服務還在執行，須先重新啟動。
2. 在 AI 側邊欄的「應用程式模式」，到輸入區下方選擇廠商。
3. OpenAI：電腦需有官方 Codex CLI。按「登入／重新連線」，再按「開啟官方登入頁面」，使用包含 Codex 權限的 ChatGPT 帳號授權。
4. Google：Gemini CLI 已列入專案依賴。按「登入／重新連線」，在 Google 自行開啟的官方登入頁面授權。使用有對應資格的個人或組織帳號，實際存取權限以 Google 為準。
5. 登入完成後，選擇官方工具回傳的模型，再送出問題。廠商、模型選擇會記住；每次請求都使用所選廠商，不自動改用其他廠商或 API。
6. 授權仍有效時會沿用，不必每次重新登入；Google 在本機服務重啟後需按一次「登入／重新連線」恢復連線。過期、撤銷或更換帳號時可能要重新授權。
7. 「取消登入」停止這次登入；「中斷連線」結束本機連線，但不撤銷已儲存的授權。若要撤銷授權，請到廠商的帳號安全設定管理。

Antigravity 保留原有連線方式與預設模型，不把它誤標為 Google 訂閱。

## Claude 的範圍

目前 Claude 入口會明確顯示「尚未支援訂閱登入」，不會送出生成請求。Anthropic 官方文件不允許第三方產品提供 Claude.ai 登入或代用使用者的 Free、Pro、Max 訂閱憑證；本次沒有改接另外計費的 API，也沒有複製 Claude Code 的登入資料。

## 資料與實作範圍

- OpenAI 使用官方 Codex App Server；Google 使用 Gemini CLI ACP。模型清單取自 `model/list` 或 `session/new` 的結果。
- 官方工具自行處理登入與憑證更新，WikiTree 不收密碼、不把憑證傳到前端或寫入專案。授權資料由官方工具存放在使用者家目錄下 `.wikitree/ai/openai` 與 `.wikitree/ai/google`，不與其他 Codex/Gemini 登入混用。
- 前端只記住廠商與模型名稱。登入網址只在登入期間顯示；帳號 email 與原始錯誤診斷不傳到前端。
- 新廠商的提問包含目前筆記內容，工作目錄使用獨立暫存區，不把整個筆記資料夾交給工具。生成文字仍需透過原有確認插入流程進入筆記。
- Google 關閉內建工具；Codex 使用唯讀限制並關閉 shell。送到 WikiTree 的工具執行與檔案操作請求會被拒絕。原有 Antigravity 行為未改動。
- 新登入、模型與生成入口只接受本機來源與專用請求標記。生成中不能切換廠商；同一廠商的重複生成會被拒絕。

## 驗證

`node scripts/check-ai-providers.mjs`：使用模擬官方介面，檢查登入、模型選擇、串流、取消、錯誤、來源限制與憑證隔離。

`node scripts/check-chat-stream.mjs`、`npm run build`、`git diff --check`：確認原有串流與建置。

已用安裝在本機的 Codex 0.136.0 與 Gemini CLI 0.59.0 確認介面初始化；未代替使用者登入、未送出真實模型生成、未做瀏覽器外觀或互動驗證。官方工具與帳號方案不同，實際登入、模型權限、額度或組織政策仍需使用者授權後確認。

## 官方資料

- [Codex App Server：登入與模型清單](https://learn.chatgpt.com/docs/app-server)
- [Gemini CLI ACP](https://geminicli.com/docs/cli/acp-mode/)
- [Gemini CLI 帳號登入](https://geminicli.com/docs/get-started/authentication/)
- [Claude 身分驗證使用範圍](https://code.claude.com/docs/en/legal-and-compliance)
