import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'
import { z } from 'zod'
import { createApiErrorResponse, sanitizeError } from '@/lib/errors'

const isDevelopment = process.env['NODE_ENV'] === 'development'

// Görev oluşturma şeması
const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.enum(['field_work', 'office_work', 'meeting', 'call', 'research', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  assignees: z.array(z.string().uuid()).min(1), // En az bir kişiye atanmalı
})

// GET - Tüm görevleri listele (admin/owner için)
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'tasks',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Kullanıcının organizasyonunu al
    const { data: userOrg } = await supabase
      .rpc('get_user_organization_id')

    if (!userOrg) {
      return NextResponse.json(
        { error: 'Organizasyon bulunamadı', code: 'NOT_FOUND' }, 
        { status: 400 }
      )
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        created_by:profiles!tasks_created_by_fkey(id, name, email),
        assignments:task_assignments(
          id,
          status,
          assigned_at,
          completed_at,
          assigned_to:profiles!task_assignments_assigned_to_fkey(id, name, email, avatar_url)
        )
      `)
      .eq('organization_id', userOrg)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (dateFrom) {
      query = query.gte('due_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('due_date', dateTo)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/tasks' })
  }
}

// POST - Yeni görev oluştur ve ata (sadece admin/owner)
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'create',
    resource: 'tasks',
  })

  if (!authResult.success) {
    return authResult.response!
  }

  const supabase = await createServerSupabaseClient()
  const { user } = authResult

  try {
    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    // Kullanıcının organizasyonunu ve rolünü kontrol et
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!memberData || !['owner', 'admin'].includes(memberData.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    // Transaction başlat
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        organization_id: memberData.organization_id,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        category: validatedData.category,
        tags: validatedData.tags || [],
        due_date: validatedData.due_date,
        created_by: user.id,
      })
      .select()
      .single()

    if (taskError) throw taskError

    // Atamaları oluştur
    const assignments = validatedData.assignees.map(assigneeId => ({
      task_id: task.id,
      assigned_to: assigneeId,
      assigned_by: user.id,
      organization_id: memberData.organization_id,
    }))

    const { error: assignmentError } = await supabase
      .from('task_assignments')
      .insert(assignments)

    if (assignmentError) throw assignmentError

    // Aktivite log kaydet
    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: 'create',
      p_entity_type: 'task',
      p_entity_id: task.id,
      p_entity_name: validatedData.title,
      p_description: `Yeni görev oluşturuldu: "${validatedData.title}"`,
      p_new_values: {
        title: validatedData.title,
        priority: validatedData.priority,
        due_date: validatedData.due_date,
        assignees: validatedData.assignees,
      },
    })

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod hatalarında sadece development ortamında detay göster
      return NextResponse.json(
        { 
          error: 'Validasyon hatası', 
          code: 'VALIDATION_ERROR',
          ...(isDevelopment && { details: error.errors }),
        },
        { status: 400 }
      )
    }

    return createApiErrorResponse(error, 500, { route: 'POST /api/tasks' })
  }
}
