'use server'

// ============================================
// KUMBARA SİSTEMİ SERVER ACTIONS
// ============================================

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
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
import type {
  DonationBoxFormValues,
  CollectionRouteFormValues,
  CollectionFormValues,
  CollectionDetailFormValues,
  MaintenanceFormValues,
} from '@/lib/validations/donation-boxes'

// ============================================
// LOKASYON TİPLERİ
// ============================================

export async function getLocationTypes(): Promise<DonationBoxLocationType[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('donation_box_location_types')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

// ============================================
// KUMBARA İŞLEMLERİ
// ============================================

export async function getDonationBoxes(filters?: {
  status?: string
  city?: string
  district?: string
  location_type_id?: string
}): Promise<DonationBox[]> {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  return data || []
}

export async function getDonationBoxById(id: string): Promise<DonationBox | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('donation_boxes')
    .select(`
      *,
      location_type:location_type_id (*)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getDonationBoxPerformance(): Promise<DonationBoxPerformance[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('donation_box_performance')
    .select('*')
    .order('performance_percentage', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getBoxesNeedingCollection(): Promise<DonationBox[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('donation_boxes')
    .select(`
      *,
      location_type:location_type_id (*)
    `)
    .or(`next_collection_date.lte.${new Date().toISOString().split('T')[0]},next_collection_date.is.null`)
    .eq('status', 'active')
    .order('next_collection_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createDonationBox(values: DonationBoxFormValues): Promise<DonationBox> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Önce kumbarayı oluştur
  const { data, error } = await supabase
    .from('donation_boxes')
    .insert({ ...values, created_by: user?.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  // QR kod oluştur ve storage'a kaydet
  try {
    const { generateAndUploadBoxQR } = await import('@/lib/qr-code')
    const qrCodeUrl = await generateAndUploadBoxQR(data.id, data.code, supabase)
    
    // QR kod URL'sini güncelle
    await supabase
      .from('donation_boxes')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', data.id)
    
    data.qr_code_url = qrCodeUrl
  } catch (qrError) {
    console.error('QR kod oluşturma hatası:', qrError)
    // QR kod hatası kumbara oluşturmayı engellemez
  }
  
  revalidatePath('/dashboard/donations/boxes')
  return data
}

export async function updateDonationBox(
  id: string, 
  values: Partial<DonationBoxFormValues>
): Promise<DonationBox> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('donation_boxes')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/boxes')
  return data
}

export async function deleteDonationBox(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('donation_boxes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/boxes')
}

// ============================================
// ROTA İŞLEMLERİ
// ============================================

export async function getCollectionRoutes(): Promise<CollectionRoute[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('collection_routes')
    .select(`
      *,
      collector:collector_id (id, first_name, last_name, phone),
      backup_collector:backup_collector_id (id, first_name, last_name)
    `)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function getRouteDetails(): Promise<RouteDetails[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('route_details')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function getRouteById(id: string): Promise<CollectionRoute | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('collection_routes')
    .select(`
      *,
      collector:collector_id (id, first_name, last_name, phone),
      backup_collector:backup_collector_id (id, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getRouteBoxes(routeId: string): Promise<RouteBox[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('route_boxes')
    .select(`
      *,
      box:box_id (*)
    `)
    .eq('route_id', routeId)
    .order('stop_order')

  if (error) throw new Error(error.message)
  return data || []
}

export async function createCollectionRoute(values: CollectionRouteFormValues): Promise<CollectionRoute> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('collection_routes')
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/routes')
  return data
}

export async function updateCollectionRoute(
  id: string, 
  values: Partial<CollectionRouteFormValues>
): Promise<CollectionRoute> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('collection_routes')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/routes')
  return data
}

export async function addBoxToRoute(
  routeId: string, 
  boxId: string, 
  stopOrder: number
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('route_boxes')
    .insert({ route_id: routeId, box_id: boxId, stop_order: stopOrder })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/routes')
}

export async function removeBoxFromRoute(routeBoxId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('route_boxes')
    .delete()
    .eq('id', routeBoxId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/routes')
}

// ============================================
// TOPLAMA İŞLEMLERİ
// ============================================

export async function getCollections(filters?: {
  route_id?: string
  collector_id?: string
  status?: string
  date_from?: string
  date_to?: string
}): Promise<Collection[]> {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  return data || []
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      route:route_id (*),
      collector:collector_id (id, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getCollectionDetails(collectionId: string): Promise<CollectionDetail[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('collection_details')
    .select(`
      *,
      box:box_id (*)
    `)
    .eq('collection_id', collectionId)

  if (error) throw new Error(error.message)
  return data || []
}

export async function createCollection(values: CollectionFormValues): Promise<Collection> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If route is specified, get boxes from route
  let totalBoxes = 0
  if (values.route_id) {
    const { count } = await supabase
      .from('route_boxes')
      .select('*', { count: 'exact', head: true })
      .eq('route_id', values.route_id)
    totalBoxes = count || 0
  }
  
  const { data, error } = await supabase
    .from('collections')
    .insert({ 
      ...values, 
      created_by: user?.id,
      total_boxes: totalBoxes
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  // If route specified, create detail records for each box
  if (values.route_id && data) {
    const { data: routeBoxes } = await supabase
      .from('route_boxes')
      .select('box_id')
      .eq('route_id', values.route_id)
    
    if (routeBoxes && routeBoxes.length > 0) {
      const details = routeBoxes.map((rb, index) => ({
        collection_id: data.id,
        box_id: rb.box_id,
        is_collected: false,
      }))
      await supabase.from('collection_details').insert(details)
    }
  }
  
  revalidatePath('/dashboard/donations/collections')
  return data
}

export async function startCollection(collectionId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('collections')
    .update({ 
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', collectionId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/collections')
}

export async function updateCollectionDetail(
  detailId: string, 
  values: Partial<CollectionDetailFormValues>
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('collection_details')
    .update(values)
    .eq('id', detailId)

  if (error) throw new Error(error.message)
}

export async function completeCollection(collectionId: string, notes?: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  // Calculate totals
  const { data: details } = await supabase
    .from('collection_details')
    .select('*')
    .eq('collection_id', collectionId)
  
  const collectedBoxes = details?.filter(d => d.is_collected).length || 0
  const skippedBoxes = details?.filter(d => !d.is_collected).length || 0
  const totalAmount = details?.reduce((sum, d) => sum + (d.actual_amount || 0), 0) || 0
  
  const { error } = await supabase
    .from('collections')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      collected_boxes: collectedBoxes,
      skipped_boxes: skippedBoxes,
      total_amount: totalAmount,
      notes: notes
    })
    .eq('id', collectionId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/collections')
}

export async function cancelCollection(
  collectionId: string, 
  reason: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('collections')
    .update({ 
      status: 'cancelled',
      cancellation_reason: reason
    })
    .eq('id', collectionId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/donations/collections')
}

// ============================================
// BAKIM İŞLEMLERİ
// ============================================

export async function getMaintenanceRecords(boxId?: string): Promise<DonationBoxMaintenance[]> {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  return data || []
}

export async function createMaintenance(values: MaintenanceFormValues): Promise<DonationBoxMaintenance> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('donation_box_maintenance')
    .insert({ ...values, reported_by: user?.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  // Update box status to maintenance
  await supabase
    .from('donation_boxes')
    .update({ status: 'maintenance' })
    .eq('id', values.box_id)
  
  revalidatePath('/dashboard/donations/boxes')
  return data
}

export async function completeMaintenance(
  maintenanceId: string, 
  resolutionNotes: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { data: maintenance } = await supabase
    .from('donation_box_maintenance')
    .select('box_id')
    .eq('id', maintenanceId)
    .single()
  
  const { error } = await supabase
    .from('donation_box_maintenance')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      resolution_notes: resolutionNotes
    })
    .eq('id', maintenanceId)

  if (error) throw new Error(error.message)
  
  // Update box status back to active
  if (maintenance) {
    await supabase
      .from('donation_boxes')
      .update({ status: 'active' })
      .eq('id', maintenance.box_id)
  }
  
  revalidatePath('/dashboard/donations/boxes')
}

// ============================================
// RAPORLAR
// ============================================

export async function getMonthlyCollectionSummary(): Promise<CollectionMonthlySummary[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('monthly_collection_summary')
    .select('*')
    .limit(12)

  if (error) throw new Error(error.message)
  return data || []
}

export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient()
  
  const [
    { count: totalBoxes },
    { count: activeBoxes },
    { count: routes },
    { count: todayCollections },
    { data: recentCollections },
  ] = await Promise.all([
    supabase.from('donation_boxes').select('*', { count: 'exact', head: true }),
    supabase.from('donation_boxes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('collection_routes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('collections').select('*', { count: 'exact', head: true })
      .eq('scheduled_date', new Date().toISOString().split('T')[0]),
    supabase.from('collections')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date')
      .limit(5),
  ])
  
  return {
    totalBoxes: totalBoxes || 0,
    activeBoxes: activeBoxes || 0,
    routes: routes || 0,
    todayCollections: todayCollections || 0,
    upcomingCollections: recentCollections || [],
  }
}
