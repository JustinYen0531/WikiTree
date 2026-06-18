# WikiTree Product Positioning

## 一句話定位

WikiTree 是一個協作式知識版本平台，讓學生可以 Fork 好筆記、微調成自己的版本、透過 AI 做輕量 Review，並在發布時保留原作者 Credit，讓知識像樹一樣持續分支與成長。

## 核心概念

WikiTree 不是 Notion + AI。

WikiTree 更接近 GitHub for Knowledge。

它不是要取代大型筆記工具，也不是要做最完整的 AI 寫作平台。它提供的是一個 Enough Editor：一個夠用、簡便、線上可改的筆記空間，讓使用者可以快速修改、整理、補強別人的好筆記，形成自己的版本。

大型創作、複雜資料庫、完整知識管理，可以交給 Notion、Obsidian、Codex、MCP 等更完整的工具。WikiTree 專注在知識流動本身：

- 發現好筆記
- Fork 成自己的版本
- 微調與補強
- AI 輕量 Review
- 發布自己的版本
- 保留原作者 Credit
- 讓知識持續分支與演化

## Enough Editor

Enough Editor 的意思不是功能陽春，而是刻意不做過重。

它的目標不是打敗 Notion 或 Obsidian，而是像 GitHub 網頁編輯器一樣：

> Review、改一點、Commit，就在這裡完成。

WikiTree 的編輯器應該支援使用者快速完成以下行為：

- 修正錯字
- 改寫幾段
- 補一個例子
- 加入考點
- 讓 AI 檢查概念錯誤
- 發布成自己的版本

這是一個面向知識協作的夠用編輯器，而不是大型個人知識庫工作台。

## 使用情境

一位學生看到別人的筆記：

> 這個人的筆記不錯，但有些地方我不太喜歡。

他可以：

1. Fork 這份筆記
2. 建立自己的版本
3. 在線上微調內容
4. 請 AI 協助糾錯、補例子、加考點
5. 發布自己的版本
6. 保留原作者 Credit
7. 讓自己的版本也能被其他人 Fork

這裡的關鍵不是建立副本，而是 Fork。

複製代表從此無關；Fork 代表保留共同祖先。

## AI 的角色

AI 不是 WikiTree 的主角。

真正重要的是 Knowledge Workflow。AI 只是其中一個輕量協作者。

WikiTree 的 AI 不應該被定位成完整寫作代理，而應該更像 Knowledge Review Assistant：

- 糾錯
- 補考點
- 加例子
- 補圖形
- 生成練習題
- 提醒常見誤解
- Review 修改內容

AI 的任務不是取代使用者寫筆記，而是在使用者 Fork、微調、發布的過程中，提供剛好夠用的協作能力。

## 與一般 AI 筆記產品的差異

很多 AI 筆記工具的流程是：

```text
生成
↓
結束
```

WikiTree 的流程是：

```text
發布
↓
Fork
↓
修改
↓
AI Review
↓
再發布
↓
被更多人 Fork
↓
知識持續演化
```

WikiTree 的價值不是單次生成，而是知識如何被傳承、分支、改進、回饋原作者。

## Credit 與知識家族樹

每一份 Fork 都應該保留來源關係。

例如：

```text
Justin
├── Kevin
│   ├── Amy
│   └── Leo
└── Mike
```

這不是單純的版本紀錄，而是 Knowledge Tree。

保留這個關係後，WikiTree 可以做到：

- 原作者知道有多少人 Fork 他的內容
- 使用者可以比較不同版本差異
- 好筆記的影響力能被看見
- 未來可以支援把改進合併回原版本
- 知識演化不會被匿名複製稀釋

## 最小產品閉環

目前最重要的不是繼續堆 AI 功能，而是做出這個閉環：

```text
看見別人的筆記
↓
Fork 成自己的版本
↓
Enough Editor 微調
↓
AI 輕量 Review / 補強
↓
發布自己的版本
↓
保留原作者 Credit
↓
形成 Knowledge Tree
```

## 產品標語候選

英文：

> Knowledge grows through forks, not copies.

中文：

> 知識不是複製，而是分支生長。

## 產品定位候選

> A collaborative knowledge versioning platform.

> GitHub for Knowledge.

> 一個讓知識可以 Fork、Review、Credit、持續演化的平台。

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
