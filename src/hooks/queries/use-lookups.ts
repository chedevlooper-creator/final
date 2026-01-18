'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  mockCountries,
  mockCities,
  mockDistricts,
  mockNeighborhoods,
  mockCategories,
  mockPartners
} from '@/lib/mock-data/needy'

// Mock data kullanımı için flag
const USE_MOCK_DATA = process.env['NEXT_PUBLIC_USE_MOCK_DATA'] === 'true'

export function useCountries() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lookups', 'countries'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockCountries
      }

      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 60, // 1 saat cache
  })
}

export function useCities(countryId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lookups', 'cities', countryId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        if (countryId) {
          return mockCities.filter(c => c.country_id === countryId)
        }
        return mockCities
      }

      let query = supabase
        .from('cities')
        .select('id, name, country_id')
        .eq('is_active', true)
        .order('name')

      if (countryId) {
        query = query.eq('country_id', countryId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: USE_MOCK_DATA ? true : !!countryId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useDistricts(cityId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lookups', 'districts', cityId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        if (cityId) {
          return mockDistricts.filter(d => d.city_id === cityId)
        }
        return mockDistricts
      }

      let query = supabase
        .from('districts')
        .select('id, name, city_id')
        .eq('is_active', true)
        .order('name')

      if (cityId) {
        query = query.eq('city_id', cityId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: USE_MOCK_DATA ? true : !!cityId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useCategories(type?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lookups', 'categories', type],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        if (type) {
          return mockCategories.filter(c => c.type === type)
        }
        return mockCategories
      }

      let query = supabase
        .from('categories')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name')

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 60,
  })
}

export function usePartners() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lookups', 'partners'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockPartners
      }

      const { data, error } = await supabase
        .from('partners')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 60,
  })
}
