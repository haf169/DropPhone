import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export cho Capacitor mobile
  output: process.env.CAPACITOR_BUILD === "true" ? "export" : undefined,
  // Disable image optimization cho Capacitor
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === "true",
  },
  // Cho phép truy cập từ IP LAN khi test trên điện thoại
  allowedDevOrigins: [
    "192.168.1.*",
    "10.0.*.*",
    "172.16.*.*",
    "100.*.*.*",   // Tailscale / VPN range
  ],
};

export default nextConfig;
