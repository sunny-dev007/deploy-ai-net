/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    appDir: true,
    optimizeCss: true,
    // Reduce the frequency of page reloads during development
    webpackDevMiddleware: config => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      return config
    },
  },
  // Turbopack configuration
  turbo: {
    loaders: {
      // Add loaders for different file types
      '.css': ['style-loader', 'css-loader'],
      '.module.css': ['style-loader', 'css-loader'],
    },
    // Configure Turbopack resolving
    resolve: {
      alias: {
        '@': '.',
      },
    },
    // Development server configuration
    devServer: {
      hot: true,
      watchOptions: {
        poll: 1000,
        aggregateTimeout: 300,
      },
    }
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Webpack configuration (will be used when Turbopack is not available)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    // Add any webpack-specific configurations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config
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