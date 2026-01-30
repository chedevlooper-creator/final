'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { safeJsonParse } from '@/lib/utils'

export interface SMSFilters {
  phone?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export function useSMSList(filters?: SMSFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['sms', filters],
    queryFn: async () => {
      let query = supabase
        .from('sms_messages')
        .select('*', { count: 'exact' })
        .order('sent_at', { ascending: false })

      if (filters?.phone) {
        query = query.ilike('phone', `%${filters.phone}%`)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.date_from) {
        query = query.gte('sent_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('sent_at', filters.date_to)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export function useSendBulkSMS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: { recipients: string[]; message: string; message_type?: string }) => {
      const response = await fetch('/api/messages/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: values.recipients,
          message: values.message,
          messageType: values.message_type || 'bulk',
        }),
      })

      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Failed to send SMS')
      }

      return safeJsonParse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms'] })
    },
  })
}

export function useSendBulkEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: { recipients: string[]; subject: string; message: string; message_type?: string }) => {
      const response = await fetch('/api/messages/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: values.recipients,
          subject: values.subject,
          message: values.message,
          messageType: values.message_type || 'bulk',
        }),
      })

      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Failed to send email')
      }

      return safeJsonParse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] })
    },
  })
}

export interface Recipient {
  id: string
  phone?: string
  email?: string
  name: string
}

export function useRecipients(recipientType: string) {
  return useQuery({
    queryKey: ['recipients', recipientType],
    queryFn: async () => {
      const response = await fetch(`/api/messages/recipients?type=${recipientType}`)
      
      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Failed to fetch recipients')
      }
      
      return safeJsonParse<{
        recipients: Recipient[]
        count: number
        type: string
      }>(response)
    },
    enabled: !!recipientType,
  })
}
