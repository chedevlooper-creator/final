import { z } from 'zod'
import { CURRENCIES as COMMON_CURRENCIES } from '@/types/common'

function validateIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  if (cleanIBAN.length !== 26) return false
  if (!cleanIBAN.startsWith('TR')) return false
  return /^TR\d{24}$/.test(cleanIBAN)
}

export const bankAccountSchema = z.object({
  bank_name: z.string().min(2, { message: 'Banka adı en az 2 karakter' }),
  account_number: z.string().min(5, { message: 'Hesap numarası en az 5 karakter' }),
  iban: z.string()
    .transform(val => val.replace(/\s/g, '').toUpperCase())
    .refine(validateIBAN, { message: 'Geçersiz IBAN numarası' }),
  account_holder: z.string().min(3, { message: 'Hesap sahibi en az 3 karakter' }),
  balance: z.number().min(0, { message: 'Bakiye 0 veya daha büyük olmalı' }),
  currency: z.enum(['TRY', 'USD', 'EUR'], { message: 'Geçersiz para birimi' }),
  status: z.enum(['active', 'inactive', 'closed'], { message: 'Geçersiz durum' }),
  is_primary: z.boolean().optional()
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>

export const CURRENCIES = COMMON_CURRENCIES

export const BANK_ACCOUNT_STATUSES = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Pasif' },
  { value: 'closed', label: 'Kapalı' },
]
