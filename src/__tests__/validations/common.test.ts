/**
 * Tests for common validation functions and Zod schemas
 * src/lib/validations/common.ts
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  validatePhone,
  validateEmail,
  validateUUID,
  validateTCKimlik,
  validateNotPastDate,
  phoneSchema,
  emailSchema,
  uuidSchema,
  tcKimlikSchema,
  sanitizedString,
  lettersOnlySchema,
  futureDateSchema,
  uuidArraySchema,
} from '@/lib/validations/common'

// ============================================
// sanitizeString
// ============================================
describe('sanitizeString', () => {
  it('should return null for null input', () => {
    expect(sanitizeString(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(sanitizeString(undefined)).toBeNull()
  })

  it('should strip HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>Hello')).toBe('alert(&quot;xss&quot;)Hello')
  })

  it('should escape ampersands', () => {
    expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less-than signs', () => {
    expect(sanitizeString('a < b')).toBe('a &lt; b')
  })

  it('should escape greater-than signs', () => {
    expect(sanitizeString('a > b')).toBe('a &gt; b')
  })

  it('should escape double quotes', () => {
    expect(sanitizeString('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(sanitizeString("it's")).toBe('it&#x27;s')
  })

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('should handle combined HTML and special chars', () => {
    const input = '<div class="x">A & B</div>'
    const result = sanitizeString(input)
    expect(result).not.toContain('<div')
    expect(result).not.toContain('</div>')
    expect(result).toContain('&amp;')
  })

  it('should return empty string for whitespace-only input', () => {
    expect(sanitizeString('   ')).toBe('')
  })

  it('should preserve Turkish characters', () => {
    const input = 'çığırtkan öğretmen şükür ünlem'
    const result = sanitizeString(input)
    expect(result).toContain('çığırtkan')
    expect(result).toContain('öğretmen')
    expect(result).toContain('şükür')
    expect(result).toContain('ünlem')
  })
})

// ============================================
// validatePhone
// ============================================
describe('validatePhone', () => {
  it('should return true for null', () => {
    expect(validatePhone(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(validatePhone(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(validatePhone('')).toBe(true)
  })

  // +90 format
  it('should accept +90 5XX XXX XX XX format', () => {
    expect(validatePhone('+905551234567')).toBe(true)
  })

  it('should accept +90 with spaces', () => {
    expect(validatePhone('+90 555 123 45 67')).toBe(true)
  })

  it('should accept +90 with dashes', () => {
    expect(validatePhone('+90-555-123-45-67')).toBe(true)
  })

  // 0 prefix format
  it('should accept 05XX XXX XX XX format', () => {
    expect(validatePhone('05551234567')).toBe(true)
  })

  it('should accept 0 prefix with spaces', () => {
    expect(validatePhone('0555 123 45 67')).toBe(true)
  })

  // Bare format (no prefix)
  it('should accept 5XX XXX XX XX format', () => {
    expect(validatePhone('5551234567')).toBe(true)
  })

  // Invalid
  it('should reject non-mobile numbers (not starting with 5)', () => {
    expect(validatePhone('02121234567')).toBe(false)
  })

  it('should reject too-short numbers', () => {
    expect(validatePhone('055512345')).toBe(false)
  })

  it('should reject too-long numbers', () => {
    expect(validatePhone('055512345678')).toBe(false)
  })

  it('should reject non-numeric input', () => {
    expect(validatePhone('abcdefghijk')).toBe(false)
  })
})

// ============================================
// validateEmail
// ============================================
describe('validateEmail', () => {
  it('should return true for null', () => {
    expect(validateEmail(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(validateEmail(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(validateEmail('')).toBe(true)
  })

  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co')).toBe(true)
    expect(validateEmail('user+tag@example.org')).toBe(true)
  })

  it('should reject emails without @', () => {
    expect(validateEmail('testexample.com')).toBe(false)
  })

  it('should reject emails without domain', () => {
    expect(validateEmail('test@')).toBe(false)
  })

  it('should reject emails without local part', () => {
    expect(validateEmail('@example.com')).toBe(false)
  })

  it('should reject emails without TLD', () => {
    expect(validateEmail('test@example')).toBe(false)
  })
})

// ============================================
// validateUUID
// ============================================
describe('validateUUID', () => {
  it('should return false for null', () => {
    expect(validateUUID(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(validateUUID(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(validateUUID('')).toBe(false)
  })

  it('should accept valid v4 UUID', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should accept valid v1 UUID', () => {
    expect(validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
  })

  it('should be case-insensitive', () => {
    expect(validateUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('should reject invalid UUID format', () => {
    expect(validateUUID('not-a-uuid')).toBe(false)
    expect(validateUUID('550e8400-e29b-41d4-a716')).toBe(false)
    expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false)
  })
})

// ============================================
// validateTCKimlik
// ============================================
describe('validateTCKimlik', () => {
  it('should return true for null', () => {
    expect(validateTCKimlik(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(validateTCKimlik(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(validateTCKimlik('')).toBe(true)
  })

  it('should reject TC starting with 0', () => {
    expect(validateTCKimlik('01234567890')).toBe(false)
  })

  it('should reject TC shorter than 11 digits', () => {
    expect(validateTCKimlik('1234567890')).toBe(false)
  })

  it('should reject TC longer than 11 digits', () => {
    expect(validateTCKimlik('123456789012')).toBe(false)
  })

  it('should reject non-numeric TC', () => {
    expect(validateTCKimlik('1234567890a')).toBe(false)
  })

  it('should reject TC with invalid 11th digit (sum check)', () => {
    // The 11th digit must be sum(first 10) mod 10
    expect(validateTCKimlik('12345678999')).toBe(false)
  })

  it('should reject TC with invalid 10th digit (odd/even check)', () => {
    // 10th digit must be (oddSum*7 - evenSum) mod 10
    expect(validateTCKimlik('12345678990')).toBe(false)
  })

  it('should accept a TC that passes both checksums', () => {
    // digits 0-8: 1,0,0,0,0,0,0,0,1
    // oddSum = 1+0+0+0+1 = 2, evenSum = 0+0+0+0 = 0
    // d10 = (2*7 - 0) % 10 = 4
    // sum10 = 1+0+0+0+0+0+0+0+1+4 = 6, d11 = 6
    expect(validateTCKimlik('10000000146')).toBe(true)
  })
})

// ============================================
// validateNotPastDate
// ============================================
describe('validateNotPastDate', () => {
  it('should return true for null', () => {
    expect(validateNotPastDate(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(validateNotPastDate(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(validateNotPastDate('')).toBe(true)
  })

  it('should return false for an invalid date string', () => {
    expect(validateNotPastDate('not-a-date')).toBe(false)
  })

  it('should return true for a future date', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(validateNotPastDate(future.toISOString())).toBe(true)
  })

  it('should return false for a past date', () => {
    expect(validateNotPastDate('2020-01-01')).toBe(false)
  })

  it('should return true for today', () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    expect(validateNotPastDate(todayStr)).toBe(true)
  })
})

// ============================================
// Zod Schemas
// ============================================
describe('phoneSchema', () => {
  it('should accept valid phone', () => {
    const result = phoneSchema.safeParse('05551234567')
    expect(result.success).toBe(true)
  })

  it('should accept null', () => {
    const result = phoneSchema.safeParse(null)
    expect(result.success).toBe(true)
  })

  it('should reject invalid phone', () => {
    const result = phoneSchema.safeParse('1234')
    expect(result.success).toBe(false)
  })
})

describe('emailSchema', () => {
  it('should accept valid email', () => {
    const result = emailSchema.safeParse('test@example.com')
    expect(result.success).toBe(true)
  })

  it('should accept null', () => {
    const result = emailSchema.safeParse(null)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = emailSchema.safeParse('not-email')
    expect(result.success).toBe(false)
  })
})

describe('uuidSchema', () => {
  it('should accept valid UUID', () => {
    const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000')
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUID', () => {
    const result = uuidSchema.safeParse('not-a-uuid')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Geçersiz ID formatı')
    }
  })
})

describe('tcKimlikSchema', () => {
  it('should accept null', () => {
    const result = tcKimlikSchema.safeParse(null)
    expect(result.success).toBe(true)
  })

  it('should reject invalid TC', () => {
    const result = tcKimlikSchema.safeParse('12345')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Geçersiz TC Kimlik numarası')
    }
  })
})

describe('sanitizedString', () => {
  it('should strip HTML and sanitize', () => {
    const schema = sanitizedString(100)
    const result = schema.safeParse('<b>bold</b>')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toContain('<b>')
    }
  })

  it('should enforce maxLength', () => {
    const schema = sanitizedString(5)
    const result = schema.safeParse('123456')
    expect(result.success).toBe(false)
  })

  it('should pass without maxLength constraint', () => {
    const schema = sanitizedString()
    const result = schema.safeParse('a long string without any limit')
    expect(result.success).toBe(true)
  })
})

describe('lettersOnlySchema', () => {
  it('should accept letters and spaces', () => {
    const schema = lettersOnlySchema(2, 50)
    const result = schema.safeParse('Ahmet Yılmaz')
    expect(result.success).toBe(true)
  })

  it('should accept Turkish characters', () => {
    const schema = lettersOnlySchema(2, 50)
    const result = schema.safeParse('Çığırtkan Öğretmen')
    expect(result.success).toBe(true)
  })

  it('should reject numbers', () => {
    const schema = lettersOnlySchema(2, 50)
    const result = schema.safeParse('Ahmet123')
    expect(result.success).toBe(false)
  })

  it('should enforce min length', () => {
    const schema = lettersOnlySchema(3, 50)
    const result = schema.safeParse('Ab')
    expect(result.success).toBe(false)
  })

  it('should enforce max length', () => {
    const schema = lettersOnlySchema(2, 5)
    const result = schema.safeParse('Abcdef')
    expect(result.success).toBe(false)
  })
})

describe('futureDateSchema', () => {
  it('should accept future date', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const result = futureDateSchema.safeParse(future.toISOString())
    expect(result.success).toBe(true)
  })

  it('should reject past date', () => {
    const result = futureDateSchema.safeParse('2020-01-01')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Geçmiş bir tarih seçilemez')
    }
  })
})

describe('uuidArraySchema', () => {
  it('should accept array of valid UUIDs', () => {
    const result = uuidArraySchema.safeParse([
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ])
    expect(result.success).toBe(true)
  })

  it('should accept undefined', () => {
    const result = uuidArraySchema.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should reject array with invalid UUID', () => {
    const result = uuidArraySchema.safeParse(['not-a-uuid'])
    expect(result.success).toBe(false)
  })

  it('should accept empty array', () => {
    const result = uuidArraySchema.safeParse([])
    expect(result.success).toBe(true)
  })
})
