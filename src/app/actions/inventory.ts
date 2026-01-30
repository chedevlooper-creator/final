'use server'

// ============================================
// STOK / DEPO YÖNETİMİ SERVER ACTIONS
// ============================================

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  Warehouse,
  ItemCategory,
  Supplier,
  InventoryItem,
  InventoryTransaction,
  StockAlert,
  WarehouseStock,
  InventoryLot,
  StockCount,
} from '@/types/inventory'
import type {
  WarehouseFormValues,
  ItemCategoryFormValues,
  SupplierFormValues,
  InventoryItemFormValues,
  InventoryTransactionFormValues,
  StockAdjustmentFormValues,
  WarehouseTransferFormValues,
  StockCountFormValues,
  QuickStockOperationValues,
} from '@/lib/validations/inventory'

// ============================================
// DEPO İŞLEMLERİ
// ============================================

export async function getWarehouses(): Promise<Warehouse[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('warehouses')
    .select(`
      *,
      manager:manager_id (id, full_name, email)
    `)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('warehouses')
    .select(`
      *,
      manager:manager_id (id, full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createWarehouse(values: WarehouseFormValues): Promise<Warehouse> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('warehouses')
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/warehouses')
  return data
}

export async function updateWarehouse(id: string, values: Partial<WarehouseFormValues>): Promise<Warehouse> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('warehouses')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/warehouses')
  return data
}

export async function deleteWarehouse(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/warehouses')
}

// ============================================
// KATEGORİ İŞLEMLERİ
// ============================================

export async function getItemCategories(): Promise<ItemCategory[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('item_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return data || []
}

export async function createItemCategory(values: ItemCategoryFormValues): Promise<ItemCategory> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('item_categories')
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/categories')
  return data
}

export async function updateItemCategory(id: string, values: Partial<ItemCategoryFormValues>): Promise<ItemCategory> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('item_categories')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/categories')
  return data
}

// ============================================
// TEDARİKÇİ İŞLEMLERİ
// ============================================

export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function createSupplier(values: SupplierFormValues): Promise<Supplier> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('suppliers')
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ============================================
// ÜRÜN İŞLEMLERİ
// ============================================

export async function getInventoryItems(filters?: {
  category_id?: string
  status?: string
  search?: string
}): Promise<InventoryItem[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('inventory_summary')
    .select('*')
    .order('name')

  if (filters?.category_id) {
    // Note: inventory_summary view doesn't have category_id directly
    // We'd need to join with items or filter differently
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data || []
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      category:category_id (*)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getItemStockByWarehouse(itemId: string): Promise<WarehouseStock[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('warehouse_inventory')
    .select('*')
    .eq('item_id', itemId)

  if (error) throw new Error(error.message)
  return data || []
}

export async function createInventoryItem(values: InventoryItemFormValues): Promise<InventoryItem> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(values)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/items')
  return data
}

export async function updateInventoryItem(
  id: string, 
  values: Partial<InventoryItemFormValues>
): Promise<InventoryItem> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('inventory_items')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/items')
  return data
}

// ============================================
// BARKOD İLE ÜRÜN BULMA
// ============================================

export async function findItemByBarcode(barcode: string): Promise<InventoryItem | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      category:category_id (*)
    `)
    .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
    .single()

  if (error) return null
  return data
}

// ============================================
// STOK HAREKETLERİ
// ============================================

export async function getInventoryTransactions(filters?: {
  item_id?: string
  warehouse_id?: string
  type?: string
  date_from?: string
  date_to?: string
  limit?: number
}): Promise<InventoryTransaction[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('inventory_transactions')
    .select(`
      *,
      item:item_id (id, name, sku, barcode, unit),
      warehouse:warehouse_id (id, name, code),
      lot:lot_id (id, lot_number, expiry_date),
      performer:performed_by (id, full_name, email),
      needy_person:needy_person_id (id, first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  if (filters?.item_id) {
    query = query.eq('item_id', filters.item_id)
  }
  
  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id)
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters?.date_from) {
    query = query.gte('transaction_date', filters.date_from)
  }
  
  if (filters?.date_to) {
    query = query.lte('transaction_date', filters.date_to)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data || []
}

export async function createInventoryTransaction(
  values: InventoryTransactionFormValues
): Promise<InventoryTransaction> {
  const supabase = await createServerSupabaseClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert({
      ...values,
      performed_by: user?.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/transactions')
  revalidatePath('/dashboard/inventory')
  return data
}

// Hızlı stok girişi
export async function quickStockIn(values: QuickStockOperationValues): Promise<InventoryTransaction> {
  const supabase = await createServerSupabaseClient()
  
  // Find item by barcode
  const item = await findItemByBarcode(values.barcode)
  if (!item) {
    throw new Error('Ürün bulunamadı')
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert({
      type: 'in',
      item_id: item.id,
      warehouse_id: values.warehouse_id,
      quantity: values.quantity,
      reference_type: values.reference_type,
      reference_id: values.reference_id,
      notes: values.notes,
      barcode_scanned: values.barcode,
      performed_by: user?.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      transaction_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory')
  return data
}

// Hızlı stok çıkışı
export async function quickStockOut(values: QuickStockOperationValues): Promise<InventoryTransaction> {
  const supabase = await createServerSupabaseClient()
  
  // Find item by barcode
  const item = await findItemByBarcode(values.barcode)
  if (!item) {
    throw new Error('Ürün bulunamadı')
  }
  
  // Check stock availability
  const { data: stock } = await supabase
    .from('warehouse_stocks')
    .select('available_quantity')
    .eq('item_id', item.id)
    .eq('warehouse_id', values.warehouse_id)
    .single()
  
  if (!stock || stock.available_quantity < values.quantity) {
    throw new Error('Yetersiz stok')
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert({
      type: 'out',
      item_id: item.id,
      warehouse_id: values.warehouse_id,
      quantity: values.quantity,
      reference_type: values.reference_type,
      reference_id: values.reference_id,
      notes: values.notes,
      barcode_scanned: values.barcode,
      performed_by: user?.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      transaction_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory')
  return data
}

// Stok düzeltme
export async function adjustStock(values: StockAdjustmentFormValues): Promise<InventoryTransaction> {
  const supabase = await createServerSupabaseClient()
  
  // Get current stock
  const { data: stock } = await supabase
    .from('warehouse_stocks')
    .select('quantity')
    .eq('item_id', values.item_id)
    .eq('warehouse_id', values.warehouse_id)
    .maybeSingle()
  
  const currentQuantity = stock?.quantity || 0
  const difference = values.new_quantity - currentQuantity
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert({
      type: 'adjustment',
      item_id: values.item_id,
      warehouse_id: values.warehouse_id,
      lot_id: values.lot_id,
      quantity: Math.abs(difference),
      reference_type: 'manual',
      notes: `${values.reason}. Eski: ${currentQuantity}, Yeni: ${values.new_quantity}`,
      performed_by: user?.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      transaction_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory')
  return data
}

// Depo transferi
export async function transferBetweenWarehouses(
  values: WarehouseTransferFormValues
): Promise<InventoryTransaction> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert({
      type: 'transfer',
      item_id: values.item_id,
      warehouse_id: values.source_warehouse_id,
      source_warehouse_id: values.source_warehouse_id,
      destination_warehouse_id: values.destination_warehouse_id,
      lot_id: values.lot_id,
      quantity: values.quantity,
      reference_type: 'manual',
      notes: values.notes || values.reason,
      performed_by: user?.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      transaction_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory')
  return data
}

// ============================================
// PARTİ / LOT İŞLEMLERİ
// ============================================

export async function getInventoryLots(filters?: {
  item_id?: string
  warehouse_id?: string
  status?: string
  expiring_soon?: boolean
}): Promise<InventoryLot[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('inventory_lots')
    .select(`
      *,
      item:item_id (id, name, sku, unit),
      warehouse:warehouse_id (id, name, code)
    `)
    .order('expiry_date', { ascending: true })

  if (filters?.item_id) {
    query = query.eq('item_id', filters.item_id)
  }
  
  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data || []
}

export async function getExpiringLots(days: number = 30): Promise<InventoryLot[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('expiring_items')
    .select('*')
    .gte('days_until_expiry', -30)
    .lte('days_until_expiry', days)
    .order('expiry_date')

  if (error) throw new Error(error.message)
  return data || []
}

// ============================================
// STOK UYARILARI
// ============================================

export async function getStockAlerts(filters?: {
  is_resolved?: boolean
  severity?: string
  type?: string
}): Promise<StockAlert[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('stock_alerts')
    .select(`
      *,
      item:item_id (id, name, sku, unit, min_stock_level),
      warehouse:warehouse_id (id, name, code),
      lot:lot_id (id, lot_number, expiry_date)
    `)
    .order('created_at', { ascending: false })

  if (filters?.is_resolved !== undefined) {
    query = query.eq('is_resolved', filters.is_resolved)
  }
  
  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data || []
}

export async function getActiveAlertCount(): Promise<number> {
  const supabase = await createServerSupabaseClient()
  
  const { count, error } = await supabase
    .from('stock_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('is_resolved', false)

  if (error) throw new Error(error.message)
  return count || 0
}

export async function resolveStockAlert(
  alertId: string, 
  resolutionNotes: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('stock_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
      resolution_notes: resolutionNotes,
    })
    .eq('id', alertId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/alerts')
}

// ============================================
// STOK SAYIMI
// ============================================

export async function getStockCounts(): Promise<StockCount[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('stock_counts')
    .select(`
      *,
      warehouse:warehouse_id (id, name, code),
      planner:planned_by (id, full_name),
      approver:approved_by (id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createStockCount(values: StockCountFormValues): Promise<StockCount> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('stock_counts')
    .insert({
      ...values,
      planned_by: user?.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  // Add all current stock items to the count
  const { data: stocks } = await supabase
    .from('warehouse_stocks')
    .select('item_id, quantity')
    .eq('warehouse_id', values.warehouse_id)
  
  if (stocks && stocks.length > 0) {
    const countItems = stocks.map(stock => ({
      count_id: data.id,
      item_id: stock.item_id,
      system_quantity: stock.quantity,
    }))
    
    await supabase.from('stock_count_items').insert(countItems)
  }
  
  revalidatePath('/dashboard/inventory/counts')
  return data
}

export async function startStockCount(countId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('stock_counts')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('id', countId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/inventory/counts')
}

export async function completeStockCount(countId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  // Update discrepancies first
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase
    .from('stock_counts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      approved_by: user?.id,
    })
    .eq('id', countId)
  
  // Apply adjustments for discrepancies
  const { data: items } = await supabase
    .from('stock_count_items')
    .select('*')
    .eq('count_id', countId)
    .neq('discrepancy', 0)
  
  if (items) {
    for (const item of items) {
      await supabase.from('inventory_transactions').insert({
        type: 'count',
        item_id: item.item_id,
        warehouse_id: (await supabase.from('stock_counts').select('warehouse_id').eq('id', countId).single()).data?.warehouse_id,
        quantity: Math.abs(item.discrepancy),
        reference_type: 'stock_count',
        reference_id: countId,
        notes: `Sayım farkı: ${item.discrepancy}. Sebep: ${item.discrepancy_reason || 'Belirtilmemiş'}`,
        performed_by: user?.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        transaction_date: new Date().toISOString().split('T')[0],
      })
    }
  }
  
  revalidatePath('/dashboard/inventory/counts')
}

// ============================================
// RAPORLAR
// ============================================

export async function getInventoryDashboardStats() {
  const supabase = await createServerSupabaseClient()
  
  const [
    { data: summary },
    { data: alerts },
    { data: expiring },
    { count: lowStockCount },
    { count: outOfStockCount },
  ] = await Promise.all([
    supabase.from('inventory_summary').select('*'),
    supabase.from('stock_alerts').select('*').eq('is_resolved', false).limit(5),
    supabase.from('expiring_items').select('*').lte('days_until_expiry', 30).gt('days_until_expiry', 0).limit(5),
    supabase.from('inventory_summary').select('*', { count: 'exact', head: true }).eq('stock_status', 'low_stock'),
    supabase.from('inventory_summary').select('*', { count: 'exact', head: true }).eq('stock_status', 'out_of_stock'),
  ])
  
  const totalItems = summary?.length || 0
  const totalValue = summary?.reduce((sum, item) => sum + (item.total_available || 0), 0) || 0
  
  return {
    totalItems,
    totalValue,
    lowStockCount: lowStockCount || 0,
    outOfStockCount: outOfStockCount || 0,
    expiringCount: expiring?.length || 0,
    recentAlerts: alerts || [],
    expiringItems: expiring || [],
  }
}

export async function getTransactionSummary(months: number = 6) {
  const supabase = await createServerSupabaseClient()
  
  const fromDate = new Date()
  fromDate.setMonth(fromDate.getMonth() - months)
  
  const { data, error } = await supabase
    .from('transaction_summary')
    .select('*')
    .gte('month', fromDate.toISOString())
    .order('month', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}
