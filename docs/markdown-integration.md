# Markdown 整合

以 main 的 0f72606 為底，移植 codex/laptop-work（eb9d977）的筆記編輯、提醒框、Notion HTML 轉換、LaTeX、Mermaid 與公開筆記預覽／副本功能。

保留 main 的首頁、AI 雙氣泡、縮略預覽、確認插入與桌面啟動器。這是功能移植，沒有合併遠端全部歷史；學期切換、其他 AI 服務與社群互動功能不在本次範圍。

## 本機試用

1. 在專案資料夾執行 `npm run dev`，使用終端機顯示的本機網址。
2. 開啟筆記資料夾，載入 `examples/Markdown功能示範.md`。
3. 編輯模式可看提醒框、公式與流程圖區塊；切換分割預覽可看整篇排版。
4. 開啟資料夾中的 Notion HTML 匯出檔，會建立 Markdown 副本；同名時加編號，原始 HTML 保留。匯入不會搬移圖片附件。
5. 線上探索中展開公開筆記，可預覽全文或下載 Markdown 副本。這一步需要已設定的線上服務與既有公開筆記。

驗證命令：`node scripts/check-markdown.mjs`、`npm run build`、`git diff --check`。不執行瀏覽器驗證。

靜態閱讀網站輸出也使用新的公式及提醒框處理；輸出的公式字型與 Mermaid 程式由 CDN 載入，因此該功能需要網路。
