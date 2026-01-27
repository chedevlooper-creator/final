'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { CharityBoxFormValues, CharityBoxCollectionValues } from '@/lib/validations/charity-box'

export interface CharityBoxFilters {
  search?: string
  status?: string
  location_city?: string
  page?: number
  limit?: number
}

/**
 * Charity boxes list with filtering and pagination
 */
export function useCharityBoxesList(filters?: CharityBoxFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['charity_boxes', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('charity_boxes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Status filtering
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // City filtering
      if (filters?.location_city) {
        query = query.eq('location_city', filters.location_city)
      }

      // Full-text search
      if (filters?.search) {
        query = query.or(
          `box_number.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%,responsible_person.ilike.%${filters.search}%,responsible_phone.ilike.%${filters.search}%`
        )
      }

      // Pagination
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
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * Charity box detail
 */
export function useCharityBoxDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['charity_boxes', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charity_boxes')
        .select(`
          *,
          collections:charity_box_collections(
            id,
            collection_date,
            amount,
            currency,
            collected_by,
            notes,
            receipt_number
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create charity box
 */
export function useCreateCharityBox() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: CharityBoxFormValues) => {
      const { data, error } = await supabase
        .from('charity_boxes')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'list']
      })
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'stats']
      })
    },
  })
}

/**
 * Update charity box
 */
export function useUpdateCharityBox() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: {
      id: string
      values: Partial<CharityBoxFormValues>
    }) => {
      const { data, error } = await supabase
        .from('charity_boxes')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'list']
      })
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'detail', id]
      })
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'stats']
      })
    },
  })
}

/**
 * Delete charity box
 */
export function useDeleteCharityBox() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('charity_boxes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'list']
      })
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'stats']
      })
    },
  })
}

/**
 * Charity box collections list
 */
export function useCharityBoxCollections(boxId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['charity_boxes', 'collections', boxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charity_box_collections')
        .select(`
          *,
          collector:auth.users(id, email, raw_user_meta_data->>'name' as name)
        `)
        .eq('charity_box_id', boxId)
        .order('collection_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!boxId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create charity box collection
 */
export function useCreateCharityBoxCollection() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: CharityBoxCollectionValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('charity_box_collections')
        .insert({
          ...values,
          collected_by: user?.id,
        })
        .select()
        .single()

      if (error) throw error
      
      // Update box current amount
      await supabase
        .from('charity_boxes')
        .update({
          current_amount: values.amount,
          last_collection_date: new Date().toISOString(),
        })
        .eq('id', values.charity_box_id)
      
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'collections', variables.charity_box_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'detail', variables.charity_box_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['charity_boxes', 'list']
      })
    },
  })
}

/**
 * Charity box statistics
 */
export function useCharityBoxStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['charity_boxes', 'stats'],
    queryFn: async () => {
      const [boxesResult, collectionsResult] = await Promise.all([
        supabase
          .from('charity_boxes')
          .select('status, current_amount', { count: 'exact' }),
        supabase
          .from('charity_box_collections')
          .select('amount')
          .gte('collection_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ])

      const boxes = boxesResult.data || []
      const activeBoxes = boxes.filter((b: any) => b.status === 'active').length
      const fullBoxes = boxes.filter((b: any) => b.status === 'full').length
      const totalAmount = boxes.reduce((sum: number, b: any) => sum + (b.current_amount || 0), 0)
      const monthlyCollected = collectionsResult.data?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0

      return {
        totalBoxes: boxesResult.count || 0,
        activeBoxes,
        fullBoxes,
        totalAmount,
        monthlyCollected,
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}
