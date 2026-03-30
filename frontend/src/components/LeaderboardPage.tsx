'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, getDeviceStats, getDeviceId, type LeaderboardEntry, type DeviceStats } from '@/lib/api';

const COUNTRY_FLAGS: Record<string, string> = {
  'Vietnam': '🇻🇳', 'USA': '🇺🇸', 'UK': '🇬🇧', 'Japan': '🇯🇵',
  'Korea': '🇰🇷', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Australia': '🇦🇺',
};
const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const MILESTONE_BADGES = ['FIRST DROPPER', 'BUTTERFINGERS', "GRAVITY'S NEMESIS", 'SERIAL SLAPPER', 'PHONE DESTROYER'];

function getRankClass(rank: number) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return '';
}

// Fallback mock data khi API chưa có dữ liệu
const MOCK_DATA: LeaderboardEntry[] = [
  { rank: 1, deviceId: 'xxx1****', username: 'Player_Viet', deviceModel: 'iPhone 15 Pro', totalDrops: 47, maxImpactForce: 6.8, lastDropAt: '' },
  { rank: 2, deviceId: 'xxx2****', username: 'ButterHands', deviceModel: 'Samsung S24', totalDrops: 31, maxImpactForce: 5.2, lastDropAt: '' },
  { rank: 3, deviceId: 'xxx3****', username: 'Player_UK01', deviceModel: 'Pixel 8', totalDrops: 28, maxImpactForce: 4.9, lastDropAt: '' },
  { rank: 4, deviceId: 'xxx4****', username: 'iDropAlot', deviceModel: 'iPhone 14', totalDrops: 19, maxImpactForce: 4.1, lastDropAt: '' },
  { rank: 5, deviceId: 'xxx5****', username: 'Flipper_KR', deviceModel: 'Galaxy Z Flip', totalDrops: 15, maxImpactForce: 3.8, lastDropAt: '' },
  { rank: 6, deviceId: 'xxx6****', username: 'NothingUser', deviceModel: 'Nothing Phone 2', totalDrops: 12, maxImpactForce: 3.4, lastDropAt: '' },
  { rank: 7, deviceId: 'xxx7****', username: 'OnePlus_Fr', deviceModel: 'OnePlus 12', totalDrops: 9, maxImpactForce: 3.1, lastDropAt: '' },
  { rank: 8, deviceId: 'xxx8****', username: 'XiaoDropper', deviceModel: 'Xiaomi 14', totalDrops: 7, maxImpactForce: 2.9, lastDropAt: '' },
  { rank: 9, deviceId: 'xxx9****', username: 'OPPOFaller', deviceModel: 'OPPO Find X7', totalDrops: 5, maxImpactForce: 2.6, lastDropAt: '' },
  { rank: 10, deviceId: 'xxx0****', username: 'RealDropper', deviceModel: 'Realme GT 5', totalDrops: 3, maxImpactForce: 2.1, lastDropAt: '' },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    Promise.all([
      getLeaderboard(),
      getDeviceStats(deviceId),
    ]).then(([lb, stats]) => {
      setEntries(lb.length > 0 ? lb : MOCK_DATA);
      setMyStats(stats);
    }).catch(() => {
      setEntries(MOCK_DATA);
      setError(true);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <h1 className="headline" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              transform: 'rotate(-1deg)',
              display: 'block',
            }}>
              🏆 HALL OF SHAME
            </h1>
            <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 2 }}>
              TOP PHONE DROPPERS WORLDWIDE
            </p>
          </div>
          {error && (
            <span className="badge badge-orange" style={{ fontSize: '0.6rem', flexShrink: 0 }}>DEMO</span>
          )}
        </div>
      </header>

      <main className="page-content" style={{ paddingTop: '1rem' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="card" style={{ height: 70, background: 'var(--surface-low)', boxShadow: 'none', opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {entries.map((entry, idx) => (
              <div
                key={entry.rank}
                className="card animate-slide-up"
                style={{
                  border: idx < 3 ? '4px solid var(--ink)' : '3px solid var(--ink)',
                  background: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--surface-white)' : idx === 2 ? 'var(--secondary)' : 'var(--surface-white)',
                  boxShadow: idx < 3 ? 'var(--shadow-hard-lg)' : 'var(--shadow-hard)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* RANK */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                  {idx < 3 ? (
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{RANK_MEDALS[idx]}</span>
                  ) : null}
                  <span className={`rank-number ${getRankClass(entry.rank)}`}
                    style={{ fontSize: idx < 3 ? '1.5rem' : '1.2rem' }}>
                    {entry.rank}
                  </span>
                </div>

                {/* INFO */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="label" style={{ fontSize: '0.8rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.username}
                  </p>
                  <p className="body-sm" style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>
                    📱 {entry.deviceModel || 'Unknown Device'}
                  </p>
                  {/* Milestone badge */}
                  {idx < 5 && (
                    <span className="badge badge-orange" style={{ marginTop: 4, fontSize: '0.55rem' }}>
                      {MILESTONE_BADGES[idx]}
                    </span>
                  )}
                </div>

                {/* STATS */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p className="score-number" style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                    {entry.totalDrops}
                  </p>
                  <p className="body-sm" style={{ color: 'var(--ink-muted)', fontSize: '0.65rem' }}>total drops</p>
                  <span className="badge badge-red" style={{ marginTop: 4, fontSize: '0.55rem' }}>
                    {entry.maxImpactForce.toFixed(1)}G
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* YOUR RANK sticky */}
        <div style={{ marginTop: '1.25rem' }}>
          <div className="card" style={{ background: 'var(--ink)', color: '#fff', border: '4px solid var(--ink)', boxShadow: 'var(--shadow-hard-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="label" style={{ color: 'var(--primary)', marginBottom: 4 }}>📍 YOUR RANK</p>
                <p className="score-number" style={{ color: '#fff', fontSize: '2rem' }}>
                  {myStats ? `#${myStats.rank}` : '—'}
                </p>
                <p className="body-sm" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginTop: 2 }}>
                  {myStats
                    ? `${myStats.totalDrops + myStats.totalSlaps} total events • Max ${myStats.maxImpactForce?.toFixed(1) || '0.0'}G`
                    : 'No drops recorded yet. ARM the sensors!'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2.5rem' }}>💀</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
