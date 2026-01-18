/**
 * Toplu Mesaj Gönderme API
 * 
 * POST /api/workflows/send-bulk-message
 */

import { start } from 'workflow/api'
import { handleBulkMessage } from '@/workflows/bulk-message'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

export async function POST(request: Request) {
  // Auth kontrolü - sadece admin ve moderator gönderebilir
  const auth = await withAuth(undefined, {
    allowedRoles: ['admin', 'moderator']
  })
  
  if (!auth.success) {
    return auth.response!
  }
  
  try {
    const body = await request.json()
    
    const { messageType, content, subject, recipientFilter } = body
    
    if (!messageType || !content) {
      return NextResponse.json(
        { error: 'messageType ve content zorunludur' },
        { status: 400 }
      )
    }
    
    if (!['sms', 'email'].includes(messageType)) {
      return NextResponse.json(
        { error: 'messageType sms veya email olmalıdır' },
        { status: 400 }
      )
    }
    
    // Workflow'u başlat
    await start(handleBulkMessage, [{
      messageType,
      content,
      subject,
      recipientFilter: recipientFilter || {},
      senderId: auth.user!.id
    }])
    
    return NextResponse.json({
      success: true,
      message: `Toplu ${messageType} gönderim işlemi başlatıldı`
    })
  } catch (error) {
    console.error('Bulk message error:', error)
    return NextResponse.json(
      { error: 'Toplu mesaj gönderilemedi' },
      { status: 500 }
    )
  }
}
