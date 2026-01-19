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

export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfYear = new Date(now.getFullYear(), 0, 1)

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
        // Total needy persons
        supabase.from('needy_persons').select('*', { count: 'exact', head: true }),
        // Active needy persons
        supabase.from('needy_persons').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        // Pending applications
        supabase.from('aid_applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        // Today's donations (amount sum)
        supabase.from('donations').select('amount').gte('created_at', startOfDay.toISOString()).eq('payment_status', 'completed'),
        // Monthly donations (amount sum)
        supabase.from('donations').select('amount').gte('created_at', startOfMonth.toISOString()).eq('payment_status', 'completed'),
        // Yearly donations (amount sum)
        supabase.from('donations').select('amount').gte('created_at', startOfYear.toISOString()).eq('payment_status', 'completed'),
        // Total donation count
        supabase.from('donations').select('*', { count: 'exact', head: true }).eq('payment_status', 'completed'),
        // Completed aids this month
        supabase.from('aid_applications').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('updated_at', startOfMonth.toISOString()),
        // Active volunteers
        supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ])

      const sumAmounts = (data: { amount: number }[] | null) => 
        data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

      return {
        totalNeedy: needyCountResult.count || 0,
        activeNeedy: activeNeedyResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        todayDonations: sumAmounts(todayDonationsResult.data),
        monthlyDonations: sumAmounts(monthlyDonationsResult.data),
        yearlyDonations: sumAmounts(yearlyDonationsResult.data),
        totalDonationCount: totalDonationsResult.count || 0,
        completedAids: completedAidsResult.count || 0,
        activeVolunteers: volunteersResult.count || 0,
        pendingOrphans: 0, // TODO: Add orphans query if table exists
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

export function useMonthlyDonationTrend(months: number = 6) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-monthly-trend', months],
    queryFn: async (): Promise<MonthlyTrend[]> => {
      const now = new Date()
      const results: MonthlyTrend[] = []

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        
        const { data } = await supabase
          .from('donations')
          .select('amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
          .eq('payment_status', 'completed')

        const total = data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        
        results.push({
          month: monthStart.toISOString().slice(0, 7),
          label: monthNames[monthStart.getMonth()] || '',
          value: total,
        })
      }

      return results
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useApplicationTypeDistribution() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-application-types'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data } = await supabase
        .from('aid_applications')
        .select('application_type')

      if (!data) return []

      const counts: Record<string, number> = {}
      data.forEach(item => {
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

      return Object.entries(counts).map(([type, count], index) => ({
        label: typeLabels[type] || type,
        value: count,
        color: colors[index % colors.length],
      }))
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useCityDistribution() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-city-distribution'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data } = await supabase
        .from('needy_persons')
        .select(`
          city:cities(name)
        `)
        .eq('status', 'active')

      if (!data) return []

      const counts: Record<string, number> = {}
      data.forEach(item => {
        const cityName = (item.city as { name?: string } | null)?.name || 'Belirtilmemiş'
        counts[cityName] = (counts[cityName] || 0) + 1
      })

      // Sort by count and take top 10
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, value]) => ({ label, value }))
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useApplicationStatusDistribution() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-application-status'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data } = await supabase
        .from('aid_applications')
        .select('status')

      if (!data) return []

      const counts: Record<string, number> = {}
      data.forEach(item => {
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
    staleTime: 1000 * 60 * 10,
  })
}
