/** @type {import('next').NextConfig} */
const nextConfig = {

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

    // Build optimizations
    reactStrictMode: true,

    // Output configuration for Docker deployment
    // TEMPORARILY DISABLED to fix build error. Re-enable for Docker deployment.
    // output: 'standalone',

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-icons',
            'date-fns',
            '@tanstack/react-query',
            // '@tanstack/react-table', // REMOVED: Causes build errors
        ],
    },

    // Compiler optimizations
    swcMinify: true,

    // Headers for caching and security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
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
};

export default nextConfig;
