import { z } from 'zod'

export const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Normal' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' },
] as const

export const PURCHASE_STATUSES = [
    { value: 'pending', label: 'Beklemede' },
    { value: 'approved', label: 'Onaylandı' },
    { value: 'rejected', label: 'Reddedildi' },
    { value: 'completed', label: 'Tamamlandı' },
] as const

export const purchaseItemSchema = z.object({
    name: z.string().min(1, 'Ürün adı gerekli'),
    quantity: z.number().min(1, 'Miktar en az 1 olmalı'),
    unit: z.string().default('Adet'),
    unit_price: z.number().min(0, 'Fiyat geçerli olmalı'),
})

export const purchaseSchema = z.object({
    title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    description: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'En az 1 ürün ekleyiniz'),
    status: z.enum(['pending', 'approved', 'rejected', 'completed']).default('pending'),
})

export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>
export type PurchaseFormValues = z.infer<typeof purchaseSchema>
