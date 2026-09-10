import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import { renderMarkdown } from '../utils/markdownRenderer';
import { preprocessCallouts } from '../utils/callouts';

export function MarkdownPreview({ content }: { content: string }) {
  const [html, setHtml] = useState('');
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    void renderMarkdown(preprocessCallouts(content)).then(value => {
      if (!cancelled) setHtml(DOMPurify.sanitize(value));
    });
    return () => { cancelled = true; };
  }, [content]);
  useEffect(() => {
    const nodes = root.current?.querySelectorAll<HTMLElement>('.mermaid');
    if (!nodes?.length) return;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
    void mermaid.run({ nodes }).catch(() => {
      // Keep the source visible when a diagram cannot be rendered.
    });
  }, [html]);
  return <div ref={root} className="rendered-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
