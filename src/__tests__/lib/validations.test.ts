import { describe, it, expect } from '@jest/globals'
import { needyFormSchema } from '@/lib/validations/needy'

describe('Validation Schemas', () => {
  describe('needyFormSchema', () => {
    const validData = {
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      identity_number: '12345678901',
      phone: '5551234567',
      status: 'active',
    }

    it('should validate valid data', () => {
      const result = needyFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require first_name', () => {
      const data = { ...validData, first_name: '' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path[0] === 'first_name')).toBe(true)
      }
    })

    it('should require last_name', () => {
      const data = { ...validData, last_name: '' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path[0] === 'last_name')).toBe(true)
      }
    })

    it('should validate TC kimlik number (11 digits)', () => {
      const data = { ...validData, identity_number: '12345' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should validate valid TC kimlik', () => {
      const data = { ...validData, identity_number: '10000000146' } // Valid TC
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should validate status enum', () => {
      const invalidStatus = 'invalid_status' as any
      const data = { ...validData, status: invalidStatus }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive', 'pending', 'rejected']

      validStatuses.forEach((status) => {
        const data = { ...validData, status }
        const result = needyFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should handle partial data for updates', () => {
      const partialData = {
        first_name: 'Mehmet',
        status: 'inactive' as const,
      }

      const result = needyFormSchema.partial().safeParse(partialData)
      expect(result.success).toBe(true)
    })

    it('should validate email format when provided', () => {
      const data = { ...validData, email: 'invalid-email' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should accept valid email', () => {
      const data = { ...validData, email: 'test@example.com' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it('should handle Turkish characters in names', () => {
      const data = {
        ...validData,
        first_name: 'Çiğdem',
        last_name: 'Öztürk',
      }

      const result = needyFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate minimum first_name length', () => {
      const data = { ...validData, first_name: 'A' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path[0] === 'first_name')).toBe(true)
      }
    })

    it('should validate minimum last_name length', () => {
      const data = { ...validData, last_name: 'B' }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path[0] === 'last_name')).toBe(true)
      }
    })

    it('should validate identity_type enum', () => {
      const validTypes = ['tc', 'passport', 'other']

      validTypes.forEach((type) => {
        const data = { ...validData, identity_type: type as any }
        const result = needyFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should validate gender enum', () => {
      const validGenders = ['male', 'female']

      validGenders.forEach((gender) => {
        const data = { ...validData, gender: gender as any }
        const result = needyFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should handle nullable optional fields', () => {
      const minimalData = {
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
      }

      const result = needyFormSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })

    it('should validate monthly_income is non-negative', () => {
      const data = { ...validData, monthly_income: -100 }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should validate family_size minimum', () => {
      const data = { ...validData, family_size: 0 }
      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
    })

    it('should provide detailed error messages', () => {
      const data = {
        first_name: '',
        last_name: '',
        identity_number: '123',
        email: 'invalid',
      }

      const result = needyFormSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
        expect(result.error.issues[0].message).toBeTruthy()
      }
    })
  })

  describe('bankAccountSchema', () => {
    const validAccount = {
      needy_person_id: '123e4567-e89b-12d3-a456-426614174000',
      bank_name: 'Garanti',
      account_holder: 'Ahmet Yılmaz',
      iban: 'TR12 3456 7890 1234 5678 9012 34',
      is_primary: true,
    }

    it('should validate valid IBAN', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const result = bankAccountSchema.safeParse(validAccount)
      expect(result.success).toBe(true)
    })

    it('should reject invalid IBAN format', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const data = { ...validAccount, iban: 'TR12' }
      const result = bankAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should require bank_name', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const data = { ...validAccount, bank_name: '' }
      const result = bankAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should require account_holder', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const data = { ...validAccount, account_holder: '' }
      const result = bankAccountSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
