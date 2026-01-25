/**
 * Rate Limiter Implementation
 *
 * Simple in-memory rate limiter for API endpoints.
 * For production at scale, consider using Redis (e.g., Upstash) or
 * Vercel's built-in rate limiting.
 *
 * Usage:
 * ```typescript
 * import { rateLimiter, checkRateLimit } from '@/lib/rate-limiter'
 *
 * export async function GET(request: Request) {
 *   const result = rateLimiter.check(request)
 *   if (!result.success) {
 *     return Response.json(
 *       { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
 *       { status: 429, headers: result.headers }
 *     )
 *   }
 *   // ... handle request
 * }
 * ```
 */

import { env } from '@/lib/env'

interface RateLimitRecord {
  count: number
  resetTime: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
}

interface RateLimiterOptions {
  /** Maximum number of requests per window */
  maxRequests?: number
  /** Time window in milliseconds */
  windowMs?: number
  /** Key generator function to identify unique clients */
  keyGenerator?: (request: Request) => string
}

/**
 * Default key generator - uses IP address or fallback to user-agent hash
 */
function defaultKeyGenerator(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (cfConnectingIp) return `ip:${cfConnectingIp}`
  if (realIp) return `ip:${realIp}`
  if (forwardedFor) return `ip:${forwardedFor.split(',')[0].trim()}`

  // Fallback to user-agent hash (less reliable)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `ua:${hashString(userAgent)}`
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * In-memory rate limiter class
 */
class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly keyGenerator: (request: Request) => string
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(options: RateLimiterOptions = {}) {
    this.maxRequests = options.maxRequests ?? env.RATE_LIMIT_MAX
    this.windowMs = options.windowMs ?? env.RATE_LIMIT_WINDOW_MS
    this.keyGenerator = options.keyGenerator ?? defaultKeyGenerator

    // Clean up expired records periodically
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs)
    }
  }

  /**
   * Check if a request is within rate limits
   */
  check(request: Request): RateLimitResult {
    const key = this.keyGenerator(request)
    const now = Date.now()
    const record = this.records.get(key)

    // Initialize or reset if window has passed
    if (!record || now >= record.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })

      return this.createResult(true, this.maxRequests - 1, now + this.windowMs)
    }

    // Increment count
    record.count++

    // Check if limit exceeded
    if (record.count > this.maxRequests) {
      return this.createResult(false, 0, record.resetTime)
    }

    return this.createResult(
      true,
      this.maxRequests - record.count,
      record.resetTime
    )
  }

  /**
   * Create rate limit result with headers
   */
  private createResult(
    success: boolean,
    remaining: number,
    reset: number
  ): RateLimitResult {
    const retryAfter = success ? 0 : Math.ceil((reset - Date.now()) / 1000)

    return {
      success,
      limit: this.maxRequests,
      remaining: Math.max(0, remaining),
      reset,
      headers: {
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
        'X-RateLimit-Reset': Math.ceil(reset / 1000).toString(),
        ...(success ? {} : { 'Retry-After': retryAfter.toString() }),
      },
    }
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.records.entries()) {
      if (now >= record.resetTime) {
        this.records.delete(key)
      }
    }
  }

  /**
   * Reset rate limit for a specific key (useful for testing)
   */
  reset(request: Request): void {
    const key = this.keyGenerator(request)
    this.records.delete(key)
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.records.clear()
  }
}

/**
 * Default rate limiter instance
 * Uses environment variables for configuration
 */
export const rateLimiter = new RateLimiter()

/**
 * Create a custom rate limiter with specific options
 */
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  return new RateLimiter(options)
}

/**
 * Helper function to check rate limit and return appropriate response
 * Returns null if within limits, or a Response if limit exceeded
 */
export function checkRateLimit(request: Request): Response | null {
  // Skip rate limiting in development
  if (env.NODE_ENV !== 'production') {
    return null
  }

  const result = rateLimiter.check(request)

  if (!result.success) {
    return Response.json(
      {
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.headers['Retry-After'],
      },
      {
        status: 429,
        headers: result.headers,
      }
    )
  }

  return null
}

/**
 * Middleware-style rate limit check
 * Adds rate limit headers to successful responses
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    // Check rate limit
    const limitResponse = checkRateLimit(request)
    if (limitResponse) {
      return limitResponse
    }

    // Get rate limit headers for successful response
    const result = rateLimiter.check(request)

    // Call the actual handler
    const response = await handler(request)

    // Clone response to add headers
    const headers = new Headers(response.headers)
    Object.entries(result.headers).forEach(([key, value]) => {
      headers.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

export type { RateLimitResult, RateLimiterOptions }
