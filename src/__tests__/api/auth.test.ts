/**
 * Auth API Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error for missing email', async () => {
    const request = new NextRequest('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123' }),
    })

    const response = await POST(request as any)
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

    const response = await POST(request as any)
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

    const response = await POST(request as any)
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

    const response = await POST(request as any)
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

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.code).toBe('MISSING_CREDENTIALS')
  })
})
