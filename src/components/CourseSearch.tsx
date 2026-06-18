import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  Hash,
  Languages,
  Link as LinkIcon,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Tag,
  UserRound,
  X,
  Droplets,
  MessageSquare,
  Send,
  Lock,
  TreePine,
} from 'lucide-react';
import { FileNode } from '../utils/fileSystem';
import { 
  supabase, 
  isSupabaseConfigured,
  fetchAllPublishedNotes,
  fetchWaterings,
  toggleWatering,
  fetchMessages,
  addMessage
} from '../utils/supabase';
import {
  NoteCategoryType,
  NoteTarget,
  assignNoteToTarget,
  getNoteTargetKey,
  loadNoteAssignments,
  removeNoteAssignment,
  saveNoteAssignments,
} from '../utils/noteCatalog';

type Course = {
  core?: string;
  emiType?: string;
  far?: string;
  gdeTpe?: string;
  gdeTpeMsg?: string;
  gdeType?: string;
  info?: string;
  isTrace?: string;
  langTpe?: string;
  lmtKind?: string;
  note?: string;
  pay?: string;
  s?: string;
  smtQty?: string;
  subClassroom?: string;
  subGde?: string;
  subKind?: string;
  subLocUrl?: string;
  subNam?: string;
  subNum?: string;
  subOdr?: string;
  subPoint?: string;
  subRemainUrl?: string;
  subSetUrl?: string;
  subTime?: string;
  subUnitRuleUrl?: string;
  teaExpUrl?: string;
  teaNam?: string;
  teaSchmUrl?: string;
  tranTpe?: string;
  y?: string;
};

interface CourseSearchProps {
  files: FileNode[];
  activeFile: FileNode | null;
  onOpenNote: (file: FileNode) => void;
  user?: {
    id?: string;
    username: string;
    nickname: string;
    college: string;
    department: string;
    grade: string;
    isSupabaseUser?: boolean;
  } | null;
}

const COURSE_DATA_URL = '/data/nccu_courses_1132.json';
const RESULT_PAGE_SIZE = 120;

const categoryTypes: Array<{
  type: NoteCategoryType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'course',
    label: '政大課程',
    description: '用課名、老師、課號查找課程筆記',
    icon: <BookOpen size={16} />,
  },
  {
    type: 'exam',
    label: '考試',
    description: '英檢、研究所、檢定考試',
    icon: <GraduationCap size={16} />,
  },
  {
    type: 'certification',
    label: '證照',
    description: 'CFA、CPA、金融與專業證照',
    icon: <Award size={16} />,
  },
  {
    type: 'custom',
    label: '自訂主題',
    description: '讀書會、專案、個人知識主題',
    icon: <Tag size={16} />,
  },
];

const presetTargets: Record<Exclude<NoteCategoryType, 'course'>, NoteTarget[]> = {
  exam: [
    { type: 'exam', id: 'gept', title: '全民英檢 GEPT', subtitle: '英文檢定' },
    { type: 'exam', id: 'toefl', title: 'TOEFL', subtitle: '留學英文考試' },
    { type: 'exam', id: 'ielts', title: 'IELTS', subtitle: '留學英文考試' },
    { type: 'exam', id: 'graduate-school', title: '研究所考試', subtitle: '入學考試' },
  ],
  certification: [
    { type: 'certification', id: 'cfa', title: 'CFA', subtitle: '金融分析師' },
    { type: 'certification', id: 'cpa', title: 'CPA', subtitle: '會計師' },
    { type: 'certification', id: 'frm', title: 'FRM', subtitle: '金融風險管理' },
    { type: 'certification', id: 'google-cert', title: 'Google Certificates', subtitle: '數位技能證照' },
  ],
  custom: [
    { type: 'custom', id: 'reading-group', title: '讀書會', subtitle: '共同閱讀與討論' },
    { type: 'custom', id: 'research-topic', title: '研究主題', subtitle: '論文、專題、資料整理' },
    { type: 'custom', id: 'career', title: '職涯準備', subtitle: '履歷、面試、作品集' },
    { type: 'custom', id: 'personal-knowledge', title: '個人知識庫', subtitle: '非課程型筆記' },
  ],
};

const getValue = (value?: string) => {
  const clean = (value || '').replace(/\uFFFD+/g, '').trim();
  return clean || '未提供';
};

const uniq = (courses: Course[], key: keyof Course) => {
  return Array.from(
    new Set(courses.map((course) => getValue(course[key])).filter((value) => value !== '未提供'))
  ).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
};

const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

const normalizeFilterValue = (key: keyof Course, value?: string) => {
  const clean = getValue(value).replace(/\uFFFD+/g, '').trim();

  if (key === 'subGde') {
    const unitAliases: Array<[RegExp, string]> = [
      [/企管|企研|企博/, '企管'],
      [/地政|地[一二三四].*土/, '地政'],
      [/中文/, '中文'],
      [/土文/, '土文'],
      [/公行/, '公行'],
      [/心理/, '心理'],
      [/文院/, '文院'],
      [/日文|日學/, '日文'],
      [/台文/, '台文'],
      [/台史/, '台史'],
      [/外文中|外文中心/, '外文中心'],
      [/外交|外戰略/, '外交'],
      [/行管|行國防|行領導/, '行管'],
      [/民族/, '民族'],
      [/東南/, '東南亞'],
      [/東亞/, '東亞'],
      [/法律|法科|法碩/, '法律'],
      [/社工/, '社工'],
      [/財政/, '財政'],
      [/金融/, '金融'],
      [/國貿/, '國貿'],
      [/會計/, '會計'],
      [/統計/, '統計'],
      [/資管/, '資管'],
      [/風管/, '風管'],
      [/新聞/, '新聞'],
      [/廣告/, '廣告'],
      [/廣電/, '廣電'],
      [/傳播/, '傳播'],
      [/英文/, '英文'],
      [/教育/, '教育'],
      [/幼教/, '幼教'],
      [/應數/, '應數'],
      [/資科/, '資科'],
      [/哲學/, '哲學'],
      [/歷史/, '歷史'],
      [/政治/, '政治'],
      [/科智|科博|科管/, '科智'],
      [/應社/, '社會'],
      [/社會/, '社會'],
      [/經濟/, '經濟'],
      [/財管/, '財管'],
    ];
    const alias = unitAliases.find(([pattern]) => pattern.test(clean));
    if (alias) return alias[1];

    const canonicalUnit = (unit: string) => unit.replace(/系$/, '').replace(/所$/, '').replace(/[碩博專產]$/, '');
    const explicitUnit = clean.match(/[\u4e00-\u9fffA-Za-z]+?(?:學分學程|學程|中心|學院|學士|專班|系|所)/);
    if (explicitUnit) return canonicalUnit(explicitUnit[0]);

    const classLevelPattern =
      /(?:一|二|三|四)(?:甲|乙|丙)?|(?:碩|博|專|產)(?:一|二|三|四|五|六|\d[A-Za-z]?)|博士|碩士|學士/g;
    const units = clean
      .replace(classLevelPattern, ' ')
      .split(/\s+/)
      .map((part) => part.trim())
      .map(canonicalUnit)
      .filter(Boolean);

    return Array.from(new Set(units)).join('、') || clean;
  }

  if (key === 'gdeType') {
    return clean
      .split('、')
      .map((part) => {
        if (part === '學士' || part === '學班' || part === '士班') return '學士班';
        if (part === '碩士') return '碩士班';
        if (part === '博士' || part === '博班') return '博士班';
        return part;
      })
      .filter(Boolean)
      .join('、');
  }

  return clean;
};

const filterMatches = (key: keyof Course, courseValue: string | undefined, selectedValue: string) => {
  return !selectedValue || normalizeFilterValue(key, courseValue) === normalizeFilterValue(key, selectedValue);
};

const getCourseId = (course: Course) => {
  return [course.y, course.s, course.subNum, course.subOdr, course.teaNam, course.subTime]
    .map((part) => getValue(part))
    .join('|');
};

const courseToTarget = (course: Course): NoteTarget => ({
  type: 'course',
  id: getCourseId(course),
  title: getValue(course.subNam),
  subtitle: `${getValue(course.subGde)} · ${getValue(course.teaNam)} · ${getValue(course.subNum)}-${getValue(course.subOdr)}`,
});

const flattenMarkdownFiles = (nodes: FileNode[]) => {
  const result: FileNode[] = [];

  const walk = (items: FileNode[]) => {
    for (const item of items) {
      if (item.kind === 'file' && item.name.toLowerCase().endsWith('.md')) {
        result.push(item);
      } else if (item.kind === 'directory' && item.children) {
        walk(item.children);
      }
    }
  };

  walk(nodes);
  return result;
};

export const CourseSearch: React.FC<CourseSearchProps> = ({ files, activeFile, onOpenNote, user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [gdeType, setGdeType] = useState('');
  const [subGde, setSubGde] = useState('');
  const [subKind, setSubKind] = useState('');
  const [langTpe, setLangTpe] = useState('');
  const [weekday, setWeekday] = useState('');
  const [visibleCount, setVisibleCount] = useState(RESULT_PAGE_SIZE);
  const [categoryType, setCategoryType] = useState<NoteCategoryType>('course');
  const [selectedTarget, setSelectedTarget] = useState<NoteTarget | null>(null);
  const [assignments, setAssignments] = useState(() => loadNoteAssignments());
  const [selectedNotePath, setSelectedNotePath] = useState('');
  const [idSearchMode, setIdSearchMode] = useState(false);
  const [idQuery, setIdQuery] = useState('');
  const [exploreMode, setExploreMode] = useState(false);
  const [publishedNotes, setPublishedNotes] = useState<any[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState('');
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreExpanded, setExploreExpanded] = useState<string | null>(null);

  // Community interaction states (watering/comments)
  const [noteWaterings, setNoteWaterings] = useState<any[]>([]);
  const [noteMessages, setNoteMessages] = useState<any[]>([]);
  const [userWatered, setUserWatered] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch(COURSE_DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('課程資料讀取失敗');
        }
        return response.json();
      })
      .then((data: Course[]) => {
        if (isMounted) {
          setCourses(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    saveNoteAssignments(assignments);
  }, [assignments]);

  useEffect(() => {
    if (!exploreMode) return;
    setExploreLoading(true);
    setExploreError('');
    fetchAllPublishedNotes()
      .then((data) => {
        setPublishedNotes(data || []);
        setExploreLoading(false);
      })
      .catch((err) => {
        setExploreError(`載入失敗：${err.message || err}`);
        setExploreLoading(false);
      });
  }, [exploreMode]);

  // Load waterings and comments for the expanded note
  useEffect(() => {
    if (!exploreExpanded) {
      setNoteWaterings([]);
      setNoteMessages([]);
      setUserWatered(false);
      return;
    }

    // 1. Fetch waterings
    fetchWaterings(exploreExpanded).then((data) => {
      setNoteWaterings(data || []);
      if (user) {
        const currentUserId = user.id || `local_${user.username}`;
        setUserWatered((data || []).some((w) => w.user_id === currentUserId));
      } else {
        setUserWatered(false);
      }
    });

    // 2. Fetch comments
    fetchMessages(exploreExpanded).then((data) => {
      setNoteMessages(data || []);
    });
  }, [exploreExpanded, user]);

  const handleWaterClick = async (noteId: string) => {
    if (!user) {
      alert('請先登入政大 Hub 帳戶才能為筆記澆水！');
      return;
    }
    const currentUserId = user.id || `local_${user.username}`;
    try {
      const { watered } = await toggleWatering(noteId, currentUserId);
      setUserWatered(watered);
      // Reload waterings
      const updated = await fetchWaterings(noteId);
      setNoteWaterings(updated || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, noteId: string) => {
    e.preventDefault();
    if (!user) {
      alert('請先登入政大 Hub 帳戶才能留下足跡！');
      return;
    }
    if (!commentInput.trim()) return;

    setIsSendingComment(true);
    const currentUserId = user.id || `local_${user.username}`;
    try {
      await addMessage(noteId, currentUserId, user.username, user.nickname, commentInput);
      setCommentInput('');
      // Reload comments
      const updated = await fetchMessages(noteId);
      setNoteMessages(updated || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingComment(false);
    }
  };

  const markdownFiles = useMemo(() => flattenMarkdownFiles(files), [files]);

  useEffect(() => {
    if (activeFile?.kind === 'file' && activeFile.name.toLowerCase().endsWith('.md')) {
      setSelectedNotePath(activeFile.path);
    } else if (!selectedNotePath && markdownFiles.length > 0) {
      setSelectedNotePath(markdownFiles[0].path);
    }
  }, [activeFile, markdownFiles, selectedNotePath]);

  const fileByPath = useMemo(() => {
    return new Map(markdownFiles.map((file) => [file.path, file]));
  }, [markdownFiles]);

  const filterOptions = useMemo(() => {
    return {
      gdeTypes: Array.from(new Set(uniq(courses, 'gdeType').map((value) => normalizeFilterValue('gdeType', value)))).filter(Boolean),
      subGdes: Array.from(new Set(courses.map((course) => normalizeFilterValue('subGde', course.subGde)).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'zh-Hant')),
      subKinds: uniq(courses, 'subKind'),
      langTpes: uniq(courses, 'langTpe'),
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const searchable = [
        course.subNam,
        course.teaNam,
        course.subGde,
        course.subKind,
        course.subNum,
        course.subOdr,
        course.subClassroom,
        course.subTime,
        course.note,
        course.info,
      ]
        .map((value) => getValue(value))
        .join(' ')
        .toLowerCase();

      return (
        (!cleanQuery || searchable.includes(cleanQuery)) &&
        filterMatches('gdeType', course.gdeType, gdeType) &&
        filterMatches('subGde', course.subGde, subGde) &&
        filterMatches('subKind', course.subKind, subKind) &&
        filterMatches('langTpe', course.langTpe, langTpe) &&
        (!weekday || getValue(course.subTime).includes(weekday))
      );
    });
  }, [courses, query, gdeType, subGde, subKind, langTpe, weekday]);

  const filteredPresetTargets = useMemo(() => {
    if (categoryType === 'course') return [];
    const cleanQuery = query.trim().toLowerCase();
    return presetTargets[categoryType].filter((target) => {
      const searchable = `${target.title} ${target.subtitle || ''}`.toLowerCase();
      return !cleanQuery || searchable.includes(cleanQuery);
    });
  }, [categoryType, query]);

  useEffect(() => {
    setVisibleCount(RESULT_PAGE_SIZE);
  }, [query, gdeType, subGde, subKind, langTpe, weekday, categoryType]);

  useEffect(() => {
    setSelectedTarget(null);
    setQuery('');
  }, [categoryType]);

  const targetAssignments = useMemo(() => {
    if (!selectedTarget) return [];
    const key = getNoteTargetKey(selectedTarget);
    return assignments.filter((assignment) => getNoteTargetKey(assignment) === key);
  }, [assignments, selectedTarget]);

  const assignmentCountByTarget = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assignment of assignments) {
      const key = getNoteTargetKey(assignment);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [assignments]);

  // ID search: find all assignments matching the ID/path/title query, newest first
  const idSearchResults = useMemo(() => {
    const base = [...assignments].sort(
      (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );
    const q = idQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.notePath.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.subtitle || '').toLowerCase().includes(q)
    );
  }, [assignments, idQuery]);

  // Sort assigned notes for the side panel, newest first
  const sortedTargetAssignments = useMemo(
    () =>
      [...targetAssignments].sort(
        (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
      ),
    [targetAssignments]
  );

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasFilters = query || gdeType || subGde || subKind || langTpe || weekday;

  const resetFilters = () => {
    setQuery('');
    setGdeType('');
    setSubGde('');
    setSubKind('');
    setLangTpe('');
    setWeekday('');
  };

  const handleAssignNote = () => {
    if (!selectedTarget || !selectedNotePath) return;
    setAssignments((current) => assignNoteToTarget(current, selectedNotePath, selectedTarget));
  };

  const handleRemoveAssignment = (notePath: string) => {
    if (!selectedTarget) return;
    setAssignments((current) => removeNoteAssignment(current, notePath, selectedTarget));
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: string[],
    icon: React.ReactNode
  ) => (
    <label className="course-filter">
      <span>
        {icon}
        {label}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  const renderAssignmentPanel = () => {
    if (!selectedTarget) {
      return (
        <aside className="note-category-panel">
          <div className="note-category-empty">
            <Tag size={24} />
            <strong>選一個分類來看筆記</strong>
            <span>課程、英檢、CFA 都會在這裡顯示它們底下既有的筆記。</span>
          </div>
        </aside>
      );
    }

    const selectedNoteAlreadyAssigned = targetAssignments.some(
      (assignment) => assignment.notePath === selectedNotePath
    );

    return (
      <aside className="note-category-panel">
        <div className="note-category-panel-header">
          <div>
            <span className="note-category-kicker">{selectedTarget.type === 'course' ? '課程分類' : '筆記分類'}</span>
            <h2>{selectedTarget.title}</h2>
            {selectedTarget.subtitle && <p>{selectedTarget.subtitle}</p>}
          </div>
          <button className="theme-toggle-btn" onClick={() => setSelectedTarget(null)} title="關閉分類面板">
            <X size={16} />
          </button>
        </div>

        <div className="note-assignment-box">
          <label className="form-label">把筆記歸到這個分類</label>
          <div className="note-assignment-row">
            <select
              value={selectedNotePath}
              onChange={(event) => setSelectedNotePath(event.target.value)}
              disabled={markdownFiles.length === 0}
            >
              {markdownFiles.length === 0 ? (
                <option value="">尚未開啟筆記資料夾</option>
              ) : (
                markdownFiles.map((file) => (
                  <option key={file.path} value={file.path}>
                    {file.path}
                  </option>
                ))
              )}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleAssignNote}
              disabled={!selectedNotePath || selectedNoteAlreadyAssigned}
            >
              {selectedNoteAlreadyAssigned ? <Check size={14} /> : <Plus size={14} />}
              {selectedNoteAlreadyAssigned ? '已歸屬' : '加入'}
            </button>
          </div>
          {activeFile && activeFile.path === selectedNotePath && (
            <span className="note-assignment-hint">目前選到的是正在編輯的筆記。</span>
          )}
        </div>

        <div className="assigned-note-list">
          <div className="assigned-note-list-title">
            <span>既有筆記</span>
            <strong>{targetAssignments.length}</strong>
          </div>

          {sortedTargetAssignments.length === 0 ? (
            <div className="assigned-note-empty">
              這個分類還沒有筆記。使用者上傳或建立筆記時，可以先選這個分類作為歸屬。
            </div>
          ) : (
            sortedTargetAssignments.map((assignment) => {
              const file = fileByPath.get(assignment.notePath);
              return (
                <div className="assigned-note-item" key={`${assignment.notePath}-${assignment.id}`}>
                  <button
                    className="assigned-note-main"
                    onClick={() => file && onOpenNote(file)}
                    disabled={!file}
                    title={file ? '開啟筆記' : '此筆記不在目前工作區'}
                  >
                    <FileText size={15} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {assignment.notePath}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        {new Date(assignment.assignedAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                  <button
                    className="theme-toggle-btn"
                    onClick={() => handleRemoveAssignment(assignment.notePath)}
                    title="移除此歸屬"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    );
  };

  return (
    <div className="course-page">
      <div className="course-topbar">
        <div>
          <h1>筆記分類與課程搜尋</h1>
          <p>先選筆記類型，再查詢該課程或主題底下是否已有筆記。</p>
        </div>
        <button className="btn" onClick={resetFilters} disabled={!hasFilters}>
          <RotateCcw size={14} />
          清除篩選
        </button>
      </div>

      <div className="course-category-tabs">
        {categoryTypes.map((category) => (
          <button
            key={category.type}
            className={`note-type-card ${!idSearchMode && !exploreMode && categoryType === category.type ? 'active' : ''}`}
            onClick={() => { setIdSearchMode(false); setExploreMode(false); setCategoryType(category.type); }}
          >
            <span className="note-type-icon">{category.icon}</span>
            <span>
              <strong>{category.label}</strong>
              <small>{category.description}</small>
            </span>
          </button>
        ))}
        <button
          className={`note-type-card ${idSearchMode ? 'active' : ''}`}
          onClick={() => { setIdSearchMode(true); setExploreMode(false); setSelectedTarget(null); }}
        >
          <span className="note-type-icon"><Hash size={16} /></span>
          <span>
            <strong>依ID查詢</strong>
            <small>輸入課號或分類ID查找筆記</small>
          </span>
        </button>
        <button
          className={`note-type-card ${exploreMode ? 'active' : ''}`}
          onClick={() => { setExploreMode(true); setIdSearchMode(false); setSelectedTarget(null); }}
        >
          <span className="note-type-icon"><Globe size={16} /></span>
          <span>
            <strong>社群筆記</strong>
            <small>瀏覽政大同學分享的筆記</small>
          </span>
        </button>
      </div>

      {exploreMode ? (
        /* ── 社群筆記模式 ── */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="course-search-panel">
            <div className="course-search-input">
              <Search size={17} />
              <input
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder="搜尋標題、作者暱稱..."
                autoFocus
              />
              {exploreQuery && (
                <button className="theme-toggle-btn" onClick={() => setExploreQuery('')} style={{ flexShrink: 0 }}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {exploreLoading ? (
            <div className="course-empty-state">
              <Globe size={24} style={{ opacity: 0.5 }} />
              <strong>載入中...</strong>
            </div>
          ) : exploreError ? (
            <div className="course-empty-state">
              <Globe size={24} style={{ color: 'var(--danger)' }} />
              <strong>無法載入</strong>
              <span>{exploreError}</span>
            </div>
          ) : (
            <>
              <div className="course-result-summary">
                {(() => {
                  const q = exploreQuery.trim().toLowerCase();
                  const filtered = q
                    ? publishedNotes.filter(
                        (n) =>
                          n.title.toLowerCase().includes(q) ||
                          n.author_nickname.toLowerCase().includes(q) ||
                          n.author_username.toLowerCase().includes(q)
                      )
                    : publishedNotes;
                  return `共 ${filtered.length} 篇社群筆記，依發布時間由新到舊排列`;
                })()}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>
                {(() => {
                  const q = exploreQuery.trim().toLowerCase();
                  const filtered = q
                    ? publishedNotes.filter(
                        (n) =>
                          n.title.toLowerCase().includes(q) ||
                          n.author_nickname.toLowerCase().includes(q) ||
                          n.author_username.toLowerCase().includes(q)
                      )
                    : publishedNotes;

                  if (filtered.length === 0) {
                    return (
                      <div className="course-empty-state">
                        <Globe size={24} />
                        <strong>{exploreQuery ? '沒有符合的筆記' : '尚無人發布筆記'}</strong>
                        <span>{exploreQuery ? '試著換個關鍵字。' : '成為第一個分享筆記的政大同學吧！'}</span>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      {filtered.map((note: any) => {
                        const isExpanded = exploreExpanded === note.id;
                        const preview = (note.content || '').slice(0, 300);
                        return (
                          <div
                            key={note.id}
                            style={{
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-primary)',
                            }}
                          >
                            <button
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '14px 16px',
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: 'var(--text-primary)',
                              }}
                              onClick={() => setExploreExpanded(isExpanded ? null : note.id)}
                            >
                              {note.note_number != null ? (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: 'var(--accent)',
                                    backgroundColor: 'var(--accent-bg)',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                    letterSpacing: '0.01em',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  #{note.note_number}
                                </span>
                              ) : (
                                <Globe size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {note.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <UserRound size={11} />
                                    {note.author_nickname}
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={11} />
                                    {new Date(note.created_at).toLocaleString('zh-TW', {
                                      year: 'numeric',
                                      month: 'numeric',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {note.note_path && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.7 }}>
                                      <FileText size={11} />
                                      {note.note_path.split('/').pop()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--accent)',
                                  flexShrink: 0,
                                  marginTop: '2px',
                                }}
                              >
                                {isExpanded ? '收起 ▲' : '展開 ▼'}
                              </span>
                            </button>

                             {isExpanded && (
                              <div
                                style={{
                                  padding: '0 16px 20px 44px',
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                  lineHeight: '1.7',
                                  borderTop: '1px solid var(--border-color)',
                                  paddingTop: '12px',
                                }}
                              >
                                {/* Note Text Preview */}
                                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '16px' }}>
                                  {preview}
                                  {(note.content || '').length > 300 && (
                                    <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                                      {' '}…（僅顯示前 300 字）
                                    </span>
                                  )}
                                </div>

                                {/* Community Interaction Bar */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    borderTop: '1px solid var(--border-color)',
                                    borderBottom: '1px solid var(--border-color)',
                                    padding: '8px 0',
                                    marginBottom: '16px',
                                  }}
                                >
                                  <button
                                    onClick={() => handleWaterClick(note.id)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '12.5px',
                                      color: userWatered ? 'var(--accent)' : 'var(--text-secondary)',
                                      fontWeight: userWatered ? '700' : '400',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <Droplets size={14} fill={userWatered ? 'var(--accent)' : 'none'} style={{ color: userWatered ? 'var(--accent)' : 'var(--text-secondary)' }} />
                                    <span>{userWatered ? '已澆水' : '幫忙澆水'} ({noteWaterings.length})</span>
                                  </button>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                    <MessageSquare size={14} />
                                    <span>留言足跡 ({noteMessages.length})</span>
                                  </div>
                                </div>

                                {/* Guest Message Board / Footprints List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                  {noteMessages.length === 0 ? (
                                    <div style={{ padding: '8px 0', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                      🐾 尚無足跡，留下一句話給作者吧！
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                      {noteMessages.map((msg: any) => {
                                        const initial = (msg.sender_nickname || '訪').charAt(0).toUpperCase();
                                        return (
                                          <div key={msg.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px' }}>
                                            <div style={{
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              backgroundColor: 'var(--bg-secondary)',
                                              border: '1px solid var(--border-color)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '11px',
                                              fontWeight: 'bold',
                                              color: 'var(--text-primary)',
                                              flexShrink: 0
                                            }}>
                                              {initial}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                <strong style={{ color: 'var(--text-primary)' }}>{msg.sender_nickname}</strong>
                                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                                  {new Date(msg.created_at).toLocaleDateString('zh-TW')} {new Date(msg.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                              </div>
                                              <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{msg.content}</div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Message Input Area */}
                                {user ? (
                                  <form onSubmit={(e) => handleCommentSubmit(e, note.id)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={commentInput}
                                      onChange={(e) => setCommentInput(e.target.value)}
                                      placeholder="留下你的足跡（留言）..."
                                      style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '12.5px',
                                        outline: 'none',
                                      }}
                                    />
                                    <button
                                      type="submit"
                                      disabled={isSendingComment || !commentInput.trim()}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--accent)',
                                        border: 'none',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        opacity: (!commentInput.trim() || isSendingComment) ? 0.6 : 1,
                                      }}
                                    >
                                      <Send size={13} />
                                    </button>
                                  </form>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '6px' }}>
                                    <Lock size={12} />
                                    <span>請登入政大 Hub 帳戶以留下留言足跡。</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      ) : idSearchMode ? (
        /* ── 依ID查詢 模式 ── */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="course-search-panel">
            <div className="course-search-input">
              <Hash size={17} />
              <input
                value={idQuery}
                onChange={(e) => setIdQuery(e.target.value)}
                placeholder="輸入課號、分類ID、筆記名稱（例如：101001、gept、行政法）"
                autoFocus
              />
              {idQuery && (
                <button className="theme-toggle-btn" onClick={() => setIdQuery('')} style={{ flexShrink: 0 }}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="course-result-summary">
            找到 {idSearchResults.length.toLocaleString()} 筆歸屬紀錄，依加入時間由新到舊排列
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>
            {idSearchResults.length === 0 ? (
              <div className="course-empty-state">
                <Hash size={24} />
                <strong>沒有符合的紀錄</strong>
                <span>試著輸入課號（如 101001）、考試代碼（如 gept）或筆記名稱。</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {idSearchResults.map((assignment, i) => {
                  const file = fileByPath.get(assignment.notePath);
                  const typeLabel: Record<string, string> = {
                    course: '課程', exam: '考試', certification: '證照', custom: '自訂',
                  };
                  return (
                    <div
                      key={`${assignment.notePath}-${assignment.id}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                      }}
                    >
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 6px',
                        borderRadius: '4px', backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)', flexShrink: 0, whiteSpace: 'nowrap',
                      }}>
                        {typeLabel[assignment.type] || assignment.type}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {assignment.title}
                        </div>
                        {assignment.subtitle && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            {assignment.subtitle}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={10} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {assignment.notePath}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        {new Date(assignment.assignedAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button
                        className="btn"
                        onClick={() => file && onOpenNote(file)}
                        disabled={!file}
                        title={file ? '開啟筆記' : '此筆記不在工作區'}
                        style={{ flexShrink: 0, padding: '4px 10px', fontSize: '12px' }}
                      >
                        開啟
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── 正常瀏覽模式 ── */
        <>
      <div className="course-search-panel">
        <div className="course-search-input">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              categoryType === 'course'
                ? '搜尋課名、老師、課號、系所、教室'
                : '搜尋英檢、CFA、研究所考試或其他分類'
            }
          />
        </div>

        {categoryType === 'course' && (
          <div className="course-filters">
            {renderSelect('學制', gdeType, setGdeType, filterOptions.gdeTypes, <GraduationCap size={13} />)}
            {renderSelect('開課單位', subGde, setSubGde, filterOptions.subGdes, <Building2 size={13} />)}
            {renderSelect('修別', subKind, setSubKind, filterOptions.subKinds, <Filter size={13} />)}
            {renderSelect('語言', langTpe, setLangTpe, filterOptions.langTpes, <Languages size={13} />)}
            {renderSelect('星期', weekday, setWeekday, weekdays, <CalendarDays size={13} />)}
          </div>
        )}
      </div>

      <div className="course-result-summary">
        {categoryType === 'course'
          ? isLoading
            ? '正在讀取政大課程資料...'
            : error || `找到 ${filteredCourses.length.toLocaleString()} 門課程`
          : `找到 ${filteredPresetTargets.length.toLocaleString()} 個分類`}
        {categoryType === 'course' && filteredCourses.length > visibleCourses.length && (
          <span>目前顯示 {visibleCourses.length.toLocaleString()} 筆，縮小搜尋可以更快定位。</span>
        )}
      </div>

      <div className="category-browser">
        <div className="course-results">
          {categoryType === 'course' && !isLoading && !error && visibleCourses.length === 0 && (
            <div className="course-empty-state">
              <Search size={24} />
              <strong>沒有符合條件的課程</strong>
              <span>試著清除篩選，或用老師、課號、課名重新搜尋。</span>
            </div>
          )}

          {categoryType === 'course' &&
            visibleCourses.map((course) => {
              const target = courseToTarget(course);
              const count = assignmentCountByTarget.get(getNoteTargetKey(target)) || 0;

              return (
                <article className="course-card" key={target.id}>
                  <div className="course-card-main">
                    <div className="course-card-title-row">
                      <div>
                        <h2>{target.title}</h2>
                        <p>{target.subtitle}</p>
                      </div>
                      <span className="course-credit">{getValue(course.subPoint)} 學分</span>
                    </div>

                    <div className="course-meta-grid">
                      <span>
                        <UserRound size={14} />
                        {getValue(course.teaNam)}
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {getValue(course.subTime)}
                      </span>
                      <span>
                        <MapPin size={14} />
                        {getValue(course.subClassroom)}
                      </span>
                      <span>
                        <BookOpen size={14} />
                        {getValue(course.gdeType)} · {getValue(course.subKind)}
                      </span>
                    </div>

                    <div className="course-tags">
                      <span>{getValue(course.langTpe)}</span>
                      <span>{getValue(course.smtQty)}</span>
                      <span>{getValue(course.tranTpe)}</span>
                      {course.emiType && <span>{course.emiType}</span>}
                      <button className="course-note-count" onClick={() => setSelectedTarget(target)}>
                        {count} 則筆記
                      </button>
                    </div>

                    {(course.info || course.note || course.gdeTpeMsg || course.lmtKind) && (
                      <div className="course-detail">
                        {course.info && <p>{course.info}</p>}
                        {course.note && <p>{course.note}</p>}
                        {course.gdeTpeMsg && <p>{course.gdeTpeMsg}</p>}
                        {course.lmtKind && <p>{course.lmtKind}</p>}
                      </div>
                    )}
                  </div>

                  <div className="course-actions">
                    <button onClick={() => setSelectedTarget(target)}>
                      <FileText size={14} />
                      查看筆記
                    </button>
                    {course.teaSchmUrl && (
                      <a href={course.teaSchmUrl} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} />
                        課程大綱
                      </a>
                    )}
                    {course.teaExpUrl && (
                      <a href={course.teaExpUrl} target="_blank" rel="noreferrer">
                        <UserRound size={14} />
                        教師資訊
                      </a>
                    )}
                    {course.subRemainUrl && (
                      <a href={course.subRemainUrl} target="_blank" rel="noreferrer">
                        <LinkIcon size={14} />
                        餘額
                      </a>
                    )}
                  </div>
                </article>
              );
            })}

          {categoryType !== 'course' &&
            filteredPresetTargets.map((target) => {
              const count = assignmentCountByTarget.get(getNoteTargetKey(target)) || 0;
              return (
                <article className="topic-card" key={target.id}>
                  <div className="topic-card-main">
                    <span className="note-type-icon">
                      {categoryTypes.find((category) => category.type === target.type)?.icon}
                    </span>
                    <div>
                      <h2>{target.title}</h2>
                      <p>{target.subtitle}</p>
                    </div>
                  </div>
                  <button className="btn" onClick={() => setSelectedTarget(target)}>
                    <FileText size={14} />
                    {count} 則筆記
                  </button>
                </article>
              );
            })}

          {categoryType === 'course' && filteredCourses.length > visibleCourses.length && (
            <button
              className="btn course-load-more"
              onClick={() => setVisibleCount((count) => count + RESULT_PAGE_SIZE)}
            >
              載入更多課程
            </button>
          )}
        </div>

        {renderAssignmentPanel()}
      </div>
        </>
      )}
    </div>
  );
};
