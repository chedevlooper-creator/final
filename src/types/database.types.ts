export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            needy_persons: {
                Row: {
                    id: string
                    file_number: string | null
                    category_id: string | null
                    partner_id: string | null
                    field_id: string | null
                    first_name: string
                    last_name: string
                    first_name_original: string | null
                    last_name_original: string | null
                    nationality_id: string | null
                    country_id: string | null
                    city_id: string | null
                    district_id: string | null
                    neighborhood_id: string | null
                    identity_type: string | null
                    identity_number: string | null
                    passport_number: string | null
                    passport_type: string | null
                    passport_expiry: string | null
                    visa_type: string | null
                    gender: string | null
                    date_of_birth: string | null
                    phone: string | null
                    email: string | null
                    address: string | null
                    living_situation: string | null
                    income_source: string | null
                    monthly_income: number | null
                    rent_amount: number | null
                    debt_amount: number | null
                    family_size: number | null
                    health_status: string | null
                    disability_status: string | null
                    notes: string | null
                    status: string
                    is_active: boolean
                    tags: string[] | null
                    created_by: string | null
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    file_number?: string | null
                    category_id?: string | null
                    partner_id?: string | null
                    field_id?: string | null
                    first_name: string
                    last_name: string
                    first_name_original?: string | null
                    last_name_original?: string | null
                    nationality_id?: string | null
                    country_id?: string | null
                    city_id?: string | null
                    district_id?: string | null
                    neighborhood_id?: string | null
                    identity_type?: string | null
                    identity_number?: string | null
                    passport_number?: string | null
                    passport_type?: string | null
                    passport_expiry?: string | null
                    visa_type?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    living_situation?: string | null
                    income_source?: string | null
                    monthly_income?: number | null
                    rent_amount?: number | null
                    debt_amount?: number | null
                    family_size?: number | null
                    health_status?: string | null
                    disability_status?: string | null
                    notes?: string | null
                    status?: string
                    is_active?: boolean
                    tags?: string[] | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    file_number?: string | null
                    category_id?: string | null
                    partner_id?: string | null
                    field_id?: string | null
                    first_name?: string
                    last_name?: string
                    first_name_original?: string | null
                    last_name_original?: string | null
                    nationality_id?: string | null
                    country_id?: string | null
                    city_id?: string | null
                    district_id?: string | null
                    neighborhood_id?: string | null
                    identity_type?: string | null
                    identity_number?: string | null
                    passport_number?: string | null
                    passport_type?: string | null
                    passport_expiry?: string | null
                    visa_type?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    living_situation?: string | null
                    income_source?: string | null
                    monthly_income?: number | null
                    rent_amount?: number | null
                    debt_amount?: number | null
                    family_size?: number | null
                    health_status?: string | null
                    disability_status?: string | null
                    notes?: string | null
                    status?: string
                    is_active?: boolean
                    tags?: string[] | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            aid_applications: {
                Row: {
                    id: string
                    application_number: string | null
                    needy_person_id: string
                    application_type: string
                    status: string
                    priority: string | null
                    assigned_user_id: string | null
                    description: string | null
                    requested_amount: number | null
                    approved_amount: number | null
                    notes: string | null
                    created_by: string | null
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    application_number?: string | null
                    needy_person_id: string
                    application_type: string
                    status?: string
                    priority?: string | null
                    assigned_user_id?: string | null
                    description?: string | null
                    requested_amount?: number | null
                    approved_amount?: number | null
                    notes?: string | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    application_number?: string | null
                    needy_person_id?: string
                    application_type?: string
                    status?: string
                    priority?: string | null
                    assigned_user_id?: string | null
                    description?: string | null
                    requested_amount?: number | null
                    approved_amount?: number | null
                    notes?: string | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            orphans: {
                Row: {
                    id: string
                    file_number: string | null
                    type: string
                    partner_id: string | null
                    field_name: string | null
                    first_name: string
                    last_name: string
                    first_name_original: string | null
                    last_name_original: string | null
                    nationality_id: string | null
                    country_id: string | null
                    gender: string | null
                    date_of_birth: string | null
                    identity_number: string | null
                    status: string
                    last_assignment_date: string | null
                    assignment_status: string | null
                    sponsor_id: string | null
                    school_id: string | null
                    grade: string | null
                    education_status: string | null
                    photo_url: string | null
                    guardian_name: string | null
                    guardian_relation: string | null
                    guardian_phone: string | null
                    address: string | null
                    city_id: string | null
                    district_id: string | null
                    notes: string | null
                    created_by: string | null
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    file_number?: string | null
                    type: string
                    partner_id?: string | null
                    field_name?: string | null
                    first_name: string
                    last_name: string
                    first_name_original?: string | null
                    last_name_original?: string | null
                    nationality_id?: string | null
                    country_id?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    identity_number?: string | null
                    status?: string
                    last_assignment_date?: string | null
                    assignment_status?: string | null
                    sponsor_id?: string | null
                    school_id?: string | null
                    grade?: string | null
                    education_status?: string | null
                    photo_url?: string | null
                    guardian_name?: string | null
                    guardian_relation?: string | null
                    guardian_phone?: string | null
                    address?: string | null
                    city_id?: string | null
                    district_id?: string | null
                    notes?: string | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    file_number?: string | null
                    type?: string
                    partner_id?: string | null
                    field_name?: string | null
                    first_name?: string
                    last_name?: string
                    first_name_original?: string | null
                    last_name_original?: string | null
                    nationality_id?: string | null
                    country_id?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    identity_number?: string | null
                    status?: string
                    last_assignment_date?: string | null
                    assignment_status?: string | null
                    sponsor_id?: string | null
                    school_id?: string | null
                    grade?: string | null
                    education_status?: string | null
                    photo_url?: string | null
                    guardian_name?: string | null
                    guardian_relation?: string | null
                    guardian_phone?: string | null
                    address?: string | null
                    city_id?: string | null
                    district_id?: string | null
                    notes?: string | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            donations: {
                Row: {
                    id: string
                    donation_number: string | null
                    donor_name: string | null
                    donor_phone: string | null
                    donor_email: string | null
                    donation_type: string
                    category_id: string | null
                    amount: number
                    currency: string
                    payment_method: string | null
                    payment_status: string
                    description: string | null
                    notes: string | null
                    created_by: string | null
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    donation_number?: string | null
                    donor_name?: string | null
                    donor_phone?: string | null
                    donor_email?: string | null
                    donation_type: string
                    category_id?: string | null
                    amount: number
                    currency?: string
                    payment_method?: string | null
                    payment_status?: string
                    description?: string | null
                    notes?: string | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    donation_number?: string | null
                    donor_name?: string | null
                    donor_phone?: string | null
                    donor_email?: string | null
                    donation_type?: string
                    category_id?: string | null
                    amount?: number
                    currency?: string
                    payment_method?: string | null
                    payment_status?: string
                    description?: string | null
                    notes?: string | null
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            countries: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    phone_code: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    phone_code?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string | null
                    phone_code?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            cities: {
                Row: {
                    id: string
                    country_id: string | null
                    name: string
                    phone_code: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    country_id?: string | null
                    name: string
                    phone_code?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    country_id?: string | null
                    name?: string
                    phone_code?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            districts: {
                Row: {
                    id: string
                    city_id: string | null
                    name: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    city_id?: string | null
                    name: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    city_id?: string | null
                    name?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    type: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            partners: {
                Row: {
                    id: string
                    name: string
                    type: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            sponsors: {
                Row: {
                    id: string
                    first_name: string
                    last_name: string
                    email: string | null
                    phone: string | null
                    address: string | null
                    country_id: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    first_name: string
                    last_name: string
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    country_id?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    first_name?: string
                    last_name?: string
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    country_id?: string | null
                    status?: string
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    avatar_url: string | null
                    role: 'admin' | 'moderator' | 'user' | 'viewer'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'moderator' | 'user' | 'viewer'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'moderator' | 'user' | 'viewer'
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Profile type
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// ============================================
// Additional Types (Not in generated types yet)
// ============================================

/**
 * Purchase Requests - Satın Alma Talepleri
 */
export interface PurchaseRequest {
  id: string
  request_number: string | null
  merchant_id: string | null
  requested_date: string | null
  required_date: string | null
  status: string
  priority: string | null
  item_description: string
  quantity: number | null
  estimated_cost: number | null
  approved_amount: number | null
  approval_date: string | null
  approved_by: string | null
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  merchant?: {
    id: string
    name: string
  }
}

export interface PurchaseRequestInsert {
  id?: string
  request_number?: string | null
  merchant_id?: string | null
  requested_date?: string | null
  required_date?: string | null
  status?: string
  priority?: string | null
  item_description?: string
  quantity?: number | null
  estimated_cost?: number | null
  approved_amount?: number | null
  approval_date?: string | null
  approved_by?: string | null
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface PurchaseRequestUpdate {
  id?: string
  request_number?: string | null
  merchant_id?: string | null
  requested_date?: string | null
  required_date?: string | null
  status?: string
  priority?: string | null
  item_description?: string
  quantity?: number | null
  estimated_cost?: number | null
  approved_amount?: number | null
  approval_date?: string | null
  approved_by?: string | null
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Merchants - Tedarikçiler
 */
export interface Merchant {
  id: string
  name: string
  tax_number: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  status: string
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface MerchantInsert {
  id?: string
  name?: string
  tax_number?: string | null
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  status?: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface MerchantUpdate {
  id?: string
  name?: string
  tax_number?: string | null
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  status?: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Volunteers - Gönüllüler (Extended)
 */
export interface Volunteer {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  birth_date: string | null
  skills: string[] | null
  availability: string | null
  status: string
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface VolunteerInsert {
  id?: string
  first_name?: string
  last_name?: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  birth_date?: string | null
  skills?: string[] | null
  availability?: string | null
  status?: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface VolunteerUpdate {
  id?: string
  first_name?: string
  last_name?: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  birth_date?: string | null
  skills?: string[] | null
  availability?: string | null
  status?: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Volunteer Missions - Gönüllü Görevleri
 */
export interface VolunteerMission {
  id: string
  volunteer_id: string
  mission_date: string
  title: string
  description: string | null
  location: string | null
  status: string
  start_time: string | null
  end_time: string | null
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  volunteer?: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
  }
}

export interface VolunteerMissionInsert {
  id?: string
  volunteer_id?: string
  mission_date?: string
  title?: string
  description?: string | null
  location?: string | null
  status?: string
  start_time?: string | null
  end_time?: string | null
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface VolunteerMissionUpdate {
  id?: string
  volunteer_id?: string
  mission_date?: string
  title?: string
  description?: string | null
  location?: string | null
  status?: string
  start_time?: string | null
  end_time?: string | null
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Aids - Yardım Kayıtları (Extended)
 */
export interface Aid {
  id: string
  needy_person_id: string | null
  aid_type: string
  amount: number | null
  description: string | null
  distribution_date: string | null
  status: string
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface AidInsert {
  id?: string
  needy_person_id?: string | null
  aid_type?: string
  amount?: number | null
  description?: string | null
  distribution_date?: string | null
  status?: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface AidUpdate {
  id?: string
  needy_person_id?: string | null
  aid_type?: string
  amount?: number | null
  description?: string | null
  distribution_date?: string | null
  status?: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Calendar Events - Takvim Etkinlikleri
 */
export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  all_day: boolean
  location: string | null
  event_type: string
  status: string
  attendees: string[] | null
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEventInsert {
  id?: string
  title?: string
  description?: string | null
  start_date?: string
  end_date?: string | null
  all_day?: boolean
  location?: string | null
  event_type?: string
  status?: string
  attendees?: string[] | null
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface CalendarEventUpdate {
  id?: string
  title?: string
  description?: string | null
  start_date?: string
  end_date?: string | null
  all_day?: boolean
  location?: string | null
  event_type?: string
  status?: string
  attendees?: string[] | null
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at?: string
  updated_at?: string
}
