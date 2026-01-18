/**
 * Environment variables configuration
 * 
 * Direct access to environment variables with type safety
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
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://jdrncdqyymlwcyvnnzoj.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkcm5jZHF5eW1sd2N5dm5uem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTYwMzcsImV4cCI6MjA4Mzg3MjAzN30.qGV-qoTFMSk2ZGzO7ABn85Sqjhyyoo8imMW43g5wTQQ',
  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const

/**
 * Type-safe environment variables
 */
export type Env = typeof env
