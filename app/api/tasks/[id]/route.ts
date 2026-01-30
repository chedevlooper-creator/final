import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'
import { z } from 'zod'

// Görev güncelleme şeması
const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['field_work', 'office_work', 'meeting', 'call', 'research', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
})

// GET - Görev detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'tasks',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        created_by:profiles!tasks_created_by_fkey(id, name, email),
        assignments:task_assignments(
          id,
          status,
          assigned_at,
          completed_at,
          completion_notes,
          assigned_to:profiles!task_assignments_assigned_to_fkey(id, name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ data: task })
  } catch (error) {
    console.error('Görev detayı alınırken hata:', error)
    return NextResponse.json(
      { error: 'Görev detayı alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Görev güncelle (sadece admin/owner)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const authResult = await withAuth(request, {
    requiredPermission: 'update',
    resource: 'tasks',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()
  const { user } = authResult

  try {
    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

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

    // Mevcut görevi al (log için)
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (!oldTask) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Aktivite log kaydet
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'update',
      p_entity_type: 'task',
      p_entity_id: id,
      p_entity_name: task.title,
      p_description: `Görev güncellendi: "${task.title}"`,
      p_old_values: oldTask,
      p_new_values: validatedData,
    })

    return NextResponse.json({ data: task })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasyon hatası', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Görev güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Görev güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Görev sil (sadece admin/owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const authResult = await withAuth(request, {
    requiredPermission: 'delete',
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

    // Silinecek görevi al (log için)
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (!oldTask) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    // Görevi sil (cascade ile atamalar da silinecek)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Aktivite log kaydet
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'delete',
      p_entity_type: 'task',
      p_entity_id: id,
      p_entity_name: oldTask.title,
      p_description: `Görev silindi: "${oldTask.title}"`,
      p_old_values: oldTask,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Görev silinirken hata:', error)
    return NextResponse.json(
      { error: 'Görev silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
