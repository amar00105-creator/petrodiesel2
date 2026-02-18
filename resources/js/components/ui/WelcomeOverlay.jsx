import React, { useState, useEffect } from 'react';

/**
 * WelcomeOverlay - Professional animated welcome message
 * Shows on: login, station switch
 * Displays: fuel station icon + station name + user greeting
 * Duration: ~2.5 seconds then auto-fades
 * Pure CSS animations — no external dependencies
 */
const WelcomeOverlay = ({ user, show, onComplete }) => {
  const [phase, setPhase] = useState('hidden'); // hidden | entering | visible | exiting

  useEffect(() => {
    if (!show) return;

    setPhase('entering');
    
    // After enter animation completes -> visible
    const t1 = setTimeout(() => setPhase('visible'), 100);
    
    // Start exit after 2.2s
    const t2 = setTimeout(() => setPhase('exiting'), 2200);
    
    // Fully hidden + callback after exit animation
    const t3 = setTimeout(() => {
      setPhase('hidden');
      if (onComplete) onComplete();
    }, 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);

  if (phase === 'hidden' && !show) return null;

  const stationName = user?.station_name || `المحطة #${user?.station_id || ''}`;
  const userName = user?.name || 'مستخدم';

  const isVisible = phase === 'visible';
  const isEntering = phase === 'entering';
  const isExiting = phase === 'exiting';

  return (
    <>
      <style>{`
        @keyframes welcomeOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes welcomeOverlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes welcomeContentSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes welcomeContentSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-30px) scale(0.9); }
        }
        @keyframes welcomeIconPop {
          0% { opacity: 0; transform: scale(0) rotate(-20deg); }
          60% { transform: scale(1.15) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes welcomeTextReveal {
          from { opacity: 0; transform: translateY(15px); clip-path: inset(100% 0 0 0); }
          to { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0 0); }
        }
        @keyframes welcomeLineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes welcomeStationBadgePop {
          0% { opacity: 0; transform: translateY(15px) scale(0.8); }
          60% { transform: translateY(-3px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes welcomeBarFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes welcomeGlowRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes welcomePulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes welcomeParticleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.7; }
          100% { transform: translateY(0) scale(1); opacity: 0.4; }
        }
        @keyframes welcomeShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .welcome-overlay {
          position: fixed; inset: 0;
          z-index: 999999;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(ellipse at center, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.99) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          font-family: 'Cairo', sans-serif;
          direction: rtl;
        }
        .welcome-overlay--entering {
          animation: welcomeOverlayFadeIn 0.5s ease-out forwards;
        }
        .welcome-overlay--exiting {
          animation: welcomeOverlayFadeOut 0.6s ease-in forwards;
        }

        .welcome-content {
          display: flex; flex-direction: column; align-items: center;
          gap: 20px; padding: 48px; max-width: 480px; text-align: center;
          position: relative;
        }
        .welcome-content--entering {
          animation: welcomeContentSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
        }
        .welcome-content--exiting {
          animation: welcomeContentSlideOut 0.5s ease-in forwards;
        }

        /* Ambient particles */
        .welcome-particle {
          position: absolute; border-radius: 50%; pointer-events: none;
        }

        /* Icon area */
        .welcome-icon-wrap {
          position: relative;
          animation: welcomeIconPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }
        .welcome-icon-glow {
          position: absolute; top: 50%; left: 50%;
          width: 160px; height: 160px;
          background: conic-gradient(from 0deg, rgba(16,185,129,0.35), rgba(59,130,246,0.35), rgba(168,85,247,0.35), rgba(16,185,129,0.35));
          border-radius: 50%; filter: blur(25px);
          animation: welcomeGlowRotate 8s linear infinite;
        }
        .welcome-icon-pulse {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 112px; height: 112px; border-radius: 50%;
          border: 2px solid rgba(16,185,129,0.3);
          animation: welcomePulseRing 2s ease-out infinite;
        }
        .welcome-icon-container {
          position: relative;
          width: 112px; height: 112px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.12) 100%);
          border: 2px solid rgba(16,185,129,0.3);
          box-shadow: 0 0 40px rgba(16,185,129,0.2), 0 0 80px rgba(59,130,246,0.1), inset 0 1px 2px rgba(255,255,255,0.1);
        }
        .welcome-icon-container svg {
          filter: drop-shadow(0 0 10px rgba(16,185,129,0.4));
        }

        /* Text styles */
        .welcome-greeting {
          font-size: 17px; font-weight: 600;
          color: rgba(148,163,184,0.85);
          letter-spacing: 0.08em;
          animation: welcomeTextReveal 0.6s ease-out 0.7s both;
        }
        .welcome-username {
          font-size: 38px; font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: welcomeTextReveal 0.6s ease-out 0.85s both;
          line-height: 1.2;
        }
        .welcome-divider {
          width: 80px; height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(59,130,246,0.5), transparent);
          animation: welcomeLineGrow 0.6s ease-out 0.95s both;
          transform-origin: center;
        }
        .welcome-station-label {
          font-size: 15px; font-weight: 500;
          color: rgba(148,163,184,0.6);
          animation: welcomeTextReveal 0.5s ease-out 1.05s both;
        }
        .welcome-station-badge {
          position: relative; padding: 12px 32px; border-radius: 16px;
          background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%);
          border: 1px solid rgba(16,185,129,0.22);
          box-shadow: 0 0 30px rgba(16,185,129,0.12), 0 0 60px rgba(59,130,246,0.06);
          animation: welcomeStationBadgePop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.15s both;
        }
        .welcome-station-name {
          font-size: 28px; font-weight: 900;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #a855f7 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: welcomeShimmer 3s linear infinite;
          animation-delay: 1.5s;
        }

        /* Progress bar */
        .welcome-bar-track {
          width: 180px; height: 3px; border-radius: 3px;
          background: rgba(255,255,255,0.05);
          overflow: hidden; margin-top: 12px;
          animation: welcomeTextReveal 0.4s ease-out 1.3s both;
        }
        .welcome-bar-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #10b981, #3b82f6, #a855f7);
          animation: welcomeBarFill 1.0s ease-in-out 1.4s both;
        }
      `}</style>

      <div className={`welcome-overlay ${isEntering || isVisible ? 'welcome-overlay--entering' : ''} ${isExiting ? 'welcome-overlay--exiting' : ''}`}>
        {/* Ambient Particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="welcome-particle"
            style={{
              width: 150 + i * 70,
              height: 150 + i * 70,
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
              animation: `welcomeParticleFloat ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        <div className={`welcome-content ${isEntering || isVisible ? 'welcome-content--entering' : ''} ${isExiting ? 'welcome-content--exiting' : ''}`}>
          {/* Fuel Station Icon */}
          <div className="welcome-icon-wrap">
            <div className="welcome-icon-glow" />
            <div className="welcome-icon-pulse" />
            <div className="welcome-icon-container">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 22V5C3 3.89543 3.89543 3 5 3H13C14.1046 3 15 3.89543 15 5V22"
                  stroke="url(#fuelGradW)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M2 22H16"
                  stroke="url(#fuelGradW)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <rect
                  x="6" y="8" width="6" height="4" rx="0.5"
                  stroke="url(#fuelGradW)"
                  strokeWidth="1.3"
                  fill="rgba(16,185,129,0.12)"
                />
                <path
                  d="M15 7L17.5 4.5C18.33 3.67 19.67 3.67 20.5 4.5C21.05 5.05 21.05 5.95 20.5 6.5L19 8V14C19 15.1 19.9 16 21 16"
                  stroke="url(#fuelGradW)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="fuelGradW" x1="2" y1="3" x2="22" y2="22">
                    <stop stopColor="#10b981" />
                    <stop offset="0.5" stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Greeting */}
          <div className="welcome-greeting">مرحباً بك يا</div>

          {/* User Name */}
          <div className="welcome-username">{userName}</div>

          {/* Divider */}
          <div className="welcome-divider" />

          {/* Station Label */}
          <div className="welcome-station-label">في محطة</div>

          {/* Station Badge */}
          <div className="welcome-station-badge">
            <div className="welcome-station-name">⛽ {stationName}</div>
          </div>

          {/* Progress Bar */}
          <div className="welcome-bar-track">
            <div className="welcome-bar-fill" />
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeOverlay;
