import { Check, Palette, Sparkles, Sprout } from 'lucide-react';
import { useState } from 'react';
import { THEMES, type ThemeId } from '../utils/themes';

type StyleStudioProps = {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  initialFormat?: 'markdown' | 'html';
};

export function StyleStudio({ theme, onThemeChange, initialFormat = 'markdown' }: StyleStudioProps) {
  const [format, setFormat] = useState(initialFormat);
  return (
    <main className="style-studio">
      <header className="style-studio-header">
        <div>
          <span className="style-studio-eyebrow"><Palette size={13} /> PERSONAL STYLE</span>
          <h1>讓你的知識森林有自己的氣候</h1>
          <p>Markdown 有自己的閱讀氛圍；HTML 讓外圍介面跟著講義配色。兩種風格各自生效。</p>
        </div>
        <div className="style-future-badge"><Sparkles size={14} /> 個人空間的第一片葉</div>
      </header>

      <section className="style-intent" aria-label="風格功能定位">
        <Sprout size={18} />
        <div>
          <strong>現在是色調，未來是你的公開樣貌</strong>
          <p>這裡未來可以繼續生長個人封面、苗圃裝飾與你喜歡的元素；別人造訪時，也能一眼感受到這座森林屬於誰。</p>
        </div>
      </section>

      <div className="style-format-switch" role="group" aria-label="選擇文件風格分類">
        <button type="button" aria-pressed={format === 'markdown'} onClick={() => setFormat('markdown')}>Markdown <small>七種風格</small></button>
        <button type="button" aria-pressed={format === 'html'} onClick={() => setFormat('html')}>HTML <small>自適應</small></button>
      </div>

      {format === 'markdown' ? <>
      <p className="style-format-description">選擇 Markdown 筆記與工作介面的風格，會保存在這台裝置。預設為 WikiTree Original。</p>
      <section className="theme-gallery" aria-label="選擇 Markdown 風格">
        {THEMES.map(option => {
          const selected = option.id === theme;
          return (
            <button
              key={option.id}
              type="button"
              className={`theme-card ${selected ? 'active' : ''}`}
              aria-pressed={selected}
              onClick={() => onThemeChange(option.id)}
            >
              <span className="theme-card-preview" aria-hidden="true">
                <span className="theme-card-sidebar" style={{ backgroundColor: option.colors[1] }} />
                <span className="theme-card-page" style={{ backgroundColor: option.colors[0] }}>
                  <i style={{ backgroundColor: option.colors[2] }} />
                  <i style={{ backgroundColor: option.colors[3] }} />
                  <i style={{ backgroundColor: option.colors[2] }} />
                </span>
                <span className="theme-card-accent" style={{ backgroundColor: option.colors[3] }} />
              </span>
              <span className="theme-card-copy">
                <span className="theme-card-title">
                  <strong>{option.name}</strong>
                  {selected && <span className="theme-selected"><Check size={12} /> 使用中</span>}
                </span>
                <small>{option.inspiration} · {option.mode === 'dark' ? '深色' : '淺色'}</small>
                <p>{option.mood}</p>
                <span className="theme-swatches" aria-hidden="true">
                  {option.colors.map(color => <i key={color} style={{ backgroundColor: color }} />)}
                </span>
              </span>
            </button>
          );
        })}
      </section>
      </> : <>
      <p className="style-format-description">打開 HTML 講義就自動生效，不需要每次重新套用。</p>
      <section className="theme-gallery html-theme-gallery" aria-label="HTML 風格">
        <article className="theme-card active html-adaptive-card">
          <span className="theme-card-preview html-adaptive-preview" aria-hidden="true">
            <span className="theme-card-sidebar" />
            <span className="theme-card-page"><i /><i /><i /></span>
            <span className="theme-card-accent" />
          </span>
          <span className="theme-card-copy">
            <span className="theme-card-title"><strong>自適應</strong><span className="theme-selected"><Check size={12} /> 自動啟用</span></span>
            <small>跟隨目前講義的配色</small>
            <p>側欄、頂部列與閱讀外圍，會配合講義的底色、文字與醒目色。講義排版、顏色與互動維持原樣。</p>
            <p>切回 Markdown 就恢復你選的風格；讀不到講義配色時，使用穩定的暖白配色。</p>
          </span>
        </article>
      </section>
      </>}

      <footer className="style-studio-footer">
        Markdown 風格保存在這台裝置上；HTML 自適應隨目前講義生效。個人封面與公開展示會在後續版本從這裡繼續生長。
      </footer>
    </main>
  );
}
