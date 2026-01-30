import { z } from 'zod'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^(\+90|0)?[\s-]?(5[0-9]{2})[\s-]?([0-9]{3})[\s-]?([0-9]{2})[\s-]?([0-9]{2})$/
const LETTERS_ONLY_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/
const HTML_TAG_REGEX = /<[^>]*>/g

export function sanitizeString(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null
  return input
    .replace(HTML_TAG_REGEX, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return true
  const cleaned = phone.replace(/\s/g, '').replace(/-/g, '')
  if (cleaned.startsWith('+90')) {
    return cleaned.length === 13 && /^\+905[0-9]{9}$/.test(cleaned)
  }
  if (cleaned.startsWith('0')) {
    return cleaned.length === 11 && /^05[0-9]{9}$/.test(cleaned)
  }
  return cleaned.length === 10 && /^5[0-9]{9}$/.test(cleaned)
}

export function validateEmail(email: string | null | undefined): boolean {
  if (!email) return true
  return EMAIL_REGEX.test(email)
}

export function validateUUID(uuid: string | null | undefined): boolean {
  if (!uuid) return false
  return UUID_REGEX.test(uuid)
}

export function validateTCKimlik(tc: string | null | undefined): boolean {
  if (!tc) return true
  if (tc.length !== 11) return false
  if (!/^\d{11}$/.test(tc)) return false
  if (tc[0] === '0') return false

  const digits = tc.split('').map(Number)
  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sum10 % 10 !== digits[10]) return false

  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  if ((oddSum * 7 - evenSum) % 10 !== digits[9]) return false

  return true
}

export function validateNotPastDate(dateString: string | null | undefined): boolean {
  if (!dateString) return true
  const inputDate = new Date(dateString)
  if (isNaN(inputDate.getTime())) return false
  
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  return inputDate.getTime() >= now.getTime()
}

export const sanitizedString = (maxLength?: number) =>
  z
    .string()
    .transform((val) => sanitizeString(val))
    .refine((val) => !maxLength || (val?.length || 0) <= maxLength, {
      message: `En fazla ${maxLength} karakter olabilir`,
    })

export const phoneSchema = z
  .string()
  .nullable()
  .optional()
  .refine(validatePhone, {
    message: 'Geçerli bir telefon numarası girin (örn: 0555 123 45 67)',
  })

export const emailSchema = z
  .string()
  .nullable()
  .optional()
  .refine(validateEmail, {
    message: 'Geçerli bir e-posta adresi girin',
  })

export const uuidSchema = z
  .string()
  .refine(validateUUID, {
    message: 'Geçersiz ID formatı',
  })

export const tcKimlikSchema = z
  .string()
  .nullable()
  .optional()
  .refine(validateTCKimlik, {
    message: 'Geçersiz TC Kimlik numarası',
  })

export const lettersOnlySchema = (min: number, max: number) =>
  z
    .string()
    .min(min, { message: `En az ${min} karakter olmalı` })
    .max(max, { message: `En fazla ${max} karakter olabilir` })
    .refine((val) => LETTERS_ONLY_REGEX.test(val), {
      message: 'Sadece harf ve boşluk karakterleri kullanılabilir',
    })
    .transform((val) => sanitizeString(val) || val)

export const futureDateSchema = z
  .string()
  .refine(validateNotPastDate, {
    message: 'Geçmiş bir tarih seçilemez',
  })

export const uuidArraySchema = z
  .array(z.string())
  .optional()
  .refine(
    (arr) => !arr || arr.every((id) => validateUUID(id)),
    { message: 'Geçersiz katılımcı ID formatı' }
  )
