import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Shield, User, Lock, Smile, GraduationCap, School, HelpCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: { username: string; nickname: string; college: string; department: string; grade: string; isSupabaseUser?: boolean }) => void;
}

const NCCU_ACADEMIC_UNITS: Record<string, string[]> = {
  "文學院": [
    "中國文學系", "歷史學系", "哲學系", 
    "圖書資訊與檔案學研究所", "宗教研究所", "台灣史研究所", "台灣文學研究所", 
    "華語文教學碩/博士學位學程", "國文教學碩士在職專班", "圖書資訊學數位碩士在職專班"
  ],
  "理學院": [
    "應用數學系", "心理學系", "神經科學研究所", "應用物理研究所", 
    "輔導與諮商碩士學位學程", "電子物理學士學位學程"
  ],
  "社會科學學院": [
    "政治學系", "社會學系", "財政學系", "公共行政學系", "地政學系", "經濟學系", "民族學系", 
    "國家發展研究所", "勞工研究所", "社會工作研究所", "行政管理碩士學程", 
    "亞太研究英語碩士學位學程", "亞太研究英語博士學位學程", "應用經濟與社會發展英語碩士學位學程", 
    "土地政策與環境規劃碩士原住民專班"
  ],
  "法學院": [
    "法律學系", "法學院碩士在職專班", "法律科際整合研究所"
  ],
  "商學院": [
    "金融學系", "國際經營與貿易學系", "會計學系", "統計學系", "企業管理學系", 
    "資訊管理學系", "財務管理學系", "風險管理與保險學系", "經營管理碩士學程（EMBA）", 
    "國際經營管理英語碩士學位學程（IMBA）", "企業管理研究所（MBA學位學程）", "科技管理與智慧財產研究所"
  ],
  "外國語文學院": [
    "英國語文學系", "阿拉伯語文學系", "斯拉夫語文學系", "日本語文學系", "韓國語文學系", 
    "土耳其語文學系", "歐洲語文學系", "東南亞語文學系", "語言學研究所", "外文中心", 
    "英語教學碩士在職專班", "中東與中亞研究碩士學位學程"
  ],
  "傳播學院": [
    "傳播學院大一大二不分系", "新聞學系", "廣告學系", "廣播電視學系", "傳播學院碩士在職專班", 
    "傳播學院博士班", "國際傳播英語碩士學位學程", "數位內容碩士學位學程", 
    "傳播學院傳播碩士學位學程", "亞際文化研究國際碩士學位學程", "實習廣播電台"
  ],
  "國際事務學院": [
    "外交學系", "東亞研究所", "俄羅斯研究所", "日本研究碩士學位學程", "日本研究博士學位學程", 
    "國際研究英語碩士學位學程", "戰略與國際事務碩士在職專班", "國家安全與大陸研究碩士在職專班", 
    "中東與中亞研究碩士學位學程"
  ],
  "教育學院": [
    "教育學系", "幼兒教育研究所", "教育行政與政策研究所", "師資培育中心", "教師研習中心", 
    "學校行政碩士在職專班", "輔導與諮商碩士學位學程"
  ],
  "創新國際學院": [
    "創國學士班", "全球傳播與創新科技碩士學位學程"
  ],
  "資訊學院": [
    "資訊科學系", "資訊科學系碩士在職專班", "數位內容與科技學士學位學程", 
    "社群網路與人智計算國際研究生博士學位學程", "資訊安全碩士學位學程", "人工智慧應用學士學位學程"
  ],
  "X實驗學院": [
    "運動產業與文化學士學位學程"
  ],
  "國際金融學院": [
    "國際金融碩士學位學程", "國際金融博士學位學程"
  ]
};

const GRADE_LEVELS = [
  "學士班 一年級",
  "學士班 二年級",
  "學士班 三年級",
  "學士班 四年級",
  "碩士班",
  "碩士在職專班",
  "博士班"
];

const DEFAULT_HINT_QUESTIONS = [
  "我最喜歡的一道菜是？",
  "我的第一隻寵物名字是？",
  "我小學六年級班導師的名字是？",
  "我最喜歡的一本書是？",
  "我出生的城市是？",
  "自訂密碼提示問題..."
];

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [regHintQuestion, setRegHintQuestion] = useState(DEFAULT_HINT_QUESTIONS[0]);
  const [regCustomHintQuestion, setRegCustomHintQuestion] = useState('');
  const [regHintAnswer, setRegHintAnswer] = useState('');

  // Forgot Password workflow states
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswerInput, setForgotAnswerInput] = useState('');
  const [revealedPassword, setRevealedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRevealedPassword, setShowRevealedPassword] = useState(false);

  // Handle department updates when college changes
  useEffect(() => {
    if (selectedCollege && NCCU_ACADEMIC_UNITS[selectedCollege]) {
      setSelectedDepartment(NCCU_ACADEMIC_UNITS[selectedCollege][0] || '');
    } else {
      setSelectedDepartment('');
    }
  }, [selectedCollege]);

  // Set defaults for college and grade in register mode
  useEffect(() => {
    if (activeTab === 'register') {
      const colleges = Object.keys(NCCU_ACADEMIC_UNITS);
      if (colleges.length > 0 && !selectedCollege) {
        setSelectedCollege(colleges[0]);
      }
      if (!selectedGrade) {
        setSelectedGrade(GRADE_LEVELS[0]);
      }
    }
  }, [activeTab]);

  const savePublicUser = async (
    authUserId: string,
    profile: { username: string; nickname: string; college: string; department: string; grade: string }
  ) => {
    if (!supabase) return null;

    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUserId,
          username: profile.username,
          nickname: profile.nickname,
          college: profile.college,
          department: profile.department,
          grade: profile.grade,
        },
        { onConflict: 'id' }
      );

    return error;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      alert('請輸入帳號與密碼');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${cleanUser.toLowerCase()}@g.nccu.edu.tw`,
          password: password,
        });

        if (error) {
          alert(`登入失敗: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const metadata = data.user.user_metadata || {};
          const loggedUser = {
            username: metadata.username || cleanUser,
            nickname: metadata.nickname || cleanUser,
            college: metadata.college || '',
            department: metadata.department || '',
            grade: metadata.grade || '',
            isSupabaseUser: true,
          };

          const userTableError = await savePublicUser(data.user.id, loggedUser);
          if (userTableError) {
            console.warn('users upsert error:', userTableError.message);
          }

          onLoginSuccess(loggedUser as any);
          onClose();
        }
      } catch (err: any) {
        alert(`登入發生錯誤: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const savedAccounts = localStorage.getItem('antigravity_local_accounts');
    const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
    
    // Find matching account
    const matched = accounts.find((acc: any) => acc.username.toLowerCase() === cleanUser.toLowerCase());

    if (!matched) {
      alert('找不到該帳戶，請先註冊新帳戶。');
      return;
    }

    if (matched.password !== password) {
      alert('密碼輸入錯誤，請重新確認。');
      return;
    }

    // Login successful
    onLoginSuccess({
      username: matched.username,
      nickname: matched.nickname,
      college: matched.college,
      department: matched.department,
      grade: matched.grade,
    });
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = regUsername.trim();
    const cleanNick = regNickname.trim();
    const cleanAnswer = regHintAnswer.trim();
    
    const finalHintQuestion = regHintQuestion === "自訂密碼提示問題..." 
      ? regCustomHintQuestion.trim() 
      : regHintQuestion;

    if (!cleanUser || !regPassword || !cleanNick || !selectedCollege || !selectedDepartment || !selectedGrade || !finalHintQuestion || !cleanAnswer) {
      alert('請填寫所有必要欄位（包含密碼提示問題與答案）。');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      alert('密碼與確認密碼不一致。');
      return;
    }

    if (cleanUser.length < 3) {
      alert('帳號長度需至少 3 個字元。');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      setIsLoading(true);
      try {
        // 1. Sign up user in Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${cleanUser.toLowerCase()}@g.nccu.edu.tw`,
          password: regPassword,
          options: {
            data: {
              username: cleanUser,
              nickname: cleanNick,
              name: cleanNick,
              college: selectedCollege,
              department: selectedDepartment,
              grade: selectedGrade,
            }
          }
        });

        if (signUpError) {
          alert(`註冊失敗: ${signUpError.message}`);
          setIsLoading(false);
          return;
        }

        if (signUpData.user) {
          // 2. Save profile to public tables
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: signUpData.user.id,
              username: cleanUser,
              nickname: cleanNick,
              college: selectedCollege,
              department: selectedDepartment,
              grade: selectedGrade,
            });

          if (profileError) {
            alert(`帳戶已建立，但資料存入 public.users 失敗：${profileError.message}\n\n請確認 users 表的 RLS policy 允許登入使用者新增自己的 id。`);
          }

          const { error: securityError } = await supabase
            .from('user_security')
            .insert({
              id: signUpData.user.id,
              username: cleanUser,
              hint_question: finalHintQuestion,
              hint_answer: cleanAnswer.toLowerCase(),
              recovery_password: regPassword,
            });

          if (securityError) {
            console.warn('user_security insert error:', securityError.message);
          }

          alert('🎉 帳戶註冊成功！已同步至 Supabase 雲端資料庫。請在登入分頁輸入您的帳號密碼。');
          
          // Reset inputs
          setRegUsername('');
          setRegPassword('');
          setRegConfirmPassword('');
          setRegNickname('');
          setRegHintAnswer('');
          setRegCustomHintQuestion('');
          
          // Switch back to login view
          setActiveTab('login');
          setUsername(cleanUser);
        }
      } catch (err: any) {
        alert(`註冊發生錯誤: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const savedAccounts = localStorage.getItem('antigravity_local_accounts');
    const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];

    // Check duplicate username
    const exists = accounts.some((acc: any) => acc.username.toLowerCase() === cleanUser.toLowerCase());
    if (exists) {
      alert('此帳號已有人註冊，請換一個帳號試試。');
      return;
    }

    // Add new account
    const newAccount = {
      username: cleanUser,
      password: regPassword,
      nickname: cleanNick,
      college: selectedCollege,
      department: selectedDepartment,
      grade: selectedGrade,
      hintQuestion: finalHintQuestion,
      hintAnswer: cleanAnswer.toLowerCase(), // Store in lowercase for easier matching
    };

    accounts.push(newAccount);
    localStorage.setItem('antigravity_local_accounts', JSON.stringify(accounts));

    alert('🎉 帳戶註冊成功！請在登入分頁輸入您的帳號密碼。');
    
    // Reset inputs
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegNickname('');
    setRegHintAnswer('');
    setRegCustomHintQuestion('');
    
    // Switch back to login view
    setActiveTab('login');
    setUsername(cleanUser);
  };

  // Forgot Password workflow: Step 1 (Find account and get question)
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = forgotUsername.trim();
    if (!cleanUser) {
      alert('請輸入帳號');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_user_hint_question', {
          username_input: cleanUser
        });

        if (error) {
          alert(`查詢提示問題失敗: ${error.message}\n(若您尚未建立 SQL 表格，請參考專案根目錄的 supabase_setup.sql 並至 Supabase 執行)`);
          setIsLoading(false);
          return;
        }

        if (!data) {
          alert('找不到該帳戶，或該帳戶未設定密碼提示問題。');
          setIsLoading(false);
          return;
        }

        setForgotQuestion(data);
        setForgotStep(2);
      } catch (err: any) {
        alert(`查詢發生錯誤: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const savedAccounts = localStorage.getItem('antigravity_local_accounts');
    const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
    
    const matched = accounts.find((acc: any) => acc.username.toLowerCase() === cleanUser.toLowerCase());

    if (!matched) {
      alert('找不到該帳戶，請確認帳號是否輸入正確。');
      return;
    }

    if (!matched.hintQuestion || !matched.hintAnswer) {
      alert('該帳戶註冊時未設定密碼提示問題，無法以此方法找回密碼。');
      return;
    }

    setForgotQuestion(matched.hintQuestion);
    setForgotStep(2);
  };

  // Forgot Password workflow: Step 2 (Verify answer and reveal password)
  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswerInput = forgotAnswerInput.trim().toLowerCase();
    if (!cleanAnswerInput) {
      alert('請輸入提示答案');
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('verify_hint_and_get_password', {
          username_input: forgotUsername.trim(),
          answer_input: cleanAnswerInput
        });

        if (error) {
          alert(`驗證失敗: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data) {
          setRevealedPassword(data);
          setForgotStep(3);
        } else {
          alert('提示答案不正確，驗證失敗！');
        }
      } catch (err: any) {
        alert(`驗證發生錯誤: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const savedAccounts = localStorage.getItem('antigravity_local_accounts');
    const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
    
    const matched = accounts.find((acc: any) => acc.username.toLowerCase() === forgotUsername.trim().toLowerCase());

    if (matched && matched.hintAnswer === cleanAnswerInput) {
      setRevealedPassword(matched.password);
      setForgotStep(3);
    } else {
      alert('提示答案不正確，驗證失敗！');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(revealedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 10, 10, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        className="animate-modal-fade-in"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* NCCU Theme Colored Header Bar */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, var(--text-primary) 0%, var(--text-muted) 50%, var(--text-primary) 100%)',
          width: '100%'
        }} />

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              backgroundColor: 'var(--accent-bg)', 
              borderRadius: '8px', 
              padding: '6px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Shield size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {activeTab === 'forgot' ? '找回密碼' : '政大 Hub 本地帳戶'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 24px',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'login' ? '600' : '400',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={14} />
            登入帳戶
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'register' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'register' ? '600' : '400',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={14} />
            建立新帳戶
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', maxHeight: '68vh', overflowY: 'auto' }}>
          
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                請登入您的本機政大 Hub 帳戶。資料將安全儲存於您的本機電腦上。
              </p>

              {/* Username Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={13} style={{ color: 'var(--text-secondary)' }} />
                  使用者帳號
                </label>
                <input 
                  type="text"
                  placeholder="輸入您的學號或註冊帳號"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={13} style={{ color: 'var(--text-secondary)' }} />
                    密碼
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setForgotStep(1);
                      setForgotUsername(username);
                      setForgotAnswerInput('');
                      setRevealedPassword('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    忘記密碼？
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13.5px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ 
                  marginTop: '12px', 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <LogIn size={15} />
                {isLoading ? '驗證登入中...' : '登入帳戶'}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                請填寫以下資訊建立帳戶。欄位後方有 * 號為必填欄位。
              </p>

              {/* Username Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} style={{ color: 'var(--text-secondary)' }} />
                  註冊帳號 *
                </label>
                <input 
                  type="text"
                  placeholder="請輸入註冊帳號 (例如學號)"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Nickname Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Smile size={12} style={{ color: 'var(--text-secondary)' }} />
                  使用者暱稱 *
                </label>
                <input 
                  type="text"
                  placeholder="請輸入暱稱 (例如：政治系小花)"
                  value={regNickname}
                  onChange={(e) => setRegNickname(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* NCCU College Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <School size={12} style={{ color: 'var(--text-secondary)' }} />
                  所屬學院 *
                </label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {Object.keys(NCCU_ACADEMIC_UNITS).map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              {/* NCCU Department Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GraduationCap size={12} style={{ color: 'var(--text-secondary)' }} />
                  主修學系/所 *
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    width: '100%',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {selectedCollege && NCCU_ACADEMIC_UNITS[selectedCollege] ? (
                    NCCU_ACADEMIC_UNITS[selectedCollege].map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))
                  ) : (
                    <option value="">請先選擇學院</option>
                  )}
                </select>
              </div>

              {/* Grade Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GraduationCap size={12} style={{ color: 'var(--text-secondary)' }} />
                  年級學制 *
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} style={{ color: 'var(--text-secondary)' }} />
                  設定密碼 *
                </label>
                <input 
                  type="password"
                  placeholder="請設定密碼"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} style={{ color: 'var(--text-secondary)' }} />
                  確認密碼 *
                </label>
                <input 
                  type="password"
                  placeholder="請再次輸入密碼"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Divider for Security Questions */}
              <div style={{ 
                margin: '10px 0 4px 0', 
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '10px'
              }} />

              {/* Password Hint Question Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={12} />
                  密碼提示問題 *
                </label>
                <select
                  value={regHintQuestion}
                  onChange={(e) => setRegHintQuestion(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {DEFAULT_HINT_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Custom Hint Question Input (Conditional) */}
              {regHintQuestion === "自訂密碼提示問題..." && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    請輸入您自訂的提示問題 *
                  </label>
                  <input 
                    type="text"
                    placeholder="例如：我第一隻狗狗的名字是？"
                    value={regCustomHintQuestion}
                    onChange={(e) => setRegCustomHintQuestion(e.target.value)}
                    required
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {/* Password Hint Answer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={12} />
                  提示問題答案 *
                </label>
                <input 
                  type="text"
                  placeholder="請輸入答案以供日後找回密碼"
                  value={regHintAnswer}
                  onChange={(e) => setRegHintAnswer(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <button 
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ 
                  marginTop: '8px', 
                  width: '100%', 
                  padding: '10px', 
                  fontSize: '13.5px', 
                  fontWeight: '600',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <UserPlus size={14} />
                {isLoading ? '註冊中...' : '註冊並建立帳戶'}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD (HINT QUESTION VERIFICATION) */}
          {activeTab === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                請填寫您的帳號以取得密碼提示問題，並透過輸入正確的答案來找回密碼。
              </p>

              {/* STEP 1: Enter Username */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotStep1} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} style={{ color: 'var(--text-secondary)' }} />
                      請輸入帳號
                    </label>
                    <input 
                      type="text"
                      placeholder="您的註冊帳號 (學號)"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      required
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('login')} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                    >
                      返回登入
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isLoading}
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? '查詢中...' : '確認帳號'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Answer Question */}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotStep2} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ 
                    backgroundColor: 'var(--accent-bg)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    padding: '12px 16px' 
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={12} />
                      您的密碼提示問題：
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--accent)' }}>
                      {forgotQuestion}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      提示問題的答案：
                    </label>
                    <input 
                      type="text"
                      placeholder="請輸入答案"
                      value={forgotAnswerInput}
                      onChange={(e) => setForgotAnswerInput(e.target.value)}
                      required
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setForgotStep(1)} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                    >
                      上一步
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isLoading}
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? '驗證中...' : '驗證答案'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Reveal Password Success */}
              {forgotStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: '10px',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 'bold' }}>
                      🎉 驗證成功！
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      您的登入密碼為：
                    </span>
                    
                    {/* Password display container */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      width: '100%',
                      maxWidth: '240px',
                      justifyContent: 'space-between'
                    }}>
                      <code style={{ 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {showRevealedPassword ? revealedPassword : '•'.repeat(revealedPassword.length)}
                      </code>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setShowRevealedPassword(!showRevealedPassword)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                          }}
                        >
                          {showRevealedPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copied ? 'var(--success)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                          }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveTab('login');
                      setUsername(forgotUsername);
                      setPassword(revealedPassword);
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '11px', 
                      fontSize: '13.5px', 
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}
                  >
                    帶入密碼並返回登入
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
