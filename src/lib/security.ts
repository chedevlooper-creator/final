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

import { randomBytes } from 'crypto'

/**
 * Generate a cryptographic nonce for CSP
 * Should be called once per request and passed to both headers and components
 */
export function generateCSPNonce(): string {
  return randomBytes(16).toString('base64')
}

/**
 * Build CSP header with nonce for inline scripts
 * @param nonce - The cryptographic nonce for this request
 * @param options - Additional CSP options
 */
export function buildCSPHeader(
  nonce?: string,
  options: {
    reportUri?: string
    reportOnly?: boolean
  } = {}
): string {
  // In development, allow unsafe-inline for hot reload
  const isDev = process.env['NODE_ENV'] !== 'production'

  // Nonce-based CSP for production, unsafe-inline for development
  const scriptSrc = nonce
    ? ` 'nonce-${nonce}'`
    : isDev
      ? " 'unsafe-inline' 'unsafe-eval'"
      : " 'unsafe-inline'" // Fallback when no nonce provided

  const styleSrc = nonce
    ? ` 'nonce-${nonce}' 'unsafe-inline'`
    : " 'unsafe-inline'" // Styles often need unsafe-inline for CSS-in-JS

  const directives = [
    // Default policy - restrict to same origin
    "default-src 'self'",

    // Scripts - prefer nonce-based, fallback to unsafe-inline
    `script-src 'self'${scriptSrc}`,

    // Styles - need unsafe-inline for CSS-in-JS libraries
    `style-src 'self'${styleSrc}`,

    // Images - allow Supabase storage and data URIs
    "img-src 'self' data: blob: https://*.supabase.co https://*.githubusercontent.com",

    // Fonts - allow self and data URIs
    "font-src 'self' data:",

    // API connections - allow Supabase, Vercel, and Sentry
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel-scripts.com https://*.sentry.io",

    // Media - restrict to same origin
    "media-src 'self'",

    // Objects - disallow plugins (Flash, Java, etc.)
    "object-src 'none'",

    // Child/frame sources - disallow embedding
    "child-src 'none'",
    "frame-src 'none'",

    // Prevent framing of this site
    "frame-ancestors 'none'",

    // Restrict base URI to prevent base tag hijacking
    "base-uri 'self'",

    // Restrict form submissions to same origin
    "form-action 'self'",

    // Require HTTPS for all resources in production
    ...(isDev ? [] : ['upgrade-insecure-requests']),

    // Block all mixed content
    "block-all-mixed-content",

    // Report URI for CSP violations (if configured)
    ...(options.reportUri ? [`report-uri ${options.reportUri}`] : []),
  ]

  return directives.join('; ')
}

/**
 * Get CSP header name based on mode
 */
export function getCSPHeaderName(reportOnly: boolean = false): string {
  return reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy'
}

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
   * X-DNS-Prefetch-Control
   * Controls browser DNS prefetching
   */
  'X-DNS-Prefetch-Control': 'on',

  /**
   * X-Download-Options
   * Prevents IE from executing downloads in site's context
   */
  'X-Download-Options': 'noopen',

  /**
   * Cross-Origin-Opener-Policy
   * Prevents cross-origin attacks via window references
   */
  'Cross-Origin-Opener-Policy': 'same-origin',

  /**
   * Cross-Origin-Resource-Policy
   * Controls which origins can load resources
   */
  'Cross-Origin-Resource-Policy': 'same-origin',

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
   * Security Improvements:
   * - Removed 'unsafe-eval' from script-src (XSS risk)
   * - Added WebSocket support for Supabase realtime (wss://*.supabase.co)
   * - Added base-uri and form-action directives for additional protection
   * - Now supports nonce-based CSP via buildCSPHeader() function
   *
   * For nonce-based CSP, use buildCSPHeader(nonce) in your middleware/route handlers
   * See: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
   */
  ...(process.env['NODE_ENV'] === 'production' ? {
    'Content-Security-Policy': buildCSPHeader() // Falls back to unsafe-inline without nonce
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
  // Use NEXT_PUBLIC_APP_URL in production, restrict to localhost in development
  origin: process.env['NODE_ENV'] === 'production'
    ? process.env['NEXT_PUBLIC_APP_URL'] || 'https://yourdomain.com'
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],

  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'apikey',
    'x-request-id', // For request tracing
  ],

  // Expose headers to the client
  exposedHeaders: [
    'X-Request-Id',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
  ],

  // Max age for preflight cache (24 hours)
  maxAge: 86400,
}
