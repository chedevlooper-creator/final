/**
 * SMS Provider Interface and Implementations
 * Supports multiple SMS service providers
 */

export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<SMSResult>
  sendBulkSMS(messages: Array<{ to: string; message: string }>): Promise<SMSResult[]>
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  to: string
}

/**
 * Twilio SMS Provider
 */
export class TwilioProvider implements SMSProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string
  private apiUrl: string

  constructor() {
    this.accountSid = process.env['TWILIO_ACCOUNT_SID'] || ''
    this.authToken = process.env['TWILIO_AUTH_TOKEN'] || ''
    this.fromNumber = process.env['TWILIO_FROM_NUMBER'] || ''
    this.apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    if (!this.accountSid || !this.authToken) {
      return {
        success: false,
        to,
        error: 'Twilio credentials not configured',
      }
    }

    try {
      const body = new URLSearchParams({
        From: this.fromNumber,
        To: to,
        Body: message,
      })

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
        },
        body,
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: data.sid,
          to,
        }
      }

      return {
        success: false,
        to,
        error: data.message || 'Twilio API error',
      }
    } catch (error) {
      return {
        success: false,
        to,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendBulkSMS(messages: Array<{ to: string; message: string }>): Promise<SMSResult[]> {
    return Promise.all(messages.map((msg) => this.sendSMS(msg.to, msg.message)))
  }
}

/**
 * NetGSM SMS Provider (Turkish SMS provider)
 */
export class NetGSMProvider implements SMSProvider {
  private username: string
  private password: string
  private apiUrl: string

  constructor() {
    this.username = process.env['NETGSM_USERNAME'] || ''
    this.password = process.env['NETGSM_PASSWORD'] || ''
    this.apiUrl = process.env['NETGSM_API_URL'] || 'https://api.netgsm.com.tr/sms/send/get'
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    if (!this.username || !this.password) {
      return {
        success: false,
        to,
        error: 'NetGSM credentials not configured',
      }
    }

    try {
      const body = new URLSearchParams({
        usercode: this.username,
        password: this.password,
        gsmno: to,
        message,
        msgheader: 'YARDIM', // Sender name
      })

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })

      const text = await response.text()

      if (text.startsWith('00') || text.startsWith('01') || text.startsWith('02')) {
        return {
          success: true,
          messageId: text.substring(2),
          to,
        }
      }

      return {
        success: false,
        to,
        error: `NetGSM error: ${text}`,
      }
    } catch (error) {
      return {
        success: false,
        to,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendBulkSMS(messages: Array<{ to: string; message: string }>): Promise<SMSResult[]> {
    // NetGSM bulk SMS implementation
    const results: SMSResult[] = []

    // Process in batches of 100 (NetGSM limit)
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100)
      const batchResults = await Promise.all(
        batch.map((msg) => this.sendSMS(msg.to, msg.message))
      )
      results.push(...batchResults)
    }

    return results
  }
}

/**
 * Mock SMS Provider for testing
 */
export class MockSMSProvider implements SMSProvider {
  async sendSMS(to: string, message: string): Promise<SMSResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    console.log(`[Mock SMS] To: ${to}, Message: ${message}`)

    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      to,
    }
  }

  async sendBulkSMS(messages: Array<{ to: string; message: string }>): Promise<SMSResult[]> {
    return Promise.all(messages.map((msg) => this.sendSMS(msg.to, msg.message)))
  }
}

/**
 * SMS Provider Factory
 */
export function getSMSProvider(): SMSProvider {
  const provider = process.env['SMS_PROVIDER'] || 'mock'

  switch (provider) {
    case 'twilio':
      return new TwilioProvider()
    case 'netgsm':
      return new NetGSMProvider()
    case 'mock':
    default:
      return new MockSMSProvider()
  }
}
