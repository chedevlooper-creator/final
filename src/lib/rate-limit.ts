/**
 * Rate Limiting Utility
 *
 * Provides in-memory rate limiting for API routes.
 * For production, consider using Redis or Upstash for distributed rate limiting.
 */

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitStore>()

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit?: number
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number
  /** Custom identifier generator (default: uses IP address) */
  identifier?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean
  /** Remaining requests in the current window */
  remaining: number
  /** Unix timestamp when the limit resets */
  resetTime: number
  /** Time in milliseconds until reset */
  retryAfter?: number
}

/**
 * Check if a request should be rate limited
 *
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```typescript
 * import { rateLimit } from '@/lib/rate-limit'
 *
 * export async function GET(request: Request) {
 *   const result = await rateLimit({
 *     identifier: request.headers.get('x-forwarded-for') || 'unknown',
 *     limit: 100,
 *     windowMs: 15 * 60 * 1000, // 15 minutes
 *   })
 *
 *   if (!result.success) {
 *     return Response.json(
 *       { error: 'Too many requests' },
 *       {
 *         status: 429,
 *         headers: {
 *           'Retry-After': String(result.retryAfter),
 *           'X-RateLimit-Limit': '100',
 *           'X-RateLimit-Remaining': '0',
 *           'X-RateLimit-Reset': String(result.resetTime),
 *         },
 *       }
 *     )
 *   }
 *
 *   // Proceed with the request
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig = {}): RateLimitResult {
  const {
    limit = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    identifier = 'default',
  } = config

  const now = Date.now()
  const key = identifier

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // Create new window
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  } else {
    // Increment count
    entry.count++
  }

  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit
  const retryAfter = success ? undefined : Math.ceil((entry.resetTime - now) / 1000)

  return {
    success,
    remaining,
    resetTime: entry.resetTime,
    retryAfter,
  }
}

/**
 * Parse IP address from request headers
 *
 * @param request - Next.js Request object
 * @returns IP address or 'unknown'
 */
export function getClientIdentifier(request: Request): string {
  // Check various headers for IP address
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim()
      if (ip) return ip
    }
  }

  return 'unknown'
}

/**
 * Generate rate limit headers for the response
 *
 * @param limit - Maximum requests
 * @param remaining - Remaining requests
 * @param resetTime - Unix timestamp when limit resets
 * @returns Headers object
 */
export function generateRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetTime),
    'X-RateLimit-Reset-After': String(Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))),
  }
}

/**
 * Create a rate-limited API response helper
 *
 * @param request - Next.js Request object
 * @param handler - The API handler to protect
 * @param config - Rate limit configuration
 * @returns Response object
 */
export function withRateLimit(
  request: Request,
  handler: () => Response | Promise<Response>,
  config: RateLimitConfig = {}
): Response | Promise<Response> {
  const identifier = config.identifier || getClientIdentifier(request)
  const result = rateLimit({ ...config, identifier })

  if (!result.success) {
    return Response.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          ...generateRateLimitHeaders(config.limit || 100, 0, result.resetTime),
          'Retry-After': String(result.retryAfter),
        },
      }
    )
  }

  // Add rate limit headers to successful responses
  const response = handler()

  // Handle both sync and async handlers
  if (response instanceof Response) {
    const headers = generateRateLimitHeaders(
      config.limit || 100,
      result.remaining,
      result.resetTime
    )
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // For async responses, we need to wrap it
  return response.then((res) => {
    const headers = generateRateLimitHeaders(
      config.limit || 100,
      result.remaining,
      result.resetTime
    )
    Object.entries(headers).forEach(([key, value]) => {
      res.headers.set(key, value)
    })
    return res
  })
}

/**
 * Stricter rate limits for sensitive operations
 */
export const SENSITIVE_RATE_LIMIT = {
  limit: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
} as const

/**
 * Standard rate limits for general API calls
 */
export const STANDARD_RATE_LIMIT = {
  limit: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
} as const

/**
 * Lenient rate limits for public endpoints
 */
export const PUBLIC_RATE_LIMIT = {
  limit: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
} as const
