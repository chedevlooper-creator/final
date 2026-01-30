/**
 * Authentication API - Login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

// Build-time placeholder values for SSG/prerendering
const BUILD_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const BUILD_PLACEHOLDER_KEY = 'placeholder-anon-key'

function isBuildTime(): boolean {
  return !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

/**
 * POST /api/auth/login - User login with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli', code: 'MISSING_CREDENTIALS' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const url = isBuildTime() ? BUILD_PLACEHOLDER_URL : env.NEXT_PUBLIC_SUPABASE_URL
    const key = isBuildTime() ? BUILD_PLACEHOLDER_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Create server client with cookie handling
    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      )
    }

    // Get user profile with role information
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', data.user.id)
      .single()

    // Return user data with profile
    return NextResponse.json({
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'viewer',
          name: profile?.['name'] || data.user.user_metadata?.['name'],
          avatar_url: profile?.['avatar_url'] || data.user.user_metadata?.['avatar_url'],
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
          token_type: data.session.token_type,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  })
}
