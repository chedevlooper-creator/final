/**
 * Slack Mesaj Webhook
 * 
 * POST /api/workflows/slack/message
 * 
 * Slack'ten gelen mesajları workflow'a iletir
 */

import { resume } from 'workflow/api'
import { NextResponse } from 'next/server'

// Slack Events API için
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Slack URL verification challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge })
    }
    
    // Slack event
    if (body.type === 'event_callback') {
      const event = body.event
      
      // Sadece mesaj eventlerini işle
      if (event.type === 'message' && !event.bot_id) {
        const message = {
          channelId: event.channel,
          userId: event.user,
          userName: event.user, // Gerçek uygulamada users.info API'den çekilmeli
          text: event.text,
          timestamp: event.ts,
          threadTs: event.thread_ts
        }
        
        // Hook token'ı oluştur
        const hookToken = `slack:channel:${event.channel}`
        
        try {
          // Workflow'a mesajı ilet
          await resume(hookToken, message)
          
          return NextResponse.json({
            success: true,
            message: 'Message forwarded to workflow'
          })
        } catch (error) {
          // Hook bulunamadı - muhtemelen bu kanal için dinleyici yok
          console.log(`No active listener for channel: ${event.channel}`)
          return NextResponse.json({
            success: false,
            message: 'No active listener for this channel'
          })
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slack message webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook işlenemedi' },
      { status: 500 }
    )
  }
}
