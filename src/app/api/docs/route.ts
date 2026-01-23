import { NextResponse } from 'next/server'
import { apiDocsConfig } from '@/lib/api-docs'

/**
 * GET /api/docs
 * 
 * OpenAPI/Swagger specification endpoint
 * 
 * @returns OpenAPI 3.0 specification
 */
export async function GET() {
  return NextResponse.json(apiDocsConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

/**
 * OPTIONS /api/docs
 * 
 * CORS preflight request
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
