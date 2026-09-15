import humanizedLearningNotesRaw from '../../skills/humanized-learning-notes/SKILL.md?raw';
import cornellAdaptiveLearningRaw from '../../skills/cornell-adaptive-learning/SKILL.md?raw';
import guidedKnowledgeConstructionRaw from '../../skills/guided-knowledge-construction/SKILL.md?raw';

export interface WikiSkill {
  id: string;
  name: string;
  title: string;
  badge?: string;
  description: string;
  overview?: string[];
  content?: string;
  rawContent?: string;
  sourceUrl?: string;
  rawUrl?: string;
  license?: string;
  category?: string;
  importable?: boolean;
  referenceOnly?: boolean;
}

export const GUIDED_KNOWLEDGE_CONSTRUCTION_SKILL_ID = 'guided-knowledge-construction';

export const DEFAULT_SKILLS: WikiSkill[] = [
  {
    id: 'humanized-learning-notes',
    name: 'humanized-learning-notes',
    title: '終身學習思維筆記',
    badge: '終身學習',
    description: '將教材轉化為建立直覺與決策力的終身思維工具書，嚴禁應試死背字眼。',
    overview: [
      '目標在於把生硬的教材或技術內容，轉化為具人情味與人生決策洞察的精品思維筆記。採用 8 步輸出法：從白話直覺起手、探尋存在理由、剖析公式與現實邊界，並映射到職涯與日常生活。',
      '強調「三年後只記三件事」與「留給未來的自己」，抽離公式後心智模型依然留在腦中。嚴禁應試死背字眼與空泛心靈雞湯，是一本為自己量身打造的終身思維工具書。',
    ],
    content: humanizedLearningNotesRaw,
    rawContent: humanizedLearningNotesRaw,
    category: 'WikiTree 內建',
  },
  {
    id: 'cornell-adaptive-learning',
    name: 'cornell-adaptive-learning',
    title: '康奈爾自適應筆記',
    badge: 'Cornell',
    description: '結合高密度知識矩陣、因果認知鏈、主動檢索問題（Cue）與掌握度標記。',
    overview: [
      '結合 Cornell 筆記四層架構（核心筆記、提示檢索問題 Cue、精煉總結、掌握度標記）與自適應間隔提取（Spaced Repetition），讓人負責學習與主觀反饋，AI 負責題型生成與動態排程。',
      '具備零欠債負擔原則（重啟優先於補債），並根據掌握度雙訊號評估動態出題（包含直接定義、情境辨析、反向找錯與生活應用），幫助建立抗遺忘的長期記憶網絡。',
    ],
    content: cornellAdaptiveLearningRaw,
    rawContent: cornellAdaptiveLearningRaw,
    category: 'WikiTree 內建',
  },
  {
    id: 'feynman-technique',
    name: 'feynman-technique',
    title: '費曼極簡白話轉譯',
    badge: '費曼轉譯',
    description: '以清楚的生活比喻拆解複雜事物，同時保留正式名詞並標出比喻的適用邊界。',
    category: 'WikiTree 內建',
  },
  {
    id: 'first-principles',
    name: 'first-principles',
    title: '第一性原理拆解',
    badge: '第一性',
    description: '剝除表面前提，回到最基本的事實重新建立因果鏈與解法。',
    category: 'WikiTree 內建',
  },
  {
    id: 'branch-evolution',
    name: 'branch-evolution',
    title: '知識森林枝幹演化',
    badge: '生態演化',
    description: '定位父概念、子概念與跨領域連結，讓每篇筆記能繼續長出新的枝葉。',
    category: 'WikiTree 內建',
  },
  {
    id: GUIDED_KNOWLEDGE_CONSTRUCTION_SKILL_ID,
    name: GUIDED_KNOWLEDGE_CONSTRUCTION_SKILL_ID,
    title: '引導式知識建構',
    badge: '對話建構',
    description: 'AI 掌握隱藏知識地圖，透過逐輪提問讓理解、例子與正式概念從對話中長成個人化筆記。',
    overview: [
      '這不是請 AI 一次替你寫完整筆記，而是先由 AI 掌握主題的知識地圖，每次只選一個最值得前進的節點提問。你的回答會決定下一步，也會被忠實整理成「我的理解」與「我的例子」。',
      '當回答不完整或有誤解時，AI 會保留你的思路，再用反例、追問與正式概念補正。每輪都更新同一份筆記與學習進度，直到真正形成能說明、能連結、也能應用的個人知識體系。',
    ],
    content: guidedKnowledgeConstructionRaw,
    rawContent: guidedKnowledgeConstructionRaw,
    category: 'WikiTree 內建',
  },
];

/**
 * Public skills found during the learning-method research. Each entry stays
 * independent so the user can install only the style or workflow they want.
 */
export const PUBLIC_SKILL_CATALOG: WikiSkill[] = [
  {
    id: 'public-eli5',
    name: 'eli5',
    title: 'ELI5 白話說明',
    badge: '白話',
    description: '先給一句重點，再用一個生活比喻說清楚；保留正式名稱、路徑、數字與錯誤訊息，不用幼稚化語氣。',
    sourceUrl: 'https://github.com/mblode/agent-skills/blob/main/skills/eli5/SKILL.md',
    rawUrl: 'https://raw.githubusercontent.com/mblode/agent-skills/main/skills/eli5/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '說明風格',
    importable: true,
  },
  {
    id: 'public-feynman-technique',
    name: 'feynman-technique',
    title: 'Feynman 機制優先解釋',
    badge: 'Feynman',
    description: '先說它如何運作，再逐步提升到專業深度；比喻要誠實標出失效的地方。',
    sourceUrl: 'https://github.com/guicortei/feynman-technique',
    rawUrl: 'https://raw.githubusercontent.com/guicortei/feynman-technique/main/skills/feynman-technique/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '說明風格',
    importable: true,
  },
  {
    id: 'public-study-system',
    name: 'study-system',
    title: 'Study System 主動學習計畫',
    badge: '主動回憶',
    description: '把教材拆成一題一概念，安排主動回憶、間隔複習、交錯練習與錯誤紀錄。',
    sourceUrl: 'https://github.com/SkillMedev/personal-operating-system/blob/main/skills/study-system/SKILL.md',
    rawUrl: 'https://raw.githubusercontent.com/SkillMedev/personal-operating-system/main/skills/study-system/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '複習方法',
    importable: true,
  },
  {
    id: 'public-guided-learning',
    name: 'guided-learning',
    title: 'Guided Learning 螺旋學習',
    badge: '螺旋課程',
    description: '從概觀、工作理解到熟練，安排回憶時間與理解檢查，並依卡關原因換解釋方式。',
    sourceUrl: 'https://github.com/WSE-research/guided-learning-skill',
    rawUrl: 'https://raw.githubusercontent.com/WSE-research/guided-learning-skill/main/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '學習流程',
    importable: true,
  },
  {
    id: 'public-mastery-loop',
    name: 'mastery-loop',
    title: 'Mastery Loop 長期記憶循環',
    badge: 'FSRS',
    description: '用 Markdown 與學習狀態管理主動回憶、交錯練習、Feynman 檢查與間隔複習。',
    sourceUrl: 'https://github.com/all666666all/mastery-loop',
    rawUrl: 'https://raw.githubusercontent.com/all666666all/mastery-loop/main/SKILL.md',
    license: 'MIT（包含 Python 輔助程式）',
    category: '複習系統',
    importable: true,
  },
  {
    id: 'public-retaincraft',
    name: 'retaincraft',
    title: 'RetainCraft 循證互動學習',
    badge: '循證學習',
    description: '把間隔複習、主動回憶、自我解釋、交錯練習與因果提問放在同一個互動流程。',
    sourceUrl: 'https://github.com/kaixiad/RetainCraft',
    rawUrl: 'https://raw.githubusercontent.com/kaixiad/RetainCraft/main/SKILL.md',
    license: 'MIT（包含 Python 輔助程式）',
    category: '複習系統',
    importable: true,
  },
  {
    id: 'public-learn-anything-24h',
    name: 'learn-anything-24h',
    title: 'Learn Anything 24h 學習衝刺',
    badge: '學習衝刺',
    description: '把複雜主題縮成有時間限制的練習，要求教回、錯誤辨識與最後的學習成果。',
    sourceUrl: 'https://github.com/adityak74/learn-anything-24h',
    rawUrl: 'https://raw.githubusercontent.com/adityak74/learn-anything-24h/main/skills/codex/learn-anything-24h/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '學習流程',
    importable: true,
  },
  {
    id: 'public-learning-mode',
    name: 'learning-mode',
    title: 'Learning Mode 邊做邊學',
    badge: '實作學習',
    description: '讓 Agent 把一小段工作交給使用者親手完成，再用回饋與間隔複習鞏固能力。',
    sourceUrl: 'https://github.com/Osipchuk/agent-skills/tree/main/skills/learning-mode',
    rawUrl: 'https://raw.githubusercontent.com/Osipchuk/agent-skills/main/skills/learning-mode/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '實作學習',
    importable: true,
  },
  {
    id: 'public-zk-fleeting-note',
    name: 'fleeting-note',
    title: 'Zettelkasten 閃念筆記',
    badge: 'Zettelkasten',
    description: '先捕捉一個還沒整理的想法，保留它的來源與下一步，不急著把它塞進大文章。',
    sourceUrl: 'https://github.com/mikonos/zettelkasten-agent-skills/tree/main/skills/fleeting-note',
    rawUrl: 'https://raw.githubusercontent.com/mikonos/zettelkasten-agent-skills/main/skills/fleeting-note/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '知識連結',
    importable: true,
  },
  {
    id: 'public-zk-literature-note',
    name: 'literature-note',
    title: 'Zettelkasten 文獻筆記',
    badge: 'Zettelkasten',
    description: '把來源內容改寫成自己的原子化理解，再留下能繼續連結的概念卡片。',
    sourceUrl: 'https://github.com/mikonos/zettelkasten-agent-skills/tree/main/skills/literature-note',
    rawUrl: 'https://raw.githubusercontent.com/mikonos/zettelkasten-agent-skills/main/skills/literature-note/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '知識連結',
    importable: true,
  },
  {
    id: 'public-zk-index-note',
    name: 'index-note',
    title: 'Zettelkasten 索引筆記',
    badge: 'Zettelkasten',
    description: '建立主題入口與索引，讓一群分散的原子筆記有清楚的進入路徑。',
    sourceUrl: 'https://github.com/mikonos/zettelkasten-agent-skills/tree/main/skills/index-note',
    rawUrl: 'https://raw.githubusercontent.com/mikonos/zettelkasten-agent-skills/main/skills/index-note/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '知識連結',
    importable: true,
  },
  {
    id: 'public-zk-connection-discovery',
    name: 'connection-discovery',
    title: 'Zettelkasten 連結發現',
    badge: 'Zettelkasten',
    description: '為兩張筆記提出可以雙向寫回的關係，找出跨主題的橋接點。',
    sourceUrl: 'https://github.com/mikonos/zettelkasten-agent-skills/tree/main/skills/connection-discovery',
    rawUrl: 'https://raw.githubusercontent.com/mikonos/zettelkasten-agent-skills/main/skills/connection-discovery/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '知識連結',
    importable: true,
  },
  {
    id: 'public-zk-note-split',
    name: 'note-split',
    title: 'Zettelkasten 筆記拆分',
    badge: 'Zettelkasten',
    description: '把一篇過長的內容拆成可重用的原子概念，避免一張筆記承擔太多想法。',
    sourceUrl: 'https://github.com/mikonos/zettelkasten-agent-skills/tree/main/skills/note-split',
    rawUrl: 'https://raw.githubusercontent.com/mikonos/zettelkasten-agent-skills/main/skills/note-split/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '知識連結',
    importable: true,
  },
  {
    id: 'public-zk-network-maintenance',
    name: 'network-maintenance',
    title: 'Zettelkasten 網路維護',
    badge: 'Zettelkasten',
    description: '檢查孤立筆記、薄弱連結與跨主題橋接點，讓知識網路持續可用。',
    sourceUrl: 'https://github.com/mikonos/zettelkasten-agent-skills/tree/main/skills/network-maintenance',
    rawUrl: 'https://raw.githubusercontent.com/mikonos/zettelkasten-agent-skills/main/skills/network-maintenance/SKILL.md',
    license: 'MIT（保留作者與授權文字）',
    category: '知識連結',
    importable: true,
  },
];

export const ALL_KNOWN_SKILLS = [...DEFAULT_SKILLS, ...PUBLIC_SKILL_CATALOG];
