'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSounds, reportDrop, getDeviceId, getDeviceModel, getBestDeviceModel, type Sound } from '@/lib/api';
import { useMotion, requestMotionPermission } from '@/lib/useMotion';
import BottomNav from '@/components/BottomNav';
import SettingsPage from '@/components/SettingsPage';
import LeaderboardPage from '@/components/LeaderboardPage';
import SplashScreen from '@/components/SplashScreen';

type Tab = 'home' | 'settings' | 'leaderboard';
type Settings = {
  sensitivity: number;
  freeFallEnabled: boolean;
  impactEnabled: boolean;
  fallSoundId: number;
  slapSoundId: number;
};

export default function App() {
  // ── State ──
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [armed, setArmed] = useState(false);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loadingSounds, setLoadingSounds] = useState(true);
  const [lastEvent, setLastEvent] = useState<{ type: string; force: number } | null>(null);
  const [settings, setSettings] = useState<Settings>({
    sensitivity: 2,
    freeFallEnabled: true,
    impactEnabled: true,
    fallSoundId: 1,
    slapSoundId: 2,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const deviceId = useRef('');
  const deviceModel = useRef('');

  // ── Init ──
  useEffect(() => {
    deviceId.current = getDeviceId();
    // Dùng ngay UA-based model làm fallback, sau đó cập nhật bằng native API
    deviceModel.current = getDeviceModel();
    getBestDeviceModel().then((model) => {
      deviceModel.current = model;
    });
    // Load settings từ localStorage
    const saved = localStorage.getItem('dropphone_settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  // ── Fetch sounds từ API ──
  useEffect(() => {
    getSounds()
      .then(setSounds)
      .catch(() => {
        // Fallback khi backend chưa chạy
        setSounds([
          { id: 1, name: 'Scream', filename: 'scream.mp3', url: '', type: 'FALL' },
          { id: 2, name: 'Ouch!', filename: 'ouch.mp3', url: '', type: 'SLAP' },
          { id: 3, name: 'THUD!', filename: 'thud.mp3', url: '', type: 'FALL' },
          { id: 4, name: 'Crash!', filename: 'crash.mp3', url: '', type: 'SLAP' },
        ]);
      })
      .finally(() => setLoadingSounds(false));
  }, []);

  // ── Play sound ──
  const playSound = useCallback((soundId: number) => {
    const sound = sounds.find(s => s.id === soundId);
    if (!sound?.url) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(sound.url);
    audio.play().catch(() => {});
    audioRef.current = audio;
  }, [sounds]);

  // ── Event handlers ──
  const handleFreeFall = useCallback(async (force: number) => {
    if (!armed) return;
    setLastEvent({ type: 'FALL 📱💨', force });
    playSound(settings.fallSoundId);
    await reportDrop({
      deviceId: deviceId.current,
      deviceModel: deviceModel.current,
      eventType: 'FALL',
      impactForce: force,
      soundId: settings.fallSoundId,
    }).catch(() => {});
  }, [armed, settings.fallSoundId, playSound]);

  const handleImpact = useCallback(async (force: number) => {
    if (!armed) return;
    setLastEvent({ type: 'SLAP 👋💥', force });
    playSound(settings.slapSoundId);
    await reportDrop({
      deviceId: deviceId.current,
      deviceModel: deviceModel.current,
      eventType: 'SLAP',
      impactForce: force,
      soundId: settings.slapSoundId,
    }).catch(() => {});
  }, [armed, settings.slapSoundId, playSound]);

  // ── Motion hook ──
  useMotion({
    onFreeFall: handleFreeFall,
    onImpact: handleImpact,
    sensitivity: settings.sensitivity,
    enabled: armed,
    freeFallEnabled: settings.freeFallEnabled,
    impactEnabled: settings.impactEnabled,
  });

  // ── Save settings ──
  const updateSettings = (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    localStorage.setItem('dropphone_settings', JSON.stringify(next));
  };

  // ── Arm/Disarm ──
  const handleArmToggle = async () => {
    if (!armed) {
      const granted = await requestMotionPermission();
      if (!granted) {
        alert('⚠️ Cần quyền truy cập cảm biến chuyển động để hoạt động!');
        return;
      }
    }
    setArmed(prev => !prev);
    setLastEvent(null);
  };

  // ── Splash → App ──
  if (showSplash) {
    return <SplashScreen onReady={() => setShowSplash(false)} />;
  }

  const fallSounds = sounds.filter(s => s.type === 'FALL');
  const slapSounds = sounds.filter(s => s.type === 'SLAP');

  return (
    <div className="app-shell">
      {/* ── HOME TAB ── */}
      {activeTab === 'home' && (
        <>
          <header className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 className="headline" style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
                  📱 SCREAM &amp; SLAP
                </h1>
                <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 2 }}>
                  Drop it. Slap it.
                </p>
              </div>
              <span className={`badge ${armed ? 'badge-red' : 'badge-green'}`}>
                <span className={`status-dot ${armed ? 'pulsing' : 'inactive'}`} />
                {armed ? 'ARMED' : 'READY'}
              </span>
            </div>
          </header>

          <main className="page-content" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ARM BUTTON */}
            <button className={`arm-btn ${armed ? 'armed' : ''}`} onClick={handleArmToggle}>
              <span>{armed ? '🔴 DISARM' : '🟢 ARM SENSORS'}</span>
              <span className="arm-btn-sub">
                {armed ? 'Tap to deactivate — sensors are hot!' : 'Tap to activate motion sensors. Volume UP! 🔊'}
              </span>
            </button>

            {/* LAST EVENT */}
            {lastEvent && (
              <div className="card animate-slide-up" style={{ background: 'var(--primary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="label">Last Event</span>
                <span className="display-lg">{lastEvent.type}</span>
                <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>
                  {lastEvent.force.toFixed(2)}G impact force detected
                </span>
              </div>
            )}

            {/* ACTIVE SENSORS */}
            <div className="card-section">
              <p className="section-label">Active Sensors</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="card toggle-wrap">
                  <div>
                    <p className="label" style={{ marginBottom: 2 }}>🍂 Free-Fall</p>
                    <p className="body-sm" style={{ color: 'var(--ink-muted)' }}>Scream while falling</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.freeFallEnabled}
                      onChange={e => updateSettings({ freeFallEnabled: e.target.checked })}
                    />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>

                <div className="card toggle-wrap">
                  <div>
                    <p className="label" style={{ marginBottom: 2 }}>👋 Impact Slap</p>
                    <p className="body-sm" style={{ color: 'var(--ink-muted)' }}>Scream on collision</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.impactEnabled}
                      onChange={e => updateSettings({ impactEnabled: e.target.checked })}
                    />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>
              </div>
            </div>

            {/* PRO TIP */}
            <div className="pro-tip">
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              <div>
                <p className="label" style={{ marginBottom: 2 }}>Pro Tip</p>
                <p className="body-sm">
                  High sensitivity may trigger while running or jumping. Adjust in <strong>Settings</strong>.
                </p>
              </div>
            </div>

            {/* QUICK SOUNDS */}
            {!loadingSounds && (
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('settings')}
                style={{ marginTop: 4 }}
              >
                🎵 Change Sounds
              </button>
            )}
          </main>
        </>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <SettingsPage
          settings={settings}
          onUpdate={updateSettings}
          fallSounds={fallSounds}
          slapSounds={slapSounds}
          loadingSounds={loadingSounds}
        />
      )}

      {/* ── LEADERBOARD TAB ── */}
      {activeTab === 'leaderboard' && (
        <LeaderboardPage />
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
