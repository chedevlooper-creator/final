import { z } from 'zod'

export const EVENT_TYPES = [
    { value: 'charity', label: 'Yardım Etkinliği' },
    { value: 'education', label: 'Eğitim' },
    { value: 'meeting', label: 'Toplantı' },
    { value: 'campaign', label: 'Kampanya' },
] as const

export const EVENT_STATUSES = [
    { value: 'planned', label: 'Planlandı' },
    { value: 'ongoing', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal Edildi' },
] as const

export const eventSchema = z.object({
    title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
    event_type: z.string().min(1, 'Tür seçiniz'),
    description: z.string().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    start_date: z.string().min(1, 'Başlangıç tarihi seçiniz'),
    end_date: z.string().optional(),
    capacity: z.number().min(1, 'Kapasite en az 1 olmalı').optional(),
    status: z.enum(['planned', 'ongoing', 'completed', 'cancelled']).default('planned'),
})

export type EventFormValues = z.infer<typeof eventSchema>
