// ============================================
// STOK / DEPO MUTASYONLARI
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  createItemCategory,
  updateItemCategory,
  createSupplier,
  createInventoryItem,
  updateInventoryItem,
  createInventoryTransaction,
  quickStockIn,
  quickStockOut,
  adjustStock,
  transferBetweenWarehouses,
  resolveStockAlert,
  createStockCount,
  startStockCount,
  completeStockCount,
} from '@/app/actions/inventory'
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
// DEPO MUTASYONLARI
// ============================================

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Depo oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<WarehouseFormValues> }) =>
      updateWarehouse(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse', variables.id] })
      toast.success('Depo güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Depo silindi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// KATEGORİ MUTASYONLARI
// ============================================

export function useCreateItemCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createItemCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-categories'] })
      toast.success('Kategori oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useUpdateItemCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ItemCategoryFormValues> }) =>
      updateItemCategory(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-categories'] })
      toast.success('Kategori güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// TEDARİKÇİ MUTASYONLARI
// ============================================

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Tedarikçi oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// ÜRÜN MUTASYONLARI
// ============================================

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      toast.success('Ürün oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<InventoryItemFormValues> }) =>
      updateInventoryItem(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-item', variables.id] })
      toast.success('Ürün güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// STOK HAREKET MUTASYONLARI
// ============================================

export function useCreateInventoryTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createInventoryTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      queryClient.invalidateQueries({ queryKey: ['item-stock-levels'] })
      toast.success('Hareket kaydedildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useQuickStockIn() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quickStockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      toast.success('Stok girişi yapıldı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useQuickStockOut() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: quickStockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      toast.success('Stok çıkışı yapıldı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      queryClient.invalidateQueries({ queryKey: ['item-stock-levels'] })
      toast.success('Stok düzeltildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useTransferBetweenWarehouses() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: transferBetweenWarehouses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      queryClient.invalidateQueries({ queryKey: ['item-stock-levels'] })
      toast.success('Transfer tamamlandı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// UYARI MUTASYONLARI
// ============================================

export function useResolveStockAlert() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ alertId, resolutionNotes }: { alertId: string; resolutionNotes: string }) =>
      resolveStockAlert(alertId, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['active-alert-count'] })
      toast.success('Uyarı çözümlendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// STOK SAYIM MUTASYONLARI
// ============================================

export function useCreateStockCount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createStockCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] })
      toast.success('Sayım oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useStartStockCount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: startStockCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] })
      toast.success('Sayım başlatıldı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useCompleteStockCount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: completeStockCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      toast.success('Sayım tamamlandı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}
