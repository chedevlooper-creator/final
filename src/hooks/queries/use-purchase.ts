'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface PurchaseRequestFilters {
  merchant_id?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export function usePurchaseRequestsList(filters?: PurchaseRequestFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['purchase-requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('purchase_requests')
        .select(`
          *,
          merchant:merchants(id, name)
        `, { count: 'exact' })
        .order('requested_date', { ascending: false })

      if (filters?.merchant_id) {
        query = query.eq('merchant_id', filters.merchant_id)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.date_from) {
        query = query.gte('requested_date', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('requested_date', filters.date_to)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}

export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}

export interface MerchantFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export function useMerchantsList(filters?: MerchantFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['merchants', filters],
    queryFn: async () => {
      let query = supabase
        .from('merchants')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,tax_number.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useCreateMerchant() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('merchants')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
    },
  })
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from('merchants')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['merchants', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
    },
  })
}
