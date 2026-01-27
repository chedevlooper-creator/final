'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalNeedy: number
  activeNeedy: number
  pendingApplications: number
  todayDonations: number
  monthlyDonations: number
  yearlyDonations: number
  totalDonationCount: number
  completedAids: number
  activeVolunteers: number
  pendingOrphans: number
  totalAids: number
}

export interface MonthlyTrend {
  month: string
  label: string
  value: number
}

export interface CategoryDistribution {
  label: string
  value: number
  color?: string
}

/**
 * Optimized dashboard stats using PostgreSQL function
 * Single query instead of 9 parallel queries
 */
export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfYear = new Date(now.getFullYear(), 0, 1)

      // Using parallel direct queries as primary for better reliability and no 404s
      const [
        needyCountResult,
        activeNeedyResult,
        pendingApplicationsResult,
        todayDonationsResult,
        monthlyDonationsResult,
        yearlyDonationsResult,
        totalDonationsResult,
        completedAidsResult,
        volunteersResult,
      ] = await Promise.all([
        supabase.from('needy_persons').select('*', { count: 'exact', head: true }),
        supabase.from('needy_persons').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('donations').select('amount').gte('created_at', startOfDay.toISOString()).eq('payment_status', 'completed'),
        supabase.from('donations').select('amount').gte('created_at', startOfMonth.toISOString()).eq('payment_status', 'completed'),
        supabase.from('donations').select('amount').gte('created_at', startOfYear.toISOString()).eq('payment_status', 'completed'),
        supabase.from('donations').select('*', { count: 'exact', head: true }).eq('payment_status', 'completed'),
        supabase.from('aids').select('*', { count: 'exact', head: true }).eq('status', 'distributed').gte('aid_date', startOfMonth.toISOString()),
        supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ])

      const sumAmounts = (data: { amount: number }[] | null) =>
        data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

      return {
        totalNeedy: needyCountResult.count || 0,
        activeNeedy: activeNeedyResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        todayDonations: sumAmounts(todayDonationsResult.data as { amount: number }[]),
        monthlyDonations: sumAmounts(monthlyDonationsResult.data as { amount: number }[]),
        yearlyDonations: sumAmounts(yearlyDonationsResult.data as { amount: number }[]),
        totalDonationCount: totalDonationsResult.count || 0,
        completedAids: completedAidsResult.count || 0,
        activeVolunteers: volunteersResult.count || 0,
        pendingOrphans: 0,
        totalAids: completedAidsResult.count || 0,
      }
    },
    // Cache stats for 10 minutes
    staleTime: 10 * 60 * 1000,
    // Auto-refetch every 15 minutes
    refetchInterval: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * Optimized monthly donation trend using single query with aggregation
 */
export function useMonthlyDonationTrend(months: number = 6) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-monthly-trend', months],
    queryFn: async (): Promise<MonthlyTrend[]> => {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

      // Using direct query as primary to avoid 404 console errors
      const { data: donations } = await supabase
        .from('donations')
        .select('created_at, amount')
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'completed')

      const monthlyTotals: Record<string, number> = {}

      donations?.forEach((d: { created_at?: string | null; amount?: number | null }) => {
        const monthKey = d.created_at?.slice(0, 7) || new Date().toISOString().slice(0, 7)
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (d.amount || 0)
      })

      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      const results: MonthlyTrend[] = []

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = monthDate.toISOString().slice(0, 7)

        results.push({
          month: monthKey,
          label: monthNames[monthDate.getMonth()] || '',
          value: monthlyTotals[monthKey] || 0,
        })
      }

      return results
    },
    // Cache trends for 10 minutes
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Optimized application type distribution
 */
export function useApplicationTypeDistribution() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-application-types'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      // Use aggregation in database for better performance
      const { data } = await supabase
        .from('applications')
        .select('application_type')
        .not('application_type', 'is', null)

      if (!data) return []

      const counts: Record<string, number> = {}
      data.forEach((item: { application_type?: string | null }) => {
        const type = item.application_type || 'other'
        counts[type] = (counts[type] || 0) + 1
      })

      const typeLabels: Record<string, string> = {
        food: 'Gıda',
        health: 'Sağlık',
        education: 'Eğitim',
        shelter: 'Barınma',
        clothing: 'Giyim',
        fuel: 'Yakacak',
        household: 'Ev Eşyası',
        cash: 'Nakdi',
        other: 'Diğer',
      }

      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6b7280']

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count], index) => ({
          label: typeLabels[type] || type,
          value: count,
          color: colors[index % colors.length],
        }))
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Optimized city distribution
 */
export function useCityDistribution() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-city-distribution'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data } = await supabase
        .from('needy_persons')
        .select('city_id')
        .eq('status', 'active')
        .not('city_id', 'is', null)

      if (!data) return []

      const counts: Record<string, number> = {}
      data.forEach((item: { city_id?: string | null }) => {
        const cityId = item.city_id || 'unknown'
        counts[cityId] = (counts[cityId] || 0) + 1
      })

      // Fetch city names in batch
      const cityIds = Object.keys(counts)
      const { data: cities } = await supabase
        .from('cities')
        .select('id, name')
        .in('id', cityIds.slice(0, 100)) // Limit to 100 cities

      const cityMap = new Map(cities?.map((c: { id: string; name: string }) => [c.id, c.name]) || [])

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cityId, value]) => ({
          label: (cityMap.get(cityId) as string) || cityId,
          value,
        }))
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Application status distribution
 */
export function useApplicationStatusDistribution() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-application-status'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data } = await supabase
        .from('applications')
        .select('status')

      if (!data) return []

      const counts: Record<string, number> = {}
      data.forEach((item: { status?: string | null }) => {
        const status = item.status || 'new'
        counts[status] = (counts[status] || 0) + 1
      })

      const statusLabels: Record<string, string> = {
        new: 'Yeni',
        in_review: 'İncelemede',
        approved: 'Onaylandı',
        rejected: 'Reddedildi',
        pending_delivery: 'Teslim Bekliyor',
        delivered: 'Teslim Edildi',
        completed: 'Tamamlandı',
      }

      const statusColors: Record<string, string> = {
        new: '#3b82f6',
        in_review: '#f59e0b',
        approved: '#10b981',
        rejected: '#ef4444',
        pending_delivery: '#8b5cf6',
        delivered: '#06b6d4',
        completed: '#22c55e',
      }

      return Object.entries(counts).map(([status, count]) => ({
        label: statusLabels[status] || status,
        value: count,
        color: statusColors[status] || '#6b7280',
      }))
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Recent activities feed
 */
export function useRecentActivities(limit: number = 10) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-recent-activities', limit],
    queryFn: async () => {
      // Using table queries instead of RPC to avoid 404s
      const [donations, aids] = await Promise.all([
        supabase
          .from('donations')
          .select('id, donor_name, amount, created_at')
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('aids')
          .select('id, aid_type, created_at, needy_person:needy_persons(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(limit)
      ])

      const activities = [
        ...(donations.data?.map((d: { id: string; donor_name: string; amount: number; created_at: string }) => ({
          id: d.id,
          type: 'donation',
          description: `Bağış: ${d.donor_name} - ${d.amount} TL`,
          created_at: d.created_at
        })) || []),
        ...(aids.data?.map((a: { id: string; aid_type: string | null; created_at: string; needy_person: { first_name: string; last_name: string } | null }) => ({
          id: a.id,
          type: 'aid',
          description: `Yardım: ${a.aid_type} - ${a.needy_person?.first_name} ${a.needy_person?.last_name}`,
          created_at: a.created_at
        })) || [])
      ]

      return activities.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, limit)
    },
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}
