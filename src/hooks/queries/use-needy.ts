'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { NeedyPersonFormValues } from '@/lib/validations/needy'

export interface NeedyFilters {
  search?: string
  category_id?: string
  status?: string
  city_id?: string
  page?: number
  limit?: number
}

/**
 * Optimized needy persons list with selective fetching
 */
export function useNeedyList(filters?: NeedyFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['needy-persons', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('needy_persons')
        .select(`
          id,
          first_name,
          last_name,
          identity_number,
          status,
          category:categories(id, name),
          city:cities(id, name),
          created_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Full-text search with Turkish character support
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,identity_number.ilike.%${filters.search}%`
        )
      }

      // Category filter
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      // Status filter - uses partial index
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // City filter
      if (filters?.city_id) {
        query = query.eq('city_id', filters.city_id)
      }

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
 * Needy person detail with all relations
 */
export function useNeedyDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['needy-persons', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('needy_persons')
        .select(`
          *,
          category:categories!category_id(id, name),
          partner:partners!partner_id(id, name),
          nationality:countries!nationality_id(id, name),
          country:countries!country_id(id, name),
          city:cities!city_id(id, name),
          district:districts!district_id(id, name),
          neighborhood:neighborhoods!neighborhood_id(id, name),
          aids:aids(id, aid_date, amount, aid_type, status)
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
 * Create needy person with cache update
 */
export function useCreateNeedy() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: NeedyPersonFormValues) => {
      const { data, error } = await supabase
        .from('needy_persons')
        .insert({
          ...values,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newPerson) => {
      queryClient.invalidateQueries({
        queryKey: ['needy-persons', 'list']
      })

      // Add to cache
      queryClient.setQueryData(
        ['needy-persons', 'detail', newPerson.id],
        newPerson
      )
    },
  })
}

/**
 * Update needy person with optimistic update
 */
export function useUpdateNeedy() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: {
      id: string
      values: Partial<NeedyPersonFormValues>
    }) => {
      const { data, error } = await supabase
        .from('needy_persons')
        .update({
          ...values,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ['needy-persons', 'detail', id] })

      const previousPerson = queryClient.getQueryData(['needy-persons', 'detail', id])

      queryClient.setQueryData(['needy-persons', 'detail', id], (old: any) => ({
        ...old,
        ...values
      }))

      return { previousPerson }
    },
    onError: (err, variables, context) => {
      if (context?.previousPerson) {
        queryClient.setQueryData(
          ['needy-persons', 'detail', variables.id],
          context.previousPerson
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['needy-persons', 'list']
      })
    },
  })
}

/**
 * Delete needy person
 */
export function useDeleteNeedy() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('needy_persons')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: ['needy-persons', 'detail', deletedId]
      })

      queryClient.invalidateQueries({
        queryKey: ['needy-persons', 'list']
      })
    },
  })
}

/**
 * Bulk status update
 */
export function useBulkUpdateNeedyStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ ids, status }: {
      ids: string[]
      status: string
    }) => {
      const { error } = await supabase
        .from('needy_persons')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)

      if (error) throw error
      return { ids, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['needy-persons', 'list']
      })
    },
  })
}

/**
 * Needy persons statistics
 */
export function useNeedyStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['needy-persons', 'stats'],
    queryFn: async () => {
      const [activeResult, pendingResult, totalResult] = await Promise.all([
        supabase
          .from('needy_persons')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('needy_persons')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('needy_persons')
          .select('id', { count: 'exact', head: true })
      ])

      return {
        active: activeResult.count || 0,
        pending: pendingResult.count || 0,
        total: totalResult.count || 0,
      }
    },
    // Cache stats for 5 minutes
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}
