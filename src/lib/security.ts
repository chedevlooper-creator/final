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
 */
export function buildCSPHeader(nonce?: string): string {
  const nonceStr = nonce ? ` 'nonce-${nonce}'` : " 'unsafe-inline'"

  return [
    "default-src 'self'",
    `script-src 'self'${nonceStr}`, // nonce-based CSP when available
    `style-src 'self'${nonceStr}`, // nonce-based CSP when available
    "img-src 'self' data: blob: https://*.supabase.co https://*.githubusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel-scripts.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
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
  // In production, replace with your actual domain
  // In development, restrict to localhost only for better security
  origin: process.env['NODE_ENV'] === 'production'
    ? 'https://yourdomain.com'
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
  ],
}
