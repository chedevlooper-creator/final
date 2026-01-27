import { z } from 'zod'

export const CHARITY_BOX_STATUSES = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Pasif' },
  { value: 'full', label: 'Dolu' },
  { value: 'collected', label: 'Toplandı' },
] as const

export const CURRENCIES = [
  { value: 'TRY', label: 'Türk Lirası (₺)', symbol: '₺' },
  { value: 'USD', label: 'Amerikan Doları ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
] as const

export const charityBoxFormSchema = z.object({
  box_number: z.string().min(1, 'Kumbara numarası zorunludur'),
  box_code: z.string().optional(),
  location_name: z.string().min(1, 'Konum adı zorunludur'),
  location_address: z.string().optional(),
  location_city: z.string().optional(),
  location_district: z.string().optional(),
  responsible_person: z.string().optional(),
  responsible_phone: z.string().optional(),
  responsible_email: z.string().email('Geçerli bir email girin').optional().or(z.literal('')),
  current_amount: z.number().min(0, 'Tutar 0 veya pozitif olmalı').default(0),
  currency: z.string().default('TRY'),
  status: z.enum(['active', 'inactive', 'full', 'collected']).default('active'),
  notes: z.string().optional(),
})

export const charityBoxCollectionSchema = z.object({
  charity_box_id: z.string().uuid('Geçerli bir kumbara seçin'),
  amount: z.number().min(0.01, 'Tutar 0.01 veya daha büyük olmalı'),
  currency: z.string().default('TRY'),
  notes: z.string().optional(),
  receipt_number: z.string().optional(),
})

export type CharityBoxFormValues = z.infer<typeof charityBoxFormSchema>
export type CharityBoxCollectionValues = z.infer<typeof charityBoxCollectionSchema>
