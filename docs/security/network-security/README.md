---
title: "探索苗圃改用 OpenAI SDK"
domain: "資工/網路安全"
branch: "探索系統的 API 安全與標準化"
parent: "WikiTree 探索苗圃"
tags: ["OpenAI SDK", "Responses API", "API key", "網路安全"]
summary: "將探索苗圃的模型呼叫改用官方 OpenAI SDK，並把 API 金鑰限制在本機後端。"
---

# 探索苗圃改用 OpenAI SDK

## 為什麼要做

探索苗圃目前透過本機 Codex `app-server` 呼叫模型。這是 Codex 應用程式的通訊介面，並非 OpenAI API 的官方 JavaScript SDK。改用官方 SDK，可讓探索功能直接使用 OpenAI API 支援的請求介面與工具，降低對 Codex CLI 協定的依賴，也讓 API 呼叫方式更容易依官方文件維護。

## 目標

- 只調整探索苗圃的模型呼叫；WikiTree 一般對話與筆記生成維持原有路徑。
- 以官方 `openai` JavaScript SDK 呼叫 Responses API。
- 保留探索時的網路搜尋能力與結構化 JSON 輸出。
- API 金鑰只由本機後端讀取環境變數 `OPENAI_API_KEY`，不傳到瀏覽器、不存進探索任務或素材資料。
- 讓探索設定頁清楚顯示 API key 的連線狀態與可用模型。

## 本機設定

在 Windows 使用者環境變數中設定 `OPENAI_API_KEY`，再重新啟動 WikiTree。探索苗圃會向 OpenAI Platform 驗證金鑰並載入該帳號可用的 GPT 模型；設定介面不會要求使用者把金鑰貼進網頁。若尚未設定或金鑰無效，探索任務不能開始。Codex/ChatGPT 登入不會代替這個 API key。

## 安全與相容性邊界

- `OPENAI_API_KEY` 是 OpenAI Platform API 憑證，與 ChatGPT/Codex 登入授權分開管理；使用 API 可能依 Platform 帳務計費。
- 不在程式碼、前端設定、任務 JSON 或 Git 中保存金鑰。
- 探索呼叫只提供必要的候選來源與題目，不開放本機檔案、shell 或任意工具存取。
- 保留現有來源驗證、重複項目過濾、日期限制及執行紀錄流程。
- 既有模型選擇若不在 API 帳號可用模型中，需提示使用者重新選擇。

## 完成條件

1. 探索任務使用官方 SDK 與 Responses API 執行，僅啟用 `web_search` 工具，並以 JSON 格式要求結果。
2. 探索苗圃能辨識 API key 缺失、模型清單載入失敗及請求失敗，且不洩漏憑證。
3. 網路搜尋、JSON 解析、素材驗證與排程流程仍可銜接。
4. 文件說明 API key 設定位置及其與 Codex 登入的差異。

## 生長枝葉

- 探索工作流程如何限制模型工具權限與外部來源範圍？
- 如何用最少的使用者資料完成來源核實與素材生成？

## Summary Capsule

探索苗圃採用官方 OpenAI SDK，是為了讓模型請求使用 OpenAI API 的官方介面並降低對本機 Codex 協定的耦合。API key 留在本機後端環境，探索功能與一般 Codex 登入路徑分開；既有來源核實及素材保存防線繼續生效。
