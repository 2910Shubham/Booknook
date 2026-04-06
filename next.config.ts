import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use Turbopack (Next.js 16 default)
  turbopack: {},
  // Allow dev access from LAN (mobile testing)
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.9'],

  // Allow PDF.js worker where needed (reader only)
  async headers() {
    return [
      {
        source: '/reader(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
