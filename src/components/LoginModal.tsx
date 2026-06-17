import React, { useState } from 'react';
import { X, LogIn, Key, Sparkles, HelpCircle } from 'lucide-react';

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
  const [inputClientId, setInputClientId] = useState(clientId);
  const [showHelp, setShowHelp] = useState(false);

  const handleSave = () => {
    onSaveClientId(inputClientId.trim());
    alert('Google Client ID 已儲存！如果 ID 正確，點擊「登入 Google」按鈕即可調用官方登入視窗。');
  };

  const handleMockLogin = () => {
    // Simulate successful login with beautiful dummy data
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

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
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
              padding: '4px',
              borderRadius: '4px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          本編輯器為本地優先設計。若要啟用真實的 Google 登入驗證，您需要提供您自己在 Google Cloud 控制台建立的 Client ID。
        </p>

        {/* Section 1: Real Google Sign-in config */}
        <div 
          style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: '600' }}>
              <Key size={14} style={{ color: 'var(--text-secondary)' }} />
              真實登入配置
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
                gap: '2px',
                fontSize: '11px'
              }}
            >
              <HelpCircle size={12} />
              如何取得 ID？
            </button>
          </div>

          {showHelp && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', backgroundColor: 'var(--bg-primary)', padding: '10px', borderRadius: '4px', borderLeft: '3px solid var(--accent)' }}>
              1. 登入 <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Google Cloud Console</a><br/>
              2. 建立新專案，至「API 和服務 &gt; 憑證」<br/>
              3. 建立「OAuth 用戶端 ID」，應用程式類型選「網頁應用程式」<br/>
              4. <b>重要</b>：在「已授權的 JavaScript 來源」新增：<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '2px' }}>http://localhost:5173</code><br/>
              5. 複製產生的「用戶端 ID」貼至下方。
            </div>
          )}

          <div>
            <input 
              type="text"
              placeholder="輸入您的 Google OAuth Client ID"
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                marginBottom: '8px'
              }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              儲存 Client ID 設定
            </button>
          </div>
        </div>

        {/* Section 2: Simulated Mode */}
        <div 
          style={{ 
            border: '1px dashed var(--accent)', 
            borderRadius: '8px', 
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: '600', color: 'var(--accent)' }}>
            <Sparkles size={14} />
            快速測試（模擬登入模式）
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
            若您目前不想設定 Google Cloud 憑證，可點擊下方按鈕直接進行模擬登入，立即體驗帶有個人頭像、登出功能及完整介面的進階版登入體驗！
          </p>
          <button 
            className="btn" 
            onClick={handleMockLogin}
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              fontSize: '13px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1px solid var(--accent)',
              color: 'var(--accent)'
            }}
          >
            使用模擬模式登入
          </button>
        </div>
      </div>
    </div>
  );
};
