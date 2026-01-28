/**
 * Bulk Email Sending API Route
 * POST /api/messages/send-email
 *
 * Handles bulk email sending by queueing messages and triggering delivery
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'
import { getEmailProvider, type EmailOptions } from '@/lib/messaging/email.provider'

/**
 * HTML içeriğini sanitize eder - XSS koruması
 * Sadece güvenli HTML etiketlerine izin verir
 */
function sanitizeHtml(html: string): string {
  // Güvenli HTML etiketleri ve özellikleri
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'div', 'span'
  ]

  const allowedAttributes = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height'],
    '*': ['class', 'style'] // Sınırlı style kullanımı
  }

  // Script ve olay handler'larını temizle
  let sanitized = html

  // <script> etiketlerini kaldır
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Olay handler'larını kaldır (onclick, onerror, vb.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')

  // javascript: protokolünü kaldır
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
  sanitized = sanitized.replace(/href\s*=\s*javascript:[^\s>]*/gi, 'href="#"')

  // Data URL'leri kaldır (XSS riski)
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')
  sanitized = sanitized.replace(/src\s*=\s*data:[^\s>]*/gi, 'src=""')

  // VML ve SVG XSS koruması
  sanitized = sanitized.replace(/<vml:[^>]*>.*?<\/vml:[^>]*>/gi, '')
  sanitized = sanitized.replace(/<svg[^>]*>.*?<\/svg>/gi, '')

  // İfade ve eval içeriklerini temizle
  sanitized = sanitized.replace(/&#[xX][0-9a-fA-F]+;?/g, '') // Hex entities
  sanitized = sanitized.replace(/&#\d+;?/g, '') // Decimal entities

  return sanitized
}

/**
 * E-posta adresini validate eder
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    // RBAC: Email gönderme için create permission gerekli
    const authResult = await withAuth(request, {
      requiredPermission: 'create',
      resource: 'donations',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const { recipients, subject, message, html, messageType, from, replyTo } = body

    // Recipients validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required', code: 'MISSING_RECIPIENTS' },
        { status: 400 }
      )
    }

    // Her bir e-posta adresini validate et
    const validRecipients = recipients.filter((email: string) => {
      if (typeof email !== 'string' || !isValidEmail(email)) {
        console.warn(`Invalid email address skipped: ${email}`)
        return false
      }
      return true
    })

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses provided', code: 'INVALID_RECIPIENTS' },
        { status: 400 }
      )
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { error: 'Subject is required', code: 'MISSING_SUBJECT' },
        { status: 400 }
      )
    }

    // Subject uzunluk limiti
    if (subject.length > 500) {
      return NextResponse.json(
        { error: 'Subject too long (max 500 characters)', code: 'SUBJECT_TOO_LONG' },
        { status: 400 }
      )
    }

    if (!message && !html) {
      return NextResponse.json(
        { error: 'Message content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      )
    }

    // HTML varsa sanitize et
    let safeHtml = html
    if (html && typeof html === 'string') {
      safeHtml = sanitizeHtml(html)
    }

    // Message uzunluk limiti
    if (message && message.length > 100000) {
      return NextResponse.json(
        { error: 'Message too long (max 100KB)', code: 'MESSAGE_TOO_LONG' },
        { status: 400 }
      )
    }

    // Insert email messages into the database
    const { data: emailData, error: insertError } = await supabase
      .from('email_messages')
      .insert(
        validRecipients.map((email: string) => ({
          email,
          subject,
          message: message || safeHtml,
          message_type: messageType || 'bulk',
          status: 'pending',
          sent_at: new Date().toISOString(),
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

    // Send email via configured provider (sanitize edilmiş HTML ile)
    const emailProvider = getEmailProvider()
    const emailOptions: EmailOptions[] = validRecipients.map((email: string) => ({
      to: email,
      subject,
      html: safeHtml,
      text: message,
      from,
      replyTo,
    }))

    const emailResults = await emailProvider.sendBulkEmail(emailOptions)

    // Log array length mismatch for debugging
    if (emailResults.length !== emailData.length) {
      console.warn(`Email results length mismatch: expected ${emailData.length}, got ${emailResults.length}`)
    }

    // Update status based on provider results
    for (let i = 0; i < emailData.length; i++) {
      const result = emailResults[i]
      
      // Skip if result is undefined (array length mismatch)
      if (!result) {
        await supabase
          .from('email_messages')
          .update({ status: 'failed', error_message: 'Provider result missing' })
          .eq('id', emailData[i].id)
        continue
      }
      
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

    return NextResponse.json({
      success: true,
      queued: emailData?.length || 0,
      sent: successCount,
      failed: failCount,
      message: `Email processing completed: ${successCount} sent, ${failCount} failed`,
    })
  } catch (_error) {
    console.error('Email send error:', _error)
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
