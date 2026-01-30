/**
 * Program Beneficiaries API
 * GET/POST /api/programs/[id]/beneficiaries
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { createApiErrorResponse, handleDatabaseError } from '@/lib/errors'
import { entityLoggers } from '@/lib/activity-logger'
import { z } from 'zod'

const addBeneficiarySchema = z.object({
  needy_person_id: z.string().uuid(),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:read' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id: programId } = await params
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('program_beneficiaries')
      .select(`
        *,
        needy_person:needy_persons(id, first_name, last_name, phone, email)
      `)
      .eq('program_id', programId)
      .order('enrollment_date', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query.limit(limit)

    if (error) return handleDatabaseError(error, 'GET /api/programs/[id]/beneficiaries')

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/programs/[id]/beneficiaries' })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:create' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id: programId } = await params
    const body = await request.json()

    const validationResult = addBeneficiarySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validasyon hatası', code: 'VALIDATION_ERROR', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // RPC fonksiyonunu çağır
    const { data, error } = await supabase.rpc('add_program_beneficiary', {
      p_program_id: programId,
      p_needy_person_id: validationResult.data.needy_person_id,
      p_enrollment_date: validationResult.data.enrollment_date || new Date().toISOString().split('T')[0],
      p_notes: validationResult.data.notes,
    })

    if (error) return handleDatabaseError(error, 'POST /api/programs/[id]/beneficiaries')

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'Faydalanıcı eklenemedi', code: 'ADD_FAILED' },
        { status: 400 }
      )
    }

    // Faydalanıcı bilgilerini al
    const { data: beneficiaryData } = await supabase
      .from('needy_persons')
      .select('first_name, last_name')
      .eq('id', validationResult.data.needy_person_id)
      .single()

    await entityLoggers.create('program_beneficiary', data.id, 
      `${beneficiaryData?.first_name} ${beneficiaryData?.last_name}`, {
      program_id: programId,
      needy_person_id: validationResult.data.needy_person_id,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'POST /api/programs/[id]/beneficiaries' })
  }
}
