/**
 * Rate Limiting Utility
 * Redis veya Memory tabanlı rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

interface RateLimitConfig {
  identifier: string
  limit: number
  window: number
  keyGenerator: (req: NextRequest) => string | Promise<string>
  skipSuccessfulRequests?: boolean
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  headers: Record<string, string>
}

const memoryStore: RateLimitStore = {}

const CLEANUP_INTERVAL = 60 * 1000

setInterval(() => {
  const now = Date.now()
  for (const key in memoryStore) {
    if (memoryStore[key].resetTime <= now) {
      delete memoryStore[key]
    }
  }
}, CLEANUP_INTERVAL)

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

async function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const resetTime = now + windowMs

  if (!memoryStore[key] || memoryStore[key].resetTime <= now) {
    memoryStore[key] = {
      count: 1,
      resetTime,
    }

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(limit - 1),
        'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
      },
    }
  }

  const entry = memoryStore[key]

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
        'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)),
      },
    }
  }

  entry.count++

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(limit - entry.count),
      'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
    },
  }
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const keyBase = await config.keyGenerator(request)
  const key = `${config.identifier}:${keyBase}`

  return checkMemoryRateLimit(key, config.limit, config.window)
}

export function getIPKey(request: NextRequest): string {
  return getClientIP(request)
}

export async function getUserKey(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  const cookie = request.headers.get('cookie')
  if (cookie) {
    const sessionMatch = cookie.match(/sb-[^-]+-auth-token=([^;]+)/)
    if (sessionMatch) {
      return sessionMatch[1]
    }
  }

  return getClientIP(request)
}

export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      error: message || 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: result.headers,
    }
  )
}

export const defaultRateLimits = {
  login: {
    limit: 5,
    window: 15 * 60 * 1000,
  },
  email: {
    limit: 50,
    window: 60 * 60 * 1000,
  },
  sms: {
    limit: 20,
    window: 60 * 60 * 1000,
  },
  needyCreate: {
    limit: 100,
    window: 60 * 60 * 1000,
  },
  donationCreate: {
    limit: 200,
    window: 60 * 60 * 1000,
  },
} as const
