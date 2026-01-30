import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'

// GET - Aktivite logları (admin/owner tümü, diğerleri sadece kendi)
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'activity_logs',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()
  const { user } = authResult

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entity_type')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Kullanıcının organizasyonunu ve rolünü kontrol et
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!memberData) {
      return NextResponse.json(
        { error: 'Organizasyon bulunamadı' },
        { status: 400 }
      )
    }

    const isAdmin = ['owner', 'admin'].includes(memberData.role)

    let query = supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', memberData.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Admin değilse sadece kendi aktivitelerini görebilir
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    // Filtreler
    if (userId && isAdmin) {
      query = query.eq('user_id', userId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00`)
    }

    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59`)
    }

    const { data, error } = await query

    if (error) throw error

    // Toplam sayıyı al (pagination için)
    let countQuery = supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', memberData.organization_id)

    if (!isAdmin) {
      countQuery = countQuery.eq('user_id', user.id)
    }

    if (userId && isAdmin) {
      countQuery = countQuery.eq('user_id', userId)
    }

    if (action) {
      countQuery = countQuery.eq('action', action)
    }

    if (entityType) {
      countQuery = countQuery.eq('entity_type', entityType)
    }

    if (dateFrom) {
      countQuery = countQuery.gte('created_at', `${dateFrom}T00:00:00`)
    }

    if (dateTo) {
      countQuery = countQuery.lte('created_at', `${dateTo}T23:59:59`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Aktivite logları alınırken hata:', error)
    return NextResponse.json(
      { error: 'Aktivite logları alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
