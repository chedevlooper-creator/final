/** @type {import('next').NextConfig} */
const nextConfig = {
    // Production build output - standalone for better deployment
    output: 'standalone',

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
    },

    // Performance optimizations
    poweredByHeader: false, // Remove X-Powered-By header
    compress: true, // Enable gzip compression

    // Build optimizations
    reactStrictMode: true,

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-icons',
            'date-fns',
        ],
    },

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
        ];
    },
};

export default nextConfig;
