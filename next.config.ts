import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'
import { securityHeaders } from '@/lib/security'
import path from 'path'

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env['ANALYZE'] === 'true',
})

const nextConfig: NextConfig = {
  // Cache Components disabled due to dynamic route incompatibility
  // cacheComponents: true,

  reactStrictMode: true,

  // TypeScript build configuration
  typescript: {
    ignoreBuildErrors: false, // Production için TypeScript hatalarını kontrol et
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jdrncdqyymlwcyvnnzoj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // Output configuration for Docker deployment
  output: 'standalone',

  // Experimental features for better performance
  experimental: {
    // cacheComponents moved to root
    optimizePackageImports: [

      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      '@tanstack/react-query',
      'recharts',
      'xlsx',
    ],
  },


  // Turbopack configuration - silence multiple lockfile warning
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Webpack optimizations for bundle size
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    // Optimize package imports
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Reduce bundle size with tree shaking
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: true,
    }

    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: Object.entries(securityHeaders).map(([key, value]) => ({
          key,
          value,
        })),
      },
      // Cache static assets
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache static assets with hash
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "kaf-g0",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env['CI'],

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
