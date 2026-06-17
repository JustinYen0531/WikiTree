import React, { useState, useEffect } from 'react';
import { X, LogIn, Key, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; picture: string; token: string; isMock?: boolean }) => void;
  clientId: string;
  onSaveClientId: (id: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
  clientId,
  onSaveClientId,
}) => {
  const [activeTab, setActiveTab] = useState<'real' | 'mock'>(clientId ? 'real' : 'mock');
  const [inputClientId, setInputClientId] = useState(clientId);
  const [showHelp, setShowHelp] = useState(false);

  const handleSave = () => {
    const trimmed = inputClientId.trim();
    if (!trimmed) {
      alert('請輸入有效的 Client ID');
      return;
    }
    onSaveClientId(trimmed);
  };

  const handleMockLogin = () => {
    const mockUser = {
      name: 'NCCU 測試用戶',
      email: 'service@nccu.edu.tw',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      token: 'mock-jwt-token-xyz-12345',
      isMock: true,
    };
    onLoginSuccess(mockUser);
    onClose();
  };

  // Mount GSI Button inside the modal container when real login tab is active and clientId exists
  useEffect(() => {
    if (activeTab === 'real' && clientId) {
      const initGsi = () => {
        if ((window as any).google?.accounts?.id) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              callback: (response: any) => {
                try {
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  );
                  const decoded = JSON.parse(jsonPayload);
                  if (decoded) {
                    onLoginSuccess({
                      name: decoded.name || decoded.email,
                      email: decoded.email,
                      picture: decoded.picture || '',
                      token: response.credential,
                    });
                    onClose();
                  }
                } catch (err) {
                  console.error('Failed to parse credential JWT', err);
                }
              },
            });

            const btnContainer = document.getElementById('modal-google-signin-btn-container');
            if (btnContainer) {
              (window as any).google.accounts.id.renderButton(btnContainer, {
                theme: 'outline',
                size: 'large',
                width: 320,
                shape: 'pill',
                text: 'signin_with',
              });
            }
          } catch (e) {
            console.error('Error during GSI init in Modal', e);
          }
        }
      };

      const timer = setTimeout(initGsi, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, clientId, onLoginSuccess, onClose]);

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
        {/* Colorful Gradient Bar at top */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #4285F4 0%, #EA4335 25%, #FBBC05 50%, #34A853 75%, #4285F4 100%)',
          width: '100%'
        }} />

        {/* Modal Header */}
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
              <LogIn size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Google 帳戶登入
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

        {/* Dynamic Tab Switchers */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 24px',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <button
            onClick={() => setActiveTab('real')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'real' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'real' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'real' ? '600' : '400',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            真實 Google 登入
          </button>
          <button
            onClick={() => setActiveTab('mock')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'mock' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'mock' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'mock' ? '600' : '400',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            快速模擬測試
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TAB 1: Real GSI Login */}
          {activeTab === 'real' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                請提供您在 Google Cloud 建立的 <strong>Client ID</strong>。您的憑證資訊將安全存放在本機瀏覽器中，僅用於呼叫 Google 官方安全登入。
              </p>

              {/* Client ID Configuration Field */}
              <div style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px', 
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <Key size={14} style={{ color: 'var(--accent)' }} />
                    API 憑證配置
                  </div>
                  <button 
                    onClick={() => setShowHelp(!showHelp)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      padding: 0
                    }}
                  >
                    <HelpCircle size={13} />
                    如何取得？
                  </button>
                </div>

                {showHelp && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.5', 
                    backgroundColor: 'var(--bg-primary)', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    borderLeft: '3px solid var(--accent)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    1. 登入 <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google Cloud 控制台</a><br/>
                    2. 建立新專案，至「API 和服務 &gt; 憑證」<br/>
                    3. 建立「OAuth 用戶端 ID」，應用程式類型選「網頁應用程式」<br/>
                    4. <strong>重要</strong>：在「已授權的 JavaScript 來源」新增本機開發 URL：<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--border-color)' }}>http://localhost:5173</code><br/>
                    5. 複製產生的「用戶端 ID」貼至下方。
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text"
                    placeholder="貼上您的 Google OAuth Client ID"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    style={{ padding: '0 16px', fontSize: '13px', fontWeight: '500', height: '38px', borderRadius: '8px' }}
                  >
                    儲存
                  </button>
                </div>
              </div>

              {/* Render Official GSI Button here if clientId is present */}
              {clientId ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '24px 0',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(35, 131, 226, 0.02)'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                    已驗證 Client ID。請點擊下方按鈕啟動登入：
                  </span>
                  
                  <div 
                    id="modal-google-signin-btn-container" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      width: '100%', 
                      minHeight: '40px',
                      overflow: 'hidden'
                    }}
                  ></div>
                </div>
              ) : (
                <div style={{ 
                  padding: '24px', 
                  textAlign: 'center', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px'
                }}>
                  請先在上方設定並<strong>儲存 Client ID</strong> 以啟用 Google 官方登入。
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Mock Login */}
          {activeTab === 'mock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                backgroundColor: 'rgba(46, 168, 101, 0.03)'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(46, 168, 101, 0.1)', 
                  borderRadius: '50%', 
                  padding: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={20} style={{ color: 'var(--success)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    快速體驗模擬登入
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    免去複雜的 API 設定。一鍵模擬成功登入，即可解鎖精美的個人資訊卡與頭像動態。
                  </span>
                </div>
              </div>

              <button 
                className="btn" 
                onClick={handleMockLogin}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: '8px',
                  border: '1.5px solid var(--success)',
                  borderRadius: '10px',
                  color: 'var(--success)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--success-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <LogIn size={16} />
                使用模擬模式登入
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
