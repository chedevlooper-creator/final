/**
 * Security Headers Configuration
 * 
 * These headers help protect the application from various security vulnerabilities
 * including XSS, clickjacking, and other attacks.
 * 
 * References:
 * - OWASP: https://owasp.org/www-project-secure-headers/
 * - Next.js: https://nextjs.org/docs/app/building-your-application/configuring/headers
 */

export const securityHeaders = {
  /**
   * X-Frame-Options: DENY
   * Prevents clickjacking attacks by disallowing the page to be framed
   */
  'X-Frame-Options': 'DENY',

  /**
   * X-Content-Type-Options: nosniff
   * Prevents MIME type sniffing
   */
  'X-Content-Type-Options': 'nosniff',

  /**
   * Referrer-Policy: strict-origin-when-cross-origin
   * Controls how much referrer information is sent
   */
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  /**
   * Permissions-Policy
   * Disables browser features that could be exploited
   */
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  /**
   * Strict-Transport-Security (HSTS)
   * Forces HTTPS connections for the specified duration
   * Only enable in production with HTTPS
   */
  ...(process.env['NODE_ENV'] === 'production' ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  } : {}),

  /**
   * Content-Security-Policy (CSP)
   * Controls which resources can be loaded
   * 
   * Note: This is a basic CSP. You may need to customize it based on your needs
   * especially if you're using external services like analytics, fonts, etc.
   */
  ...(process.env['NODE_ENV'] === 'production' ? {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  } : {}),

  /**
   * X-XSS-Protection
   * Enables XSS filtering (mostly for older browsers)
   */
  'X-XSS-Protection': '1; mode=block',
}

/**
 * CORS Configuration
 * 
 * Configure which origins are allowed to access your API
 */
export const corsConfig = {
  // In production, replace with your actual domain
  origin: process.env['NODE_ENV'] === 'production'
    ? 'https://yourdomain.com'
    : '*', // Allow all origins in development

  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'apikey',
  ],
}
