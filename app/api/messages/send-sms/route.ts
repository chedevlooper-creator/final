/**
 * Bulk SMS Sending API Route
 * POST /api/messages/send-sms
 *
 * Handles bulk SMS sending by queueing messages and triggering delivery
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'
import { getSMSProvider } from '@/lib/messaging/sms.provider'
import { rateLimit, getUserKey, createRateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, {
      identifier: 'sms',
      limit: 20,
      window: 60 * 60 * 1000,
      keyGenerator: getUserKey,
    })

    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        'Saatlik SMS gönderme limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.'
      )
    }

    // RBAC: SMS gönderme için create permission gerekli
    const authResult = await withAuth(request, {
      requiredPermission: 'create',
      resource: 'donations',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const { recipients, message, messageType } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required', code: 'MISSING_RECIPIENTS' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required', code: 'MISSING_MESSAGE' },
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
        { error: 'Failed to queue SMS messages', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Send SMS via configured provider
    const smsProvider = getSMSProvider()
    const smsResults = await smsProvider.sendBulkSMS(
      recipients.map((phone: string) => ({ to: phone, message }))
    )

    // Update status based on provider results
    for (let i = 0; i < smsData.length; i++) {
      const result = smsResults[i]
      const updateData: {
        status: string
        provider_message_id?: string
        error_message?: string
      } = {
        status: result.success ? 'sent' : 'failed',
      }

      if (result.messageId) {
        updateData.provider_message_id = result.messageId
      }

      if (result.error) {
        updateData.error_message = result.error
      }

      await supabase
        .from('sms_messages')
        .update(updateData)
        .eq('id', smsData[i].id)
    }

    const successCount = smsResults.filter((r) => r.success).length
    const failCount = smsResults.filter((r) => !r.success).length

    return NextResponse.json(
      {
        success: true,
        queued: smsData?.length || 0,
        sent: successCount,
        failed: failCount,
        message: `SMS processing completed: ${successCount} sent, ${failCount} failed`,
      },
      { headers: rateLimitResult.headers }
    )
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  })
}
