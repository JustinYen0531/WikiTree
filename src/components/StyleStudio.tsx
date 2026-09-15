import { Check, Palette, Sparkles, Sprout } from 'lucide-react';
import { THEMES, type ThemeId } from '../utils/themes';

type StyleStudioProps = {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
};

export function StyleStudio({ theme, onThemeChange }: StyleStudioProps) {
  return (
    <main className="style-studio">
      <header className="style-studio-header">
        <div>
          <span className="style-studio-eyebrow"><Palette size={13} /> PERSONAL STYLE</span>
          <h1>讓你的知識森林有自己的氣候</h1>
          <p>選一種最像你的閱讀氛圍。套用後，筆記、苗圃與工作介面會一起改變，並在下次開啟時保留。</p>
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

      <section className="theme-gallery" aria-label="選擇風格">
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

      <footer className="style-studio-footer">
        第一版會把選擇保存在這台裝置上；個人封面與公開展示會在後續版本從這裡繼續生長。
      </footer>
    </main>
  );
}
