/**
 * Bulk Email Sending API Route
 * POST /api/messages/send-email
 *
 * Handles bulk email sending by queueing messages and triggering delivery
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { getEmailProvider, type EmailOptions } from '@/lib/messaging/email.provider'
import { rateLimit, getUserKey, createRateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, {
      identifier: 'email',
      limit: 50,
      window: 60 * 60 * 1000,
      keyGenerator: getUserKey,
    })

    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        'Saatlik email gönderme limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.'
      )
    }

    // RBAC: Email gönderme için create permission gerekli
    const authResult = await withOrgAuth(request, {
      requiredPermission: 'data:create',
    })

    if (!authResult.success) {
      return createOrgErrorResponse(authResult.error, authResult.status)
    }

    const orgId = authResult.user.organization.id
    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const { recipients, subject, message, html, messageType, from, replyTo } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required', code: 'MISSING_RECIPIENTS' },
        { status: 400 }
      )
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { error: 'Subject is required', code: 'MISSING_SUBJECT' },
        { status: 400 }
      )
    }

    if (!message && !html) {
      return NextResponse.json(
        { error: 'Message content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      )
    }

    // Insert email messages into the database
    const { data: emailData, error: insertError } = await supabase
      .from('email_messages')
      .insert(
        recipients.map((email: string) => ({
          email,
          subject,
          message: message || html,
          message_type: messageType || 'bulk',
          status: 'pending',
          sent_at: new Date().toISOString(),
          organization_id: orgId,
        }))
      )
      .select()

    if (insertError) {
      console.error('Error inserting email messages:', insertError)
      return NextResponse.json(
        { error: 'Failed to queue email messages', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Send email via configured provider
    const emailProvider = getEmailProvider()
    const emailOptions: EmailOptions[] = recipients.map((email: string) => ({
      to: email,
      subject,
      html,
      text: message,
      from,
      replyTo,
    }))

    const emailResults = await emailProvider.sendBulkEmail(emailOptions)

    // Update status based on provider results
    for (let i = 0; i < emailData.length; i++) {
      const result = emailResults[i]
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
        .from('email_messages')
        .update(updateData)
        .eq('id', emailData[i].id)
    }

    const successCount = emailResults.filter((r) => r.success).length
    const failCount = emailResults.filter((r) => !r.success).length

    return NextResponse.json(
      {
        success: true,
        queued: emailData?.length || 0,
        sent: successCount,
        failed: failCount,
        message: `Email processing completed: ${successCount} sent, ${failCount} failed`,
      },
      { headers: rateLimitResult.headers }
    )
  } catch (error) {
    console.error('Email send error:', error)
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
