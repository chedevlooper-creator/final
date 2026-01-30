/**
 * Tests for rate limiting system
 * src/lib/rate-limit.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  rateLimit,
  getIPKey,
  getUserKey,
  createRateLimitResponse,
  defaultRateLimits,
} from '@/lib/rate-limit'

function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  const h = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    h.set(key, value)
  }
  return new NextRequest('https://example.com/api/test', { headers: h })
}

// ============================================
// getIPKey
// ============================================
describe('getIPKey', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' })
    expect(getIPKey(req)).toBe('192.168.1.1')
  })

  it('should extract first IP from multiple forwarded IPs', () => {
    const req = createMockRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' })
    expect(getIPKey(req)).toBe('1.2.3.4')
  })

  it('should fall back to x-real-ip header', () => {
    const req = createMockRequest({ 'x-real-ip': '10.0.0.5' })
    expect(getIPKey(req)).toBe('10.0.0.5')
  })

  it('should return unknown when no IP headers present', () => {
    const req = createMockRequest()
    expect(getIPKey(req)).toBe('unknown')
  })

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const req = createMockRequest({
      'x-forwarded-for': '1.1.1.1',
      'x-real-ip': '2.2.2.2',
    })
    expect(getIPKey(req)).toBe('1.1.1.1')
  })
})

// ============================================
// getUserKey
// ============================================
describe('getUserKey', () => {
  it('should extract Bearer token from authorization header', async () => {
    const req = createMockRequest({ authorization: 'Bearer my-token-123' })
    const key = await getUserKey(req)
    expect(key).toBe('my-token-123')
  })

  it('should extract session token from cookie', async () => {
    const req = createMockRequest({ cookie: 'sb-abc-auth-token=session123; other=val' })
    const key = await getUserKey(req)
    expect(key).toBe('session123')
  })

  it('should prefer Bearer token over cookie', async () => {
    const req = createMockRequest({
      authorization: 'Bearer bearer-token',
      cookie: 'sb-abc-auth-token=cookie-token',
    })
    const key = await getUserKey(req)
    expect(key).toBe('bearer-token')
  })

  it('should fall back to IP when no auth present', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '10.0.0.1' })
    const key = await getUserKey(req)
    expect(key).toBe('10.0.0.1')
  })

  it('should return unknown when nothing available', async () => {
    const req = createMockRequest()
    const key = await getUserKey(req)
    expect(key).toBe('unknown')
  })
})

// ============================================
// rateLimit
// ============================================
describe('rateLimit', () => {
  it('should allow first request', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '100.0.0.1' })
    const result = await rateLimit(req, {
      identifier: 'test-allow-first',
      limit: 5,
      window: 60000,
      keyGenerator: getIPKey,
    })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.limit).toBe(5)
  })

  it('should decrement remaining on each request', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '100.0.0.2' })
    const config = {
      identifier: 'test-decrement',
      limit: 3,
      window: 60000,
      keyGenerator: getIPKey,
    }

    const r1 = await rateLimit(req, config)
    expect(r1.remaining).toBe(2)

    const r2 = await rateLimit(req, config)
    expect(r2.remaining).toBe(1)

    const r3 = await rateLimit(req, config)
    expect(r3.remaining).toBe(0)
  })

  it('should block requests exceeding the limit', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '100.0.0.3' })
    const config = {
      identifier: 'test-block',
      limit: 2,
      window: 60000,
      keyGenerator: getIPKey,
    }

    await rateLimit(req, config) // 1
    await rateLimit(req, config) // 2

    const blocked = await rateLimit(req, config) // 3 - should be blocked
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('should track different identifiers separately', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '100.0.0.4' })

    const r1 = await rateLimit(req, {
      identifier: 'test-sep-a',
      limit: 1,
      window: 60000,
      keyGenerator: getIPKey,
    })
    expect(r1.success).toBe(true)

    const r2 = await rateLimit(req, {
      identifier: 'test-sep-b',
      limit: 1,
      window: 60000,
      keyGenerator: getIPKey,
    })
    expect(r2.success).toBe(true)
  })

  it('should track different IPs separately', async () => {
    const req1 = createMockRequest({ 'x-forwarded-for': '100.0.0.5' })
    const req2 = createMockRequest({ 'x-forwarded-for': '100.0.0.6' })
    const config = {
      identifier: 'test-ip-sep',
      limit: 1,
      window: 60000,
      keyGenerator: getIPKey,
    }

    const r1 = await rateLimit(req1, config)
    expect(r1.success).toBe(true)

    const r2 = await rateLimit(req2, config)
    expect(r2.success).toBe(true)
  })

  it('should include proper headers in response', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '100.0.0.7' })
    const result = await rateLimit(req, {
      identifier: 'test-headers',
      limit: 10,
      window: 60000,
      keyGenerator: getIPKey,
    })

    expect(result.headers['X-RateLimit-Limit']).toBe('10')
    expect(result.headers['X-RateLimit-Remaining']).toBe('9')
    expect(result.headers['X-RateLimit-Reset']).toBeDefined()
  })

  it('should include Retry-After header when blocked', async () => {
    const req = createMockRequest({ 'x-forwarded-for': '100.0.0.8' })
    const config = {
      identifier: 'test-retry-after',
      limit: 1,
      window: 60000,
      keyGenerator: getIPKey,
    }

    await rateLimit(req, config)
    const blocked = await rateLimit(req, config)
    expect(blocked.headers['Retry-After']).toBeDefined()
    expect(Number(blocked.headers['Retry-After'])).toBeGreaterThan(0)
  })
})

// ============================================
// createRateLimitResponse
// ============================================
describe('createRateLimitResponse', () => {
  it('should return 429 status', async () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      resetTime: Date.now() + 60000,
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil((Date.now() + 60000) / 1000)),
        'Retry-After': '60',
      },
    }

    const response = createRateLimitResponse(result)
    expect(response.status).toBe(429)

    const body = await response.json()
    expect(body.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(body.retryAfter).toBeDefined()
  })

  it('should use default Turkish message', async () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      resetTime: Date.now() + 60000,
      headers: {},
    }

    const response = createRateLimitResponse(result)
    const body = await response.json()
    expect(body.error).toBe('Çok fazla istek. Lütfen daha sonra tekrar deneyin.')
  })

  it('should accept custom message', async () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      resetTime: Date.now() + 60000,
      headers: {},
    }

    const response = createRateLimitResponse(result, 'Özel mesaj')
    const body = await response.json()
    expect(body.error).toBe('Özel mesaj')
  })
})

// ============================================
// defaultRateLimits
// ============================================
describe('defaultRateLimits', () => {
  it('should have login limits', () => {
    expect(defaultRateLimits.login.limit).toBe(5)
    expect(defaultRateLimits.login.window).toBe(15 * 60 * 1000) // 15 min
  })

  it('should have email limits', () => {
    expect(defaultRateLimits.email.limit).toBe(50)
    expect(defaultRateLimits.email.window).toBe(60 * 60 * 1000) // 1 hour
  })

  it('should have SMS limits', () => {
    expect(defaultRateLimits.sms.limit).toBe(20)
    expect(defaultRateLimits.sms.window).toBe(60 * 60 * 1000) // 1 hour
  })

  it('should have needy create limits', () => {
    expect(defaultRateLimits.needyCreate.limit).toBe(100)
    expect(defaultRateLimits.needyCreate.window).toBe(60 * 60 * 1000) // 1 hour
  })

  it('should have donation create limits', () => {
    expect(defaultRateLimits.donationCreate.limit).toBe(200)
    expect(defaultRateLimits.donationCreate.window).toBe(60 * 60 * 1000) // 1 hour
  })
})
