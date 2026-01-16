import { z } from 'zod'

// TC Kimlik numarası doğrulama
function validateTCKimlik(tc: string): boolean {
  if (tc.length !== 11) return false
  if (tc[0] === '0') return false
  
  const digits = tc.split('').map(Number)
  
  // İlk 10 hanenin toplamının son rakamı, 11. haneye eşit olmalı
  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sum10 % 10 !== digits[10]) return false
  
  // Tek hanelerin toplamının 7 katından çift hanelerin toplamı çıkarılınca mod 10'u 10. haneye eşit olmalı
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  if ((oddSum * 7 - evenSum) % 10 !== digits[9]) return false
  
  return true
}

// IBAN doğrulama
function validateIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  if (cleanIBAN.length !== 26) return false
  if (!cleanIBAN.startsWith('TR')) return false
  return /^TR\d{24}$/.test(cleanIBAN)
}

// Form için kullanılan şema - default değerler ile
export const needyFormSchema = z.object({
  // Temel Bilgiler
  first_name: z.string().min(2, { message: 'Ad en az 2 karakter olmalı' }),
  last_name: z.string().min(2, { message: 'Soyad en az 2 karakter olmalı' }),
  first_name_original: z.string().nullable().optional(),
  last_name_original: z.string().nullable().optional(),
  
  // Kategori ve İlişkiler
  category_id: z.string().uuid().nullable().optional(),
  partner_id: z.string().uuid().nullable().optional(),
  field_id: z.string().uuid().nullable().optional(),
  
  // Lokasyon
  nationality_id: z.string().uuid().nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  district_id: z.string().uuid().nullable().optional(),
  neighborhood_id: z.string().uuid().nullable().optional(),
  
  // Kimlik Bilgileri
  identity_type: z.enum(['tc', 'passport', 'other']).nullable().optional(),
  identity_number: z.string()
    .refine((val) => !val || validateTCKimlik(val), {
      message: 'Geçersiz TC Kimlik numarası',
    })
    .nullable()
    .optional(),
  passport_number: z.string().nullable().optional(),
  passport_type: z.enum(['normal', 'diplomatic', 'service', 'special']).nullable().optional(),
  passport_expiry: z.string().nullable().optional(),
  visa_type: z.enum(['tourist', 'work', 'student', 'residence', 'temporary_protection']).nullable().optional(),
  
  // Kişisel Bilgiler
  gender: z.enum(['male', 'female']).nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email({ message: 'Geçersiz e-posta adresi' }).nullable().optional(),
  address: z.string().nullable().optional(),
  
  // Yaşam Durumu
  living_situation: z.enum([
    'own_house', 'rental', 'with_relatives', 'shelter', 'homeless', 'other'
  ]).nullable().optional(),
  income_source: z.enum([
    'none', 'salary', 'pension', 'social_aid', 'charity', 'other'
  ]).nullable().optional(),
  monthly_income: z.number().min(0).nullable().optional(),
  rent_amount: z.number().min(0).nullable().optional(),
  debt_amount: z.number().min(0).nullable().optional(),
  family_size: z.number().min(1).nullable().optional(),
  
  // Sağlık
  health_status: z.string().nullable().optional(),
  disability_status: z.string().nullable().optional(),
  
  // Diğer
  notes: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'rejected']).optional().default('pending'),
  is_active: z.boolean().optional().default(true),
  tags: z.array(z.string()).nullable().optional(),
})

export type NeedyFormValues = z.input<typeof needyFormSchema>
// Eski ismi de export et (geriye uyumluluk için)
export const needyPersonSchema = needyFormSchema
export type NeedyPersonFormValues = NeedyFormValues

// IBAN Schema
export const bankAccountSchema = z.object({
  needy_person_id: z.string().uuid(),
  bank_name: z.string().min(2, { message: 'Banka adı zorunlu' }),
  account_holder: z.string().min(2, { message: 'Hesap sahibi zorunlu' }),
  iban: z.string()
    .transform((val) => val.replace(/\s/g, '').toUpperCase())
    .refine(validateIBAN, {
      message: 'Geçersiz IBAN numarası',
    }),
  is_primary: z.boolean(),
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>
