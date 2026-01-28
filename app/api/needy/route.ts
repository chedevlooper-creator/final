/**
 * Needy Persons API
 * GET/POST /api/needy
 *
 * Multi-tenant: Tüm sorgular organization_id ile filtrelenir
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'

/**
 * GET /api/needy - Get list of needy persons with pagination and filters
 *
 * Query params:
 * - page: number (default: 0)
 * - limit: number (default: 20)
 * - search: string (searches in name, phone, email)
 * - city_id: string
 * - district_id: string
 * - status: string
 *
 * Response (200):
 * {
 *   "data": Array<NeedyPerson>,
 *   "meta": { page, limit, count, totalPages }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Multi-tenant auth: Organizasyon context'i ile birlikte auth kontrolü
    const orgAuthResult = await withOrgAuth(request, {
      requiredPermission: 'data:read',
    })

    if (!orgAuthResult.success) {
      return createOrgErrorResponse(orgAuthResult.error, orgAuthResult.status)
    }

    // Legacy RBAC kontrolü (opsiyonel, kaldırılabilir)
    const authResult = await withAuth(request, {
      requiredPermission: 'read',
      resource: 'needy_persons',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const organizationId = orgAuthResult.user.organization.id

    const page = Number.parseInt(searchParams.get('page') || '0')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const cityId = searchParams.get('city_id')
    const districtId = searchParams.get('district_id')
    const status = searchParams.get('status')

    // Build query with organization filter
    let query = supabase
      .from('needy_persons')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId) // Multi-tenant filter
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      )
    }
    if (cityId) {
      query = query.eq('city_id', cityId)
    }
    if (districtId) {
      query = query.eq('district_id', districtId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const from = page * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      return NextResponse.json(
        { error: error.message, code: 'DATABASE_ERROR' },
        { status: 400 }
      )
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: data || [],
      meta: {
        page,
        limit,
        count: count || 0,
        totalPages,
        organization_id: organizationId, // Include org context in response
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Bir hata oluştu', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/needy - Create a new needy person
 *
 * Request body:
 * {
 *   "first_name": string (required),
 *   "last_name": string (required),
 *   "phone": string,
 *   "email": string,
 *   "city_id": string,
 *   "district_id": string,
 *   "address": string,
 *   "notes": string,
 *   ...other fields
 * }
 *
 * Response (201):
 * {
 *   "data": NeedyPerson
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Multi-tenant auth: Organizasyon context'i ile birlikte auth kontrolü
    const orgAuthResult = await withOrgAuth(request, {
      requiredPermission: 'data:create',
    })

    if (!orgAuthResult.success) {
      return createOrgErrorResponse(orgAuthResult.error, orgAuthResult.status)
    }

    // Legacy RBAC kontrolü (opsiyonel, kaldırılabilir)
    const authResult = await withAuth(request, {
      requiredPermission: 'create',
      resource: 'needy_persons',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const body = await request.json()

    // Validate required fields
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        {
          error: 'İsim ve soyisim zorunludur',
          code: 'VALIDATION_ERROR',
          fields: ['first_name', 'last_name'],
        },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const user = authResult.user!
    const organizationId = orgAuthResult.user.organization.id

    // Prepare data with organization_id and created_by
    const newData = {
      ...body,
      organization_id: organizationId, // Multi-tenant: Her kayıt organizasyona bağlı
      created_by: user.id,
      updated_by: user.id,
      status: body.status || 'active',
    }

    const { data, error } = await supabase
      .from('needy_persons')
      .insert(newData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message, code: 'DATABASE_ERROR' },
        { status: 400 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
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
      'Allow': 'GET, POST, OPTIONS',
    },
  })
}
