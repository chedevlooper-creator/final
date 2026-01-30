/**
 * Next.js Middleware
 *
 * - Supabase session yönetimi
 * - Security headers ekler (CSP nonce ile)
 * - Request ID üretir (tracing için)
 * - CORS preflight desteği
 */

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { securityHeaders, generateCSPNonce, buildCSPHeader, corsConfig } from '@/lib/security'

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Check if an origin is allowed
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedOrigins = Array.isArray(corsConfig.origin)
    ? corsConfig.origin
    : [corsConfig.origin]

  // In development, allow any localhost origin
  if (process.env['NODE_ENV'] !== 'production' && origin.match(/^http:\/\/localhost:\d+$/)) {
    return true
  }

  return allowedOrigins.includes(origin)
}

/**
 * Add CORS headers to response
 */
function addCORSHeaders(request: NextRequest, response: NextResponse): void {
  const origin = request.headers.get('origin')

  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '))
  response.headers.set('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '))
  response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString())

  if (corsConfig.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
}

export async function proxy(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    addCORSHeaders(request, response)
    response.headers.set('X-Request-Id', generateRequestId())
    return response
  }

  // Generate CSP nonce for this request
  const nonce = generateCSPNonce()

  // First, handle Supabase session (this creates the initial response)
  const response = await updateSession(request)

  // Generate request ID
  const requestId = generateRequestId()

  // Add request ID for tracing
  response.headers.set('X-Request-Id', requestId)

  // Add CORS headers
  addCORSHeaders(request, response)

  // Add security headers (skip CSP - we'll set it with nonce)
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (key === 'Content-Security-Policy') {
      return
    }
    response.headers.set(key, value)
  })

  // Set CSP header with nonce in production
  if (process.env['NODE_ENV'] === 'production') {
    const cspHeader = buildCSPHeader(nonce)
    response.headers.set('Content-Security-Policy', cspHeader)
  }

  // Add nonce to response header for client components
  response.headers.set('X-Nonce', nonce)

  return response
}

/**
 * Matcher config
 * - API routes
 * - Page routes (excluding static files)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot|css|js|map)).*)',
  ],
}
