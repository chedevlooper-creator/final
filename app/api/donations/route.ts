/**
 * Donations API
 * GET/POST /api/donations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/permission-middleware'

/**
 * GET /api/donations - Get list of donations with pagination and filters
 *
 * Query params:
 * - page: number (default: 0)
 * - limit: number (default: 20)
 * - donation_type: string (cash, goods, sacrifice, etc.)
 * - payment_status: string
 * - date_from: string
 * - date_to: string
 *
 * Response (200):
 * {
 *   "data": Array<Donation>,
 *   "meta": { page, limit, count, totalPages }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // RBAC: Donations listesinde read yetkisi gerekli
    const authResult = await withAuth(request, {
      requiredPermission: 'read',
      resource: 'donations',
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
    
    const donationType = searchParams.get('donation_type')
    const paymentStatus = searchParams.get('payment_status')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Build query
    let query = supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (donationType) {
      query = query.eq('donation_type', donationType)
    }
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
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
 * POST /api/donations - Create a new donation
 *
 * Request body:
 * {
 *   "donor_name": string,
 *   "donor_phone": string,
 *   "donor_email": string,
 *   "donation_type": string (required),
 *   "amount": number (required),
 *   "currency": string (default: TRY),
 *   "payment_method": string,
 *   "payment_status": string (default: pending),
 *   "description": string,
 *   "notes": string
 * }
 *
 * Response (201):
 * {
 *   "data": Donation
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // RBAC: Donations create için create yetkisi gerekli
    const authResult = await withAuth(request, {
      requiredPermission: 'create',
      resource: 'donations',
    })

    if (!authResult.success) {
      return authResult.response!
    }

    const body = await request.json()

    // Validate required fields
    if (!body.donation_type) {
      return NextResponse.json(
        {
          error: 'Bağış türü zorunludur',
          code: 'VALIDATION_ERROR',
          fields: ['donation_type'],
        },
        { status: 400 }
      )
    }

    // Validate amount
    const amount = Number(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: 'Geçerli bir tutar girin',
          code: 'VALIDATION_ERROR',
          fields: ['amount'],
        },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const user = authResult.user!

    // Prepare data with created_by
    const newData = {
      donor_name: body.donor_name || null,
      donor_phone: body.donor_phone || null,
      donor_email: body.donor_email || null,
      donation_type: body.donation_type,
      amount: amount,
      currency: body.currency || 'TRY',
      payment_method: body.payment_method || null,
      payment_status: body.payment_status || 'pending',
      description: body.description || null,
      notes: body.notes || null,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data, error } = await supabase
      .from('donations')
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
