/**
 * Needy Persons API
 * GET/POST /api/needy
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'

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
    // RBAC: Needy persons listesinde read yetkisi gerekli
    const authResult = await withAuth(request, {
      requiredPermission: 'read',
      resource: 'needy_persons',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const pageParam = Number.parseInt(searchParams.get('page') || '0', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '20', 10)
    
    // Validate pagination parameters
    const page = Number.isNaN(pageParam) || pageParam < 0 ? 0 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 100)
    
    const search = searchParams.get('search')
    const cityId = searchParams.get('city_id')
    const districtId = searchParams.get('district_id')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('needy_persons')
      .select('*', { count: 'exact' })
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
    // RBAC: Needy persons create için create yetkisi gerekli
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

    // Prepare data with allowed fields only (prevent mass assignment)
    const newData = {
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone || null,
      email: body.email || null,
      tc_no: body.tc_no || null,
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      marital_status: body.marital_status || null,
      country_id: body.country_id || null,
      city_id: body.city_id || null,
      district_id: body.district_id || null,
      neighborhood_id: body.neighborhood_id || null,
      address: body.address || null,
      occupation: body.occupation || null,
      monthly_income: body.monthly_income || null,
      family_size: body.family_size || null,
      housing_type: body.housing_type || null,
      notes: body.notes || null,
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
