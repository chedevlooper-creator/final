/**
 * Çift Onaylı Başvuru Workflow API
 * 
 * POST /api/workflows/dual-approval
 */

import { start } from 'workflow/api'
import { handleDualApprovalApplication } from '@/workflows/approval-with-hook'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

export async function POST(request: Request) {
  // Auth kontrolü
  const auth = await withAuth(undefined, {
    requiredPermission: 'create'
  })
  
  if (!auth.success) {
    return auth.response!
  }
  
  try {
    const body = await request.json()
    
    const { 
      applicationId,
      needyPersonId, 
      applicationType, 
      requestedAmount,
      description 
    } = body
    
    if (!needyPersonId || !applicationType || !requestedAmount) {
      return NextResponse.json(
        { error: 'needyPersonId, applicationType ve requestedAmount zorunludur' },
        { status: 400 }
      )
    }
    
    const id = applicationId || crypto.randomUUID()
    
    // Workflow'u başlat
    await start(handleDualApprovalApplication, [{
      id,
      needyPersonId,
      applicationType,
      requestedAmount,
      description: description || '',
      submittedBy: auth.user!.id
    }])
    
    return NextResponse.json({
      success: true,
      message: 'Çift onay süreci başlatıldı',
      applicationId: id,
      approvalTokens: {
        first: `approval:first:${id}`,
        second: `approval:second:${id}`
      }
    })
  } catch (error) {
    console.error('Dual approval workflow error:', error)
    return NextResponse.json(
      { error: 'Workflow başlatılamadı' },
      { status: 500 }
    )
  }
}
