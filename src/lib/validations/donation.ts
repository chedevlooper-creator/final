import { z } from 'zod'
import { CURRENCIES as COMMON_CURRENCIES, PAYMENT_METHODS as COMMON_PAYMENT_METHODS } from '@/types/common'

export const donationSchema = z.object({
  donor_name: z.string().nullable().optional(),
  donor_phone: z.string().nullable().optional(),
  donor_email: z.string().email({ message: 'Geçersiz e-posta' }).nullable().optional(),
  donation_type: z.enum(['cash', 'in_kind', 'sacrifice', 'zakat', 'fitre', 'sadaka']),
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().min(0.01, { message: 'Tutar 0.01\'den büyük olmalı' }),
  currency: z.enum(['TRY', 'USD', 'EUR', 'GBP']),
  payment_method: z.enum(['cash', 'bank_transfer', 'credit_card', 'online']).nullable().optional(),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type DonationFormValues = z.infer<typeof donationSchema>

// Bağış Türleri
export const DONATION_TYPES = [
  { value: 'cash', label: 'Nakit Bağış' },
  { value: 'in_kind', label: 'Ayni Bağış' },
  { value: 'sacrifice', label: 'Kurban' },
  { value: 'zakat', label: 'Zekat' },
  { value: 'fitre', label: 'Fitre' },
  { value: 'sadaka', label: 'Sadaka' },
]

// Ödeme Yöntemleri
export const PAYMENT_METHODS = COMMON_PAYMENT_METHODS

// Para Birimleri
export const CURRENCIES = COMMON_CURRENCIES
