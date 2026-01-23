/**
 * Bulk SMS Sending API Route
 * POST /api/messages/send-sms
 *
 * Handles bulk SMS sending by queueing messages and triggering delivery
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const { recipients, message, messageType } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Insert SMS messages into the database
    const { data: smsData, error: insertError } = await supabase
      .from('sms_messages')
      .insert(
        recipients.map((phone: string) => ({
          phone,
          message,
          message_type: messageType || 'bulk',
          status: 'pending',
          sent_at: new Date().toISOString(),
        }))
      )
      .select()

    if (insertError) {
      console.error('Error inserting SMS messages:', insertError)
      return NextResponse.json(
        { error: 'Failed to queue SMS messages' },
        { status: 500 }
      )
    }

    // TODO: Integrate with SMS service provider (e.g., Twilio, MessageBird)
    // For now, messages are queued with 'pending' status
    // In production, you would:
    // 1. Call the SMS provider API
    // 2. Update status based on provider response
    // 3. Handle retries for failed messages

    // Example integration pattern (commented out):
    // const { data: { user } } = await supabase.auth.getUser()
    // const smsResults = await sendViaProvider(recipients, message)
    // await supabase.from('sms_messages').update({
    //   status: smsResults.status,
    //   provider_message_id: smsResults.messageId,
    //   sent_at: new Date().toISOString()
    // }).eq('id', smsData.id)

    return NextResponse.json({
      success: true,
      queued: smsData?.length || 0,
      message: 'SMS messages queued successfully',
    })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
