/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    serverActions: true
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Webpack configuration (will be used when Turbopack is not available)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Add page configurations
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Add rewrites for cleaner URLs
  async rewrites() {
    return [
      {
        source: '/about',
        destination: '/about/page',
      },
      {
        source: '/api/analyze',
        destination: '/api/analyze/route',
      }
    ];
  },
}

module.exports = nextConfig