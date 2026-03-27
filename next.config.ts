import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use Turbopack (Next.js 16 default)
  turbopack: {},

  // Allow PDF.js CDN worker
  async headers() {
    return [
      {
        source: '/(.*)',
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
