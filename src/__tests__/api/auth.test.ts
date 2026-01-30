/**
 * Auth API Tests
 * Tests for POST /api/auth/login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers cookies
const mockCookieStore = {
  getAll: vi.fn(() => []),
  get: vi.fn(),
  set: vi.fn(),
}
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

// Mock Supabase createServerClient
const mockSignInWithPassword = vi.fn()
const mockProfileSelect = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockProfileSelect,
        })),
      })),
    })),
  })),
}))

// Mock activity logger
vi.mock('@/lib/activity-logger', () => ({
  entityLoggers: {
    create: vi.fn(() => Promise.resolve()),
  },
}))

// Mock env
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}))

// Mock rate limiter to avoid 429 in tests
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve({
    success: true,
    limit: 5,
    remaining: 4,
    resetTime: Date.now() + 900000,
    headers: {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '4',
      'X-RateLimit-Reset': String(Math.ceil((Date.now() + 900000) / 1000)),
    },
  })),
  getIPKey: vi.fn(() => '127.0.0.1'),
  createRateLimitResponse: vi.fn(),
}))

import { POST } from '../../../app/api/auth/login/route'
import { NextRequest } from 'next/server'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // Input Validation
  // ============================================

  it('should return error for missing email', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('MISSING_CREDENTIALS')
  })

  it('should return error for missing password', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('MISSING_CREDENTIALS')
  })

  it('should return error for invalid email format', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'test123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('INVALID_EMAIL')
  })

  it('should return error for empty email', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
        password: 'test123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('MISSING_CREDENTIALS')
  })

  it('should return error for empty password', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('MISSING_CREDENTIALS')
  })

  // ============================================
  // Successful Login
  // ============================================

  it('should return user data on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          user_metadata: { name: 'Admin User' },
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_at: 1234567890,
          expires_in: 3600,
          token_type: 'bearer',
        },
      },
      error: null,
    })

    mockProfileSelect.mockResolvedValueOnce({
      data: { role: 'admin', name: 'Admin User', avatar_url: null },
      error: null,
    })

    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'validPassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.user.id).toBe('user-1')
    expect(data.data.user.email).toBe('admin@example.com')
    expect(data.data.user.role).toBe('admin')
    expect(data.data.session.access_token).toBe('access-token')
  })

  // ============================================
  // Failed Login
  // ============================================

  it('should return 401 for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.code).toBe('INVALID_CREDENTIALS')
    expect(data.error).toBe('Geçersiz email veya şifre')
  })

  // ============================================
  // Edge Cases
  // ============================================

  it('should return error for missing body', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('MISSING_CREDENTIALS')
  })

  it('should handle whitespace-only email as missing', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: '   ',
        password: 'test123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Whitespace email should fail email format validation
    expect(response.status).toBe(400)
  })

  it('should default to viewer role when profile has no role', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-2',
          email: 'norol@example.com',
          user_metadata: {},
        },
        session: {
          access_token: 'at',
          refresh_token: 'rt',
          expires_at: 9999999999,
          expires_in: 3600,
          token_type: 'bearer',
        },
      },
      error: null,
    })

    mockProfileSelect.mockResolvedValueOnce({
      data: { role: null, name: null, avatar_url: null },
      error: null,
    })

    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'norol@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.user.role).toBe('viewer')
  })
})
