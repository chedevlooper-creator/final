/**
 * Email Provider Interface and Implementations
 * Supports multiple email service providers
 */

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<EmailResult>
  sendBulkEmail(messages: EmailOptions[]): Promise<EmailResult[]>
}

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  to: string
}

/**
 * Resend Email Provider
 */
export class ResendProvider implements EmailProvider {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = process.env['RESEND_API_KEY'] || ''
    this.apiUrl = 'https://api.resend.com/emails'
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.apiKey) {
      return {
        success: false,
        to: options.to,
        error: 'Resend API key not configured',
      }
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || 'Yardım Yönetim Paneli <noreply@example.com>',
          to: options.to,
          subject: options.subject,
          html: options.html || options.text || '',
          text: options.text,
          reply_to: options.replyTo,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: data.id,
          to: options.to,
        }
      }

      return {
        success: false,
        to: options.to,
        error: data.message || 'Resend API error',
      }
    } catch (error) {
      return {
        success: false,
        to: options.to,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendBulkEmail(messages: EmailOptions[]): Promise<EmailResult[]> {
    return Promise.all(messages.map((msg) => this.sendEmail(msg)))
  }
}

/**
 * SendGrid Email Provider
 */
export class SendGridProvider implements EmailProvider {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = process.env['SENDGRID_API_KEY'] || ''
    this.apiUrl = 'https://api.sendgrid.com/v3/mail/send'
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.apiKey) {
      return {
        success: false,
        to: options.to,
        error: 'SendGrid API key not configured',
      }
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: {
            email: options.from?.match(/<(.+)>/)?.[1] || options.from || 'noreply@example.com',
            name: options.from?.match(/(.+)\s*</)?.[1] || 'Yardım Yönetim Paneli',
          },
          content: [
            {
              type: 'text/html',
              value: options.html || options.text || '',
            },
          ],
          reply_to: options.replyTo,
        }),
      })

      // SendGrid returns 202 on success
      if (response.status === 202) {
        // Extract X-Message-Id from headers if available
        const messageId = response.headers.get('X-Message-Id')

        return {
          success: true,
          messageId: messageId || undefined,
          to: options.to,
        }
      }

      const data = await response.json()
      return {
        success: false,
        to: options.to,
        error: data.errors?.[0]?.message || 'SendGrid API error',
      }
    } catch (error) {
      return {
        success: false,
        to: options.to,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendBulkEmail(messages: EmailOptions[]): Promise<EmailResult[]> {
    return Promise.all(messages.map((msg) => this.sendEmail(msg)))
  }
}

/**
 * Mock Email Provider for testing
 */
export class MockEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    console.log(`[Mock Email] To: ${options.to}, Subject: ${options.subject}`)

    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      to: options.to,
    }
  }

  async sendBulkEmail(messages: EmailOptions[]): Promise<EmailResult[]> {
    return Promise.all(messages.map((msg) => this.sendEmail(msg)))
  }
}

/**
 * Email Provider Factory
 */
export function getEmailProvider(): EmailProvider {
  const provider = process.env['EMAIL_PROVIDER'] || 'mock'

  switch (provider) {
    case 'resend':
      return new ResendProvider()
    case 'sendgrid':
      return new SendGridProvider()
    case 'mock':
    default:
      return new MockEmailProvider()
  }
}
