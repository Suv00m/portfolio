import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '0.0.0.0'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
