/**
 * Tests for /api/needy endpoint
 */

import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../../app/api/needy/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: { id: '123', first_name: 'Ahmet', last_name: 'Yılmaz' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

// Mock withAuth
vi.mock('@/lib/permission-middleware', () => ({
  withAuth: vi.fn(() => Promise.resolve({
    success: true,
    user: { id: 'user-1', role: 'admin' },
  })),
}))

// Mock withOrgAuth for multi-tenant
vi.mock('@/lib/organization-middleware', () => ({
  withOrgAuth: vi.fn(() => Promise.resolve({
    success: true,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      organization: {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        plan_tier: 'professional',
        role: 'admin',
        settings: {
          currency: 'TRY',
          language: 'tr',
          timezone: 'Europe/Istanbul',
          date_format: 'DD.MM.YYYY',
          max_users: 10,
          features: {
            sms_enabled: true,
            email_enabled: true,
            mernis_enabled: true,
            reports_enabled: true
          }
        }
      }
    }
  })),
  createOrgErrorResponse: vi.fn((error, status) => new Response(JSON.stringify({ error }), { status })),
}))

describe('POST /api/needy', () => {
  it('should create a new needy person', async () => {
    const request = new NextRequest('http://localhost/api/needy', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        tckn: '12345678901',
        phone: '05551234567',
        email: 'ahmet@example.com',
        address: 'Test Address',
        city_id: 34,
        district_id: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toBeDefined()
  })

  it('should return 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/needy', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Ahmet',
        // Missing last_name
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})
