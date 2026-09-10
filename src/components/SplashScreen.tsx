import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  minDuration = 1000 
}) => {
  const [progress, setProgress] = useState(10);
  const [status, setStatus] = useState('正在載入生態網絡...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDuration) * 100));

      setProgress(pct);

      if (pct > 70) {
        setStatus('準備進入森林...');
      } else if (pct > 35) {
        setStatus('載入工作區神經元...');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsVisible(false);
            onFinish?.();
          }, 400);
        }, 150);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDuration, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#09090b',
        color: '#fafafa',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* 微弱背景環境光 */}
      <div
        style={{
          position: 'absolute',
          width: 440,
          height: 440,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {/* 中央 Logo */}
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <img
            src="/wikitree-logo.png"
            alt="WikiTree Logo"
            style={{
              width: 92,
              height: 92,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 24px rgba(255, 255, 255, 0.25))',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* 標題與副標題 */}
        <div
          style={{
            fontSize: 19,
            fontWeight: 300,
            letterSpacing: '0.45em',
            textIndent: '0.45em',
            textTransform: 'uppercase',
            color: '#f4f4f5',
            marginBottom: 6,
          }}
        >
          WikiTree
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.28em',
            textIndent: '0.28em',
            textTransform: 'uppercase',
            color: '#71717a',
            marginBottom: 34,
          }}
        >
          Knowledge Ecosystem
        </div>

        {/* 進度條 */}
        <div
          style={{
            width: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: '100%',
              height: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 999,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#ffffff',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)',
                borderRadius: 999,
                transition: 'width 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              color: '#a1a1aa',
              fontVariantNumeric: 'tabular-nums',
              height: 16,
            }}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};
