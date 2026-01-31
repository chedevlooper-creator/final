import { z } from 'zod'

export const AVAILABILITY_OPTIONS = [
    { value: 'weekdays', label: 'Hafta İçi' },
    { value: 'weekends', label: 'Hafta Sonu' },
    { value: 'evenings', label: 'Akşamları' },
    { value: 'flexible', label: 'Esnek' },
] as const

export const VOLUNTEER_STATUSES = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' },
    { value: 'pending', label: 'Beklemede' },
] as const

export const volunteerSchema = z.object({
    first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    phone: z.string().min(10, 'Geçerli telefon numarası giriniz'),
    email: z.string().email('Geçerli e-posta giriniz').optional().or(z.literal('')),
    profession: z.string().optional(),
    availability: z.string().optional(),
    skills: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
})

export type VolunteerFormValues = z.infer<typeof volunteerSchema>
