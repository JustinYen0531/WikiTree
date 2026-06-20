# WikiTree Experience Editor — Definition v0.1

> 這不是關卡編輯器。這是一台**情緒編排台**。
>
> 作者不是在設計難度，而是在設計一段**精神流**：玩家沿著一條路徑前進，路徑的起伏是身體的感受，文字是腦中的旁白，背景是空間的氣味，導演層是整個舞台的呼吸，聲音是恐懼真正的來源。
>
> 編輯器的北極星：**Compose an emotional journey, not a level.**

本文是這台編輯器的**界定書**（definition）。它定義五個層、每層的職責邊界、共用時間軸、以及可直接實作的資料模型。任何後續實作都以本文為準。

---

## 0. 核心模型：一條路徑，五個層

整個作品稱為一個 **Experience（體驗）**。它由**五個層**組成，全部掛在**同一條時間軸**上。

```text
                  ┌─────────────────────────────────────────────┐
   Director Layer │  舞台主控：shake / zoom / flash / fog ...    │  ← 控制整個舞台
   Narrative Layer│  精神字幕：出現 / 消失 / 打字 / 刪字 ...      │  ← 控制腦中旁白
   Audio Layer    │  心跳 / 腳步 / 靜電 / 雨 / 呼吸 ...           │  ← 控制聽覺
   Stage Layer    │  官方主題：Silent Hill / Factory / Void ...  │  ← 控制空間（受限）
   Path Layer     │  ●──curve──●──drop──●──shake──●  (玩家身體)  │  ← 控制節奏與情緒
                  └─────────────────────────────────────────────┘
                   0s ───────────────── timeline ──────────────► end
```

### 0.1 兩種定位：時間 vs. 進度

每一個事件都能用兩種方式定位，作者二選一：

- **`time`（絕對時間，秒）**— 適合與音樂節拍對齊的事件（旁白、導演層、音效）。
- **`at`（路徑進度，0–1）**— 適合與「玩家走到哪」綁定的事件（路徑上的障礙、跟隨玩家的字幕）。

兩者透過**速度曲線**互相換算：玩家在路徑上的位置是速度對時間的積分。編輯器內部維護一張 `progress ↔ time` 對照表（見 §6.2），讓兩種定位可以混用、互相吸附。

### 0.2 設計鐵律

1. **Path 不是難度，是情緒。** 起伏、下墜、抖動描述的是感受，不是挑戰。
2. **Stage 是受限的。** 背景只能從官方主題選，作者不能自繪。刻意避免「裝飾軍備競賽」。
3. **Director 控制舞台，不控制物件。** 它是導演，不是 per-object trigger。
4. **Narrative 是精神流，不是字幕。** 它可以打字、停頓、刪字、覆蓋、重複。
5. **Audio 不只是 BGM。** 恐怖來自收音機、腳步、鐵鏈，不是畫面。

---

## 1. ① Path Layer（路徑層 / 遊戲層）

> 玩家的**身體路徑**。這一層其實是玩家的**情緒節奏**。

### 職責
- 拉出一條路徑（polyline + bezier 控制把手）。
- 制定節點（node）、彎曲（curve）、起伏（height）、速度（speed）。
- 放置障礙（obstacle）。

### 不負責
- 不負責「過關 / 失敗」的計分敘事。失敗只是情緒事件，不是難度懲罰。
- 不負責背景與特效。

### 概念
路徑由一連串 **PathNode** 組成。相鄰節點之間是一段 **PathSegment**，segment 帶有自己的曲率與速度。height 是垂直起伏（情緒的上下），speed 是節奏（平穩 / 突然下墜 / 劇烈抖動由 speed + height + curve 共同造成）。

```ts
interface PathNode {
  id: string;
  x: number;            // 沿路徑的水平座標（世界單位）
  y: number;            // 垂直高度；負值往上，正值往下
  curveIn?: Vec2;       // 進入此節點的 bezier 控制把手（相對座標）
  curveOut?: Vec2;      // 離開此節點的 bezier 控制把手
}

interface PathSegment {
  fromNodeId: string;
  toNodeId: string;
  speed: number;        // 此段的基準速度（世界單位/秒）；低=滯重，高=失速
  feel?: 'calm' | 'drop' | 'shake' | 'rise' | 'freeze'; // 語意標籤，驅動預設手感
}

interface Obstacle {
  id: string;
  at: number;           // 路徑進度 0–1
  lane?: 'low' | 'mid' | 'high'; // 相對玩家高度的位置
  kind: 'spike' | 'block' | 'gap' | 'gate';
  // 障礙是情緒事件：碰到 = 觸發一次情緒，而非單純扣命
}

interface PathLayer {
  nodes: PathNode[];
  segments: PathSegment[];
  obstacles: Obstacle[];
  totalLength: number;  // 由 nodes 推導，快取
}
```

---

## 2. ② Narrative Layer（敘事層 / 文字層）

> 不是字幕，是 **Mental Caption**——玩家腦中的聲音。

### 職責
- 控制每段文字的**出現時間 / 消失時間**。
- 控制字體、大小、顏色、漸入、漸出。
- 控制定位：**跟著玩家** 或 **固定畫面**。
- 文字特效：打字、停頓、刪字、覆蓋、重複。

### 不負責
- 不負責畫面震動、模糊等舞台級效果（那是 Director Layer）。
- 不負責語音播放（那是 Audio Layer）。

```ts
type CaptionAnchor =
  | { mode: 'fixed'; x: number; y: number }      // 釘在畫面座標（0–1 比例）
  | { mode: 'follow'; offset: Vec2 };            // 跟著玩家，帶偏移

type TextEffect =
  | { type: 'typewriter'; cps: number }          // 每秒字數
  | { type: 'pause'; afterChar: number; ms: number }
  | { type: 'delete'; fromChar: number; toChar: number; cps: number }
  | { type: 'overwrite'; withText: string; cps: number }
  | { type: 'repeat'; times: number; gapMs: number };

interface Caption {
  id: string;
  text: string;
  // 定位：time 與 at 二選一
  time?: number;        // 絕對出現時間（秒）
  at?: number;          // 路徑進度 0–1
  duration: number;     // 停留時長（秒）
  font: 'mono' | 'serif' | 'hand' | 'system';
  size: number;         // px
  color: string;        // 預設承襲主題；單色優先
  fadeIn: number;       // 漸入秒數
  fadeOut: number;      // 漸出秒數
  anchor: CaptionAnchor;
  effects?: TextEffect[]; // 依序套用，組成精神流
}

interface NarrativeLayer {
  captions: Caption[];
}
```

---

## 3. ③ Stage Layer（舞台層 / 背景層）— 受限

> 刻意限制這一層，避免 **Decoration Arms Race**。作者比的是「誰講得更好」，不是「誰畫得更像動畫」。

### 職責
- **只做一件事：從官方主題中選一個。**
- 可選主題內已暴露的少量參數（如霧濃度、亮度），但不能新增資產。

### 不負責
- 不負責自繪背景、上傳圖片、堆疊圖層。**這是規格層面的禁止，不是尚未實作。**

```ts
type ThemeId =
  | 'silent-hill'   // 鏽蝕、霧、靜默
  | 'factory'       // 金屬、機械、迴響
  | 'dream'         // 漂浮、柔焦、失重
  | 'ocean'         // 深藍、壓力、緩慢
  | 'void'          // 純黑、無物、星塵
  | 'church';       // 石、光柱、莊嚴

interface StageLayer {
  theme: ThemeId;
  // 只暴露官方允許的旋鈕，數量刻意很少：
  fog?: number;        // 0–1
  ambientLight?: number; // 0–1（承襲 design bible 的 moonlight 哲學）
}
```

> 官方做好，大家選，不用自己畫。

---

## 4. ④ Director Layer（導演層 / 整體特效）

> 不叫 Trigger，叫 **Director**。它像舞台劇導演，控制的是**整個舞台**，不是單一物件。

### 職責
- 在時間軸上排入舞台級事件：Camera Shake / Zoom / Flash / Blur / Fog / Light / Fade / Rotate。
- 每個事件有起點、時長、強度、緩動曲線。

### 不負責
- 不負責移動或改變單一節點 / 字幕 / 物件的屬性。它只對「整個畫面」下指令。

```ts
type DirectorEffectKind =
  | 'cameraShake' | 'zoom' | 'flash' | 'blur'
  | 'fog' | 'light' | 'fade' | 'rotate';

type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'step';

interface DirectorCue {
  id: string;
  kind: DirectorEffectKind;
  time?: number;        // 絕對時間（秒）— 與 at 二選一
  at?: number;          // 路徑進度 0–1
  duration: number;     // 秒
  intensity: number;    // 0–1，語意依 kind 而定（震幅 / 縮放量 / 模糊半徑…）
  easing: Easing;
}

interface DirectorLayer {
  cues: DirectorCue[];
}
```

---

## 5. ⑤ Audio Layer（聲音層）

> 不只是 BGM。Silent Hill 的恐怖不在畫面，在收音機、腳步、鐵鏈。

### 職責
- 一條（或多條）背景音樂（BGM）。
- 在時間軸 / 路徑上排入音效：Heartbeat / Footstep / Static / Rain / Breathing / Door / Wind。
- 控制音量、淡入淡出、loop。

### 不負責
- 不負責畫面。聲音與視覺解耦，刻意讓作者能「只用聲音製造恐懼」。

```ts
type SoundKind =
  | 'heartbeat' | 'footstep' | 'static'
  | 'rain' | 'breathing' | 'door' | 'wind';

interface AudioTrack {        // 持續性的底層聲音（含 BGM）
  id: string;
  src: string;                // 官方音庫 id 或上傳
  role: 'bgm' | 'ambience';
  gain: number;               // 0–1
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
}

interface SoundCue {          // 一次性 / 短循環音效
  id: string;
  kind: SoundKind;
  time?: number;              // 與 at 二選一
  at?: number;
  gain: number;               // 0–1
  loop?: { count: number; gapMs: number };
}

interface AudioLayer {
  tracks: AudioTrack[];
  cues: SoundCue[];
}
```

---

## 6. 整合：Experience 檔案格式與時間軸

### 6.1 頂層結構

```ts
interface Experience {
  schemaVersion: 1;
  id: string;
  title: string;
  author: string;
  durationHint?: number;   // 預估總時長（秒），由 path + speed 推導

  path: PathLayer;
  narrative: NarrativeLayer;
  stage: StageLayer;
  director: DirectorLayer;
  audio: AudioLayer;
}
```

一個 `Experience` 就是一個可序列化的 JSON 檔（`.exp.json`）。播放器只需要這個檔 + 官方主題與音庫即可重現整段體驗。

### 6.2 `progress ↔ time` 對照（核心換算）

因為 Path 的速度沿路徑變化，「進度 `at`」與「時間 `time`」不是線性關係。編輯器建立一張單調遞增的對照表：

```ts
// 對 path 依弧長取樣，沿途用每段 speed 積分得到到達時間
function buildTimeline(path: PathLayer): { at: number; time: number }[];

// 任一定位都可轉成另一種，事件得以混用 / 互相吸附
function atToTime(at: number, table): number;
function timeToAt(time: number, table): number;
```

播放時，主迴圈推進 `time`，由對照表求出當下 `at`，再驅動五個層。

---

## 7. 編輯器 UI 形態（對齊 Design Bible）

編輯器本身必須服從 `docs/wikitree-design-bible.md`：純黑底、白線、單色 + 5% accent、0.5–2px 線條、moonlight ambient、安靜的工具。

```text
┌──────────────────────────────────────────────────────────┐
│  Viewport（預覽舞台：即時播放所選時刻）                     │
│                                                            │
├──────────────────────────────────────────────────────────┤
│ ▸ Director   ─── shake ───        ▮ flash                  │  ← 五條時間軸軌
│ ▸ Narrative      "他在看著我" ───────────                  │
│ ▸ Audio      heartbeat ▮▮▮▮  door ▮      rain ───────────  │
│ ▸ Stage      [ silent-hill ]                               │
│ ▸ Path       ●──curve──●──drop──●──shake──●  ▲playhead     │
└──────────────────────────────────────────────────────────┘
```

- **左側**：當前選取層的屬性面板（細線、mono 標籤、坐標感）。
- **底部**：五條對齊同一 playhead 的時間軸；Path 軌同時是空間編輯區（拉節點、調把手）。
- **工具不搶戲**：toolbar / modal 降低存在感，舞台是主角。

---

## 8. 範圍界線（這版本「不」做什麼）

- 不做多人協作即時編輯（先單人）。
- 不做自訂背景資產（規格性禁止）。
- 不做 per-object 動畫關鍵影格（Director 只到舞台級）。
- 不做計分 / 排行榜（這不是難度遊戲）。

---

## 9. 實作落點建議

- 型別集中於 `src/experience/types.ts`（即本文 §1–§6 的 interface）。
- 純函式（`buildTimeline` / `atToTime` / 路徑取樣）放 `src/experience/timeline.ts`，與 UI 解耦、可單測。
- 編輯器元件 `src/components/ExperienceEditor/`，五層各一個軌道子元件。
- 播放器 `src/experience/player/`，吃 `Experience` JSON，不依賴編輯器。
- 官方主題與音庫為靜態資源，以 `ThemeId` / 音庫 id 索引，作者只能選不能傳。

> 本文是 **definition**，不是實作。任何 PR 在動工前，先確認它落在某一層的職責邊界內，且未違反 §0.2 的五條鐵律與 §8 的範圍界線。
