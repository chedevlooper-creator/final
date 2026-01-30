/**
 * Tests for donation validation schema
 * src/lib/validations/donation.ts
 */

import { describe, it, expect } from 'vitest'
import { donationSchema, DONATION_TYPES } from '@/lib/validations/donation'

describe('donationSchema', () => {
  const validDonation = {
    donation_type: 'cash' as const,
    amount: 1000,
    currency: 'TRY' as const,
  }

  it('should accept valid minimal donation', () => {
    const result = donationSchema.safeParse(validDonation)
    expect(result.success).toBe(true)
  })

  it('should accept donation with all optional fields', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      donor_name: 'Ahmet Yılmaz',
      donor_phone: '05551234567',
      donor_email: 'ahmet@example.com',
      payment_method: 'bank_transfer',
      description: 'Zekat bağışı',
      notes: 'Aylık düzenli bağış',
      category_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  // donation_type
  it('should require donation_type', () => {
    const { donation_type, ...rest } = validDonation
    const result = donationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('should accept all valid donation types', () => {
    const types = ['cash', 'in_kind', 'sacrifice', 'zakat', 'fitre', 'sadaka'] as const
    for (const donation_type of types) {
      const result = donationSchema.safeParse({ ...validDonation, donation_type })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid donation_type', () => {
    const result = donationSchema.safeParse({ ...validDonation, donation_type: 'invalid' })
    expect(result.success).toBe(false)
  })

  // amount
  it('should require amount', () => {
    const { amount, ...rest } = validDonation
    const result = donationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('should reject negative amount', () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: -100 })
    expect(result.success).toBe(false)
  })

  it('should accept zero amount', () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: 0 })
    expect(result.success).toBe(true)
  })

  it('should accept decimal amounts', () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: 99.99 })
    expect(result.success).toBe(true)
  })

  // currency
  it('should require currency', () => {
    const { currency, ...rest } = validDonation
    const result = donationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('should accept all valid currencies', () => {
    for (const currency of ['TRY', 'USD', 'EUR', 'GBP'] as const) {
      const result = donationSchema.safeParse({ ...validDonation, currency })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid currency', () => {
    const result = donationSchema.safeParse({ ...validDonation, currency: 'JPY' })
    expect(result.success).toBe(false)
  })

  // payment_method
  it('should accept valid payment methods', () => {
    for (const payment_method of ['cash', 'bank_transfer', 'credit_card', 'online'] as const) {
      const result = donationSchema.safeParse({ ...validDonation, payment_method })
      expect(result.success).toBe(true)
    }
  })

  it('should accept null payment_method', () => {
    const result = donationSchema.safeParse({ ...validDonation, payment_method: null })
    expect(result.success).toBe(true)
  })

  // donor_email
  it('should reject invalid donor_email', () => {
    const result = donationSchema.safeParse({ ...validDonation, donor_email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('should accept null donor_email', () => {
    const result = donationSchema.safeParse({ ...validDonation, donor_email: null })
    expect(result.success).toBe(true)
  })

  // Optional strings
  it('should accept null for all optional string fields', () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      donor_name: null,
      donor_phone: null,
      donor_email: null,
      description: null,
      notes: null,
      category_id: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('DONATION_TYPES', () => {
  it('should have 6 donation types', () => {
    expect(DONATION_TYPES).toHaveLength(6)
  })

  it('should have value and label for each type', () => {
    for (const type of DONATION_TYPES) {
      expect(type).toHaveProperty('value')
      expect(type).toHaveProperty('label')
      expect(typeof type.value).toBe('string')
      expect(typeof type.label).toBe('string')
    }
  })

  it('should include all expected types', () => {
    const values = DONATION_TYPES.map(t => t.value)
    expect(values).toContain('cash')
    expect(values).toContain('in_kind')
    expect(values).toContain('sacrifice')
    expect(values).toContain('zakat')
    expect(values).toContain('fitre')
    expect(values).toContain('sadaka')
  })
})
