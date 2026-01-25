/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API routes
 * For production with multiple instances, use Redis-based solution (Upstash)
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
  maxCacheSize?: number // Maximum cache entries (default: 10000)
}

class RateLimiter {
  private cache: Map<string, number[]>
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.cache = new Map()
    this.config = {
      ...config,
      maxCacheSize: config.maxCacheSize || 10000
    }
  }

  check(identifier: string, limit: number): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const windowStart = now - this.config.interval

    // Get or create token bucket for this identifier
    const tokens = this.cache.get(identifier) || []
    
    // Remove expired tokens
    const validTokens = tokens.filter(timestamp => timestamp > windowStart)
    
    // Check if limit exceeded
    if (validTokens.length >= limit) {
      const oldestToken = validTokens[0]
      const resetAt = oldestToken + this.config.interval
      
      return {
        success: false,
        remaining: 0,
        resetAt
      }
    }

    // Add new token
    validTokens.push(now)
    this.cache.set(identifier, validTokens)

    // Cleanup old entries if cache is too large
    if (this.cache.size > (this.config.maxCacheSize || 10000)) {
      this.cleanup(windowStart)
    }

    return {
      success: true,
      remaining: limit - validTokens.length,
      resetAt: now + this.config.interval
    }
  }

  private cleanup(windowStart: number): void {
    for (const [key, tokens] of this.cache.entries()) {
      const validTokens = tokens.filter(timestamp => timestamp > windowStart)
      if (validTokens.length === 0) {
        this.cache.delete(key)
      } else {
        this.cache.set(key, validTokens)
      }
    }
  }

  reset(identifier: string): void {
    this.cache.delete(identifier)
  }
}

// Export rate limiter instances with different configs
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

export const strictRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute  
  uniqueTokenPerInterval: 100
})

/**
 * Rate limit middleware for API routes
 * 
 * @example
 * ```typescript
 * import { rateLimit } from '@/lib/rate-limit'
 * 
 * export async function GET(request: Request) {
 *   const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
 *   const result = rateLimit(identifier, 10) // 10 requests per minute
 *   
 *   if (!result.success) {
 *     return new Response('Too many requests', { 
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': '10',
 *         'X-RateLimit-Remaining': '0',
 *         'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
 *       }
 *     })
 *   }
 *   
 *   // Process request...
 * }
 * ```
 */
export function rateLimit(
  identifier: string,
  limit: number = 60,
  limiter: RateLimiter = apiRateLimiter
) {
  return limiter.check(identifier, limit)
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetAt).toISOString(),
    'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString()
  }
}

/**
 * Create rate limit error response
 */
export function rateLimitError(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      code: 'RATE_LIMIT_EXCEEDED'
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString()
      }
    }
  )
}
