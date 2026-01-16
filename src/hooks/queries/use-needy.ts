'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { NeedyPersonFormValues } from '@/lib/validations/needy'
import { Tables } from '@/types/database.types'
import {
  getMockNeedyList,
  getMockNeedyPerson,
  mockCountries,
  mockCities,
  mockDistricts,
  mockNeighborhoods,
  mockCategories,
  mockPartners,
} from '@/lib/mock-data/needy'

// Mock data kullanımı için flag
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export interface NeedyFilters {
  search?: string
  category_id?: string
  status?: string
  city_id?: string
  page?: number
  limit?: number
}

export function useNeedyList(filters?: NeedyFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['needy', filters],
    queryFn: async () => {
      // Mock data kullanılıyorsa
      if (USE_MOCK_DATA) {
        const result = getMockNeedyList({
          page,
          limit,
          search: filters?.search,
          status: filters?.status,
        })
        return {
          data: result.data as any[],
          count: result.count,
          page,
          limit
        }
      }

      // Gerçek Supabase sorgusu
      let query = supabase
        .from('needy_persons')
        .select(`
          *,
          category:categories(name),
          partner:partners(name),
          country:countries!country_id(name),
          city:cities(name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,identity_number.ilike.%${filters.search}%`)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.city_id) {
        query = query.eq('city_id', filters.city_id)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useNeedyDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['needy', id],
    queryFn: async () => {
      // Mock data kullanılıyorsa
      if (USE_MOCK_DATA) {
        const person = getMockNeedyPerson(id)
        if (!person) throw new Error('Person not found')
        return {
          ...person,
          category: mockCategories.find(c => c.id === person.category_id),
          partner: mockPartners.find(p => p.id === person.partner_id),
          nationality: mockCountries.find(c => c.id === person.nationality_id),
          country: mockCountries.find(c => c.id === person.country_id),
          city: mockCities.find(c => c.id === person.city_id),
          district: mockDistricts.find(d => d.id === person.district_id),
        } as any
      }

      // Gerçek Supabase sorgusu
      const { data, error } = await supabase
        .from('needy_persons')
        .select(`
          *,
          category:categories(id, name),
          partner:partners(id, name),
          nationality:countries!nationality_id(id, name),
          country:countries!country_id(id, name),
          city:cities(id, name),
          district:districts(id, name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateNeedy() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: NeedyPersonFormValues) => {
      const { data, error } = await supabase
        .from('needy_persons')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['needy'] })
    },
  })
}

export function useUpdateNeedy() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<NeedyPersonFormValues> }) => {
      const { data, error } = await supabase
        .from('needy_persons')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['needy', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['needy'] })
    },
  })
}

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['needy'] })
    },
  })
}
