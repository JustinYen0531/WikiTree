import { useMemo, useRef, useState } from 'react';
import { FileText, FolderInput, Import, ShieldCheck, X } from 'lucide-react';
import type { FileNode } from '../utils/fileSystem';
import { collectLibraryFolders, importFilesToLibrary, type LibraryImportResult } from '../utils/library';

type ImportToWikiTreeModalProps = {
  files: FileNode[];
  onClose: () => void;
  onImported: (result: LibraryImportResult) => void;
};

const supportedNote = (file: File) => /\.(md|markdown|txt)$/i.test(file.name);

export function ImportToWikiTreeModal({ files, onClose, onImported }: ImportToWikiTreeModalProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<File[]>([]);
  const [destination, setDestination] = useState('收件苗圃');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const folders = useMemo(() => collectLibraryFolders(files), [files]);
  const supported = selection.filter(supportedNote);
  const skippedCount = selection.length - supported.length;

  const choose = (next: FileList | null) => {
    setSelection(next ? Array.from(next) : []);
    setError('');
  };

  const confirmImport = async () => {
    if (!supported.length || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await importFilesToLibrary(selection, destination);
      onImported(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '文件還沒能收進 WikiTree。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="library-import-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}>
      <section className="library-import-modal" role="dialog" aria-modal="true" aria-labelledby="library-import-title">
        <header>
          <div>
            <span><Import size={13} /> BRING INTO WIKITREE</span>
            <h2 id="library-import-title">收進 WikiTree</h2>
          </div>
          <button type="button" className="theme-toggle-btn" onClick={onClose} disabled={busy} aria-label="關閉"><X size={17} /></button>
        </header>

        <div className="library-import-body">
          <div className="library-import-assurance">
            <ShieldCheck size={17} />
            <p><strong>外部原檔會保留。</strong>收進來的版本會成為 WikiTree 的獨立筆記，不會在背後互相覆蓋或同步。</p>
          </div>

          <div className="library-import-pickers">
            <button type="button" className="btn" onClick={() => fileInput.current?.click()} disabled={busy}>
              <FileText size={14} /> 選擇文件
            </button>
            <button type="button" className="btn" onClick={() => folderInput.current?.click()} disabled={busy}>
              <FolderInput size={14} /> 選擇資料夾
            </button>
            <input ref={fileInput} hidden type="file" multiple accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={event => choose(event.target.files)} />
            <input ref={folderInput} hidden type="file" multiple {...({ webkitdirectory: '', directory: '' } as Record<string, string>)} onChange={event => choose(event.target.files)} />
          </div>

          {selection.length > 0 ? (
            <div className="library-import-preview">
              <div className="library-import-summary">
                <strong>準備收進 {supported.length} 份筆記</strong>
                {skippedCount > 0 && <small>另外 {skippedCount} 個非文字檔會略過</small>}
              </div>
              <div className="library-import-list">
                {selection.slice(0, 12).map((file, index) => (
                  <div key={`${file.webkitRelativePath || file.name}:${index}`} className={supportedNote(file) ? '' : 'skipped'}>
                    <FileText size={13} />
                    <span>{file.webkitRelativePath || file.name}</span>
                    <small>{supportedNote(file) ? `${Math.max(1, Math.ceil(file.size / 1024))} KB` : '略過'}</small>
                  </div>
                ))}
                {selection.length > 12 && <p>還有 {selection.length - 12} 個項目未展開顯示</p>}
              </div>
            </div>
          ) : (
            <div className="library-import-empty">
              選擇 Markdown、純文字文件，或包含這些筆記的整個資料夾。
            </div>
          )}

          <label className="library-import-destination">
            <span>收進哪裡？</span>
            <select value={destination} onChange={event => setDestination(event.target.value)} disabled={busy}>
              {folders.map(folder => <option key={folder.path} value={folder.path}>{folder.label}</option>)}
            </select>
          </label>

          {error && <div className="library-import-error" role="alert">{error}</div>}
        </div>

        <footer>
          <button type="button" className="btn" onClick={onClose} disabled={busy}>取消</button>
          <button type="button" className="btn btn-primary" onClick={() => void confirmImport()} disabled={!supported.length || busy}>
            <Import size={14} /> {busy ? '正在收進…' : `收進 ${supported.length || ''} 份筆記`}
          </button>
        </footer>
      </section>
    </div>
  );
}
