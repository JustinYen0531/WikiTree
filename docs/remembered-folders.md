# WikiTree 自有筆記天地

WikiTree 桌面版現在自動管理自己的筆記天地，不再把使用者最後打開的外部資料夾當成產品本體。

- 預設位置是使用者的「文件／WikiTree」。
- 第一次啟動會建立「我的森林」「收件苗圃」和一篇歡迎筆記。
- 左側「WIKITREE」直接顯示這個筆記天地裡的資料夾與筆記。
- 「收進 WikiTree」可選擇 Markdown、純文字文件或整個資料夾，預覽後再選擇目的地。
- 收進來時只複製內容；外部原檔不會移動或刪除，也不會和 WikiTree 版本暗中同步。
- 同名筆記不會被覆蓋，會自動加上編號建立另一份。
- 舊版曾記住的外部資料夾仍留在原本位置，但不會再自動成為目前的 WikiTree；需要時可使用「收進 WikiTree」手動帶入。

筆記仍保存為一般 Markdown，可以自行備份與搬移。內部的 `.wikitree` 只保存這座筆記天地的身分與功能資料，不會顯示在筆記樹裡。

驗證：`npm run check:library`、`node scripts/check-workspaces.mjs`、`node scripts/check-markdown.mjs`、`node --check cli-server.cjs`、`npm run build`、`git diff --check`。檢查只使用測試暫存資料夾與靜態產生內容，不開啟瀏覽器，也不讀寫真正的「文件／WikiTree」。
