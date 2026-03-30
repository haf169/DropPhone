'use client';

import { type Sound } from '@/lib/api';

type Settings = {
  sensitivity: number;
  freeFallEnabled: boolean;
  impactEnabled: boolean;
  fallSoundId: number;
  slapSoundId: number;
};

interface SettingsPageProps {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
  fallSounds: Sound[];
  slapSounds: Sound[];
  loadingSounds: boolean;
}

const SENSITIVITY_LABELS = ['LOW', 'MEDIUM', 'HIGH'];

export default function SettingsPage({
  settings, onUpdate, fallSounds, slapSounds, loadingSounds
}: SettingsPageProps) {
  return (
    <>
      <header className="page-header">
        <h1 className="headline" style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
          ⚙️ SETTINGS
        </h1>
        <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 2 }}>
          Configure your prank engine
        </p>
      </header>

      <main className="page-content" style={{ paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* AUDIO CONFIG */}
        <div className="card-section">
          <p className="section-label">🎵 Audio Config</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

            <div>
              <p className="label" style={{ marginBottom: '0.5rem' }}>FALL SOUND SELECT</p>
              {loadingSounds ? (
                <div className="card" style={{ color: 'var(--ink-muted)', textAlign: 'center' }}>
                  Loading sounds...
                </div>
              ) : (
                <select
                  className="brutalist"
                  value={settings.fallSoundId}
                  onChange={e => onUpdate({ fallSoundId: Number(e.target.value) })}
                >
                  {fallSounds.length === 0 && (
                    <option value={1}>🎤 Scream (default)</option>
                  )}
                  {fallSounds.map(s => (
                    <option key={s.id} value={s.id}>🎤 {s.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="label" style={{ marginBottom: '0.5rem' }}>SLAP SOUND SELECT</p>
              {loadingSounds ? (
                <div className="card" style={{ color: 'var(--ink-muted)', textAlign: 'center' }}>
                  Loading sounds...
                </div>
              ) : (
                <select
                  className="brutalist"
                  value={settings.slapSoundId}
                  onChange={e => onUpdate({ slapSoundId: Number(e.target.value) })}
                >
                  {slapSounds.length === 0 && (
                    <option value={2}>🤕 Ouch! (default)</option>
                  )}
                  {slapSounds.map(s => (
                    <option key={s.id} value={s.id}>🤕 {s.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* PHYSICS ENGINE */}
        <div className="card-section">
          <p className="section-label">⚡ Physics Engine</p>

          <div className="card" style={{ marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <p className="label">SENSITIVITY</p>
              <span className={`badge ${settings.sensitivity === 1 ? 'badge-green' : settings.sensitivity === 2 ? 'badge-yellow' : 'badge-red'}`}>
                {SENSITIVITY_LABELS[settings.sensitivity - 1]}
              </span>
            </div>
            <div className="slider-wrap">
              <input
                type="range"
                className="brutalist"
                min={1} max={3} step={1}
                value={settings.sensitivity}
                onChange={e => onUpdate({ sensitivity: Number(e.target.value) })}
              />
              <div className="slider-labels">
                <span>LOW</span>
                <span>MEDIUM ★</span>
                <span>HIGH</span>
              </div>
            </div>
            <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
              {settings.sensitivity === 1 && 'Best for in-pocket use. Fewer false positives.'}
              {settings.sensitivity === 2 && 'Recommended for most situations.'}
              {settings.sensitivity === 3 && '⚠️ May trigger when running or jumping!'}
            </p>
          </div>

          {/* Sensor toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="card toggle-wrap">
              <div>
                <p className="label" style={{ marginBottom: 2 }}>🍂 Free-Fall Detection</p>
                <p className="body-sm" style={{ color: 'var(--ink-muted)' }}>Triggers when phone drops</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.freeFallEnabled}
                  onChange={e => onUpdate({ freeFallEnabled: e.target.checked })}
                />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
            <div className="card toggle-wrap">
              <div>
                <p className="label" style={{ marginBottom: 2 }}>👋 Impact Detection</p>
                <p className="body-sm" style={{ color: 'var(--ink-muted)' }}>Triggers on slap/hit</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.impactEnabled}
                  onChange={e => onUpdate({ impactEnabled: e.target.checked })}
                />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>
        </div>

        {/* SAFETY DISCLAIMER */}
        <button className="btn btn-secondary" onClick={() => alert('⚠️ SAFETY DISCLAIMER\n\nDropPhone is a PRANK app. Do NOT actually drop your phone. We are not responsible for any damage. Use responsibly!\n\nLiability Shield: ACTIVE 🛡️')}>
          🛡️ SAFETY DISCLAIMER
        </button>

        {/* Version badge */}
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <span className="badge badge-yellow">
            LIABILITY SHIELD ACTIVE • v2.4.0 CODENAME: THUD
          </span>
        </div>
      </main>
    </>
  );
}
