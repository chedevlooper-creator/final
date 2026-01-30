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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth check for API routes - they handle their own auth
  if (request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Korumalı sayfalar için auth kontrolü
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Login sayfasına gelen authenticated kullanıcıları ana sayfaya yönlendir
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
