import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['whatsapp-web.js', 'puppeteer', 'qrcode'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-side modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'puppeteer-core': false,
        'whatsapp-web.js': false,
      };
    }
    return config;
  },
}

export default nextConfig
