/**
 * Tests for messaging providers
 */

import { describe, it, expect, vi } from 'vitest'
import {
  TwilioProvider,
  NetGSMProvider,
  MockSMSProvider,
  getSMSProvider,
} from '@/lib/messaging/sms.provider'
import {
  ResendProvider,
  SendGridProvider,
  MockEmailProvider,
  getEmailProvider,
} from '@/lib/messaging/email.provider'

describe('SMS Providers', () => {
  describe('MockSMSProvider', () => {
    it('should successfully send SMS', async () => {
      const provider = new MockSMSProvider()
      const result = await provider.sendSMS('05551234567', 'Test message')

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should send bulk SMS', async () => {
      const provider = new MockSMSProvider()
      const messages = [
        { to: '05551234567', message: 'Test 1' },
        { to: '05551234568', message: 'Test 2' },
      ]

      const results = await provider.sendBulkSMS(messages)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
    })
  })

  describe('TwilioProvider', () => {
    it('should create TwilioProvider with default constructor', () => {
      const provider = new TwilioProvider()
      expect(provider).toBeInstanceOf(TwilioProvider)
    })
  })

  describe('NetGSMProvider', () => {
    it('should create NetGSMProvider with default constructor', () => {
      const provider = new NetGSMProvider()
      expect(provider).toBeInstanceOf(NetGSMProvider)
    })
  })

  describe('getSMSProvider', () => {
    it('should return MockSMSProvider by default', () => {
      const provider = getSMSProvider()
      expect(provider).toBeInstanceOf(MockSMSProvider)
    })

    it('should return TwilioProvider when configured', () => {
      process.env['SMS_PROVIDER'] = 'twilio'

      const provider = getSMSProvider()

      expect(provider).toBeInstanceOf(TwilioProvider)

      delete process.env['SMS_PROVIDER']
    })
  })
})

describe('Email Providers', () => {
  describe('MockEmailProvider', () => {
    it('should successfully send email', async () => {
      const provider = new MockEmailProvider()
      const result = await provider.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should send bulk emails', async () => {
      const provider = new MockEmailProvider()
      const emails = [
        { to: 'test1@example.com', subject: 'Test 1', html: '<p>Test 1</p>' },
        { to: 'test2@example.com', subject: 'Test 2', html: '<p>Test 2</p>' },
      ]

      const results = await provider.sendBulkEmail(emails)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
    })
  })

  describe('ResendProvider', () => {
    it('should create ResendProvider with default constructor', () => {
      const provider = new ResendProvider()
      expect(provider).toBeInstanceOf(ResendProvider)
    })
  })

  describe('SendGridProvider', () => {
    it('should create SendGridProvider with default constructor', () => {
      const provider = new SendGridProvider()
      expect(provider).toBeInstanceOf(SendGridProvider)
    })
  })

  describe('getEmailProvider', () => {
    it('should return MockEmailProvider by default', () => {
      const provider = getEmailProvider()
      expect(provider).toBeInstanceOf(MockEmailProvider)
    })

    it('should return ResendProvider when configured', () => {
      process.env['EMAIL_PROVIDER'] = 'resend'

      const provider = getEmailProvider()

      expect(provider).toBeInstanceOf(ResendProvider)

      delete process.env['EMAIL_PROVIDER']
    })
  })
})
