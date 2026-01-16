'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface CalendarEventFilters {
  event_type?: string
  status?: string
  date_from?: string
  date_to?: string
}

export function useCalendarEvents(filters?: CalendarEventFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['calendar-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true })

      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.date_from) {
        query = query.gte('event_date', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('event_date', filters.date_to)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}

export function useEventsList(filters?: CalendarEventFilters & { page?: number; limit?: number }) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select('*', { count: 'exact' })
        .order('event_date', { ascending: false })

      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.date_from) {
        query = query.gte('event_date', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('event_date', filters.date_to)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    },
  })
}
