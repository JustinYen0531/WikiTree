import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ExternalLink,
  FolderOpen,
  Globe2,
  Import,
  Library,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react';
import { cliWorkspaceHeaders } from '../utils/cliWorkspace';
import {
  DEFAULT_SKILLS,
  PUBLIC_SKILL_CATALOG,
  type WikiSkill,
} from '../utils/learningSkills';

interface SkillLibraryProps {
  workspacePath?: string;
}

const mergeSkills = (skills: WikiSkill[]) => {
  const map = new Map<string, WikiSkill>();
  skills.forEach((skill) => map.set(skill.id, skill));
  return Array.from(map.values());
};

const isSameSkill = (stored: WikiSkill, candidate: WikiSkill) => {
  return stored.id === candidate.id || stored.name === candidate.name || stored.id === candidate.name;
};

export const SkillLibrary: React.FC<SkillLibraryProps> = ({ workspacePath }) => {
  const [storedSkills, setStoredSkills] = useState<WikiSkill[]>(DEFAULT_SKILLS);
  const [selectedId, setSelectedId] = useState(PUBLIC_SKILL_CATALOG[0]?.id || DEFAULT_SKILLS[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/skills', { headers: cliWorkspaceHeaders(workspacePath) });
      if (!response.ok) throw new Error('技能清單暫時無法讀取');
      const data = await response.json();
      if (Array.isArray(data.skills) && data.skills.length > 0) {
        setStoredSkills(mergeSkills(data.skills));
      }
    } catch {
      // The built-in list remains visible when the local CLI is offline.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSkills();
  }, [workspacePath]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const categories = useMemo(() => {
    return ['全部', ...Array.from(new Set(PUBLIC_SKILL_CATALOG.map((skill) => skill.category || '其他')))];
  }, []);

  const visibleCatalog = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return PUBLIC_SKILL_CATALOG.filter((skill) => {
      const matchesCategory = category === '全部' || skill.category === category;
      const matchesQuery = !cleanQuery || [skill.title, skill.name, skill.description, skill.badge]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(cleanQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const visibleStored = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return storedSkills.filter((skill) => {
      if (!cleanQuery) return true;
      return [skill.title, skill.name, skill.description, skill.badge]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(cleanQuery);
    });
  }, [query, storedSkills]);

  const selectedSkill = useMemo(() => {
    const catalogSkill = PUBLIC_SKILL_CATALOG.find((skill) => skill.id === selectedId);
    const storedSkill = storedSkills.find((skill) => catalogSkill ? isSameSkill(skill, catalogSkill) : skill.id === selectedId);
    return storedSkill || catalogSkill || storedSkills[0] || PUBLIC_SKILL_CATALOG[0];
  }, [selectedId, storedSkills]);

  const isStored = (skill: WikiSkill) => storedSkills.some((stored) => isSameSkill(stored, skill));

  const handleImport = async (skill: WikiSkill) => {
    if (!workspacePath) {
      setNotice({ kind: 'error', text: '請先在左側 FOREST 連接一座本機知識森林，才能寫入 Skill。' });
      return;
    }
    setImportingId(skill.id);
    setNotice(null);
    try {
      const response = await fetch('/api/skills/import', {
        method: 'POST',
        headers: cliWorkspaceHeaders(workspacePath),
        body: JSON.stringify({ id: skill.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Skill 匯入失敗');
      setNotice({ kind: 'success', text: `已將「${skill.title}」獨立存入這座知識森林。` });
      await loadSkills();
      setSelectedId(skill.id);
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Skill 匯入失敗' });
    } finally {
      setImportingId(null);
    }
  };

  const renderStoredBadge = (skill: WikiSkill) => (
    <span className="skill-library-status skill-library-status-stored">
      <Check size={12} /> 已儲存
    </span>
  );

  return (
    <section className="skill-library-page">
      <header className="skill-library-topbar">
        <div>
          <div className="skill-library-eyebrow"><Library size={14} /> ORBIT / SKILLS</div>
          <h1>筆記技能庫</h1>
          <p>每一項 Skill 都獨立保存、獨立啟用，先看懂它的用途，再決定要不要加入這座知識森林。</p>
        </div>
        <div className="skill-library-counts" aria-label="技能數量">
          <div><strong>{storedSkills.length}</strong><span>目前儲存</span></div>
          <div><strong>{PUBLIC_SKILL_CATALOG.length}</strong><span>公開可引入</span></div>
        </div>
      </header>

      <div className="skill-library-toolbar">
        <div className="skill-library-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋 Skill 名稱、用途或方法…"
            aria-label="搜尋技能"
          />
        </div>
        <div className="skill-library-filters" role="tablist" aria-label="技能分類">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {notice && <div className={`skill-library-notice ${notice.kind}`}>{notice.text}</div>}

      <div className="skill-library-content">
        <div className="skill-library-list-pane">
          <div className="skill-library-section-heading">
            <span><Sparkles size={15} /> 目前已儲存</span>
            <small>{loading ? '同步中…' : `${visibleStored.length} 項`}</small>
          </div>
          <div className="skill-library-card-list">
            {visibleStored.length === 0 ? (
              <div className="skill-library-empty">沒有符合搜尋條件的已儲存技能。</div>
            ) : visibleStored.map((skill) => (
              <button
                type="button"
                key={`stored-${skill.id}`}
                className={`skill-library-card ${selectedSkill?.id === skill.id ? 'active' : ''}`}
                onClick={() => setSelectedId(skill.id)}
              >
                <span className="skill-library-card-icon"><Sparkles size={16} /></span>
                <span className="skill-library-card-body">
                  <strong>{skill.title}</strong>
                  <small>{skill.description}</small>
                  <span className="skill-library-card-meta">
                    {skill.badge && <em>{skill.badge}</em>}
                    {renderStoredBadge(skill)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="skill-library-section-heading skill-library-public-heading">
            <span><Globe2 size={15} /> 公開可引入</span>
            <small>{visibleCatalog.length} 項</small>
          </div>
          <div className="skill-library-card-list">
            {visibleCatalog.map((skill) => {
              const stored = isStored(skill);
              return (
                <button
                  type="button"
                  key={skill.id}
                  className={`skill-library-card ${selectedSkill?.id === skill.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(skill.id)}
                >
                  <span className="skill-library-card-icon public"><Tag size={16} /></span>
                  <span className="skill-library-card-body">
                    <strong>{skill.title}</strong>
                    <small>{skill.description}</small>
                    <span className="skill-library-card-meta">
                      {skill.badge && <em>{skill.badge}</em>}
                      {stored ? renderStoredBadge(skill) : <span className="skill-library-status">可獨立引入</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <article className="skill-library-detail">
          {selectedSkill ? (
            <>
              <div className="skill-library-detail-head">
                <div className="skill-library-detail-icon"><Sparkles size={22} /></div>
                <div>
                  <div className="skill-library-detail-badge">{selectedSkill.badge || selectedSkill.category || '技能'}</div>
                  <h2>{selectedSkill.title}</h2>
                  <code>{selectedSkill.name}</code>
                </div>
              </div>
              <p className="skill-library-detail-description">{selectedSkill.description}</p>

              <div className="skill-library-detail-grid">
                <div><span>狀態</span><strong>{isStored(selectedSkill) ? '已經儲存在本機' : '尚未加入這座森林'}</strong></div>
                <div><span>授權</span><strong>{selectedSkill.license || 'WikiTree 內建'}</strong></div>
                <div><span>用途分類</span><strong>{selectedSkill.category || '筆記技能'}</strong></div>
                <div><span>使用方式</span><strong>在 AI 技能選擇器中獨立啟用</strong></div>
              </div>

              {selectedSkill.content && (
                <div className="skill-library-content-preview">
                  <div className="skill-library-detail-label">目前載入內容</div>
                  <pre>{selectedSkill.content.slice(0, 1200)}{selectedSkill.content.length > 1200 ? '\n…' : ''}</pre>
                </div>
              )}

              <div className="skill-library-detail-actions">
                {selectedSkill.importable && !isStored(selectedSkill) && (
                  <button type="button" className="btn btn-primary" onClick={() => void handleImport(selectedSkill)} disabled={importingId === selectedSkill.id}>
                    <Import size={15} />
                    {importingId === selectedSkill.id ? '正在引入…' : '獨立引入專案'}
                  </button>
                )}
                {isStored(selectedSkill) && <span className="skill-library-ready"><Check size={15} /> 這項 Skill 已可在 AI 面板選用</span>}
                {selectedSkill.sourceUrl && (
                  <a className="btn" href={selectedSkill.sourceUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} /> 查看原始來源
                  </a>
                )}
              </div>
              {!workspacePath && selectedSkill.importable && !isStored(selectedSkill) && (
                <div className="skill-library-hint"><FolderOpen size={14} /> 先從左側 FOREST 連接本機資料夾，才能把這項 Skill 寫入專案。</div>
              )}
            </>
          ) : (
            <div className="skill-library-empty detail">選擇一項 Skill 查看概要。</div>
          )}
        </article>
      </div>
    </section>
  );
};
