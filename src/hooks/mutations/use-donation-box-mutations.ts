// ============================================
// KUMBARA MUTASYONLARI
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createDonationBox,
  updateDonationBox,
  deleteDonationBox,
  createCollectionRoute,
  updateCollectionRoute,
  addBoxToRoute,
  removeBoxFromRoute,
  createCollection,
  startCollection,
  updateCollectionDetail,
  completeCollection,
  cancelCollection,
  createMaintenance,
  completeMaintenance,
} from '@/app/actions/donation-boxes'
import type {
  DonationBoxFormValues,
  CollectionRouteFormValues,
  CollectionFormValues,
  CollectionDetailFormValues,
  MaintenanceFormValues,
} from '@/lib/validations/donation-boxes'

// ============================================
// KUMBARA MUTASYONLARI
// ============================================

export function useCreateDonationBox() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createDonationBox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-boxes'] })
      queryClient.invalidateQueries({ queryKey: ['donation-box-performance'] })
      toast.success('Kumbara oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useUpdateDonationBox() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<DonationBoxFormValues> }) =>
      updateDonationBox(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donation-boxes'] })
      queryClient.invalidateQueries({ queryKey: ['donation-box', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['donation-box-performance'] })
      toast.success('Kumbara güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useDeleteDonationBox() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteDonationBox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-boxes'] })
      queryClient.invalidateQueries({ queryKey: ['donation-box-performance'] })
      toast.success('Kumbara silindi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// ROTA MUTASYONLARI
// ============================================

export function useCreateCollectionRoute() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCollectionRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
      queryClient.invalidateQueries({ queryKey: ['route-details'] })
      toast.success('Rota oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useUpdateCollectionRoute() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CollectionRouteFormValues> }) =>
      updateCollectionRoute(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-routes'] })
      queryClient.invalidateQueries({ queryKey: ['route-details'] })
      toast.success('Rota güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useAddBoxToRoute() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ routeId, boxId, stopOrder }: { routeId: string; boxId: string; stopOrder: number }) =>
      addBoxToRoute(routeId, boxId, stopOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['route-boxes', variables.routeId] })
      queryClient.invalidateQueries({ queryKey: ['route-details'] })
      toast.success('Kumbara rotaya eklendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useRemoveBoxFromRoute() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: removeBoxFromRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-boxes'] })
      queryClient.invalidateQueries({ queryKey: ['route-details'] })
      toast.success('Kumbara rotadan çıkarıldı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// TOPLAMA MUTASYONLARI
// ============================================

export function useCreateCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['donation-box-dashboard-stats'] })
      toast.success('Toplama planlandı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useStartCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: startCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      toast.success('Toplama başlatıldı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useUpdateCollectionDetail() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ detailId, values }: { detailId: string; values: Partial<CollectionDetailFormValues> }) =>
      updateCollectionDetail(detailId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-details'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useCompleteCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ collectionId, notes }: { collectionId: string; notes?: string }) =>
      completeCollection(collectionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection-details'] })
      queryClient.invalidateQueries({ queryKey: ['donation-box-performance'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-collection-summary'] })
      queryClient.invalidateQueries({ queryKey: ['donation-box-dashboard-stats'] })
      toast.success('Toplama tamamlandı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useCancelCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ collectionId, reason }: { collectionId: string; reason: string }) =>
      cancelCollection(collectionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      toast.success('Toplama iptal edildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

// ============================================
// BAKIM MUTASYONLARI
// ============================================

export function useCreateMaintenance() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] })
      queryClient.invalidateQueries({ queryKey: ['donation-boxes'] })
      toast.success('Bakım kaydı oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ maintenanceId, resolutionNotes }: { maintenanceId: string; resolutionNotes: string }) =>
      completeMaintenance(maintenanceId, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] })
      queryClient.invalidateQueries({ queryKey: ['donation-boxes'] })
      toast.success('Bakım tamamlandı')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    },
  })
}
