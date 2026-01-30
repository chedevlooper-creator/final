/**
 * Programs API
 * GET/POST /api/programs
 * 
 * Proje ve program yönetimi için API endpointleri
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { createApiErrorResponse, handleDatabaseError } from '@/lib/errors'
import { rateLimit, getUserKey, createRateLimitResponse } from '@/lib/rate-limit'
import { entityLoggers } from '@/lib/activity-logger'
import { z } from 'zod'

const createProgramSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['ongoing', 'project', 'campaign', 'emergency']).default('ongoing'),
  category: z.enum([
    'education', 'health', 'food', 'housing', 'clothing',
    'financial_aid', 'orphan_care', 'religious', 'cultural', 'other'
  ]).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  budget_allocated: z.number().min(0).default(0),
  target_beneficiaries: z.number().int().min(0).optional().nullable(),
  target_amount: z.number().min(0).optional().nullable(),
  program_manager_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
  city_id: z.string().uuid().optional().nullable(),
  district_id: z.string().uuid().optional().nullable(),
  location_description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
})

/**
 * GET /api/programs - Program listesi
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:read' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('programs')
      .select(`
        *,
        manager:profiles!programs_program_manager_id_fkey(id, name),
        coordinator:profiles!programs_coordinator_id_fkey(id, name),
        city:cities(id, name),
        district:districts(id, name)
      `, { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) return handleDatabaseError(error, 'GET /api/programs')

    return NextResponse.json({
      data: data || [],
      meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/programs' })
  }
}

/**
 * POST /api/programs - Yeni program oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, {
      identifier: 'program-create',
      limit: 30,
      window: 60 * 60 * 1000,
      keyGenerator: getUserKey,
    })

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, 'Saatlik program oluşturma limitine ulaşıldı.')
    }

    const authResult = await withOrgAuth(request, { requiredPermission: 'data:create' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const body = await request.json()
    const validationResult = createProgramSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validasyon hatası', code: 'VALIDATION_ERROR', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id
    const userId = authResult.user.id

    const { data, error } = await supabase
      .from('programs')
      .insert({
        ...validationResult.data,
        organization_id: orgId,
        created_by: userId,
        updated_by: userId,
        status: 'planning',
      })
      .select()
      .single()

    if (error) return handleDatabaseError(error, 'POST /api/programs')

    await entityLoggers.create('program', data.id, data.name, validationResult.data)

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'POST /api/programs' })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Allow': 'GET, POST, OPTIONS' } })
}
