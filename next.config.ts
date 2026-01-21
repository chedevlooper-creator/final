import type { NextConfig } from 'next'
// import { withWorkflow } from 'workflow/next'
import { securityHeaders } from '@/lib/security'
import path from 'path'

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env['ANALYZE'] === 'true',
})

const nextConfig: NextConfig = {
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
  webpack: (config, { isServer }) => {
    // Optimize package imports
    if (!isServer) {
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

export default withBundleAnalyzer(nextConfig)
