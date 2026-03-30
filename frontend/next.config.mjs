/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export cho Capacitor mobile
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
  },
};

export default nextConfig;
