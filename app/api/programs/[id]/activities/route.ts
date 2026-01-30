/**
 * Program Activities API
 * GET/POST /api/programs/[id]/activities
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { createApiErrorResponse, handleDatabaseError } from '@/lib/errors'
import { entityLoggers } from '@/lib/activity-logger'
import { z } from 'zod'

const createActivitySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  activity_type: z.enum(['distribution', 'visit', 'meeting', 'training', 'event', 'assessment', 'procurement', 'other']),
  planned_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  planned_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  expected_participants: z.number().int().min(0).optional().nullable(),
  cost: z.number().min(0).default(0),
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
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('program_activities')
      .select('*')
      .eq('program_id', programId)
      .order('planned_date', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query.limit(limit)

    if (error) return handleDatabaseError(error, 'GET /api/programs/[id]/activities')

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/programs/[id]/activities' })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:create' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id: programId } = await params
    const body = await request.json()

    const validationResult = createActivitySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validasyon hatası', code: 'VALIDATION_ERROR', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const userId = authResult.user.id

    const { data, error } = await supabase
      .from('program_activities')
      .insert({
        ...validationResult.data,
        program_id: programId,
        status: 'planned',
        created_by: userId,
      })
      .select()
      .single()

    if (error) return handleDatabaseError(error, 'POST /api/programs/[id]/activities')

    await entityLoggers.create('program_activity', data.id, data.title, {
      program_id: programId,
      ...validationResult.data,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'POST /api/programs/[id]/activities' })
  }
}
