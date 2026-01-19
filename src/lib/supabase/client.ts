import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'
import { supabase } from '@supabase/supabase-js'

// Singleton pattern for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Optimized browser client with singleton pattern
 * Prevents multiple instances and improves performance
 */
export function createClient() {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'yardim-yonetim-paneli',
        },
      },
    }
  )

  return browserClient
}

/**
 * Create admin client for privileged operations
 * Use only in server-side contexts!
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on server side')
  }

  return supabase(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
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
