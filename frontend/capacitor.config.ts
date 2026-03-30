import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dropphone.app",
  appName: "DropPhone",
  webDir: "out", // Next.js static export output
  server: {
    // Dev: trỏ tới Next.js dev server để live-reload
    // Comment dòng này khi build production
    url:
      process.env.NODE_ENV === "development"
        ? "http://192.168.1.100:3000" // ← Thay bằng IP máy tính của bạn
        : undefined,
    cleartext: true,
  },
  plugins: {
    Motion: {},
  },
};

export default config;
