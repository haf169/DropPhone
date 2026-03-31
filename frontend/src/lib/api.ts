// =============================================
// API Client — kết nối với NestJS backend
// =============================================

// Ưu tiên: biến env runtime → localhost fallback
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
  username: string;
  deviceId: string;
  deviceModel?: string;
  totalDrops: number;
  maxImpactForce: number;
  lastDropAt: string;
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

// ── Device Model — fallback nhanh bằng UserAgent ─────────────────────────
// Hàm này dùng ngay lập tức (sync) để có giá trị ban đầu
export function getDeviceModel(): string {
  if (typeof window === 'undefined') return 'Server';
  const ua = navigator.userAgent;

  // iOS
  if (/iPhone/.test(ua)) {
    const match = ua.match(/iPhone OS (\d+_\d+)/);
    return match ? `iPhone (iOS ${match[1].replace('_', '.')})` : 'iPhone';
  }
  if (/iPad/.test(ua)) return 'iPad';

  // Android — cố extract model
  if (/Android/.test(ua)) {
    // UA pattern: "... (Linux; Android 13; Pixel 7) ..."
    const modelMatch = ua.match(/\(Linux; Android[\d .]+; ([^)]+)\)/);
    if (modelMatch) {
      const model = modelMatch[1].trim();
      // Xác định hãng phổ biến
      if (/samsung/i.test(model)) return `Samsung ${model.replace(/SM-\w+/i, '').trim()}`.trim();
      if (/pixel/i.test(model)) return model;
      if (/xiaomi|redmi|poco/i.test(model)) return model;
      if (/oppo|realme|oneplus/i.test(model)) return model;
      if (/huawei/i.test(model)) return model;
      if (/vivo/i.test(model)) return model;
      return model;
    }
    return 'Android';
  }

  // Desktop / khác
  if (/Windows NT/.test(ua)) return 'Windows PC';
  if (/Macintosh|Mac OS/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';

  return 'Unknown Device';
}

// ── Device Model nâng cao — dùng Capacitor Device API (async) ───────────────
// Chỉ hoạt động khi chạy trong app native (Android/iOS)
// Trả về null nếu đang chạy trên web
export async function getDeviceModelNative(): Promise<string | null> {
  try {
    // Dynamic import để tránh lỗi khi chạy SSR / web thuần
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();

    // info.platform: 'ios' | 'android' | 'web'
    if (info.platform === 'web') return null;

    const parts: string[] = [];

    // Manufacturer + Model (vd: "Samsung Galaxy S24 Ultra")
    if (info.manufacturer && info.manufacturer !== info.model) {
      parts.push(info.manufacturer);
    }
    if (info.model) parts.push(info.model);

    const deviceName = parts.join(' ').trim() || 'Unknown Device';
    const os = info.platform === 'ios' ? 'iOS' : 'Android';
    const osVer = info.osVersion || '';

    return osVer ? `${deviceName} (${os} ${osVer})` : `${deviceName} (${os})`;
  } catch {
    // Chạy trên web hoặc Capacitor chưa ready
    return null;
  }
}

// ── Unified: lấy tên thiết bị tốt nhất có thể ───────────────────────────────
// Dùng native API nếu có, fallback về UserAgent
export async function getBestDeviceModel(): Promise<string> {
  const native = await getDeviceModelNative();
  if (native) return native;
  return getDeviceModel();
}
