/**
 * Tests for needy person validation schemas
 * src/lib/validations/needy.ts
 */

import { describe, it, expect } from 'vitest'
import { needyFormSchema, bankAccountSchema } from '@/lib/validations/needy'

describe('needyFormSchema', () => {
  const validData = {
    first_name: 'Ahmet',
    last_name: 'Yılmaz',
  }

  it('should accept valid minimal data', () => {
    const result = needyFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require first_name', () => {
    const result = needyFormSchema.safeParse({ last_name: 'Yılmaz' })
    expect(result.success).toBe(false)
  })

  it('should require last_name', () => {
    const result = needyFormSchema.safeParse({ first_name: 'Ahmet' })
    expect(result.success).toBe(false)
  })

  it('should enforce first_name min length of 2', () => {
    const result = needyFormSchema.safeParse({ first_name: 'A', last_name: 'Yılmaz' })
    expect(result.success).toBe(false)
  })

  it('should enforce last_name min length of 2', () => {
    const result = needyFormSchema.safeParse({ first_name: 'Ahmet', last_name: 'Y' })
    expect(result.success).toBe(false)
  })

  it('should accept all optional fields as null', () => {
    const result = needyFormSchema.safeParse({
      ...validData,
      category_id: null,
      partner_id: null,
      phone: null,
      email: null,
      gender: null,
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  it('should accept valid identity_type values', () => {
    for (const type of ['tc', 'passport', 'other']) {
      const result = needyFormSchema.safeParse({ ...validData, identity_type: type })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid identity_type', () => {
    const result = needyFormSchema.safeParse({ ...validData, identity_type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('should accept valid gender values', () => {
    for (const gender of ['male', 'female']) {
      const result = needyFormSchema.safeParse({ ...validData, gender })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid gender', () => {
    const result = needyFormSchema.safeParse({ ...validData, gender: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('should accept valid status values', () => {
    for (const status of ['active', 'inactive', 'pending', 'rejected']) {
      const result = needyFormSchema.safeParse({ ...validData, status })
      expect(result.success).toBe(true)
    }
  })

  it('should default status to pending', () => {
    const result = needyFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('pending')
    }
  })

  it('should default is_active to true', () => {
    const result = needyFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_active).toBe(true)
    }
  })

  it('should reject negative monthly_income', () => {
    const result = needyFormSchema.safeParse({ ...validData, monthly_income: -100 })
    expect(result.success).toBe(false)
  })

  it('should reject negative rent_amount', () => {
    const result = needyFormSchema.safeParse({ ...validData, rent_amount: -50 })
    expect(result.success).toBe(false)
  })

  it('should reject negative debt_amount', () => {
    const result = needyFormSchema.safeParse({ ...validData, debt_amount: -200 })
    expect(result.success).toBe(false)
  })

  it('should reject family_size less than 1', () => {
    const result = needyFormSchema.safeParse({ ...validData, family_size: 0 })
    expect(result.success).toBe(false)
  })

  it('should accept zero monthly_income', () => {
    const result = needyFormSchema.safeParse({ ...validData, monthly_income: 0 })
    expect(result.success).toBe(true)
  })

  it('should accept valid living_situation values', () => {
    const values = ['own_house', 'rental', 'with_relatives', 'shelter', 'homeless', 'other']
    for (const living_situation of values) {
      const result = needyFormSchema.safeParse({ ...validData, living_situation })
      expect(result.success).toBe(true)
    }
  })

  it('should accept valid income_source values', () => {
    const values = ['none', 'salary', 'pension', 'social_aid', 'charity', 'other']
    for (const income_source of values) {
      const result = needyFormSchema.safeParse({ ...validData, income_source })
      expect(result.success).toBe(true)
    }
  })

  it('should accept tags as array of strings', () => {
    const result = needyFormSchema.safeParse({ ...validData, tags: ['tag1', 'tag2'] })
    expect(result.success).toBe(true)
  })

  it('should accept tags as null', () => {
    const result = needyFormSchema.safeParse({ ...validData, tags: null })
    expect(result.success).toBe(true)
  })

  it('should validate TC Kimlik number in identity_number', () => {
    // Invalid TC (fails checksum)
    const result = needyFormSchema.safeParse({ ...validData, identity_number: '12345678999' })
    expect(result.success).toBe(false)
  })

  it('should accept valid TC Kimlik in identity_number', () => {
    // Valid TC: 10000000146 (passes both checksums)
    const result = needyFormSchema.safeParse({ ...validData, identity_number: '10000000146' })
    expect(result.success).toBe(true)
  })

  it('should accept null identity_number', () => {
    const result = needyFormSchema.safeParse({ ...validData, identity_number: null })
    expect(result.success).toBe(true)
  })

  it('should accept valid email format', () => {
    const result = needyFormSchema.safeParse({ ...validData, email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const result = needyFormSchema.safeParse({ ...validData, email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('should accept valid UUID for category_id', () => {
    const result = needyFormSchema.safeParse({
      ...validData,
      category_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUID for category_id', () => {
    const result = needyFormSchema.safeParse({ ...validData, category_id: 'bad-uuid' })
    expect(result.success).toBe(false)
  })

  it('should accept valid passport_type values', () => {
    for (const passport_type of ['normal', 'diplomatic', 'service', 'special']) {
      const result = needyFormSchema.safeParse({ ...validData, passport_type })
      expect(result.success).toBe(true)
    }
  })

  it('should accept valid visa_type values', () => {
    const values = ['tourist', 'work', 'student', 'residence', 'temporary_protection']
    for (const visa_type of values) {
      const result = needyFormSchema.safeParse({ ...validData, visa_type })
      expect(result.success).toBe(true)
    }
  })
})

describe('bankAccountSchema', () => {
  const validAccount = {
    needy_person_id: '550e8400-e29b-41d4-a716-446655440000',
    bank_name: 'Ziraat Bankası',
    account_holder: 'Ahmet Yılmaz',
    iban: 'TR330006100519786457841326',
    is_primary: true,
  }

  it('should accept valid bank account data', () => {
    const result = bankAccountSchema.safeParse(validAccount)
    expect(result.success).toBe(true)
  })

  it('should require needy_person_id as UUID', () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, needy_person_id: 'not-uuid' })
    expect(result.success).toBe(false)
  })

  it('should require bank_name with min 2 chars', () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, bank_name: 'A' })
    expect(result.success).toBe(false)
  })

  it('should require account_holder with min 2 chars', () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, account_holder: 'A' })
    expect(result.success).toBe(false)
  })

  it('should validate IBAN format - must start with TR', () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, iban: 'DE89370400440532013000' })
    expect(result.success).toBe(false)
  })

  it('should validate IBAN length - must be 26 chars', () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, iban: 'TR12345' })
    expect(result.success).toBe(false)
  })

  it('should accept IBAN with spaces (auto-trimmed)', () => {
    const result = bankAccountSchema.safeParse({
      ...validAccount,
      iban: 'TR33 0006 1005 1978 6457 8413 26',
    })
    expect(result.success).toBe(true)
  })

  it('should normalize IBAN to uppercase', () => {
    const result = bankAccountSchema.safeParse({
      ...validAccount,
      iban: 'tr330006100519786457841326',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.iban).toBe('TR330006100519786457841326')
    }
  })

  it('should require is_primary field', () => {
    const { is_primary, ...withoutPrimary } = validAccount
    const result = bankAccountSchema.safeParse(withoutPrimary)
    expect(result.success).toBe(false)
  })

  it('should reject IBAN with letters after TR prefix', () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, iban: 'TRABCDEFGHIJKLMNOPQRSTUVWX' })
    expect(result.success).toBe(false)
  })
})
