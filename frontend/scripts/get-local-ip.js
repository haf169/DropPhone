#!/usr/bin/env node
/**
 * get-local-ip.js
 * Tự động phát hiện IP LAN của máy tính và ghi vào .env.local
 * Chạy trước khi `cap sync` để Capacitor dùng đúng IP
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

// ── Lấy IP LAN ──────────────────────────────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, netInfos] of Object.entries(interfaces)) {
    if (!netInfos) continue;
    for (const info of netInfos) {
      // Chỉ lấy IPv4, không phải loopback (127.x.x.x)
      if (info.family === 'IPv4' && !info.internal) {
        candidates.push({ name, address: info.address });
      }
    }
  }

  if (candidates.length === 0) {
    console.warn('⚠️  Không tìm thấy IP LAN, dùng localhost');
    return '127.0.0.1';
  }

  // Ưu tiên theo thứ tự: WiFi > Ethernet > còn lại
  const priority = ['wi-fi', 'wifi', 'wlan', 'en0', 'eth', 'ethernet', 'local area'];
  for (const keyword of priority) {
    const match = candidates.find(c => c.name.toLowerCase().includes(keyword));
    if (match) return match.address;
  }

  // Fallback: chọn cái đầu tiên
  return candidates[0].address;
}

// ── Đọc/ghi .env.local ──────────────────────────────────────────────────────
function updateEnvLocal(ip) {
  const envPath = path.join(__dirname, '..', '.env.local');
  const port = process.env.PORT || '3001';

  // Đọc file hiện có nếu có
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  }

  const keysToSet = {
    NEXT_PUBLIC_LOCAL_IP: ip,
    NEXT_PUBLIC_API_URL: `http://${ip}:${port}/api`,
    NEXT_PUBLIC_BACKEND_URL: `http://${ip}:${port}`,
  };

  for (const [key, value] of Object.entries(keysToSet)) {
    const idx = lines.findIndex(l => l.startsWith(`${key}=`));
    const line = `${key}=${value}`;
    if (idx >= 0) {
      lines[idx] = line;
    } else {
      lines.push(line);
    }
  }

  // Loại bỏ dòng trống ở cuối rồi thêm 1 dòng trống
  const content = lines.filter((l, i) => !(l === '' && i === lines.length - 1)).join('\n') + '\n';
  fs.writeFileSync(envPath, content, 'utf-8');
}

// ── Cập nhật capacitor.config.ts ────────────────────────────────────────────
function updateCapacitorConfig(ip) {
  const capConfigPath = path.join(__dirname, '..', 'capacitor.config.ts');
  if (!fs.existsSync(capConfigPath)) return;

  const content = fs.readFileSync(capConfigPath, 'utf-8');
  // Thay thế IP cũ trong URL Capacitor dev server
  // Pattern: http://<digits.digits.digits.digits>:<port>
  const updated = content.replace(
    /(["'])http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:(\d+)\1/g,
    (match, quote, port) => `${quote}http://${ip}:${port}${quote}`
  );

  if (updated !== content) {
    fs.writeFileSync(capConfigPath, updated, 'utf-8');
    console.log(`📝 Đã cập nhật capacitor.config.ts → http://${ip}`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
const ip = getLocalIP();
console.log('\n🌐 DropPhone — Tự động phát hiện IP LAN');
console.log('─'.repeat(40));
console.log(`📡 IP LAN của máy: \x1b[32m${ip}\x1b[0m`);
console.log(`🔗 Backend URL   : \x1b[36mhttp://${ip}:${process.env.PORT || 3001}/api\x1b[0m`);

updateEnvLocal(ip);
updateCapacitorConfig(ip);

console.log(`✅ Đã ghi vào .env.local và cập nhật capacitor.config.ts`);
console.log('─'.repeat(40) + '\n');
