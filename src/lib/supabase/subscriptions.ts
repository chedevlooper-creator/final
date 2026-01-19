/**
 * Supabase Real-time Subscription Utilities
 * Type-safe subscriptions with automatic cleanup
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type SubscriptionCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void

/**
 * Subscribe to table changes with automatic cleanup
 * 
 * @example
 * ```tsx
 * useSubscription('donations', 'INSERT', (payload) => {
 *   console.log('New donation:', payload.new)
 * })
 * ```
 */
export function useSubscription<T = any>(
  table: string,
  filter?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    filter?: string
  },
  callback?: SubscriptionCallback<T>
) {
  if (typeof window === 'undefined') return

  const supabase = createClient()
  const channelName = `${table}_changes`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: filter?.event || '*',
        schema: 'public',
        table: table,
        filter: filter?.filter,
      },
      (payload) => {
        callback?.(payload as RealtimePostgresChangesPayload<T>)
      }
    )
    .subscribe()

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to multiple tables
 */
export function useMultiSubscription<T = any>(
  subscriptions: Array<{
    table: string
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    callback: SubscriptionCallback<T>
  }>
) {
  if (typeof window === 'undefined') return

  const supabase = createClient()
  const channels: RealtimeChannel[] = []

  subscriptions.forEach((sub) => {
    const channel = supabase
      .channel(`${sub.table}_${sub.event || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: sub.event || '*',
          schema: 'public',
          table: sub.table,
        },
        sub.callback
      )
      .subscribe()
    
    channels.push(channel)
  })

  // Cleanup all
  return () => {
    channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
  }
}

/**
 * Subscribe with auto-refetch
 * Automatically refetches React Query data when database changes
 */
export function useSubscriptionWithRefetch(
  table: string,
  queryKey: string[],
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
  const { useQueryClient } = require('@tanstack/react-query')
  const queryClient = useQueryClient()

  useSubscription(table, { event }, () => {
    // Invalidate and refetch the query
    queryClient.invalidateQueries({ queryKey })
  })
}

/**
 * Presence channel for online users
 */
export function usePresence(channelName: string, userId: string) {
  if (typeof window === 'undefined') return

  const supabase = createClient()

  const channel = supabase.channel(channelName)
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Presence state:', state)
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      })
    }
  })

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Broadcast channel for real-time updates
 */
export function useBroadcast(channelName: string, callback: (payload: any) => void) {
  if (typeof window === 'undefined') return

  const supabase = createClient()

  const channel = supabase.channel(channelName)
  channel.on('broadcast', { event: 'update' }, (payload) => {
    callback(payload.payload)
  })

  channel.subscribe()

  return {
    send: (data: any) => {
      channel.send({
        type: 'broadcast',
        event: 'update',
        payload: data,
      })
    },
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}
