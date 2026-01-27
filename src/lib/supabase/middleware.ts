import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

// Build-time placeholder values for SSG/prerendering
const BUILD_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const BUILD_PLACEHOLDER_KEY = 'placeholder-anon-key'

/**
 * Check if we're in a build environment without proper env vars
 */
function isBuildTime(): boolean {
  return !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

/**
 * Security headers to add to all responses
 */
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'force-off',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-XSS-Protection': '1; mode=block',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app",
  ].join('; '),
} as const

/**
 * Paths that don't require authentication
 */
const PUBLIC_PATHS = [
  '/login',
  '/auth',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/health',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/public',
  '/manifest.webmanifest',
]

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

/**
 * Update session and handle authentication
 *
 * This middleware:
 * 1. Refreshes the Supabase session
 * 2. Redirects unauthenticated users from protected routes
 * 3. Redirects authenticated users from auth pages
 * 4. Adds security headers to all responses
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip auth check for static assets and public paths BEFORE creating Supabase client
  // This prevents unnecessary auth calls for routes like manifest.webmanifest
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') ||
    isPublicPath(pathname)
  ) {
    const response = NextResponse.next({
      request,
    })
    // Add security headers to public responses
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Use placeholder values during build/SSG to allow prerendering
  const url = isBuildTime() ? BUILD_PLACEHOLDER_URL : env.NEXT_PUBLIC_SUPABASE_URL
  const key = isBuildTime() ? BUILD_PLACEHOLDER_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check session using getSession() instead of getUser() for middleware
  // getSession() is more reliable in edge environments and doesn't auto-refresh
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve the original URL for redirect after login
    url.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(url)

    // Add security headers to redirect response
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  // Redirect authenticated users away from login/auth pages
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/auth'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const response = NextResponse.redirect(url)

    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  // Add security headers to authenticated responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  return supabaseResponse
}

/**
 * Rate limiting store for API routes (in-memory)
 * Note: For production, use Redis or Upstash for distributed rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for API routes
 */
export function checkRateLimit(identifier: string, limit = 100, windowMs = 900000): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

/**
 * Clean up expired rate limit entries (run every 5 minutes)
 */
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
