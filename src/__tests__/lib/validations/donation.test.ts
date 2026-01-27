import { describe, it, expect } from 'vitest'
import { donationSchema } from '@/lib/validations/donation'

describe('Donation Validation Schema', () => {
  describe('Basic Validation', () => {
    it('should validate a complete donation', () => {
      const validData = {
        donor_name: 'Ahmet Yılmaz',
        donor_phone: '05551234567',
        donor_email: 'ahmet@example.com',
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: 'bank_transfer' as const,
        description: 'Aylık bağış',
        notes: 'Düzenli bağışçı',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate minimal required fields', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 500,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Donation Type Validation', () => {
    it('should accept all valid donation types', () => {
      const types = ['cash', 'in_kind', 'sacrifice', 'zakat', 'fitre', 'sadaka']
      
      types.forEach(type => {
        const validData = {
          donation_type: type,
          amount: 1000,
          currency: 'TRY' as const,
        }
        const result = donationSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid donation type', () => {
      const invalidData = {
        donation_type: 'invalid_type',
        amount: 1000,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require donation_type', () => {
      const invalidData = {
        amount: 1000,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Amount Validation', () => {
    it('should accept positive amounts', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept zero amount', () => {
      const validData = {
        donation_type: 'in_kind' as const,
        amount: 0,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject negative amounts', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        amount: -100,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('0\'dan büyük olmalı')
      }
    })

    it('should accept decimal amounts', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1234.56,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require amount field', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Currency Validation', () => {
    it('should accept TRY currency', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept USD currency', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 100,
        currency: 'USD' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept EUR currency', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 100,
        currency: 'EUR' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept GBP currency', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 100,
        currency: 'GBP' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid currency', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'JPY',
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require currency field', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        amount: 1000,
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Payment Method Validation', () => {
    it('should accept cash payment method', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: 'cash' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept bank_transfer payment method', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: 'bank_transfer' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept credit_card payment method', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: 'credit_card' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept online payment method', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: 'online' as const,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid payment method', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: 'invalid_method',
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept null payment method', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        payment_method: null,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Donor Information Validation', () => {
    it('should accept valid donor email', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        donor_email: 'donor@example.com',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid donor email', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        donor_email: 'invalid-email',
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Geçersiz e-posta')
      }
    })

    it('should accept null donor email', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        donor_email: null,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept donor name and phone', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        donor_name: 'Ahmet Yılmaz',
        donor_phone: '05551234567',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept null donor name and phone', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        donor_name: null,
        donor_phone: null,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Optional Fields', () => {
    it('should accept category_id as UUID', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        category_id: '123e4567-e89b-12d3-a456-426614174000',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID for category_id', () => {
      const invalidData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        category_id: 'invalid-uuid',
      }
      const result = donationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept description and notes', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        description: 'Monthly donation',
        notes: 'Regular donor',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept null description and notes', () => {
      const validData = {
        donation_type: 'cash' as const,
        amount: 1000,
        currency: 'TRY' as const,
        description: null,
        notes: null,
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should validate a sacrifice donation', () => {
      const validData = {
        donor_name: 'Mehmet Demir',
        donor_phone: '05559876543',
        donation_type: 'sacrifice' as const,
        amount: 5000,
        currency: 'TRY' as const,
        payment_method: 'bank_transfer' as const,
        description: 'Kurban bağışı - 2024',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate a zakat donation', () => {
      const validData = {
        donor_name: 'Ayşe Kaya',
        donor_email: 'ayse@example.com',
        donation_type: 'zakat' as const,
        amount: 10000,
        currency: 'TRY' as const,
        payment_method: 'online' as const,
        description: 'Yıllık zekat',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate an in-kind donation', () => {
      const validData = {
        donor_name: 'Ali Yıldız',
        donation_type: 'in_kind' as const,
        amount: 0,
        currency: 'TRY' as const,
        description: 'Gıda kolisi - 50 adet',
        notes: 'Ramazan ayı için',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate a foreign currency donation', () => {
      const validData = {
        donor_name: 'John Smith',
        donor_email: 'john@example.com',
        donation_type: 'cash' as const,
        amount: 500,
        currency: 'USD' as const,
        payment_method: 'credit_card' as const,
        description: 'International donation',
      }
      const result = donationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
