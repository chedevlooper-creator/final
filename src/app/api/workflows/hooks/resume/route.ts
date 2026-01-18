/**
 * Hook Resume API
 * 
 * POST /api/workflows/hooks/resume
 * 
 * Bu endpoint, bekleyen workflow hook'larını tetikler.
 * Örneğin: Onay bekleyen bir başvuruyu onaylamak veya reddetmek
 */

import { resume } from 'workflow/api'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

export async function POST(request: Request) {
  // Auth kontrolü
  const auth = await withAuth(undefined, {
    allowedRoles: ['admin', 'moderator']
  })
  
  if (!auth.success) {
    return auth.response!
  }
  
  try {
    const body = await request.json()
    
    const { token, payload } = body
    
    if (!token) {
      return NextResponse.json(
        { error: 'token zorunludur' },
        { status: 400 }
      )
    }
    
    // Payload'a onaylayan bilgisini ekle
    const enrichedPayload = {
      ...payload,
      approvedBy: auth.user!.id,
      approvedAt: new Date().toISOString()
    }
    
    // Hook'u resume et
    await resume(token, enrichedPayload)
    
    return NextResponse.json({
      success: true,
      message: 'Hook başarıyla tetiklendi',
      token
    })
  } catch (error) {
    console.error('Hook resume error:', error)
    return NextResponse.json(
      { error: 'Hook tetiklenemedi' },
      { status: 500 }
    )
  }
}
