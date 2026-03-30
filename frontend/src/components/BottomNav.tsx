'use client';

type Tab = 'home' | 'settings' | 'leaderboard';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home',        icon: '🏠', label: 'HOME' },
  { id: 'settings',   icon: '⚙️', label: 'SETTINGS' },
  { id: 'leaderboard',icon: '🏆', label: 'RANKS' },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          aria-label={tab.label}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
