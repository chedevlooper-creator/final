/**
 * Yardım Başvurusu Onaylama API
 * 
 * POST /api/workflows/approve-application
 */

import { start } from 'workflow/api'
import { handleApplicationApproval } from '@/workflows/application-approval'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

export async function POST(request: Request) {
  // Auth kontrolü
  const auth = await withAuth(undefined, {
    requiredPermission: 'approve_applications'
  })
  
  if (!auth.success) {
    return auth.response!
  }
  
  try {
    const body = await request.json()
    
    const { applicationId, needyPersonId, applicationType, amount } = body
    
    if (!applicationId || !needyPersonId || !applicationType) {
      return NextResponse.json(
        { error: 'applicationId, needyPersonId ve applicationType zorunludur' },
        { status: 400 }
      )
    }
    
    // Workflow'u başlat (asenkron çalışır, bloklamaz)
    await start(handleApplicationApproval, [{
      id: applicationId,
      needyPersonId,
      applicationType,
      amount,
      approvedBy: auth.user!.id
    }])
    
    return NextResponse.json({
      success: true,
      message: 'Başvuru onay işlemi başlatıldı',
      applicationId
    })
  } catch (error) {
    console.error('Application approval error:', error)
    return NextResponse.json(
      { error: 'Onay işlemi başlatılamadı' },
      { status: 500 }
    )
  }
}
