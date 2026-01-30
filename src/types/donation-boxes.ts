// ============================================
// KUMBARA SİSTEMİ TİPLERİ
// ============================================

// Lokasyon Tipleri
export interface DonationBoxLocationType {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string
  is_active: boolean
  created_at: string
}

// Kumbara Tipleri
export type BoxType = 'standard' | 'digital' | 'secure' | 'custom'
export type BoxSize = 'small' | 'medium' | 'large' | 'xlarge'
export type BoxStatus = 'active' | 'inactive' | 'maintenance' | 'removed'

// Kumbara
export interface DonationBox {
  id: string
  code: string
  name: string
  
  // Lokasyon
  location_type_id?: string | null
  location_name: string
  address?: string | null
  city?: string
  district?: string | null
  neighborhood?: string | null
  latitude?: number | null
  longitude?: number | null
  
  // İletişim
  contact_person?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  
  // Detaylar
  box_type: BoxType
  box_size: BoxSize
  installation_date?: string | null
  
  // Durum
  status: BoxStatus
  last_collection_date?: string | null
  next_collection_date?: string | null
  
  // Performans
  estimated_monthly_amount: number
  average_collection_amount: number
  collection_count: number
  
  // Notlar
  notes?: string | null
  
  // QR Kod
  qr_code_url?: string | null
  
  // Meta
  created_by?: string | null
  created_at: string
  updated_at: string
  
  // Relations
  location_type?: DonationBoxLocationType
  created_by_user?: {
    id: string
    full_name: string
  }
}

// Kumbara performans view
export interface DonationBoxPerformance {
  id: string
  code: string
  name: string
  location_name: string
  location_type?: string
  city?: string
  district?: string | null
  status: BoxStatus
  last_collection_date?: string | null
  next_collection_date?: string | null
  estimated_monthly_amount: number
  average_collection_amount: number
  collection_count: number
  performance_percentage: number
  total_collections: number
}

// Toplama Rotası
export type RouteFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface CollectionRoute {
  id: string
  code: string
  name: string
  description?: string | null
  
  city: string
  district?: string | null
  
  collector_id?: string | null
  backup_collector_id?: string | null
  
  frequency: RouteFrequency
  collection_day: number[] // [1, 3, 5] = Pazartesi, Çarşamba, Cuma
  estimated_duration?: number | null
  
  is_active: boolean
  
  created_at: string
  updated_at: string
  
  // Relations
  collector?: {
    id: string
    first_name: string
    last_name: string
    phone?: string
  }
  backup_collector?: {
    id: string
    first_name: string
    last_name: string
  }
}

// Rota detay view
export interface RouteDetails extends CollectionRoute {
  collector_name?: string
  box_count: number
  total_estimated_minutes: number
}

// Rota-Kumbara İlişkisi
export interface RouteBox {
  id: string
  route_id: string
  box_id: string
  stop_order: number
  estimated_minutes?: number | null
  notes?: string | null
  created_at: string
  
  // Relations
  box?: DonationBox
}

// Toplama Koleksiyonu
export type CollectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'

export interface Collection {
  id: string
  collection_number: string
  
  route_id?: string | null
  collector_id?: string | null
  
  scheduled_date: string
  scheduled_time?: string | null
  started_at?: string | null
  completed_at?: string | null
  
  status: CollectionStatus
  cancellation_reason?: string | null
  
  total_boxes: number
  collected_boxes: number
  skipped_boxes: number
  total_amount: number
  
  notes?: string | null
  
  created_by?: string | null
  created_at: string
  updated_at: string
  
  // Relations
  route?: CollectionRoute
  collector?: {
    id: string
    first_name: string
    last_name: string
  }
}

// Toplama Detayı
export interface CollectionDetail {
  id: string
  collection_id: string
  box_id: string
  
  arrived_at?: string | null
  departed_at?: string | null
  
  is_collected: boolean
  skip_reason?: string | null
  
  estimated_amount?: number | null
  actual_amount?: number | null
  
  coin_amount: number
  bill_amount: number
  
  photos?: string[]
  receipt_number?: string | null
  
  notes?: string | null
  
  collected_latitude?: number | null
  collected_longitude?: number | null
  
  created_at: string
  
  // Relations
  box?: DonationBox
}

// Bakım Kaydı
export type MaintenanceType = 'repair' | 'cleaning' | 'replacement' | 'inspection' | 'relocation'
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface DonationBoxMaintenance {
  id: string
  box_id: string
  
  maintenance_type: MaintenanceType
  description: string
  
  status: MaintenanceStatus
  
  reported_at: string
  scheduled_date?: string | null
  completed_at?: string | null
  
  reported_by?: string | null
  assigned_to?: string | null
  
  cost: number
  
  resolution_notes?: string | null
  photos_before?: string[]
  photos_after?: string[]
  
  created_at: string
  updated_at: string
  
  // Relations
  box?: DonationBox
  reported_by_user?: {
    id: string
    full_name: string
  }
  assigned_to_user?: {
    id: string
    full_name: string
  }
}

// ============================================
// FORM TİPLERİ
// ============================================

export interface DonationBoxFormValues {
  code: string
  name: string
  location_type_id?: string
  location_name: string
  address?: string
  city?: string
  district?: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  box_type?: BoxType
  box_size?: BoxSize
  installation_date?: string
  estimated_monthly_amount?: number
  notes?: string
}

export interface CollectionRouteFormValues {
  code: string
  name: string
  description?: string
  city: string
  district?: string
  collector_id?: string
  backup_collector_id?: string
  frequency: RouteFrequency
  collection_day: number[]
  estimated_duration?: number
}

export interface CollectionFormValues {
  route_id?: string
  collector_id?: string
  scheduled_date: string
  scheduled_time?: string
  notes?: string
}

export interface CollectionDetailFormValues {
  collection_id: string
  box_id: string
  arrived_at?: string
  departed_at?: string
  is_collected: boolean
  skip_reason?: string
  estimated_amount?: number
  actual_amount?: number
  coin_amount?: number
  bill_amount?: number
  notes?: string
  photos?: string[]
  receipt_number?: string
}

export interface MaintenanceFormValues {
  box_id: string
  maintenance_type: MaintenanceType
  description: string
  scheduled_date?: string
  assigned_to?: string
  cost?: number
}

// ============================================
// FİLTRE TİPLERİ
// ============================================

export interface DonationBoxFilters {
  search?: string
  location_type_id?: string
  status?: BoxStatus
  city?: string
  district?: string
  needs_collection?: boolean // next_collection_date geçmiş olanlar
}

export interface CollectionFilters {
  route_id?: string
  collector_id?: string
  status?: CollectionStatus
  date_from?: string
  date_to?: string
}

// ============================================
// RAPOR TİPLERİ
// ============================================

export interface CollectionMonthlySummary {
  month: string
  collection_count: number
  total_boxes: number
  collected_boxes: number
  total_amount: number
  average_amount: number
}

export interface RoutePerformanceReport {
  route_id: string
  route_name: string
  collector_name?: string
  collection_count: number
  total_amount: number
  average_per_collection: number
  completion_rate: number
}

export interface BoxCollectionHistory {
  box_id: string
  box_name: string
  collection_date: string
  amount: number
  receipt_number?: string
}
