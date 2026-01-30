// ============================================
// STOK / DEPO YÖNETİMİ VALIDASYON ŞEMALARI
// ============================================

import { z } from 'zod'

// Depo validasyonları
export const warehouseSchema = z.object({
  code: z.string().min(2, 'Kod en az 2 karakter olmalı').max(20, 'Kod en fazla 20 karakter olabilir'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100, 'İsim en fazla 100 karakter olabilir'),
  type: z.enum(['main', 'branch', 'mobile', 'virtual'], {
    required_error: 'Depo tipi seçilmeli',
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  manager_id: z.string().uuid().optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli email girin').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type WarehouseFormValues = z.infer<typeof warehouseSchema>

// Kategori validasyonları
export const itemCategorySchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı'),
  code: z.string().min(2, 'Kod en az 2 karakter olmalı').max(10).optional(),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli renk kodu girin').default('#3B82F6'),
  icon: z.string().optional(),
  default_unit: z.string().min(1, 'Varsayılan birim seçilmeli').default('piece'),
  is_perishable: z.boolean().default(false),
  track_by_lot: z.boolean().default(false),
  min_stock_alert: z.number().min(0).default(0),
  sort_order: z.number().int().default(0),
})

export type ItemCategoryFormValues = z.infer<typeof itemCategorySchema>

// Tedarikçi validasyonları
export const supplierSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  type: z.enum(['company', 'individual', 'donor']).default('company'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli email girin').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  tax_number: z.string().optional(),
  website: z.string().url('Geçerli URL girin').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

// Ürün validasyonları
export const inventoryItemSchema = z.object({
  sku: z.string().min(2, 'SKU en az 2 karakter olmalı').optional(),
  barcode: z.string().optional(),
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı').max(200),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  unit: z.string().min(1, 'Birim seçilmeli'),
  unit_weight: z.number().min(0).optional(),
  track_inventory: z.boolean().default(true),
  enable_stock_alert: z.boolean().default(true),
  min_stock_level: z.number().min(0).default(0),
  max_stock_level: z.number().min(0).optional(),
  reorder_point: z.number().min(0).optional(),
  is_perishable: z.boolean().default(false),
  shelf_life_days: z.number().int().min(1).optional(),
  storage_conditions: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.unknown()).optional(),
  images: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>

// Stok hareketi validasyonları
export const inventoryTransactionSchema = z.object({
  type: z.enum(['in', 'out', 'transfer', 'adjustment', 'count', 'return', 'damage', 'expired'], {
    required_error: 'Hareket tipi seçilmeli',
  }),
  item_id: z.string().uuid('Ürün seçilmeli'),
  warehouse_id: z.string().uuid('Depo seçilmeli'),
  lot_id: z.string().uuid().optional(),
  quantity: z.number().positive('Miktar 0\'dan büyük olmalı'),
  unit_cost: z.number().min(0).optional(),
  source_warehouse_id: z.string().uuid().optional(),
  destination_warehouse_id: z.string().uuid().optional(),
  reference_type: z.string().optional(),
  reference_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  needy_person_id: z.string().uuid().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli tarih formatı: YYYY-MM-DD'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  barcode_scanned: z.string().optional(),
}).refine(
  (data) => {
    // Transfer için kaynak ve hedep depo zorunlu
    if (data.type === 'transfer') {
      return !!data.source_warehouse_id && !!data.destination_warehouse_id
    }
    return true
  },
  {
    message: 'Transfer işlemi için kaynak ve hedef depo seçilmeli',
    path: ['source_warehouse_id'],
  }
).refine(
  (data) => {
    // Transfer için kaynak ve hedef farklı olmalı
    if (data.type === 'transfer') {
      return data.source_warehouse_id !== data.destination_warehouse_id
    }
    return true
  },
  {
    message: 'Kaynak ve hedef depo aynı olamaz',
    path: ['destination_warehouse_id'],
  }
)

export type InventoryTransactionFormValues = z.infer<typeof inventoryTransactionSchema>

// Hızlı stok giriş/çıkış validasyonu
export const quickStockOperationSchema = z.object({
  barcode: z.string().min(1, 'Barkod okutulmalı'),
  warehouse_id: z.string().uuid('Depo seçilmeli'),
  type: z.enum(['in', 'out'], {
    required_error: 'İşlem tipi seçilmeli',
  }),
  quantity: z.number().positive('Miktar 0\'dan büyük olmalı'),
  lot_number: z.string().optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reference_type: z.string().optional(),
  reference_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export type QuickStockOperationValues = z.infer<typeof quickStockOperationSchema>

// Stok düzeltme validasyonu
export const stockAdjustmentSchema = z.object({
  item_id: z.string().uuid('Ürün seçilmeli'),
  warehouse_id: z.string().uuid('Depo seçilmeli'),
  lot_id: z.string().uuid().optional(),
  new_quantity: z.number().min(0, 'Miktar 0 veya daha büyük olmalı'),
  reason: z.string().min(3, 'Düzeltme sebebi en az 3 karakter olmalı'),
  notes: z.string().optional(),
})

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>

// Depo transfer validasyonu
export const warehouseTransferSchema = z.object({
  item_id: z.string().uuid('Ürün seçilmeli'),
  source_warehouse_id: z.string().uuid('Kaynak depo seçilmeli'),
  destination_warehouse_id: z.string().uuid('Hedef depo seçilmeli'),
  quantity: z.number().positive('Miktar 0\'dan büyük olmalı'),
  lot_id: z.string().uuid().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.source_warehouse_id !== data.destination_warehouse_id,
  {
    message: 'Kaynak ve hedef depo aynı olamaz',
    path: ['destination_warehouse_id'],
  }
)

export type WarehouseTransferFormValues = z.infer<typeof warehouseTransferSchema>

// Stok sayım validasyonları
export const stockCountSchema = z.object({
  warehouse_id: z.string().uuid('Depo seçilmeli'),
  type: z.enum(['full', 'partial', 'cycle', 'spot']).default('full'),
  planned_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
})

export type StockCountFormValues = z.infer<typeof stockCountSchema>

export const stockCountItemSchema = z.object({
  count_id: z.string().uuid(),
  item_id: z.string().uuid(),
  lot_id: z.string().uuid().optional(),
  counted_quantity: z.number().min(0),
  discrepancy_reason: z.string().optional(),
  notes: z.string().optional(),
})

export type StockCountItemFormValues = z.infer<typeof stockCountItemSchema>

// Uyarı çözümleme validasyonu
export const resolveAlertSchema = z.object({
  resolution_notes: z.string().min(3, 'Çözüm notu en az 3 karakter olmalı'),
})

export type ResolveAlertFormValues = z.infer<typeof resolveAlertSchema>

// Parti/Lot validasyonları
export const inventoryLotSchema = z.object({
  lot_number: z.string().min(1, 'Parti numarası girilmeli'),
  item_id: z.string().uuid('Ürün seçilmeli'),
  warehouse_id: z.string().uuid('Depo seçilmeli'),
  quantity: z.number().positive('Miktar 0\'dan büyük olmalı'),
  manufacture_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  supplier_id: z.string().uuid().optional(),
  donation_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export type InventoryLotFormValues = z.infer<typeof inventoryLotSchema>
