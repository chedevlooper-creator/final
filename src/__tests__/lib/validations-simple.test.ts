import { describe, it, expect } from '@jest/globals'

describe('Lib Functions - Validations', () => {
  describe('Schema Exports', () => {
    it('should export needyFormSchema', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      expect(needyFormSchema).toBeDefined()
    })

    it('should export bankAccountSchema', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      expect(bankAccountSchema).toBeDefined()
    })
  })

  describe('needyFormSchema Validation', () => {
    const validData = {
      first_name: 'Ahmet',
      last_name: 'Yilmaz',
      phone: '5551234567',
    }

    it('should accept valid minimal data', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty first_name', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({ ...validData, first_name: '' })
      expect(result.success).toBe(false)
    })

    it('should reject short first_name', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({ ...validData, first_name: 'A' })
      expect(result.success).toBe(false)
    })

    it('should reject empty last_name', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({ ...validData, last_name: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({ ...validData, email: 'invalid-email' })
      expect(result.success).toBe(false)
    })

    it('should accept valid email', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({ ...validData, email: 'test@example.com' })
      expect(result.success).toBe(true)
    })

    it('should accept Turkish characters in names', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({
        first_name: 'Cigdem',
        last_name: 'Ozturk',
      })
      expect(result.success).toBe(true)
    })

    it('should validate TC kimlik number', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({
        ...validData,
        identity_number: '12345',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid TC kimlik', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({
        ...validData,
        identity_number: '10000000146', // Valid TC
      })
      expect(result.success).toBe(true)
    })

    it('should reject negative monthly_income', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({
        ...validData,
        monthly_income: -100,
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid family_size', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const result = needyFormSchema.safeParse({
        ...validData,
        family_size: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid status values', () => {
      const { needyFormSchema } = require('@/lib/validations/needy')
      const statuses = ['active', 'inactive', 'pending', 'rejected']
      
      statuses.forEach((status) => {
        const result = needyFormSchema.safeParse({ ...validData, status })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('bankAccountSchema Validation', () => {
    const validAccount = {
      needy_person_id: '123e4567-e89b-12d3-a456-426614174000',
      bank_name: 'Garanti',
      account_holder: 'Ahmet Yilmaz',
      iban: 'TR12 3456 7890 1234 5678 9012 34',
      is_primary: true,
    }

    it('should accept valid IBAN', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const result = bankAccountSchema.safeParse(validAccount)
      expect(result.success).toBe(true)
    })

    it('should reject invalid IBAN format', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const result = bankAccountSchema.safeParse({ ...validAccount, iban: 'TR12' })
      expect(result.success).toBe(false)
    })

    it('should reject empty bank_name', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const result = bankAccountSchema.safeParse({ ...validAccount, bank_name: '' })
      expect(result.success).toBe(false)
    })

    it('should reject empty account_holder', () => {
      const { bankAccountSchema } = require('@/lib/validations/needy')
      const result = bankAccountSchema.safeParse({ ...validAccount, account_holder: '' })
      expect(result.success).toBe(false)
    })
  })
})
