// ============================================
// KUMBARA SORGULARI
// ============================================

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  DonationBox,
  DonationBoxLocationType,
  DonationBoxPerformance,
  CollectionRoute,
  RouteDetails,
  RouteBox,
  Collection,
  CollectionDetail,
  DonationBoxMaintenance,
  CollectionMonthlySummary,
} from '@/types/donation-boxes'

// ============================================
// LOKASYON TİPLERİ
// ============================================

export function useLocationTypes() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['location-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_box_location_types')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as DonationBoxLocationType[]
    },
    staleTime: 30 * 60 * 1000,
  })
}

// ============================================
// KUMBARA SORGULARI
// ============================================

export function useDonationBoxes(filters?: {
  status?: string
  city?: string
  district?: string
  location_type_id?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['donation-boxes', filters],
    queryFn: async () => {
      let query = supabase
        .from('donation_boxes')
        .select(`
          *,
          location_type:location_type_id (*)
        `)
        .order('name')
      
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.city) query = query.eq('city', filters.city)
      if (filters?.district) query = query.eq('district', filters.district)
      if (filters?.location_type_id) query = query.eq('location_type_id', filters.location_type_id)
      
      const { data, error } = await query
      
      if (error) throw error
      return data as DonationBox[]
    },
  })
}

export function useDonationBoxById(id: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['donation-box', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('donation_boxes')
        .select(`
          *,
          location_type:location_type_id (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as DonationBox
    },
    enabled: !!id,
  })
}

export function useDonationBoxPerformance() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['donation-box-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_box_performance')
        .select('*')
        .order('performance_percentage', { ascending: false })
      
      if (error) throw error
      return data as DonationBoxPerformance[]
    },
  })
}

export function useBoxesNeedingCollection() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['boxes-needing-collection'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('donation_boxes')
        .select(`
          *,
          location_type:location_type_id (*)
        `)
        .or(`next_collection_date.lte.${today},next_collection_date.is.null`)
        .eq('status', 'active')
        .order('next_collection_date', { ascending: true })
      
      if (error) throw error
      return data as DonationBox[]
    },
  })
}

// ============================================
// ROTA SORGULARI
// ============================================

export function useCollectionRoutes() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['collection-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_routes')
        .select(`
          *,
          collector:collector_id (id, first_name, last_name, phone),
          backup_collector:backup_collector_id (id, first_name, last_name)
        `)
        .order('name')
      
      if (error) throw error
      return data as CollectionRoute[]
    },
  })
}

export function useRouteDetails() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['route-details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('route_details')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as RouteDetails[]
    },
  })
}

export function useRouteById(id: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['collection-route', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('collection_routes')
        .select(`
          *,
          collector:collector_id (id, first_name, last_name, phone),
          backup_collector:backup_collector_id (id, first_name, last_name)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as CollectionRoute
    },
    enabled: !!id,
  })
}

export function useRouteBoxes(routeId: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['route-boxes', routeId],
    queryFn: async () => {
      if (!routeId) return []
      const { data, error } = await supabase
        .from('route_boxes')
        .select(`
          *,
          box:box_id (*)
        `)
        .eq('route_id', routeId)
        .order('stop_order')
      
      if (error) throw error
      return data as RouteBox[]
    },
    enabled: !!routeId,
  })
}

// ============================================
// TOPLAMA SORGULARI
// ============================================

export function useCollections(filters?: {
  route_id?: string
  collector_id?: string
  status?: string
  date_from?: string
  date_to?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['collections', filters],
    queryFn: async () => {
      let query = supabase
        .from('collections')
        .select(`
          *,
          route:route_id (*),
          collector:collector_id (id, first_name, last_name)
        `)
        .order('scheduled_date', { ascending: false })
      
      if (filters?.route_id) query = query.eq('route_id', filters.route_id)
      if (filters?.collector_id) query = query.eq('collector_id', filters.collector_id)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.date_from) query = query.gte('scheduled_date', filters.date_from)
      if (filters?.date_to) query = query.lte('scheduled_date', filters.date_to)
      
      const { data, error } = await query
      
      if (error) throw error
      return data as Collection[]
    },
  })
}

export function useCollectionById(id: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          route:route_id (*),
          collector:collector_id (id, first_name, last_name)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Collection
    },
    enabled: !!id,
  })
}

export function useCollectionDetails(collectionId: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['collection-details', collectionId],
    queryFn: async () => {
      if (!collectionId) return []
      const { data, error } = await supabase
        .from('collection_details')
        .select(`
          *,
          box:box_id (*)
        `)
        .eq('collection_id', collectionId)
      
      if (error) throw error
      return data as CollectionDetail[]
    },
    enabled: !!collectionId,
  })
}

// ============================================
// BAKIM SORGULARI
// ============================================

export function useMaintenanceRecords(boxId?: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['maintenance-records', boxId],
    queryFn: async () => {
      let query = supabase
        .from('donation_box_maintenance')
        .select(`
          *,
          box:box_id (*),
          reported_by_user:reported_by (id, full_name),
          assigned_to_user:assigned_to (id, full_name)
        `)
        .order('reported_at', { ascending: false })
      
      if (boxId) query = query.eq('box_id', boxId)
      
      const { data, error } = await query
      
      if (error) throw error
      return data as DonationBoxMaintenance[]
    },
  })
}

// ============================================
// RAPOR SORGULARI
// ============================================

export function useMonthlyCollectionSummary() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['monthly-collection-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_collection_summary')
        .select('*')
        .limit(12)
      
      if (error) throw error
      return data as CollectionMonthlySummary[]
    },
  })
}

export function useDonationBoxDashboardStats() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['donation-box-dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const [
        { count: totalBoxes },
        { count: activeBoxes },
        { count: routes },
        { count: todayCollections },
        { data: upcomingCollections },
      ] = await Promise.all([
        supabase.from('donation_boxes').select('*', { count: 'exact', head: true }),
        supabase.from('donation_boxes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('collection_routes').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('collections').select('*', { count: 'exact', head: true }).eq('scheduled_date', today),
        supabase.from('collections')
          .select(`
            *,
            route:route_id (name)
          `)
          .eq('status', 'scheduled')
          .gte('scheduled_date', today)
          .order('scheduled_date')
          .limit(5),
      ])
      
      return {
        totalBoxes: totalBoxes || 0,
        activeBoxes: activeBoxes || 0,
        routes: routes || 0,
        todayCollections: todayCollections || 0,
        upcomingCollections: upcomingCollections || [],
      }
    },
  })
}
