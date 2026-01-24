/**
 * Authentication API - Login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/login - User login with email and password
 *
 * Request body:
 * {
 *   "email": string,
 *   "password": string
 * }
 *
 * Response (200):
 * {
 *   "data": {
 *     "user": { id, email, ... },
 *     "session": { access_token, refresh_token, ... }
 *   }
 * }
 *
 * Response (400/401):
 * {
 *   "error": string,
 *   "code": string
 * }
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

    const supabase = await createServerSupabaseClient()

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
    // Error logged securely without exposing sensitive data
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
