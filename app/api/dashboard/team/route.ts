import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'

// GET - Organizasyon üyelerini listele (görev atama için)
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'organization_members',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()
  const { user } = authResult

  try {
    // Kullanıcının organizasyonunu kontrol et
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

    // Organizasyon üyelerini getir
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        user_id,
        role,
        joined_at,
        user:profiles!organization_members_user_id_fkey(
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('organization_id', memberData.organization_id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) throw error

    // Formatla
    const formattedMembers = members.map((member) => ({
      id: member.user_id,
      name: member.user?.name || member.user?.email,
      email: member.user?.email,
      avatar_url: member.user?.avatar_url,
      role: member.role,
      joined_at: member.joined_at,
    }))

    return NextResponse.json({ data: formattedMembers })
  } catch (error) {
    console.error('Takım üyeleri alınırken hata:', error)
    return NextResponse.json(
      { error: 'Takım üyeleri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
