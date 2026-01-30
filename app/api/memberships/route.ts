/**
 * Memberships API
 * GET/POST /api/memberships
 * 
 * Üyelik yönetimi için API endpointleri
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { createApiErrorResponse, handleDatabaseError } from '@/lib/errors'
import { rateLimit, getUserKey, createRateLimitResponse } from '@/lib/rate-limit'
import { entityLoggers } from '@/lib/activity-logger'
import { z } from 'zod'

// Validasyon şeması
const createMembershipSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  identity_number: z.string().length(11).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city_id: z.string().uuid().optional().nullable(),
  district_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
  education_level: z.string().max(50).optional().nullable(),
  workplace: z.string().max(100).optional().nullable(),
  emergency_contact_name: z.string().max(100).optional().nullable(),
  emergency_contact_phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  membership_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})

/**
 * GET /api/memberships - Üye listesi
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:read' })
    if (!authResult.success) {
      return createOrgErrorResponse(authResult.error, authResult.status)
    }

    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const categoryId = searchParams.get('category_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('memberships')
      .select(`
        *,
        category:membership_categories(id, name, dues_amount)
      `, { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,member_number.ilike.%${search}%`
      )
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) return handleDatabaseError(error, 'GET /api/memberships')

    return NextResponse.json({
      data: data || [],
      meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/memberships' })
  }
}

/**
 * POST /api/memberships - Yeni üye ekle
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, {
      identifier: 'membership-create',
      limit: 50,
      window: 60 * 60 * 1000,
      keyGenerator: getUserKey,
    })

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, 'Saatlik üye ekleme limitine ulaşıldı.')
    }

    const authResult = await withOrgAuth(request, { requiredPermission: 'data:create' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const body = await request.json()
    const validationResult = createMembershipSchema.safeParse(body)
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
      .from('memberships')
      .insert({
        ...validationResult.data,
        organization_id: orgId,
        created_by: userId,
        updated_by: userId,
        status: 'active',
      })
      .select()
      .single()

    if (error) return handleDatabaseError(error, 'POST /api/memberships')

    await entityLoggers.create('membership', data.id, `${data.first_name} ${data.last_name}`, validationResult.data)

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'POST /api/memberships' })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Allow': 'GET, POST, OPTIONS' } })
}
