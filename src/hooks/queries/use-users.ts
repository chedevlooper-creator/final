'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/common'

// User profile data for creating/updating
export interface UserProfileData {
  email: string
  name?: string
  avatar_url?: string
  role?: UserRole
}

export interface UserFilters {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export function useUsersList(filters?: UserFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('users')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })

        if (filters?.role) {
          query = query.eq('role', filters.role)
        }
        if (filters?.status) {
          query = query.eq('status', filters.status)
        }
        if (filters?.search) {
          query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
        }

        const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

        if (error) {
          console.warn('Users list query error:', error.message)
          return { data: [], count: 0, page, limit }
        }
        return { data: data || [], count: count || 0, page, limit }
      } catch {
        return { data: [], count: 0, page, limit }
      }
    },
  })
}

export function useUserDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.warn('User detail query error:', error.message)
          return null
        }
        return data
      } catch {
        return null
      }
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: UserProfileData) => {
      const { data, error } = await supabase
        .from('users')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<UserProfileData> }) => {
      const { data, error } = await supabase
        .from('users')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
