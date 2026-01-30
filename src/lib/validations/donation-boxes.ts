// ============================================
// KUMBARA SİSTEMİ VALIDASYON ŞEMALARI
// ============================================

import { z } from 'zod'

// Kumbara validasyonu
export const donationBoxSchema = z.object({
  code: z.string().min(3, 'Kod en az 3 karakter olmalı').max(20, 'Kod en fazla 20 karakter olabilir'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100),
  location_type_id: z.string().uuid().optional(),
  location_name: z.string().min(2, 'Lokasyon adı gereklidir').max(100),
  address: z.string().optional(),
  city: z.string().default('İstanbul'),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Geçerli email girin').optional().or(z.literal('')),
  box_type: z.enum(['standard', 'digital', 'secure', 'custom']).default('standard'),
  box_size: z.enum(['small', 'medium', 'large', 'xlarge']).default('medium'),
  installation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estimated_monthly_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
})

export type DonationBoxFormValues = z.infer<typeof donationBoxSchema>

// Rota validasyonu
export const collectionRouteSchema = z.object({
  code: z.string().min(3, 'Kod en az 3 karakter olmalı').max(20),
  name: z.string().min(2, 'İsim gereklidir').max(100),
  description: z.string().optional(),
  city: z.string().min(1, 'Şehir seçilmeli'),
  district: z.string().optional(),
  collector_id: z.string().uuid().optional(),
  backup_collector_id: z.string().uuid().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).default('weekly'),
  collection_day: z.array(z.number().min(0).max(6)).default([1]),
  estimated_duration: z.number().min(0).optional(),
})

export type CollectionRouteFormValues = z.infer<typeof collectionRouteSchema>

// Toplama validasyonu
export const collectionSchema = z.object({
  route_id: z.string().uuid().optional(),
  collector_id: z.string().uuid().optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli tarih formatı: YYYY-MM-DD'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().optional(),
})

export type CollectionFormValues = z.infer<typeof collectionSchema>

// Toplama detayı validasyonu
export const collectionDetailSchema = z.object({
  collection_id: z.string().uuid(),
  box_id: z.string().uuid(),
  arrived_at: z.string().optional(),
  departed_at: z.string().optional(),
  is_collected: z.boolean().default(true),
  skip_reason: z.string().optional(),
  estimated_amount: z.number().min(0).optional(),
  actual_amount: z.number().min(0).optional(),
  coin_amount: z.number().min(0).default(0),
  bill_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
  photos: z.array(z.string()).default([]),
  receipt_number: z.string().optional(),
})

export type CollectionDetailFormValues = z.infer<typeof collectionDetailSchema>

// Bakım validasyonu
export const maintenanceSchema = z.object({
  box_id: z.string().uuid('Kumbara seçilmeli'),
  maintenance_type: z.enum(['repair', 'cleaning', 'replacement', 'inspection', 'relocation']),
  description: z.string().min(5, 'Açıklama en az 5 karakter olmalı'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  assigned_to: z.string().uuid().optional(),
  cost: z.number().min(0).default(0),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>

// Rota-kumbara ekleme validasyonu
export const routeBoxSchema = z.object({
  route_id: z.string().uuid(),
  box_id: z.string().uuid(),
  stop_order: z.number().int().min(0).default(0),
  estimated_minutes: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export type RouteBoxFormValues = z.infer<typeof routeBoxSchema>

// Toplama başlatma validasyonu
export const startCollectionSchema = z.object({
  collection_id: z.string().uuid(),
  started_at: z.string().optional(),
})

export type StartCollectionValues = z.infer<typeof startCollectionSchema>

// Toplama tamamlama validasyonu
export const completeCollectionSchema = z.object({
  collection_id: z.string().uuid(),
  notes: z.string().optional(),
})

export type CompleteCollectionValues = z.infer<typeof completeCollectionSchema>
