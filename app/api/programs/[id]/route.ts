/**
 * Program Detail API
 * GET/PATCH/DELETE /api/programs/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { createApiErrorResponse, handleDatabaseError } from '@/lib/errors'
import { entityLoggers } from '@/lib/activity-logger'
import { z } from 'zod'

const updateProgramSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  actual_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  actual_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  budget_allocated: z.number().min(0).optional(),
  target_beneficiaries: z.number().int().min(0).optional().nullable(),
  program_manager_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
  is_public: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  tags: z.array(z.string()).optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/programs/[id] - Program detayı
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:read' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id

    // Program bilgileri
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select(`
        *,
        manager:profiles!programs_program_manager_id_fkey(id, name, email),
        coordinator:profiles!programs_coordinator_id_fkey(id, name, email),
        city:cities(id, name),
        district:districts(id, name)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (programError) return handleDatabaseError(programError, 'GET /api/programs/[id]')

    // İstatistikler
    const { data: stats, error: statsError } = await supabase
      .rpc('get_program_stats', { p_program_id: id })

    if (statsError) return handleDatabaseError(statsError, 'GET /api/programs/[id]/stats')

    // Bütçe kalemleri
    const { data: budgetItems, error: budgetError } = await supabase
      .from('program_budget_items')
      .select('*')
      .eq('program_id', id)
      .order('created_at', { ascending: true })

    if (budgetError) return handleDatabaseError(budgetError, 'GET /api/programs/[id]/budget')

    // Aktiviteler
    const { data: activities, error: activitiesError } = await supabase
      .from('program_activities')
      .select('*')
      .eq('program_id', id)
      .order('planned_date', { ascending: true })

    if (activitiesError) return handleDatabaseError(activitiesError, 'GET /api/programs/[id]/activities')

    // Faydalanıcılar
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('program_beneficiaries')
      .select(`
        *,
        needy_person:needy_persons(id, first_name, last_name, phone)
      `)
      .eq('program_id', id)
      .order('enrollment_date', { ascending: false })
      .limit(50)

    if (beneficiariesError) return handleDatabaseError(beneficiariesError, 'GET /api/programs/[id]/beneficiaries')

    // Görevliler
    const { data: staff, error: staffError } = await supabase
      .from('program_staff')
      .select(`
        *,
        user:profiles(id, name, email)
      `)
      .eq('program_id', id)
      .eq('is_active', true)

    if (staffError) return handleDatabaseError(staffError, 'GET /api/programs/[id]/staff')

    return NextResponse.json({
      data: {
        ...program,
        stats,
        budget_items: budgetItems || [],
        activities: activities || [],
        beneficiaries: beneficiaries || [],
        staff: staff || [],
      },
    })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/programs/[id]' })
  }
}

/**
 * PATCH /api/programs/[id] - Program güncelle
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:update' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id } = await params
    const body = await request.json()

    const validationResult = updateProgramSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validasyon hatası', code: 'VALIDATION_ERROR', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id
    const userId = authResult.user.id

    // Mevcut veriyi al
    const { data: oldData, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (fetchError) return handleDatabaseError(fetchError, 'PATCH /api/programs/[id]')

    // Güncelle
    const { data, error } = await supabase
      .from('programs')
      .update({
        ...validationResult.data,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single()

    if (error) return handleDatabaseError(error, 'PATCH /api/programs/[id]')

    // Audit log
    await entityLoggers.update('program', id, data.name, oldData, validationResult.data)

    return NextResponse.json({ data })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'PATCH /api/programs/[id]' })
  }
}

/**
 * DELETE /api/programs/[id] - Program sil
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:delete' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id

    // Mevcut veriyi al
    const { data: oldData, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (fetchError) return handleDatabaseError(fetchError, 'DELETE /api/programs/[id]')

    // Sil (cascade ile ilişkili veriler de silinir)
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId)

    if (error) return handleDatabaseError(error, 'DELETE /api/programs/[id]')

    // Audit log
    await entityLoggers.delete('program', id, oldData.name, oldData)

    return NextResponse.json({ success: true })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'DELETE /api/programs/[id]' })
  }
}
