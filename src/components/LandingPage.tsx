import React from 'react';
import { LogIn, User, TreePine } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onGuestClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onGuestClick,
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 簡約藝術風格圖示 (樹木與連結概念，易於修改) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '96px',
          height: '96px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-color) 100%)',
          border: '1px solid var(--border-color)',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <TreePine size={48} style={{ color: 'var(--accent)' }} />
      </div>

      {/* 主標題 nccu hub */}
      <h1 
        style={{
          fontSize: '48px',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-muted) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'lowercase'
        }}
      >
        nccu hub
      </h1>

      {/* 副標題 "一人種樹，億人乘涼" */}
      <p 
        style={{
          fontSize: '18px',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          margin: '0 0 48px 0',
          letterSpacing: '0.1em',
          position: 'relative',
          paddingBottom: '16px'
        }}
      >
        一人種樹，億人乘涼
        <span 
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: 'var(--accent)',
            opacity: 0.8
          }}
        />
      </p>

      {/* 選項按鈕區 (排版簡單明瞭，方便後續修改) */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '320px'
        }}
      >
        <button 
          onClick={onLoginClick}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s',
            border: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <LogIn size={18} />
          登入政大帳戶
        </button>

        <button 
          onClick={onGuestClick}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <User size={18} />
          訪客進入
        </button>
      </div>

      {/* 底部小字說明 */}
      <div 
        style={{
          marginTop: '64px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}
      >
        政大共筆社群與本地 Markdown 編輯器
        <br />
        NCCU Hub © {new Date().getFullYear()}
      </div>
    </div>
  );
};
