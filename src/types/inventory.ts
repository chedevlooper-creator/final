// ============================================
// STOK / DEPO YÖNETİMİ TİPLERİ
// ============================================

// Depo Tipleri
export type WarehouseType = 'main' | 'branch' | 'mobile' | 'virtual'

export interface Warehouse {
  id: string
  code: string
  name: string
  type: WarehouseType
  address?: string | null
  city?: string | null
  district?: string | null
  manager_id?: string | null
  phone?: string | null
  email?: string | null
  is_active: boolean
  notes?: string | null
  created_at: string
  updated_at: string
  // Relations
  manager?: {
    id: string
    full_name: string
    email: string
  }
}

// Ürün Kategorileri
export interface ItemCategory {
  id: string
  name: string
  code?: string | null
  description?: string | null
  parent_id?: string | null
  color?: string
  icon?: string | null
  default_unit: string
  is_perishable: boolean
  track_by_lot: boolean
  min_stock_alert: number
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  parent?: ItemCategory
  children?: ItemCategory[]
}

// Tedarikçiler
export type SupplierType = 'company' | 'individual' | 'donor'

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  tax_number?: string | null
  website?: string | null
  is_active: boolean
  notes?: string | null
  created_at: string
  updated_at: string
}

// Ürünler / Envanter Kalemleri
export type ItemStatus = 'active' | 'inactive' | 'discontinued'

export interface InventoryItem {
  id: string
  sku?: string | null
  barcode?: string | null
  name: string
  description?: string | null
  category_id?: string | null
  unit: string
  unit_weight?: number | null
  track_inventory: boolean
  enable_stock_alert: boolean
  min_stock_level: number
  max_stock_level?: number | null
  reorder_point?: number | null
  avg_cost: number
  last_cost: number
  is_perishable: boolean
  shelf_life_days?: number | null
  storage_conditions?: string | null
  status: ItemStatus
  is_active: boolean
  tags?: string[]
  attributes?: Record<string, unknown>
  images?: string[]
  notes?: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: ItemCategory
  // Computed
  total_quantity?: number
  total_reserved?: number
  total_available?: number
  stock_status?: StockStatus
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'

// Depo Stok Seviyeleri
export interface WarehouseStock {
  id: string
  warehouse_id: string
  item_id: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  location_code?: string | null
  last_movement_at?: string | null
  last_counted_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Relations
  warehouse?: Warehouse
  item?: InventoryItem
  stock_status?: StockStatus
}

// Parti / Lot Takibi
export type LotStatus = 'active' | 'expired' | 'consumed' | 'damaged'

export interface InventoryLot {
  id: string
  lot_number: string
  item_id: string
  warehouse_id: string
  quantity: number
  remaining_quantity: number
  manufacture_date?: string | null
  expiry_date?: string | null
  received_date: string
  supplier_id?: string | null
  donation_id?: string | null
  status: LotStatus
  notes?: string | null
  created_at: string
  updated_at: string
  // Relations
  item?: InventoryItem
  warehouse?: Warehouse
  supplier?: Supplier
  // Computed
  days_until_expiry?: number
}

// Stok Hareketleri
export type TransactionType = 'in' | 'out' | 'transfer' | 'adjustment' | 'count' | 'return' | 'damage' | 'expired'
export type TransactionStatus = 'pending' | 'completed' | 'cancelled'

export interface InventoryTransaction {
  id: string
  transaction_number: string
  type: TransactionType
  status: TransactionStatus
  item_id: string
  warehouse_id: string
  lot_id?: string | null
  quantity: number
  unit_cost?: number | null
  total_cost?: number | null
  source_warehouse_id?: string | null
  destination_warehouse_id?: string | null
  reference_type?: string | null
  reference_id?: string | null
  supplier_id?: string | null
  needy_person_id?: string | null
  performed_by?: string | null
  approved_by?: string | null
  transaction_date: string
  completed_at?: string | null
  reason?: string | null
  notes?: string | null
  barcode_scanned?: string | null
  created_at: string
  updated_at: string
  // Relations
  item?: InventoryItem
  warehouse?: Warehouse
  lot?: InventoryLot
  source_warehouse?: Warehouse
  destination_warehouse?: Warehouse
  supplier?: Supplier
  needy_person?: {
    id: string
    first_name: string
    last_name: string
  }
  performer?: {
    id: string
    full_name: string
    email: string
  }
  approver?: {
    id: string
    full_name: string
    email: string
  }
}

// Stok Uyarıları
export type AlertType = 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'overstock' | 'reorder'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface StockAlert {
  id: string
  type: AlertType
  item_id: string
  warehouse_id?: string | null
  lot_id?: string | null
  severity: AlertSeverity
  message: string
  current_value?: number | null
  threshold_value?: number | null
  is_resolved: boolean
  resolved_at?: string | null
  resolved_by?: string | null
  resolution_notes?: string | null
  created_at: string
  acknowledged_at?: string | null
  acknowledged_by?: string | null
  // Relations
  item?: InventoryItem
  warehouse?: Warehouse
  lot?: InventoryLot
}

// Stok Sayımı
export type CountType = 'full' | 'partial' | 'cycle' | 'spot'
export type CountStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled'

export interface StockCount {
  id: string
  count_number: string
  warehouse_id: string
  type: CountType
  status: CountStatus
  planned_date?: string | null
  started_at?: string | null
  completed_at?: string | null
  planned_by?: string | null
  counted_by?: string[]
  approved_by?: string | null
  total_items: number
  matched_items: number
  discrepancy_items: number
  discrepancy_value: number
  notes?: string | null
  created_at: string
  updated_at: string
  // Relations
  warehouse?: Warehouse
  planner?: {
    id: string
    full_name: string
  }
  approver?: {
    id: string
    full_name: string
  }
  items?: StockCountItem[]
}

export interface StockCountItem {
  id: string
  count_id: string
  item_id: string
  lot_id?: string | null
  system_quantity: number
  counted_quantity?: number | null
  counted_by?: string | null
  counted_at?: string | null
  discrepancy: number
  discrepancy_reason?: string | null
  notes?: string | null
  created_at: string
  // Relations
  item?: InventoryItem
  lot?: InventoryLot
  counter?: {
    id: string
    full_name: string
  }
}

// ============================================
// FORM TİPLERİ
// ============================================

export interface WarehouseFormValues {
  code: string
  name: string
  type: WarehouseType
  address?: string
  city?: string
  district?: string
  manager_id?: string
  phone?: string
  email?: string
  notes?: string
}

export interface ItemCategoryFormValues {
  name: string
  code?: string
  description?: string
  parent_id?: string
  color?: string
  icon?: string
  default_unit: string
  is_perishable?: boolean
  track_by_lot?: boolean
  min_stock_alert?: number
  sort_order?: number
}

export interface InventoryItemFormValues {
  sku?: string
  barcode?: string
  name: string
  description?: string
  category_id?: string
  unit: string
  unit_weight?: number
  track_inventory?: boolean
  enable_stock_alert?: boolean
  min_stock_level?: number
  max_stock_level?: number
  reorder_point?: number
  is_perishable?: boolean
  shelf_life_days?: number
  storage_conditions?: string
  status?: ItemStatus
  tags?: string[]
  attributes?: Record<string, unknown>
  images?: string[]
  notes?: string
}

export interface InventoryTransactionFormValues {
  type: TransactionType
  item_id: string
  warehouse_id: string
  lot_id?: string
  quantity: number
  unit_cost?: number
  source_warehouse_id?: string
  destination_warehouse_id?: string
  reference_type?: string
  reference_id?: string
  supplier_id?: string
  needy_person_id?: string
  transaction_date: string
  reason?: string
  notes?: string
  barcode_scanned?: string
}

export interface StockAdjustmentFormValues {
  item_id: string
  warehouse_id: string
  lot_id?: string
  new_quantity: number
  reason: string
  notes?: string
}

export interface StockCountFormValues {
  warehouse_id: string
  type: CountType
  planned_date?: string
  notes?: string
}

export interface StockCountItemFormValues {
  count_id: string
  item_id: string
  lot_id?: string
  counted_quantity: number
  discrepancy_reason?: string
  notes?: string
}

// ============================================
// FİLTRE VE SIRALAMA TİPLERİ
// ============================================

export interface InventoryFilters {
  search?: string
  category_id?: string
  status?: ItemStatus
  stock_status?: StockStatus
  warehouse_id?: string
  low_stock?: boolean
  is_perishable?: boolean
}

export interface TransactionFilters {
  type?: TransactionType
  status?: TransactionStatus
  item_id?: string
  warehouse_id?: string
  date_from?: string
  date_to?: string
  performed_by?: string
}

export interface AlertFilters {
  type?: AlertType
  severity?: AlertSeverity
  is_resolved?: boolean
  item_id?: string
  warehouse_id?: string
}

// ============================================
// RAPOR TİPLERİ
// ============================================

export interface InventorySummaryReport {
  total_items: number
  total_value: number
  low_stock_items: number
  out_of_stock_items: number
  expiring_items: number
  category_breakdown: {
    category_id: string
    category_name: string
    item_count: number
    total_quantity: number
    total_value: number
  }[]
  warehouse_breakdown: {
    warehouse_id: string
    warehouse_name: string
    item_count: number
    total_quantity: number
  }[]
}

export interface TransactionReport {
  period: string
  in_quantity: number
  in_value: number
  out_quantity: number
  out_value: number
  net_change: number
}

export interface StockMovementReport {
  item_id: string
  item_name: string
  sku: string
  opening_stock: number
  incoming: number
  outgoing: number
  adjustments: number
  closing_stock: number
}
