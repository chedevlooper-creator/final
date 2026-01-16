'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { DonationFormValues } from '@/lib/validations/donation'

export interface DonationFilters {
  search?: string
  donation_type?: string
  payment_status?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export function useDonationsList(filters?: DonationFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['donations', filters],
    queryFn: async () => {
      let query = supabase
        .from('donations')
        .select(`
          *,
          category:categories(id, name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.donation_type) {
        query = query.eq('donation_type', filters.donation_type)
      }
      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useDonationDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['donations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateDonation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: DonationFormValues) => {
      const { data, error } = await supabase
        .from('donations')
        .insert({ ...values, payment_status: 'pending' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
    },
  })
}

export function useUpdateDonation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<DonationFormValues & { payment_status: string }> }) => {
      const { data, error } = await supabase
        .from('donations')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donations', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['donations'] })
    },
  })
}

// Dashboard için istatistikler
export function useDonationStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['donations', 'stats'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Bugünkü bağışlar
      const { data: todayData } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', today.toISOString())

      // Bu ayki bağışlar
      const { data: monthData } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', thisMonth.toISOString())

      // Toplam bağış
      const { data: totalData } = await supabase
        .from('donations')
        .select('amount')

      const todayTotal = todayData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const monthTotal = monthData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const allTimeTotal = totalData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

      return {
        today: todayTotal,
        thisMonth: monthTotal,
        allTime: allTimeTotal,
        count: totalData?.length || 0,
      }
    },
  })
}
