/**
 * Tests for /api/donations endpoint
 */

import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/donations/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: {
              id: '123',
              amount: 1000,
              currency: 'TRY',
              donor_name: 'Test Donor',
              payment_status: 'completed',
            },
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

describe('POST /api/donations', () => {
  it('should create a new donation', async () => {
    const request = new NextRequest('http://localhost/api/donations', {
      method: 'POST',
      body: JSON.stringify({
        donation_type: 'cash', // Required field
        amount: 1000,
        currency: 'TRY',
        donor_name: 'Test Donor',
        donor_email: 'donor@example.com',
        donor_phone: '05551234567',
        payment_method: 'transfer',
        payment_status: 'completed',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toBeDefined()
    expect(data.data.amount).toBe(1000)
  })

  it('should return 400 for invalid amount', async () => {
    const request = new NextRequest('http://localhost/api/donations', {
      method: 'POST',
      body: JSON.stringify({
        amount: -100,
        currency: 'TRY',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for missing amount', async () => {
    const request = new NextRequest('http://localhost/api/donations', {
      method: 'POST',
      body: JSON.stringify({
        currency: 'TRY',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})
