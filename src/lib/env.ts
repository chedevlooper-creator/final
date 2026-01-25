/**
 * Environment variables configuration
 * 
 * Direct access to environment variables with type safety and validation
 * 
 * SECURITY NOTE: 
 * - Never commit real secrets to git
 * - In production, environment variables MUST be set via deployment configuration
 * - All public variables are prefixed with NEXT_PUBLIC_
 */

/**
 * Validate required environment variables
 * Throws error if required variables are missing in production
 */
function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0 && process.env['NODE_ENV'] === 'production') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please configure these in your Vercel dashboard or deployment platform.'
    )
  }

  // Validate URL format
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL should use HTTPS in production')
  }
}

// Run validation on module load
if (typeof window === 'undefined') {
  // Only validate on server-side
  try {
    validateEnv()
  } catch (error) {
    if (process.env['NODE_ENV'] === 'production') {
      throw error
    } else {
      console.warn('⚠️ Environment validation warning:', error)
    }
  }
}

/**
 * Export environment variables with defaults for development
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 * 
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 */
export const env = {
  // Supabase configuration (required)
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',

  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',

  // Service role key (server-side only) - MUST be set in production
  // NEVER expose this to the client
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',

  // Sentry configuration (optional)
  NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
  SENTRY_AUTH_TOKEN: process.env['SENTRY_AUTH_TOKEN'],

  // PostHog Analytics (optional)
  NEXT_PUBLIC_POSTHOG_KEY: process.env['NEXT_PUBLIC_POSTHOG_KEY'],
  NEXT_PUBLIC_POSTHOG_HOST: process.env['NEXT_PUBLIC_POSTHOG_HOST'],

  // MERNIS (Turkish ID verification) (optional)
  MERNIS_USERNAME: process.env['MERNIS_USERNAME'],
  MERNIS_PASSWORD: process.env['MERNIS_PASSWORD'],

  // Cron job authentication
  CRON_SECRET: process.env['CRON_SECRET'],

  // Application URLs
  NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',

  // Environment
  NODE_ENV: process.env['NODE_ENV'] || 'development',

  // Feature flags
  ENABLE_ANALYTICS: process.env['ENABLE_ANALYTICS'] === 'true',
  ENABLE_ERROR_TRACKING: process.env['ENABLE_ERROR_TRACKING'] === 'true',
} as const

/**
 * Type-safe environment variables
 */
export type Env = typeof env

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test'

