# WikiTree Design Bible v1.0

> WikiTree is not a note-taking application. It is a living knowledge ecosystem. Every interaction should reinforce the feeling that knowledge is alive, connected, evolving, and collectively cultivated. The interface should resemble an explorable digital biosphere rather than a conventional productivity tool.

## Core Philosophy

**Knowledge is Alive.**

知識不是靜態文件，而是一片持續生長、彼此連結的生命網絡。

WikiTree 不應讓使用者感覺自己正在瀏覽資料庫、管理檔案、整理資料夾，或操作一般生產力工具。使用者應感覺自己正在登入、探索、培育一顆活著的知識星球。

WikiTree 的核心感受是：

- **Discovery**: 每一次進入都是探索未知地形。
- **Growth**: 知識會生長，不只是被新增。
- **Connection**: 每個節點、分支、葉片都與其他知識相連。
- **Evolution**: 系統與內容會隨時間演化，留下生命軌跡。

WikiTree 不追求 dashboard、database、file manager 的效率感。它追求的是一種安靜、聰明、科學化的自然感。

## Design Motto

**Knowledge grows like forests, not folders.**

## Artistic Direction

WikiTree 的美術方向是：

**Scientific Nature**

或者更精準地說：

**Nature designed by computer science.**

關鍵詞：

- Minimal
- Scientific
- Organic
- Futuristic
- Monochrome
- Calm
- Intelligent
- Spatial
- Living Network

WikiTree 不是 Cyberpunk，不是 Apple，不是 Notion，也不是 Obsidian。它不應有霓虹雜訊、厚重玻璃感、卡片式工作台，或傳統筆記軟體的資料夾心智模型。

## Visual Identity

第一眼的情緒目標：

> 我正在登入一個知識文明。

使用者不應第一眼覺得「這是一個筆記網站」。他們應該感到自己正在進入一個可以被探索、被耕種、被共同培養的數位生態圈。

整體視覺應像：

Planet -> Forest -> Tree -> Branch -> Leaf -> Knowledge

而不是：

Workspace -> Sidebar -> Folder -> File -> Editor

## Color System

### Background

- Pure black: `#000000`

黑色是宇宙背景，不是暗色模式裝飾。它應該讓白色線條、節點、星球、森林與知識結構浮現。

### Primary

- Pure white: `#FFFFFF`

白色代表結構、生命線、知識連結、主要文字與節點。

### Secondary

- Gray at 20-40%

灰色用於遠景、未啟動節點、背景資訊、星球內部層、低優先資訊與空間深度。

### Accent

Accent 不固定，依知識區域或學院主題決定。

範例：

- 商學院: 淡金
- 資工: 冰藍
- 法律: 銀白
- 醫學: 翠綠

Accent 永遠只佔整體畫面約 **5%**。它是生態中的微量元素，不是品牌主色。

## Line Language

所有元素避免厚重。

主要視覺語言由 0.5-2px 線條形成：

- Node
- Edge
- Polygon
- Wireframe
- Orbit
- Root
- Branch
- Low-poly surface

線條應像科學圖譜、生命網絡、星球測繪與有機分枝的混合。禁止粗框、厚邊、重陰影、厚重卡片與大面積裝飾色塊。

## Geometry

世界生成順序是：

Point -> Line -> Plane -> Life

設計上不是先畫一棵樹，而是先形成節點，再讓節點連成線，線構成面，面與分支最後生長成樹。

形狀語言應優先使用：

- Organic Polygon
- Voronoi
- Triangulation
- Low Poly
- Git Branch
- Bezier Curves
- Spatial Orbit

避免大量矩形。矩形只應保留給必要的輸入、按鈕、文字容器或工具性 UI，而且要盡量安靜。

## Lighting

整體光感是：

**Moonlight**

只使用 ambient light。光應該像月光、星光、薄霧、微弱的實驗室儀器亮度。

禁止：

- 強烈 shadow
- 厚重 glow
- 彩色霓虹
- 高對比塑膠光澤
- 大面積漸層裝飾

允許：

- 微弱呼吸光
- 節點脈衝
- 邊界淡光
- 星球大氣層
- 線條反白
- 低透明度內部層次

## Animation Philosophy

**Everything Breathes.**

所有東西都應該是活著的。沒有完全靜止的世界。

動畫應該慢、輕、安靜，像生物與天體的運動，而不是一般網頁特效。

可使用：

- Node 慢慢 pulse
- Tree 微微生長
- Line 緩慢流動
- Planet 自轉
- Orbit 漂移
- Root 像在地底延伸
- Knowledge 展開時像分枝

避免：

- 快速彈跳
- 過度 ease
- 廣告式動效
- 大量 hover pop
- 讓人分心的背景動畫

## World Building

WikiTree 不是首頁，而是 Planet。

使用者進入後的世界尺度應逐層變化：

Planet -> Forest -> Tree -> Branch -> Leaf -> Knowledge

Zoom 不是單純放大畫布，而是轉換認知尺度：

- Planet: 看見整個知識文明。
- Forest: 看見領域與社群。
- Tree: 看見主題結構。
- Branch: 看見分支脈絡。
- Leaf: 看見具體知識內容。

真正目標是接近 Google Earth 的探索感，而不是一般檔案總管的點選感。

## Knowledge Representation

禁止把知識表現為：

- Folder
- File
- Tree View
- Database row
- Dashboard card

應表現為：

- Planet
- Biome
- Forest
- Tree
- Branch
- Leaf

知識不是存在資料夾裡，而是長在世界裡。

## Git Representation

所有知識天然都是 Branch。

例如：

```text
AI
├── GPT
├── Claude
└── Gemini
```

畫面不應只是樹狀清單，而應該讓使用者真的看見分枝結構：節點如何分叉、聚合、延伸、演化。

Git 的概念應被轉譯為自然分枝，而不是開發工具 UI。

## Typography

### Primary

- Roboto Mono

### Secondary

- Inter

### Chinese

- Noto Sans TC

文字應偏向 uppercase、mono、科學儀器、坐標標籤、研究站介面感。

Letter spacing 偏大。文字不應太情緒化，也不應太產品行銷。語氣應冷靜、聰明、精準。

## Icon Style

禁止彩色 icon。

Icon 應為：

- Outline
- Monoline
- Geometric
- Minimal

Icon 不應成為畫面主角，只是系統中的低聲提示。

## Interaction Rules

### Hover

Hover 應讓 node、edge、branch 或 leaf 微微發光、反白、脈衝。

### Click

Click 不只是選取。Click 應該像展開生命結構：Tree 展開、Branch 生長、Leaf 浮現。

### Zoom

Zoom 應承擔世界尺度轉換：

Planet -> Forest -> Tree -> Knowledge

### Cursor

Cursor 可作為探索工具。反相光暈、掃描感、局部照明可強化「我正在探索未知知識地形」的感覺。

## UI Boundary

WikiTree 可以有工具，但工具不應主導世界。

允許必要的：

- Login
- Search
- Editor
- Publish
- Version
- Settings

但它們應像科學探索介面上的儀器，而不是 SaaS dashboard。

Sidebar、modal、button、toolbar 必須降低存在感，避免搶走 Planet / Forest / Tree 的核心敘事。

## Forbidden Directions

避免下列方向：

- Cyberpunk neon
- Apple-style glossy minimalism
- Notion-like document workspace
- Obsidian-like graph/file hybrid
- Dashboard-first SaaS
- Database table aesthetic
- Card-heavy productivity layout
- Thick glow
- Heavy drop shadow
- Colorful icons
- Folder-first navigation
- Static landing page

## Implementation Checklist

每次重做或新增 UI 時，應檢查：

- 是否讓使用者覺得知識是活的？
- 是否有 discovery、growth、connection、evolution？
- 是否避免 folder/file/database 的心智模型？
- 是否以 point、line、plane、life 的順序生成視覺？
- 是否維持 monochrome + 5% accent？
- 線條是否保持 0.5-2px？
- 動畫是否像呼吸，而不是炫技？
- 是否保留 moonlight ambient light？
- UI 工具是否安靜地服務世界，而不是變成主角？
- 使用者第一眼是否像進入知識文明，而不是筆記網站？

## North Star

WikiTree 的北極星不是「更好用的筆記 app」。

WikiTree 的北極星是：

> A living knowledge planet that grows through connection.

