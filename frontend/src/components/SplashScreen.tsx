'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onReady: () => void;
}

export default function SplashScreen({ onReady }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + Math.random() * 20;
      });
    }, 200);

    const timer = setTimeout(onReady, 2200);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onReady]);

  return (
    <div className="splash-screen">
      {/* Top gutter */}
      <div />

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* Phone icon with speed lines */}
        <div style={{ position: 'relative' }}>
          <div className="splash-phone-icon">📱</div>
          {/* Speed lines */}
          <div style={{
            position: 'absolute', top: '50%', left: '-1.5rem',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 6,
            opacity: 0.6,
          }}>
            {[18, 28, 14].map((w, i) => (
              <div key={i} style={{
                width: w, height: 3, background: 'var(--ink)',
                borderRadius: 2, marginLeft: 'auto',
              }} />
            ))}
          </div>
          {/* THUD starburst */}
          <div style={{
            position: 'absolute', bottom: -12, right: -20,
            background: 'var(--secondary)',
            border: '3px solid var(--ink)',
            borderRadius: '4px',
            padding: '3px 8px',
            transform: 'rotate(8deg)',
            boxShadow: '2px 2px 0 var(--ink)',
          }}>
            <span className="label" style={{ fontSize: '0.7rem' }}>THUD!</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="display-xl" style={{ transform: 'rotate(-2deg)', display: 'inline-block', marginBottom: '0.5rem' }}>
            DROP<br />PHONE
          </h1>
          <div style={{
            background: 'var(--ink)', color: 'var(--primary)',
            padding: '0.25rem 1rem', borderRadius: 4,
            display: 'inline-block',
          }}>
            <span className="label">The World's Most Realistic Prank</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
        {/* Loading dots */}
        <div className="loading-dots">
          <span /><span /><span />
        </div>

        {/* CTA Button */}
        <button className="btn btn-primary" onClick={onReady} style={{ fontSize: '1.1rem', padding: '1rem' }}>
          LET&apos;S GO 💥
        </button>

        {/* Version */}
        <span className="label" style={{ color: 'var(--ink-muted)', fontSize: '0.65rem' }}>
          v2.4.0 — CODENAME: THUD
        </span>
      </div>
    </div>
  );
}
