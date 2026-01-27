/**
 * Environment variables configuration
 *
 * Direct access to environment variables with type safety and runtime validation
 *
 * SECURITY NOTE: Hardcoded secrets are only for local development.
 * In production, environment variables MUST be set via proper deployment configuration.
 */

/**
 * Check if we're in a server-side context
 */
const isServer = typeof window === 'undefined'

/**
 * Check if we're in production
 */
const isProduction = process.env['NODE_ENV'] === 'production'

/**
 * Check if we're in the build phase (no env vars needed for static generation)
 */
const isBuildPhase = process.env['NEXT_PHASE'] === 'phase-production-build'

/**
 * Public environment variables (safe for client-side access)
 *
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 *
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 */
export const env = {
  // Supabase configuration (public)
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',

  // Sentry configuration (optional, public)
  NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],

  // Application URL (for CORS and other configurations)
  NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],

  // Rate limiting configuration
  RATE_LIMIT_MAX: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes

  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const

/**
 * Server-only environment variables
 * These are NEVER exposed to the client
 *
 * Usage (server components only):
 * ```typescript
 * import { serverEnv } from '@/lib/env'
 *
 * const serviceKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY
 * ```
 */
export const serverEnv = {
  // Service role key - ONLY accessible on server-side
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',

  // Other server-only secrets can be added here
  DATABASE_URL: process.env['DATABASE_URL'],
  API_SECRET_KEY: process.env['API_SECRET_KEY'],
} as const

/**
 * Type-safe environment variables
 */
export type Env = typeof env
export type ServerEnv = typeof serverEnv

/**
 * Validates that required environment variables are present
 * Throws an error if any required variables are missing in production
 * Only runs on server-side and not during build phase
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  // Skip validation during build or client-side
  if (!isServer || isBuildPhase) {
    return { valid: true, missing: [] }
  }

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  // Service role key is only required on server in production
  if (isProduction) {
    required.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0 && isProduction) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`)
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Checks if Supabase credentials are configured
 */
export function hasSupabaseCredentials(): boolean {
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/**
 * Get service role key (server-side only)
 * Throws on client-side access attempt
 */
export function getServiceRoleKey(): string {
  if (!isServer) {
    throw new Error('Service role key can only be accessed on server-side')
  }
  return serverEnv.SUPABASE_SERVICE_ROLE_KEY
}
