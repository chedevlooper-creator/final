import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'

// GET - Takım istatistikleri (sadece admin/owner)
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'tasks',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()
  const { user } = authResult

  try {
    // Kullanıcının organizasyonunu ve rolünü kontrol et
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!memberData || !['owner', 'admin'].includes(memberData.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const orgId = memberData.organization_id

    // 1. Takım üyelerini al
    const { data: teamMembers, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        user_id,
        role,
        joined_at,
        user:profiles!organization_members_user_id_fkey(id, name, email, avatar_url)
      `)
      .eq('organization_id', orgId)
      .eq('is_active', true)

    if (membersError) throw membersError

    // 2. Her üye için görev istatistikleri
    const memberStats = await Promise.all(
      teamMembers.map(async (member) => {
        // Toplam atanan görev
        const { count: totalAssigned } = await supabase
          .from('task_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.user_id)
          .eq('organization_id', orgId)

        // Tamamlanan görevler
        const { count: completed } = await supabase
          .from('task_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.user_id)
          .eq('organization_id', orgId)
          .eq('status', 'completed')

        // Bekleyen görevler
        const { count: pending } = await supabase
          .from('task_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.user_id)
          .eq('organization_id', orgId)
          .eq('status', 'pending')

        // Geciken görevler
        const { count: overdue } = await supabase
          .from('task_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.user_id)
          .eq('organization_id', orgId)
          .eq('status', 'overdue')

        // Devam eden görevler
        const { count: inProgress } = await supabase
          .from('task_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.user_id)
          .eq('organization_id', orgId)
          .eq('status', 'in_progress')

        // Son aktivite
        const { data: lastActivity } = await supabase
          .from('activity_logs')
          .select('created_at, action, description')
          .eq('user_id', member.user_id)
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          user: member.user,
          role: member.role,
          joined_at: member.joined_at,
          stats: {
            total_assigned: totalAssigned || 0,
            completed: completed || 0,
            pending: pending || 0,
            overdue: overdue || 0,
            in_progress: inProgress || 0,
            completion_rate: totalAssigned
              ? Math.round(((completed || 0) / totalAssigned) * 100)
              : 0,
          },
          last_activity: lastActivity || null,
        }
      })
    )

    // 3. Genel organizasyon istatistikleri
    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    const { count: activeTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active')

    const { count: completedTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'completed')

    // Bu haftaki görevler
    const { count: thisWeekTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      data: {
        team_members: memberStats,
        organization_stats: {
          total_tasks: totalTasks || 0,
          active_tasks: activeTasks || 0,
          completed_tasks: completedTasks || 0,
          this_week_tasks: thisWeekTasks || 0,
          completion_rate: totalTasks
            ? Math.round(((completedTasks || 0) / totalTasks) * 100)
            : 0,
        },
      },
    })
  } catch (error) {
    console.error('Takım istatistikleri alınırken hata:', error)
    return NextResponse.json(
      { error: 'Takım istatistikleri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
