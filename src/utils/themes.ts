export const THEME_IDS = [
  'rose-terminal',
  'warm-paper',
  'soft-pastel',
  'cold-focus',
  'midnight-ide',
  'paper-light',
] as const;

export type ThemeId = typeof THEME_IDS[number];

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  mood: string;
  mode: 'light' | 'dark';
  inspiration: string;
  colors: readonly [string, string, string, string];
};

export const DEFAULT_THEME: ThemeId = 'rose-terminal';
export const THEME_STORAGE_KEY = 'wikitree_theme_v1';

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'rose-terminal',
    name: 'Rose Terminal',
    mood: '深灰黑、乾燥玫瑰與柔和紫，安靜但有個性。',
    mode: 'dark',
    inspiration: '玫瑰終端',
    colors: ['#191724', '#26233A', '#EBBCBA', '#C4A7E7'],
  },
  {
    id: 'warm-paper',
    name: 'Warm Paper',
    mood: '米白紙張、棕灰與暖橘，像翻閱一座舊檔案館。',
    mode: 'light',
    inspiration: '溫暖紙頁',
    colors: ['#F6F0E1', '#E8DCC4', '#3C3836', '#D65D0E'],
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    mood: '奶油底色揉入粉紫、淡藍與嫩綠，柔軟而輕盈。',
    mode: 'light',
    inspiration: '柔霧機器',
    colors: ['#EFF1F5', '#E6E9EF', '#8839EF', '#1E66F5'],
  },
  {
    id: 'cold-focus',
    name: 'Cold Focus',
    mood: '深藍灰、冰藍與青綠，適合長時間閱讀與整理。',
    mode: 'dark',
    inspiration: '冷靜實驗室',
    colors: ['#2E3440', '#3B4252', '#88C0D0', '#A3BE8C'],
  },
  {
    id: 'midnight-ide',
    name: 'Midnight IDE',
    mood: '深夜藍紫與清亮藍白，像專注工作的現代工具。',
    mode: 'dark',
    inspiration: '午夜工作台',
    colors: ['#1A1B26', '#24283B', '#7AA2F7', '#BB9AF7'],
  },
  {
    id: 'paper-light',
    name: 'Paper Light',
    mood: '暖白、淺灰與墨黑，讓內容本身成為畫面主角。',
    mode: 'light',
    inspiration: '安靜白紙',
    colors: ['#FCFAF5', '#F1EEE7', '#292621', '#8B5E3C'],
  },
] as const;

export const isThemeId = (value: string | null): value is ThemeId =>
  value !== null && (THEME_IDS as readonly string[]).includes(value);

export const readSavedTheme = (): ThemeId => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const getTheme = (id: ThemeId): ThemeDefinition =>
  THEMES.find(theme => theme.id === id) ?? THEMES[0];
