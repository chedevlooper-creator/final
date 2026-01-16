'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ApplicationFormValues } from '@/lib/validations/application'

export interface ApplicationFilters {
  search?: string
  status?: string
  application_type?: string
  priority?: string
  needy_person_id?: string
  page?: number
  limit?: number
}

export function useApplicationsList(filters?: ApplicationFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['applications', filters],
    queryFn: async () => {
      let query = supabase
        .from('aid_applications')
        .select(`
          *,
          needy_person:needy_persons(id, first_name, last_name, phone)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.application_type) {
        query = query.eq('application_type', filters.application_type)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.needy_person_id) {
        query = query.eq('needy_person_id', filters.needy_person_id)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useApplicationDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aid_applications')
        .select(`
          *,
          needy_person:needy_persons(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: ApplicationFormValues) => {
      const { data, error } = await supabase
        .from('aid_applications')
        .insert({ ...values, status: 'new' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<ApplicationFormValues & { status: string }> }) => {
      const { data, error } = await supabase
        .from('aid_applications')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}
