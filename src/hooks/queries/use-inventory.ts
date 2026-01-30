// ============================================
// STOK / DEPO SORGULARI
// ============================================

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
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

// ============================================
// DEPO SORGULARI
// ============================================

export function useWarehouses() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select(`
          *,
          manager:manager_id (id, full_name, email)
        `)
        .order('name')
      
      if (error) throw error
      return data as Warehouse[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useWarehouseById(id: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('warehouses')
        .select(`
          *,
          manager:manager_id (id, full_name, email)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Warehouse
    },
    enabled: !!id,
  })
}

export function useWarehouseStock(warehouseId: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['warehouse-stock', warehouseId],
    queryFn: async () => {
      if (!warehouseId) return []
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('item_name')
      
      if (error) throw error
      return data as (WarehouseStock & { item_name: string; sku: string })[]
    },
    enabled: !!warehouseId,
  })
}

// ============================================
// KATEGORİ SORGULARI
// ============================================

export function useItemCategories() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['item-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (error) throw error
      return data as ItemCategory[]
    },
    staleTime: 30 * 60 * 1000,
  })
}

// ============================================
// TEDARİKÇİ SORGULARI
// ============================================

export function useSuppliers() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as Supplier[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

// ============================================
// ÜRÜN SORGULARI
// ============================================

export function useInventorySummary(filters?: {
  category_id?: string
  status?: string
  stock_status?: string
  search?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['inventory-summary', filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_summary')
        .select('*')
        .order('name')
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters?.stock_status) {
        query = query.eq('stock_status', filters.stock_status)
      }
      
      if (filters?.search) {
        query = query.or(`item_name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as (InventoryItem & { 
        item_id: string
        item_name: string
        category_name: string | null
        total_quantity: number
        total_reserved: number
        total_available: number
        warehouse_count: number
        stock_status: string 
      })[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useInventoryItem(itemId: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: async () => {
      if (!itemId) return null
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:category_id (*)
        `)
        .eq('id', itemId)
        .single()
      
      if (error) throw error
      return data as InventoryItem
    },
    enabled: !!itemId,
  })
}

export function useItemStockLevels(itemId: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['item-stock-levels', itemId],
    queryFn: async () => {
      if (!itemId) return []
      const { data, error } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('item_id', itemId)
      
      if (error) throw error
      return data as WarehouseStock[]
    },
    enabled: !!itemId,
  })
}

export function useFindItemByBarcode(barcode: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['item-by-barcode', barcode],
    queryFn: async () => {
      if (!barcode) return null
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:category_id (*)
        `)
        .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
        .single()
      
      if (error) return null
      return data as InventoryItem
    },
    enabled: !!barcode,
  })
}

// ============================================
// HAREKET SORGULARI
// ============================================

export function useInventoryTransactions(filters?: {
  item_id?: string
  warehouse_id?: string
  type?: string
  date_from?: string
  date_to?: string
  limit?: number
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['inventory-transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_transactions')
        .select(`
          *,
          item:item_id (id, name, sku, barcode, unit),
          warehouse:warehouse_id (id, name, code),
          lot:lot_id (id, lot_number, expiry_date),
          performer:performed_by (id, full_name)
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
      
      if (error) throw error
      return data as InventoryTransaction[]
    },
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// PARTİ / LOT SORGULARI
// ============================================

export function useInventoryLots(filters?: {
  item_id?: string
  warehouse_id?: string
  status?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['inventory-lots', filters],
    queryFn: async () => {
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
      
      if (error) throw error
      return data as InventoryLot[]
    },
  })
}

export function useExpiringLots(days: number = 30) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['expiring-lots', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expiring_items')
        .select('*')
        .gte('days_until_expiry', -30)
        .lte('days_until_expiry', days)
        .order('expiry_date')
      
      if (error) throw error
      return data as (InventoryLot & { 
        days_until_expiry: number
        item_name: string
        warehouse_name: string 
      })[]
    },
  })
}

// ============================================
// UYARI SORGULARI
// ============================================

export function useStockAlerts(filters?: {
  is_resolved?: boolean
  severity?: string
  type?: string
}) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['stock-alerts', filters],
    queryFn: async () => {
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
      
      if (error) throw error
      return data as StockAlert[]
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useActiveAlertCount() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['active-alert-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('stock_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false)
      
      if (error) throw error
      return count || 0
    },
    staleTime: 1 * 60 * 1000,
  })
}

// ============================================
// STOK SAYIM SORGULARI
// ============================================

export function useStockCounts() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['stock-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_counts')
        .select(`
          *,
          warehouse:warehouse_id (id, name, code),
          planner:planned_by (id, full_name),
          approver:approved_by (id, full_name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as StockCount[]
    },
  })
}

export function useStockCountById(countId: string | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['stock-count', countId],
    queryFn: async () => {
      if (!countId) return null
      const { data, error } = await supabase
        .from('stock_counts')
        .select(`
          *,
          warehouse:warehouse_id (id, name, code),
          planner:planned_by (id, full_name),
          approver:approved_by (id, full_name)
        `)
        .eq('id', countId)
        .single()
      
      if (error) throw error
      return data as StockCount
    },
    enabled: !!countId,
  })
}

// ============================================
// RAPOR SORGULARI
// ============================================

export function useInventoryDashboardStats() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['inventory-dashboard-stats'],
    queryFn: async () => {
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
      const totalValue = summary?.reduce((sum: number, item: { total_available?: number }) => sum + (item.total_available || 0), 0) || 0
      
      return {
        totalItems,
        totalValue,
        lowStockCount: lowStockCount || 0,
        outOfStockCount: outOfStockCount || 0,
        expiringCount: expiring?.length || 0,
        recentAlerts: alerts as StockAlert[],
        expiringItems: expiring as InventoryLot[],
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useTransactionSummary(months: number = 6) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['transaction-summary', months],
    queryFn: async () => {
      const fromDate = new Date()
      fromDate.setMonth(fromDate.getMonth() - months)
      
      const { data, error } = await supabase
        .from('transaction_summary')
        .select('*')
        .gte('month', fromDate.toISOString())
        .order('month', { ascending: false })
      
      if (error) throw error
      return data
    },
  })
}
