import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export cho Capacitor mobile
  output: process.env.CAPACITOR_BUILD === "true" ? "export" : undefined,
  // Disable image optimization cho Capacitor
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === "true",
  },
};

export default nextConfig;
