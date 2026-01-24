/**
 * Dashboard Statistics API
 * GET /api/dashboard/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'

/**
 * Dashboard Statistics Response
 */
interface DashboardStats {
  totalNeedy: number
  activeNeedy: number
  pendingApplications: number
  totalDonations: number
  donationAmount: number
  activeVolunteers: number
  upcomingMeetings: number
  pendingTasks: number
  recentActivities: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 *
 * Response (200):
 * {
 *   "data": {
 *     "totalNeedy": number,
 *     "activeNeedy": number,
 *     "pendingApplications": number,
 *     "totalDonations": number,
 *     "donationAmount": number,
 *     "activeVolunteers": number,
 *     "upcomingMeetings": number,
 *     "pendingTasks": number,
 *     "recentActivities": Array
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // RBAC: Dashboard stats için read yetkisi gerekli
    const authResult = await withAuth(request, {
      requiredPermission: 'read',
      resource: 'dashboard',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const supabase = await createServerSupabaseClient()
    const user = authResult.user!

    // Get total needy persons count
    const { count: totalNeedy } = await supabase
      .from('needy_persons')
      .select('*', { count: 'exact', head: true })

    // Get active needy persons count
    const { count: activeNeedy } = await supabase
      .from('needy_persons')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_active', true)

    // Get pending applications count
    const { count: pendingApplications } = await supabase
      .from('aid_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get total donations count and amount
    const { data: donationStats } = await supabase
      .from('donations')
      .select('amount, currency')
      .eq('payment_status', 'completed')

    const totalDonations = donationStats?.length || 0
    const donationAmount =
      donationStats?.reduce((sum: number, d: { amount: number; currency: string }) => {
        // Convert to TRY if needed (simplified - actual conversion would use exchange rates)
        return sum + (d.currency === 'TRY' ? d.amount : d.amount * 35) // Simplified conversion
      }, 0) || 0

    // Get active volunteers count
    const { count: activeVolunteers } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get upcoming meetings count (meetings in the future)
    const { count: upcomingMeetings } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .gte('meeting_date', new Date().toISOString().split('T')[0])
      .in('status', ['scheduled', 'confirmed'])

    // Get pending tasks count for current user
    const { count: pendingTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .not('status', 'eq', 'completed')

    // Get recent activities from audit log
    const { data: recentActivities } = await supabase
      .from('audit_logs')
      .select('action, entity_type, created_at, created_by')
      .order('created_at', { ascending: false })
      .limit(10)

    const activities =
      recentActivities?.map((log) => ({
        type: log.entity_type,
        description: log.action,
        timestamp: log.created_at,
      })) || []

    const stats: DashboardStats = {
      totalNeedy: totalNeedy || 0,
      activeNeedy: activeNeedy || 0,
      pendingApplications: pendingApplications || 0,
      totalDonations,
      donationAmount: Math.round(donationAmount * 100) / 100,
      activeVolunteers: activeVolunteers || 0,
      upcomingMeetings: upcomingMeetings || 0,
      pendingTasks: pendingTasks || 0,
      recentActivities: activities,
    }

    return NextResponse.json({ data: stats })
  } catch (error) {
    return NextResponse.json(
      { error: 'Bir hata oluştu', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
    },
  })
}
