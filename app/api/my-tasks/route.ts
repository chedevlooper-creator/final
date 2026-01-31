import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'
import { z } from 'zod'

// Görev tamamlama şeması
const completeTaskSchema = z.object({
  completion_notes: z.string().optional(),
})

// GET - Çalışanın kendi görevleri
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

  if (!user) {
    return NextResponse.json(
      { error: 'Kullanıcı bilgisi alınamadı' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('task_assignments')
      .select(`
        id,
        status,
        assigned_at,
        completed_at,
        completion_notes,
        task:tasks(
          id,
          title,
          description,
          priority,
          category,
          tags,
          due_date,
          status as task_status,
          created_by:profiles!tasks_created_by_fkey(id, name, email)
        )
      `)
      .eq('assigned_to', user.id)
      .order('assigned_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Görevler listelenirken hata:', error)
    return NextResponse.json(
      { error: 'Görevler listelenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Görev tamamla (çalışan kendi görevini)
export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'update',
    resource: 'tasks',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()
  const { user } = authResult

  if (!user) {
    return NextResponse.json(
      { error: 'Kullanıcı bilgisi alınamadı' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Atama ID gerekli' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = completeTaskSchema.parse(body)

    // Atamanın bu kullanıcıya ait olduğunu kontrol et
    const { data: assignment, error: fetchError } = await supabase
      .from('task_assignments')
      .select(`
        *,
        task:tasks(id, title, created_by)
      `)
      .eq('id', assignmentId)
      .eq('assigned_to', user.id)
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Görev ataması bulunamadı veya erişim yetkiniz yok' },
        { status: 404 }
      )
    }

    // Zaten tamamlanmış mı kontrol et
    if (assignment.status === 'completed') {
      return NextResponse.json(
        { error: 'Bu görev zaten tamamlanmış' },
        { status: 400 }
      )
    }

    // Görevi tamamla
    const { data: updatedAssignment, error } = await supabase
      .from('task_assignments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes: validatedData.completion_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .select()
      .single()

    if (error) throw error

    // Aktivite log kaydet
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'complete',
      p_entity_type: 'task_assignment',
      p_entity_id: assignmentId,
      p_entity_name: assignment.task.title,
      p_description: `Görev tamamlandı: "${assignment.task.title}"`,
      p_new_values: {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes: validatedData.completion_notes,
      },
    })

    return NextResponse.json({ data: updatedAssignment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasyon hatası', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Görev tamamlanırken hata:', error)
    return NextResponse.json(
      { error: 'Görev tamamlanırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
