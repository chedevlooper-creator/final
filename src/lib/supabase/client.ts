import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Singleton pattern for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

// Build-time placeholder values for SSG/prerendering
// These are only used during build and never at runtime
const BUILD_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const BUILD_PLACEHOLDER_KEY = 'placeholder-anon-key'

/**
 * Check if we're in a build environment without proper env vars
 */
function isBuildTime(): boolean {
  return !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

/**
 * Optimized browser client with singleton pattern
 * Prevents multiple instances and improves performance
 */
export function createClient() {
  if (browserClient) {
    return browserClient
  }

  // Use placeholder values during build/SSG to allow prerendering
  const url = isBuildTime() ? BUILD_PLACEHOLDER_URL : env.NEXT_PUBLIC_SUPABASE_URL
  const key = isBuildTime() ? BUILD_PLACEHOLDER_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only create client on client-side
  if (typeof window === 'undefined') {
    return createBrowserClient(url, key)
  }

  browserClient = createBrowserClient(
    url,
    key,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )

  return browserClient
}

/**
 * Check if service role key is available for admin operations
 */
function hasServiceRoleKey(): boolean {
  return !!env.SUPABASE_SERVICE_ROLE_KEY
}

/**
 * Create admin client for privileged operations
 * Use only in server-side contexts!
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on server side')
  }

  // Use placeholder values during build/SSG
  const url = isBuildTime() ? BUILD_PLACEHOLDER_URL : env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = hasServiceRoleKey() ? env.SUPABASE_SERVICE_ROLE_KEY : BUILD_PLACEHOLDER_KEY

  return createSupabaseClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Reset client (useful for logout)
 */
export function resetClient() {
  browserClient = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token')
  }
}
