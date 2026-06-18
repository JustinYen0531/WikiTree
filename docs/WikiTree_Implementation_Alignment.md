# WikiTree Implementation Alignment

這份文件用來對照 WikiTree 的產品願景與目前專案已經做出的結構，作為後續實作收斂與 roadmap 的依據。

## 想起來與做起來的共同處

把目前專案結構攤開來看，WikiTree 已經不是一個單純的 AI 筆記 Demo。它其實已經長出幾個和定位高度重合的骨架，只是有些還停在雛形或命名尚未對齊。

### 1. Enough Editor 已經存在

對應程式：

- `Editor.tsx`
- `AntigravityPlugin.tsx`
- `VersionHistory.tsx`
- `versionControl.ts`

目前已經有：

- Markdown / WYSIWYG 混合編輯
- 輕量 block 編輯
- AI Ask
- AI Agent / Edit with Groq
- Agent chips
- 版本快照
- 還原 snapshot

這和 Enough Editor 的理念一致：它不是完整 Notion，也不是大型 IDE，而是讓使用者能快速改一點、補一點、修一點、發布出去。

目前最像 GitHub 網頁編輯器的地方是：

```text
打開筆記
↓
微調內容
↓
AI 協助補強或糾錯
↓
儲存 / 建立版本快照
↓
發布
```

這已經支撐了「80% 的知識修改」。

### 2. Knowledge Publishing 已經存在

對應程式：

- `PublishNoteModal.tsx`
- `PublishModal.tsx`
- `publisher.ts`
- `supabase.ts`

目前已經有兩種發布概念：

- 發布單篇筆記到公共筆記池
- 將本地筆記編譯成靜態網站

其中 `PublishNoteModal` 已經開始接近 Knowledge Commons：

- 有作者資訊
- 有筆記分類
- 有課程 / 檢定 / 自訂分類
- 有公開筆記編號
- 有 Supabase / local fallback

這代表 WikiTree 已經不只是「我在本地寫筆記」，而是開始進入：

```text
我的筆記
↓
發布成公共知識
↓
被其他人搜尋 / 互動 / 延伸
```

### 3. Forest 概念已經存在

對應程式：

- `ForestDashboard.tsx`
- `CourseSearch.tsx`
- `supabase.ts`
- `Sidebar.tsx`

目前已經有：

- 我的森林
- 已發布筆記
- 澆水 / waterings
- 留言 / messages
- 使用者的筆記活動紀錄
- Explore guest / 搜尋公開筆記

這些已經對應到 Knowledge Ecosystem 的早期版本。

現在的 Forest 還比較像 dashboard，但它已經暗示了未來可以變成：

```text
個人樹屋
↓
我的樹
↓
我的發布
↓
別人對我的筆記澆水 / 留言 / Fork
↓
知識影響力
```

### 4. Knowledge Review Assistant 已經有雛形

對應程式：

- `AntigravityPlugin.tsx`
- `Editor.tsx`
- `App.tsx`

目前 AI 已經分成兩種模式：

- Ask：一般對話，會過濾開場 / 正文 / 結尾
- Agent：選取文字後做 semi-agent 編輯，不做正文抽取，直接套用結果

Agent chips 已經開始接近真正的 Context AI：

- 加入考點
- 補上圖形
- 加入記憶技巧
- 生成練習題
- 連到前置概念
- 常見誤解
- 教授上課補充

這和產品定位裡的「AI as Infrastructure」一致。

AI 不是主角，它是長在筆記裡的輔助工具。

```text
選取一段知識
↓
請 AI Review / Grow / Clarify
↓
直接套用到筆記
```

這比單純聊天更接近 WikiTree 的核心。

### 5. Versioning 已經有本地雛形

對應程式：

- `VersionHistory.tsx`
- `versionControl.ts`

目前已經有：

- snapshot
- diff
- restore
- file state tracking

這是 Knowledge Versioning 的底層雛形。

只是目前它比較像「本地歷史版本」，還不是「公共知識版本圖」。

未來要從：

```text
本地 snapshot
```

往：

```text
公開版本
Fork lineage
Credit chain
Knowledge Tree
```

演化。

## 目前最重要的落差

目前專案已經有 Editor、AI、Publish、Forest、Version History，但 GitHub for Knowledge 的核心還缺三個關鍵資料關係。

### 1. Fork 關係還不存在

現在可以發布筆記，也可以搜尋筆記，但還沒有真正的：

```text
forked_from_note_id
original_author_id
root_note_id
lineage_depth
```

所以目前比較像「發布與瀏覽」，還不是完整的 Fork。

### 2. Credit Chain 還不存在

現在發布筆記有作者，但還沒有完整的 attribution chain。

未來一篇筆記應該能知道：

```text
Original: Justin
Forked by: Kevin
Forked by: Amy
Current version: Leo
```

這會讓「建立副本」升級成真正的「Fork」。

### 3. Knowledge Tree 還不存在

目前 Forest 是個人 dashboard，但還沒有顯示某篇筆記的分支家族樹。

未來需要：

```text
Note Family Tree
Branch Graph
Fork Count
Derivative Versions
Compare Changes
```

這會讓 WikiTree 從「公開筆記平台」正式變成「知識版本平台」。

## 下一步產品收斂

如果要讓「想起來」和「做起來」真正接上，下一步不應該繼續堆 AI。

下一步應該優先做：

```text
Public Note
↓
Fork Note
↓
Create My Version
↓
Edit with Enough Editor
↓
Publish Fork
↓
Show Credit
```

也就是先做出最小 Fork 閉環。

## 從 GitHub 協作翻譯成 WikiTree 機制

WikiTree 要借鑑 GitHub 的地方，不是它能存程式碼，而是它定義了：

> 陌生人如何安全地共同修改同一個作品。

對 WikiTree 來說，核心問題也是：

> 同學、學長姐、老師、陌生人，如何安全地共同培育同一棵知識樹。

因此，GitHub 的協作機制可以翻譯成 WikiTree 的知識協作語言。

### 1. Repository -> 知識樹

GitHub 的 Repository 不是單一檔案，而是一個作品的完整歷史、檔案、討論與修改紀錄。

WikiTree 裡對應的是：

```text
一門課 / 一個主題的知識樹
```

例如：

```text
NCCU / 個體經濟學
```

裡面可以包含：

- 章節
- 筆記
- 題型
- 版本
- 貢獻者
- 討論
- Fork 分支

這讓 WikiTree 的基本單位不只是 note，而是可以逐步長成一棵 subject tree。

### 2. Issue -> 樹洞

Issue 的價值在於：不會寫程式的人也能參與專案。

WikiTree 也需要這個入口。

不是每個人都想直接改筆記，但很多人都能指出問題：

- 這裡公式怪怪的
- 這段可以講更白話嗎
- 可以補考試例題嗎
- 這個定義和老師上課講的不一樣
- 這裡需要來源

這可以被命名為「樹洞」。

樹洞讓知識協作不只屬於會編輯的人，也屬於會發現問題的人。

### 3. Fork -> 樹枝

Fork 不是複製。

Fork 的意義是：

> 我從你的版本長出一個分支，而且保留血緣關係。

WikiTree 裡這是最重要的動作之一。

例如：

```text
原版：A 同學的個經筆記
↓
Fork：加入圖解與考點的版本
↓
Fork：超簡短考前版
```

這樣知識不會變成無數份匿名複製，而會形成可追溯的知識家族樹。

### 4. Pull Request -> 回枝請求

GitHub 的 Pull Request 是：

```text
我 fork 你的專案
↓
我改了一些內容
↓
我發 Pull Request
↓
你看差異
↓
你覺得好，就 merge 進主版本
```

WikiTree 可以翻譯成：

```text
我 Fork 你的筆記
↓
我補了例子 / 圖解 / 考點
↓
我送出回枝請求
↓
原作者或維護者 Review
↓
接受後合併回主樹
```

候選命名：

- 貢獻請求
- 合併請求
- 回枝請求

其中「回枝請求」最有 WikiTree 的品牌語感，因為它表示分支長出去後，也可以把好的養分帶回主樹。

### 5. Review -> 知識審查

GitHub 的 Review 不是直接接受，而是逐行討論。

WikiTree 的 Review 可以是：

- 對某一段筆記留言
- 建議補例子
- 指出概念錯誤
- 要求補來源
- AI Review
- 老師 Review
- 維護者 Review

Review 的目標不是讓知識變多，而是讓知識變乾淨。

這會避免共同筆記越改越亂。

### 6. Merge -> 合併回主樹

Merge 的意義是：

> 這個修改被社群或維護者承認，成為正式版本的一部分。

WikiTree 裡 Merge 可以區分不同層級：

- 個人版本
- 社群推薦版本
- 課程主樹版本
- 老師 / 助教認證版本

這一步很重要，因為 WikiTree 不是讓所有人直接改同一份內容，而是讓知識先分支，再經過 Review 後回到主樹。

## WikiTree 的協作主流程

把 GitHub 的協作語言翻譯後，WikiTree 可以形成這條主流程：

```text
看見一篇知識
↓
覺得有問題 -> 開樹洞 Issue
↓
想自己改 -> Fork 成自己的樹枝
↓
用 Enough Editor + AI 微調
↓
發布自己的版本
↓
送出回枝請求
↓
原作者 / 維護者 Review
↓
接受後 Merge
↓
所有貢獻者保留 Credit
```

這條流程就是「如何實踐 WikiTree 精神」。

它把抽象願景落成可做的產品機制：

- Repository -> 知識樹
- Issue -> 樹洞
- Fork -> 樹枝
- Pull Request -> 回枝請求
- Review -> 知識審查
- Merge -> 合併回主樹
- Credit -> 貢獻者被看見

### 對目前產品的實作啟示

短期不需要一次做完整 GitHub。

最小可行順序可以是：

1. 先做 Fork，保留 parent / root / original author。
2. 再做樹洞，讓使用者能對公開筆記提出問題。
3. 再做回枝請求，讓 Fork 後的版本可以送回原作者。
4. 再做 Review UI，比較兩個版本的差異。
5. 最後做 Merge，把接受的改動合併回主樹。

這比繼續堆更多 AI chips 更接近 WikiTree 的主菜。

### 建議的資料模型方向

`published_notes` 可以逐步補上：

```text
id
note_number
title
content
author_user_id
author_username
created_at

root_note_id
parent_note_id
forked_from_note_id
original_author_user_id
credit_chain
version_label
fork_count
```

先不用一次做完整 Git merge。

只要先做到：

```text
這篇是從哪篇 Fork 來的
原作者是誰
目前作者是誰
有多少人 Fork
```

產品定位就會立起來。

## 命名對齊建議

目前功能與品牌語言可以逐步對齊：

| 現在功能 | 產品語言 |
| --- | --- |
| 發布筆記 | Plant / Publish |
| 我的森林 | Forest / Treehouse |
| AI 編輯 | Grow / Review |
| 建立副本 | Fork / Branch |
| 留言 | Treehole |
| 讚 / like | Watering |
| 版本歷史 | Growth Rings |
| 筆記編號 | Leaf ID / Note ID |

命名不用一次全部改，但計劃書可以先定調：WikiTree 的語言應該圍繞森林、分支、成長、傳承。

## 總結

目前「想起來」和「做起來」的共同處是：

WikiTree 已經具備 Enough Editor、AI Review、Publish、Forest、Version Snapshot 這些局部能力。

它缺的不是更多 AI，而是把這些能力串成 Knowledge Workflow：

```text
Explore
↓
Fork
↓
Edit
↓
Review
↓
Publish
↓
Credit
↓
Knowledge Tree
```

因此，WikiTree 目前最準確的產品狀態是：

> 一個已經具備 AI 輔助編輯、公開發布、個人森林與版本快照的知識平台雛形，下一步應該把核心從「發布筆記」推進到「Fork 筆記」，讓知識版本控制成為產品主軸。
