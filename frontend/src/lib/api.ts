// =============================================
// API Client — kết nối với NestJS backend
// =============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ── Types ──
export interface Sound {
  id: number;
  name: string;
  filename: string;
  url: string;
  type: 'FALL' | 'SLAP';
  duration?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;      // từ backend
  deviceId: string;
  deviceModel?: string;  // optional từ backend
  totalDrops: number;
  maxImpactForce: number;
  lastDropAt: string;    // từ backend
}

export interface ReportDropPayload {
  deviceId: string;
  deviceModel: string;
  eventType: 'FALL' | 'SLAP';
  impactForce?: number;
  soundId?: number;
}

export interface DeviceStats {
  deviceId: string;
  totalDrops: number;
  totalSlaps: number;
  maxImpactForce: number;
  rank: number;
}

// ── API calls ──
export async function getSounds(type?: 'FALL' | 'SLAP'): Promise<Sound[]> {
  const url = type ? `${API_BASE}/sounds?type=${type}` : `${API_BASE}/sounds`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sounds');
  return res.json();
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/leaderboard`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function reportDrop(payload: ReportDropPayload): Promise<void> {
  await fetch(`${API_BASE}/report-drop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getDeviceStats(deviceId: string): Promise<DeviceStats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats?deviceId=${deviceId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Device ID helper (persistent) ──
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('dropphone_device_id');
  if (!id) {
    id = 'device_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    localStorage.setItem('dropphone_device_id', id);
  }
  return id;
}

export function getDeviceModel(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Samsung/.test(ua)) return 'Samsung';
  if (/Pixel/.test(ua)) return 'Pixel';
  if (/Android/.test(ua)) return 'Android';
  return 'Desktop';
}
