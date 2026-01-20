/**
 * Environment variables configuration
 * 
 * Direct access to environment variables with type safety
 * 
 * SECURITY NOTE: Hardcoded secrets are only for local development.
 * In production, environment variables MUST be set via proper deployment configuration.
 */

/**
 * Export environment variables
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 * 
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 */
export const env = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || (() => {
    if (typeof window !== 'undefined' && process.env['NODE_ENV'] === 'development') {
      // Allow fallback for local development only
      return 'https://jdrncdqyymlwcyvnnzoj.supabase.co'
    }
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required in production')
  })(),
  
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || (() => {
    if (typeof window !== 'undefined' && process.env['NODE_ENV'] === 'development') {
      // Allow fallback for local development only
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkcm5jZHF5eW1sd2N5dm5uem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTYwMzcsImV4cCI6MjA4Mzg3MjAzN30.qGV-qoTFMSk2ZGzO7ABn85Sqjhyyoo8imMW43g5wTQQ'
    }
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required in production')
  })(),
  })(),
  
  // Service role key (server-side only) - MUST be set in production
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] || (() => {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production for admin operations')
    }
    // Development için boş string dön (opsiyonel)
    return ''
  })(),
  
  // Sentry configuration (optional)
  NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
  
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const

/**
 * Type-safe environment variables
 */
export type Env = typeof env
