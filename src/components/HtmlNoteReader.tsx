import { useEffect, useRef, useState } from 'react';
import { prepareHtmlLecture, readLectureAsset } from '../utils/htmlReader';
import { discoverHtmlPalette, type HtmlPalette } from '../utils/htmlTheme';
import './HtmlNoteReader.css';

type Props = {
  content: string;
  path: string;
  root: FileSystemDirectoryHandle | string;
  onNavigate: (path: string) => void;
  onPaletteChange: (palette: HtmlPalette) => void;
};

export function HtmlNoteReader({ content, path, root, onNavigate, onPaletteChange }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<{ content: string; path: string; root: Props['root']; result?: { srcDoc: string; missing: string[] }; error?: string }>();
  const current = state?.content === content && state.path === path && state.root === root ? state : undefined;
  const prepared = current?.result;
  const error = current?.error;
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    void prepareHtmlLecture(content, path, asset => readLectureAsset(root, asset), blob => {
      const url = URL.createObjectURL(blob);
      urls.push(url);
      return url;
    }).then(result => {
      if (cancelled) urls.forEach(url => URL.revokeObjectURL(url));
      else setState({ content, path, root, result });
    }).catch(() => {
      urls.forEach(url => URL.revokeObjectURL(url));
      if (!cancelled) setState({ content, path, root, error: '講義還沒能開啟，請重新選擇這份筆記。' });
    });
    return () => { cancelled = true; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [content, path, root]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!frame.current || event.source !== frame.current.contentWindow) return;
      if (event.data?.type === 'wikitree-html-colors') onPaletteChange(discoverHtmlPalette(event.data.samples));
      else if (event.data?.type === 'wikitree-html-navigation' && typeof event.data.path === 'string') onNavigate(event.data.path);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onNavigate, onPaletteChange]);

  return (
    <section className="html-note-reader" aria-label="HTML 講義閱讀">
      <div className="html-note-reader-info">
        <span>HTML 原樣閱讀</span><small>保留講義排版與互動，閱讀不會修改原檔。</small>
      </div>
      {prepared?.missing.length ? (
        <details className="html-note-reader-warning">
          <summary>有 {prepared.missing.length} 個附件未能載入；請確認附件也已收進 WikiTree。</summary>
          <ul>{prepared.missing.map(item => <li key={item}>{item}</li>)}</ul>
        </details>
      ) : null}
      {error ? <p role="alert">{error}</p> : prepared ? (
        <iframe ref={frame} title={path} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={prepared.srcDoc} />
      ) : <p role="status">正在開啟講義…</p>}
    </section>
  );
}
