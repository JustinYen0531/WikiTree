import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive, Bell, BellOff, BookOpen, CalendarClock, Check, ChevronRight, Clock3,
  ExternalLink, History, Inbox, Pause, Play, Plus, RefreshCw, Search, Settings2,
  Sparkles, Star, Tags, Trash2, X,
} from 'lucide-react';
import { AiProviderPicker, type AiSelection } from './AiProviderPicker';
import explorationPresets from '../data/exploration-presets.json';
import explorationSourceCatalog from '../data/exploration-source-catalog.json';
import { explorationApi } from '../utils/explorationApi';
import type { ExplorationItem, ExplorationRun, ExplorationScheduleKind, ExplorationTask } from '../types/exploration';

type Filter = 'unread' | 'all' | 'saved' | 'review' | 'archived';
type TaskDraft = Partial<ExplorationTask> & { schedule: NonNullable<Partial<ExplorationTask>['schedule']>; sources: NonNullable<Partial<ExplorationTask>['sources']> };

const sourceCatalogById = new Map(explorationSourceCatalog.map(source => [source.id, source]));
const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
const emptyDraft = (): TaskDraft => ({
  name: '', topic: '', instructions: '', provider: 'openai', model: 'default', itemCount: 5,
  notificationEnabled: false, status: 'active',
  schedule: { kind: 'manual', localTime: '09:00', daysOfWeek: [1, 2, 3, 4, 5], dayOfMonth: 1 },
  sources: { connectorIds: [...explorationPresets[0].sourceIds], customUrls: [], directUrls: [], excludedDomains: [] },
});

function displayTime(value?: string | null) {
  if (!value) return '尚未安排';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function runLabel(run: ExplorationRun) {
  if (run.status === 'running' || run.status === 'pending') return '執行中';
  if (run.status === 'complete_with_shortfall') return '完成但素材不足';
  if (run.status === 'failed') return '失敗';
  return '完成';
}

export function ExplorationNursery({ workspacePath, onHandoff }: {
  workspacePath?: string;
  onHandoff: (value: { key: string; sourceIds: string[]; titles: string[] }) => void;
}) {
  const [tasks, setTasks] = useState<ExplorationTask[]>([]);
  const [runs, setRuns] = useState<ExplorationRun[]>([]);
  const [items, setItems] = useState<ExplorationItem[]>([]);
  const [basket, setBasket] = useState<ExplorationItem[]>([]);
  const [reviews, setReviews] = useState<Array<{ itemId: string; dueOn: string; status: string }>>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [filter, setFilter] = useState<Filter>('unread');
  const [leftView, setLeftView] = useState<'tasks' | 'runs'>('tasks');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [editor, setEditor] = useState<TaskDraft | null>(null);
  const [presetPickerMode, setPresetPickerMode] = useState<'name' | 'topic' | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState(explorationPresets[0].id);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [scheduler, setScheduler] = useState<{ installed: boolean; status: string; error: string } | null>(null);
  const workspace = workspacePath || '';

  const load = useCallback(async (quiet = false) => {
    if (!workspace) return;
    if (!quiet) setLoading(true);
    try {
      const [taskData, runData, itemData, basketData, reviewData, schedulerData] = await Promise.all([
        explorationApi.tasks(workspace), explorationApi.runs(workspace), explorationApi.items(workspace),
        explorationApi.basket(workspace), explorationApi.reviews(workspace), explorationApi.scheduler(workspace),
      ]);
      setTasks(taskData.tasks); setRuns(runData.runs); setItems(itemData.items); setBasket(basketData.items);
      setReviews(reviewData.reviews); setScheduler(schedulerData);
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : '探索苗圃讀取失敗。' }); }
    finally { if (!quiet) setLoading(false); }
  }, [workspace]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!runs.some(run => run.status === 'running' || run.status === 'pending')) return;
    const timer = window.setInterval(() => void load(true), 5000);
    return () => window.clearInterval(timer);
  }, [runs, load]);

  const dueIds = useMemo(() => new Set(reviews.filter(review => review.status === 'pending' && review.dueOn <= new Date().toISOString().slice(0, 10)).map(review => review.itemId)), [reviews]);
  const visibleItems = useMemo(() => items.filter(item => {
    if (selectedTask && item.taskId !== selectedTask) return false;
    if (filter === 'unread') return !item.read && !item.archived;
    if (filter === 'saved') return item.favoriteLevel > 0 && !item.archived;
    if (filter === 'review') return dueIds.has(item.id) && !item.archived;
    if (filter === 'archived') return item.archived;
    return !item.archived;
  }), [items, selectedTask, filter, dueIds]);
  const detail = items.find(item => item.id === selectedItem) || visibleItems[0] || null;
  const unread = items.filter(item => !item.read && !item.archived).length;
  const running = runs.filter(run => run.status === 'running' || run.status === 'pending').length;
  const nextTask = tasks.filter(task => task.nextRunAt).sort((a, b) => String(a.nextRunAt).localeCompare(String(b.nextRunAt)))[0];
  const basketIds = new Set(basket.map(item => item.id));
  const selectedPreset = explorationPresets.find(preset => preset.id === selectedPresetId) || explorationPresets[0];
  const sourceOptions = [...new Set([...(selectedPreset.sourceIds || []), ...(editor?.sources.connectorIds || [])])]
    .map(id => sourceCatalogById.get(id))
    .filter((source): source is (typeof explorationSourceCatalog)[number] => Boolean(source));

  const act = async (action: () => Promise<unknown>, message: string) => {
    try { await action(); setNotice({ kind: 'success', text: message }); await load(true); }
    catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : '操作失敗。' }); }
  };
  const toggleBasket = (item: ExplorationItem) => act(
    () => explorationApi.setBasket(workspace, basketIds.has(item.id) ? basket.filter(row => row.id !== item.id).map(row => row.id) : [...basket.map(row => row.id), item.id]),
    basketIds.has(item.id) ? '已移出來源籃。' : '已放進來源籃。',
  );
  const editTask = (task?: ExplorationTask) => {
    const draft = task ? { ...task, schedule: { ...task.schedule }, sources: { ...task.sources } } : emptyDraft();
    const matchingPreset = explorationPresets.find(preset => preset.label === draft.name || preset.topics.includes(draft.topic || ''));
    setAiReady(false);
    setAdvancedOpen(false);
    setPresetPickerMode(task ? null : 'name');
    setSelectedPresetId(matchingPreset?.id || explorationPresets[0].id);
    setEditor(draft);
  };
  const choosePresetDomain = (id: string) => {
    const preset = explorationPresets.find(candidate => candidate.id === id);
    if (!preset) return;
    setSelectedPresetId(id);
    setEditor(current => current ? { ...current, name: preset.label, sources: { ...current.sources, connectorIds: [...preset.sourceIds] } } : current);
  };
  const choosePresetTopic = (topic: string) => {
    setEditor(current => current ? { ...current, name: selectedPreset.label, topic, sources: { ...current.sources, connectorIds: [...selectedPreset.sourceIds] } } : current);
    setPresetPickerMode(null);
  };
  const saveTask = async () => {
    if (!editor?.topic?.trim() || !editor.name?.trim()) { setNotice({ kind: 'error', text: '請填寫任務名稱與探索題目。' }); return; }
    if (!aiReady) { setNotice({ kind: 'error', text: '請先確認 AI 已連線並選好模型。' }); return; }
    await act(() => explorationApi.saveTask(workspace, editor), editor.id ? '探索任務已更新。' : '探索任務已建立。');
    setEditor(null);
  };
  const updateSelection = useCallback((selection: AiSelection) => setEditor(current => current ? { ...current, provider: selection.provider as 'openai', model: selection.model } : current), []);
  const updateReady = useCallback((ready: boolean) => setAiReady(ready), []);

  if (!workspace) return (
    <section className="exploration-empty">
      <Search size={28} />
      <h1>探索苗圃等待一座本機森林</h1>
      <p>先從 FOREST 連接 Windows 資料夾。排程素材會存到 WikiTree 的本機資料區，不會寫進 Markdown 資料夾。</p>
    </section>
  );

  return (
    <section className="exploration-page">
      <header className="exploration-header">
        <div>
          <div className="exploration-eyebrow"><Sparkles size={13} /> ORBIT / 探索苗圃</div>
          <h1>讓未知自己敲門</h1>
          <p>排程只把素材帶進門；你確認過的草稿，才會長成正式葉片。</p>
        </div>
        <div className="exploration-header-actions">
          <button className="btn" onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} />重新整理</button>
          <button className="btn btn-primary" onClick={() => editTask()}><Plus size={14} />建立探索任務</button>
        </div>
      </header>

      <div className="exploration-pulse" aria-label="探索摘要">
        <div><Inbox size={15} /><span>未讀素材</span><strong>{unread}</strong></div>
        <div><Clock3 size={15} /><span>執行中的任務</span><strong>{running}</strong></div>
        <div><CalendarClock size={15} /><span>下一次探索</span><strong>{nextTask ? `${nextTask.name} · ${displayTime(nextTask.nextRunAt)}` : '尚未安排'}</strong></div>
      </div>

      {notice && <div className={`exploration-notice ${notice.kind}`}><span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="關閉"><X size={13} /></button></div>}

      <div className="exploration-workspace">
        <aside className="exploration-task-pane">
          <div className="pane-tabs">
            <button className={leftView === 'tasks' ? 'active' : ''} onClick={() => setLeftView('tasks')}><Search size={13} />探索任務</button>
            <button className={leftView === 'runs' ? 'active' : ''} onClick={() => setLeftView('runs')}><History size={13} />履歷</button>
          </div>
          <div className="pane-scroll">
            {leftView === 'tasks' ? <>
              <button className={`exploration-task-row ${selectedTask === '' ? 'active' : ''}`} onClick={() => setSelectedTask('')}>
                <span><strong>全部任務</strong><small>跨批次查看素材</small></span><b>{items.length}</b>
              </button>
              {tasks.map(task => <div key={task.id} className={`exploration-task-row ${selectedTask === task.id ? 'active' : ''}`}>
                <button className="task-main" onClick={() => setSelectedTask(task.id)}>
                  <span><strong>{task.name}</strong><small>{task.legacyProviderRemoved ? '舊 AI 連線已停用，請重新設定' : task.status === 'paused' ? '已暫停' : displayTime(task.nextRunAt)}</small></span><ChevronRight size={13} />
                </button>
                <div className="task-actions">
                  {!task.legacyProviderRemoved && <button title="立即執行" onClick={() => void act(() => explorationApi.runTask(workspace, task.id), '探索已開始，完成後會進入素材流。')}><Play size={12} /></button>}
                  <button title="編輯任務" onClick={() => editTask(task)}><Settings2 size={12} /></button>
                  {!task.legacyProviderRemoved && <button title={task.status === 'paused' ? '恢復' : '暫停'} onClick={() => void act(() => explorationApi.saveTask(workspace, { ...task, status: task.status === 'paused' ? 'active' : 'paused' }), task.status === 'paused' ? '任務已恢復。' : '任務已暫停。')}>{task.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}</button>}
                </div>
              </div>)}
            </> : runs.map(run => <button key={run.id} className="exploration-run-row" onClick={() => { setSelectedTask(run.taskId); setFilter('all'); }}>
              <span><strong>{(run.taskSnapshot as ExplorationTask)?.name || '探索執行'}</strong><small>{displayTime(run.startedAt || run.scheduledFor)}</small></span>
              <em data-status={run.status}>{runLabel(run)}</em>
              {(run.error || run.shortfallReason) && <small>{run.error || run.shortfallReason}</small>}
            </button>)}
          </div>
          <div className="scheduler-strip">
            <span>{scheduler?.installed ? <Bell size={13} /> : <BellOff size={13} />}{scheduler?.installed ? `背景排程：${scheduler.status}` : '背景排程尚未安裝'}</span>
            <button className="btn" onClick={() => void act(() => explorationApi.schedulerAction(workspace, scheduler?.installed ? 'remove' : 'install'), scheduler?.installed ? '背景排程已移除。' : '背景排程已安裝。')}>{scheduler?.installed ? '移除' : '安裝'}</button>
            {scheduler?.error && <small>{scheduler.error}</small>}
            <button className="text-action" onClick={() => { const value = window.prompt('舊 Brew 資料夾位置：', 'C:\\Users\\閻星澄\\Desktop\\brew'); if (value) void act(() => explorationApi.importBrew(workspace, value), '舊 Brew 歷史已匯入；重複素材已略過。'); }}>從舊 Brew 匯入</button>
          </div>
        </aside>

        <main className="exploration-feed-pane">
          <nav className="material-filters" aria-label="素材篩選">
            {([['unread', `未讀 ${unread}`], ['all', '最新探索'], ['saved', '已保留'], ['review', `待回訪 ${dueIds.size}`], ['archived', '封存']] as Array<[Filter, string]>).map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
          </nav>
          {!visibleItems.length ? <div className="material-empty"><Inbox size={24} /><strong>這裡還沒有素材</strong><span>建立任務或立即執行一次探索；找不到足夠可靠的來源時，系統會誠實留下短缺紀錄。</span></div> : <div className="material-stream">
            <div className="material-list">
              {visibleItems.map(item => <button key={item.id} className={`material-row ${detail?.id === item.id ? 'active' : ''} ${item.read ? 'read' : ''}`} onClick={() => { setSelectedItem(item.id); if (!item.read) void act(() => explorationApi.feedback(workspace, item.id, 'read'), '已標記為已讀。'); }}>
                <span className="material-origin">AI 自動排程探索 · {item.source.platform || item.source.domain}</span>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <small>{item.source.publishedAt || '日期未確認'}{item.favoriteLevel > 0 ? ` · ${item.favoriteLevel === 2 ? '重點保留' : '已保留'}` : ''}</small>
              </button>)}
            </div>
            {detail && <article className="material-detail">
              <div className="material-detail-head"><div><span>AI 自動排程探索</span><h2>{detail.title}</h2></div><button className="btn" onClick={() => void toggleBasket(detail)}>{basketIds.has(detail.id) ? <Check size={13} /> : <Plus size={13} />}{basketIds.has(detail.id) ? '已在來源籃' : '加入來源籃'}</button></div>
              <section><h3>來源支持的內容</h3><p>{detail.sourceSupported || '來源沒有提供可安全摘述的內容。'}</p></section>
              <section className="inference"><h3>AI 整理／推論</h3><p>{detail.editorialSynthesis || detail.summary}</p><small>這一段是 AI 的整理，不等於來源原文或已證實事實。</small></section>
              <dl className="source-lineage"><div><dt>來源</dt><dd><a href={detail.source.url} target="_blank" rel="noreferrer">{detail.source.domain}<ExternalLink size={11} /></a></dd></div><div><dt>作者</dt><dd>{detail.source.author || '未確認'}</dd></div><div><dt>發布日</dt><dd>{detail.source.publishedAt || '未確認'}</dd></div><div><dt>探索履歷</dt><dd>{detail.runId.slice(0, 8)}</dd></div></dl>
              <div className="material-actions">
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, detail.favoriteLevel === 1 ? 'unsaved' : 'saved'), detail.favoriteLevel === 1 ? '已取消保留。' : '7 天後會提醒你回訪。')}><Star size={12} />保留</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, 'priority_saved'), '已重點保留，將於 3／14／45 天回訪。')}><Star size={12} />重點保留</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, 'want_more'), '已記住你想看更多這個方向。')}>想看更多</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, 'want_to_build'), '已記住你想實作。')}>想實作</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, 'not_interested'), '已封存並降低相似方向。')}>不感興趣</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, 'exclude_source'), '後續探索將排除這個來源。')}>排除來源</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, 'converted'), '已標示為轉成筆記。')}><BookOpen size={12} />已轉成筆記</button>
                <button onClick={() => void act(() => explorationApi.feedback(workspace, detail.id, detail.archived ? 'unarchive' : 'archive'), detail.archived ? '已移回素材流。' : '已封存。')}><Archive size={12} />{detail.archived ? '移回素材流' : '封存'}</button>
                <button className="danger" onClick={() => { if (window.confirm('永久刪除後無法復原。確定刪除這筆探索素材？') && window.confirm('最後確認：真的要永久刪除嗎？')) void act(() => explorationApi.deleteItem(workspace, detail.id), '素材已永久刪除，無法復原。'); }}><Trash2 size={12} />永久刪除</button>
              </div>
            </article>}
          </div>}
        </main>

        <aside className="source-basket-pane">
          <div className="basket-heading"><div><span>來源籃</span><strong>{basket.length} / 10</strong></div><small>可跨批次挑選；AI 必須自行判斷，不能把它們當成絕對事實。</small></div>
          <div className="basket-items">{basket.map((item, index) => <div key={item.id}><b>{String(index + 1).padStart(2, '0')}</b><span><strong>{item.title}</strong><small>{item.source.domain}</small></span><button onClick={() => void toggleBasket(item)} aria-label={`移除 ${item.title}`}><X size={12} /></button></div>)}{!basket.length && <p>從素材詳情加入最多 10 筆來源。</p>}</div>
          <button className="btn btn-primary basket-submit" disabled={!basket.length} onClick={() => onHandoff({ key: crypto.randomUUID(), sourceIds: basket.map(item => item.id), titles: basket.map(item => item.title) })}><Sparkles size={14} />交給 AI 整理草稿</button>
          <p className="basket-footnote">送出後只會建立 AI 工作台對話。草稿仍須預覽，再選擇建立新葉片或插入現有筆記。</p>
        </aside>
      </div>

      {editor && <div className="exploration-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEditor(null); }}>
        <form className="exploration-task-editor" onSubmit={event => { event.preventDefault(); void saveTask(); }}>
          <header><div><span>探索任務</span><h2>{editor.id ? '調整探索路線' : '建立一條自動探索路線'}</h2></div><button type="button" onClick={() => setEditor(null)}><X size={16} /></button></header>
          {editor.legacyProviderRemoved && <div className="exploration-notice error"><span>這個任務原本使用的 Antigravity 連線已停用，目前保持暫停。請在下方確認 OpenAI 模型後再儲存。</span></div>}
          <div className="task-form-grid">
            <div className="task-field wide">
              <label htmlFor="exploration-task-name"><span>任務名稱</span><small>可自己輸入，也可從 20 個興趣領域挑選</small></label>
              <div className="preset-input-row">
                <input id="exploration-task-name" className="form-input" value={editor.name || ''} onChange={event => setEditor({ ...editor, name: event.target.value })} placeholder="例如：AI 與科技" />
                <button type="button" className={`preset-trigger ${presetPickerMode === 'name' ? 'active' : ''}`} onClick={() => setPresetPickerMode(current => current === 'name' ? null : 'name')} aria-expanded={presetPickerMode === 'name'}><Tags size={13} />挑興趣</button>
              </div>
            </div>
            <div className="task-field wide">
              <label htmlFor="exploration-task-topic"><span>自由探索題目</span><small>保留自由輸入，或從興趣下挑一個更精細的題目</small></label>
              <div className="preset-input-row preset-textarea-row">
                <textarea id="exploration-task-topic" className="form-input" rows={3} value={editor.topic || ''} onChange={event => setEditor({ ...editor, topic: event.target.value })} placeholder="我想被帶進哪一扇陌生的門？" />
                <button type="button" className={`preset-trigger ${presetPickerMode === 'topic' ? 'active' : ''}`} onClick={() => setPresetPickerMode(current => current === 'topic' ? null : 'topic')} aria-expanded={presetPickerMode === 'topic'}><Tags size={13} />挑題目</button>
              </div>
            </div>
            {presetPickerMode && <section className="exploration-preset-picker wide" aria-label={presetPickerMode === 'name' ? '興趣領域選擇' : '細分探索題目選擇'}>
              <div className="preset-picker-heading">
                <div><strong>{presetPickerMode === 'name' ? '你對什麼有興趣？' : '想從哪個方向開始？'}</strong><small>先選領域，下方會出現 4 個可直接使用的題目。</small></div>
                <button type="button" onClick={() => setPresetPickerMode(null)} aria-label="關閉預設選擇"><X size={13} /></button>
              </div>
              <div className="preset-domain-list" aria-label="20 個興趣領域">
                {explorationPresets.map(preset => <button type="button" key={preset.id} className={preset.id === selectedPreset.id ? 'active' : ''} onClick={() => choosePresetDomain(preset.id)}><span>{preset.label}</span><small>{preset.description}</small></button>)}
              </div>
              <div className="preset-topic-panel">
                <div><span>目前領域</span><strong>{selectedPreset.label}</strong><small>點選一個題目後，仍可在上方自由修改。</small></div>
                <div className="preset-topic-list">{selectedPreset.topics.map((topic, index) => <button type="button" key={topic} onClick={() => choosePresetTopic(topic)}><b>{String(index + 1).padStart(2, '0')}</b><span>{topic}</span><ChevronRight size={13} /></button>)}</div>
              </div>
            </section>}
            <label className="wide">補充要求<textarea className="form-input" rows={2} value={editor.instructions || ''} onChange={event => setEditor({ ...editor, instructions: event.target.value })} placeholder="語言、時間範圍、不要出現的內容……" /></label>
            <label>每次素材數<select className="form-input" value={editor.itemCount || 5} onChange={event => setEditor({ ...editor, itemCount: Number(event.target.value) })}>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 筆</option>)}</select></label>
            <label>節奏<select className="form-input" value={editor.schedule.kind || 'manual'} onChange={event => setEditor({ ...editor, schedule: { ...editor.schedule, kind: event.target.value as ExplorationScheduleKind } })}><option value="manual">只手動執行</option><option value="daily">每天</option><option value="weekdays">指定星期</option><option value="weekly">每週</option><option value="monthly">每月</option></select></label>
            {editor.schedule.kind !== 'manual' && <label>本地時間<input className="form-input" type="time" value={editor.schedule.localTime || '09:00'} onChange={event => setEditor({ ...editor, schedule: { ...editor.schedule, localTime: event.target.value } })} /></label>}
            {(editor.schedule.kind === 'weekdays' || editor.schedule.kind === 'weekly') && <fieldset className="wide"><legend>星期</legend><div className="day-grid">{dayLabels.map((label, index) => { const day = index + 1; return <label key={day}><input type={editor.schedule.kind === 'weekly' ? 'radio' : 'checkbox'} name={editor.schedule.kind === 'weekly' ? 'weekly-day' : undefined} checked={editor.schedule.daysOfWeek?.includes(day)} onChange={event => setEditor({ ...editor, schedule: { ...editor.schedule, daysOfWeek: editor.schedule.kind === 'weekly' ? [day] : event.target.checked ? [...(editor.schedule.daysOfWeek || []), day] : (editor.schedule.daysOfWeek || []).filter(value => value !== day) } })} />{label}</label>; })}</div></fieldset>}
            {editor.schedule.kind === 'monthly' && <label>每月日期<input className="form-input" type="number" min={1} max={31} value={editor.schedule.dayOfMonth || 1} onChange={event => setEditor({ ...editor, schedule: { ...editor.schedule, dayOfMonth: Number(event.target.value) } })} /></label>}
            <label className="toggle-line"><input type="checkbox" checked={Boolean(editor.notificationEnabled)} onChange={event => setEditor({ ...editor, notificationEnabled: event.target.checked })} />完成時顯示 Windows 通知（預設關閉）</label>
            <details className="task-advanced-settings wide" open={advancedOpen} onToggle={event => setAdvancedOpen(event.currentTarget.open)}>
              <summary>
                <span><strong>進階設定</strong><small>AI 模型、來源範圍與網址限制</small></span>
                <em>OpenAI · {(editor.sources.connectorIds || []).length} 個一般來源</em>
                <ChevronRight size={14} />
              </summary>
              <div className="advanced-settings-body">
                <div><AiProviderPicker url={localStorage.getItem('antigravity_cli_url') || 'http://localhost:18080'} selection={{ provider: 'openai', model: editor.model || 'default' }} onChange={updateSelection} onReadyChange={updateReady} disabled={false} /></div>
                <fieldset><legend>{selectedPreset.label}的建議來源</legend><small className="source-scope-note">選擇興趣時會自動套用，你仍可個別取消。</small><div className="connector-grid">{sourceOptions.map(source => <label key={source.id}><input type="checkbox" checked={editor.sources.connectorIds?.includes(source.id)} onChange={event => setEditor({ ...editor, sources: { ...editor.sources, connectorIds: event.target.checked ? [...(editor.sources.connectorIds || []), source.id] : (editor.sources.connectorIds || []).filter(value => value !== source.id) } })} />{source.label}</label>)}</div></fieldset>
                <label>指定網站／RSS（每行一個）<textarea className="form-input" rows={2} value={(editor.sources.customUrls || []).join('\n')} onChange={event => setEditor({ ...editor, sources: { ...editor.sources, customUrls: event.target.value.split('\n').map(value => value.trim()).filter(Boolean) } })} /></label>
                <label>硬性網址（填寫後只看這些網址）<textarea className="form-input" rows={2} value={(editor.sources.directUrls || []).join('\n')} onChange={event => setEditor({ ...editor, sources: { ...editor.sources, directUrls: event.target.value.split('\n').map(value => value.trim()).filter(Boolean) } })} /></label>
                <label>排除來源網域（每行一個）<textarea className="form-input" rows={2} value={(editor.sources.excludedDomains || []).join('\n')} onChange={event => setEditor({ ...editor, sources: { ...editor.sources, excludedDomains: event.target.value.split('\n').map(value => value.trim().toLowerCase()).filter(Boolean) } })} placeholder="example.com" /></label>
              </div>
            </details>
          </div>
          <footer>{editor.id && <button type="button" className="btn danger" onClick={() => { if (window.confirm('封存任務後不再執行，但歷史與素材會保留。確定封存？')) void act(() => explorationApi.archiveTask(workspace, editor.id!), '任務已封存。').then(() => setEditor(null)); }}>封存任務</button>}<span /><button type="button" className="btn" onClick={() => setEditor(null)}>取消</button><button type="submit" className="btn btn-primary">{editor.id ? '儲存調整' : '建立任務'}</button></footer>
        </form>
      </div>}
    </section>
  );
}
