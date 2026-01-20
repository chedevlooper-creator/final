import { z } from 'zod'

export const applicationSchema = z.object({
  needy_person_id: z.string().uuid({ message: 'İhtiyaç sahibi seçilmeli' }),
  application_type: z.enum([
    'food', 'health', 'education', 'shelter', 'clothing',
    'fuel', 'household', 'cash', 'other'
  ], { message: 'Başvuru türü seçilmeli' }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().nullable().optional(),
  requested_amount: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>

// Başvuru Türleri
export const APPLICATION_TYPES = [
  { value: 'food', label: 'Gıda Yardımı' },
  { value: 'health', label: 'Sağlık Yardımı' },
  { value: 'education', label: 'Eğitim Yardımı' },
  { value: 'shelter', label: 'Barınma Yardımı' },
  { value: 'clothing', label: 'Giyim Yardımı' },
  { value: 'fuel', label: 'Yakacak Yardımı' },
  { value: 'household', label: 'Ev Eşyası' },
  { value: 'cash', label: 'Nakdi Yardım' },
  { value: 'other', label: 'Diğer' },
]

// Başvuru Durumları
export const APPLICATION_STATUSES = [
  { value: 'new', label: 'Yeni', color: 'blue' },
  { value: 'in_review', label: 'İnceleniyor', color: 'yellow' },
  { value: 'approved', label: 'Onaylandı', color: 'green' },
  { value: 'rejected', label: 'Reddedildi', color: 'red' },
  { value: 'pending_delivery', label: 'Teslimat Bekliyor', color: 'orange' },
  { value: 'delivered', label: 'Teslim Edildi', color: 'green' },
  { value: 'completed', label: 'Tamamlandı', color: 'gray' },
]

// Öncelik Seviyeleri
export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Düşük', color: 'gray' },
  { value: 'medium', label: 'Normal', color: 'blue' },
  { value: 'high', label: 'Yüksek', color: 'orange' },
  { value: 'urgent', label: 'Acil', color: 'red' },
]
