/**
 * Slack Entegrasyon API
 * 
 * POST /api/workflows/slack - Kanal dinlemeyi başlat
 * POST /api/workflows/slack/message - Mesaj gönder (hook resume)
 */

import { start, resume } from 'workflow/api'
import { handleSlackChannel } from '@/workflows/slack-integration'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

// Slack kanal dinlemeyi başlat
export async function POST(request: Request) {
  const auth = await withAuth(undefined, {
    allowedRoles: ['admin']
  })
  
  if (!auth.success) {
    return auth.response!
  }
  
  try {
    const body = await request.json()
    const { channelId } = body
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId zorunludur' },
        { status: 400 }
      )
    }
    
    // Slack listener workflow'unu başlat
    await start(handleSlackChannel, [channelId])
    
    return NextResponse.json({
      success: true,
      message: 'Slack kanal dinleme başlatıldı',
      channelId,
      hookToken: `slack:channel:${channelId}`
    })
  } catch (error) {
    console.error('Slack workflow error:', error)
    return NextResponse.json(
      { error: 'Slack entegrasyonu başlatılamadı' },
      { status: 500 }
    )
  }
}
