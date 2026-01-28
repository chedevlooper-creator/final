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

/**
 * Optimized donations list with selective column fetching
 * Only fetches required columns to reduce payload size
 */
export function useDonationsList(filters?: DonationFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['donations', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('donations')
        .select(`
          id,
          amount,
          donation_type,
          payment_status,
          donor_name,
          donor_phone,
          donor_email,
          category:categories(id, name),
          created_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Type filtering
      if (filters?.donation_type) {
        query = query.eq('donation_type', filters.donation_type)
      }

      // Status filtering
      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status)
      }

      // Date range filtering - using index-friendly columns
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      // Full-text search - uses pg_trgm index
      if (filters?.search) {
        query = query.or(
          `donor_name.ilike.%${filters.search}%,donor_phone.ilike.%${filters.search}%,donor_email.ilike.%${filters.search}%`
        )
      }

      // Pagination with range
      const { data, error, count } = await query
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    },
    // Cache for 10 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * Donation detail with full relations
 */
export function useDonationDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['donations', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          category:categories(*),
          aid_distribution:aids(id, aid_date, status)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
    // Cache detail for 5 minutes
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create donation with optimistic update
 */
export function useCreateDonation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: DonationFormValues) => {
      const { data, error } = await supabase
        .from('donations')
        .insert({ 
          ...values, 
          payment_status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newDonation) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ['donations', 'list'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['donations', 'stats'] 
      })
      
      // Add new item to cache immediately
      queryClient.setQueryData(
        ['donations', 'detail', newDonation.id],
        newDonation
      )
    },
  })
}

/**
 * Update donation with optimistic update
 */
export function useUpdateDonation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { 
      id: string
      values: Partial<DonationFormValues & { payment_status: string }> 
    }) => {
      const { data, error } = await supabase
        .from('donations')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, values }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['donations', 'detail', id] })

      // Snapshot previous value
      const previousDonation = queryClient.getQueryData(['donations', 'detail', id])

      // Optimistically update to the new value
      queryClient.setQueryData(['donations', 'detail', id], (old: Record<string, unknown> | undefined) =>
        old ? { ...old, ...values } : undefined
      )

      // Return context with previous value
      return { previousDonation }
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousDonation) {
        queryClient.setQueryData(
          ['donations', 'detail', variables.id],
          context.previousDonation
        )
      }
    },
    onSuccess: (_, _variables) => {
      // Invalidate list query
      queryClient.invalidateQueries({ 
        queryKey: ['donations', 'list'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['donations', 'stats'] 
      })
    },
  })
}

/**
 * Optimized donation stats with single query
 * Uses PostgreSQL aggregation for better performance
 */
export function useDonationStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['donations', 'stats'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Single query with aggregation - much faster!
      const { data, error } = await supabase
        .rpc('calculate_donation_stats', {
          p_start_date: thisMonth.toISOString(),
          p_end_date: today.toISOString()
        })

      if (error) {
        // Fallback to manual calculation if RPC doesn't exist
        const [todayResult, monthResult, totalResult] = await Promise.all([
          supabase
            .from('donations')
            .select('amount')
            .gte('created_at', today.toISOString())
            .eq('payment_status', 'completed'),
          supabase
            .from('donations')
            .select('amount')
            .gte('created_at', thisMonth.toISOString())
            .eq('payment_status', 'completed'),
          supabase
            .from('donations')
            .select('amount')
            .eq('payment_status', 'completed')
        ])

        const todayTotal = todayResult.data?.reduce((sum: number, d: { amount?: number | null }) => sum + (d.amount || 0), 0) || 0
        const monthTotal = monthResult.data?.reduce((sum: number, d: { amount?: number | null }) => sum + (d.amount || 0), 0) || 0
        const allTimeTotal = totalResult.data?.reduce((sum: number, d: { amount?: number | null }) => sum + (d.amount || 0), 0) || 0

        return {
          today: todayTotal,
          thisMonth: monthTotal,
          allTime: allTimeTotal,
          count: totalResult.data?.length || 0,
        }
      }

      return data || {
        today: 0,
        thisMonth: 0,
        allTime: 0,
        count: 0,
      }
    },
    // Cache stats for 2 minutes
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Bulk delete donations
 */
export function useBulkDeleteDonations() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('donations')
        .delete()
        .in('id', ids)

      if (error) throw error
      return ids
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['donations', 'list'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['donations', 'stats'] 
      })
    },
  })
}
