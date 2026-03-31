import type { CapacitorConfig } from "@capacitor/cli";
import * as os from "os";

// ── Tự động phát hiện IP LAN ────────────────────────────────────────────────
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();

  const candidates: { name: string; address: string }[] = [];

  for (const [name, netInfos] of Object.entries(interfaces)) {
    if (!netInfos) continue;
    for (const info of netInfos) {
      if (info.family === "IPv4" && !info.internal) {
        candidates.push({ name, address: info.address });
      }
    }
  }

  if (candidates.length === 0) return "localhost";

  // Ưu tiên WiFi → Ethernet → còn lại
  const priority = ["wi-fi", "wifi", "wlan", "en0", "eth", "ethernet"];
  for (const keyword of priority) {
    const match = candidates.find((c) =>
      c.name.toLowerCase().includes(keyword)
    );
    if (match) return match.address;
  }

  return candidates[0].address;
}

const isDev = process.env.NODE_ENV !== "production";
const localIP = getLocalIP();
const devServerPort = 3000;

if (isDev) {
  console.log(`\n📡 [Capacitor] IP LAN tự động: ${localIP}`);
  console.log(`🔗 Dev server : http://${localIP}:${devServerPort}\n`);
}

const config: CapacitorConfig = {
  appId: "com.dropphone.app",
  appName: "DropPhone",
  webDir: "out",
  server: isDev
    ? {
        // Tự động dùng IP LAN — không cần sửa tay!
        url: `http://${localIP}:${devServerPort}`,
        cleartext: true,
      }
    : undefined,
  plugins: {
    Motion: {},
  },
};

export default config;
