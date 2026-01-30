/**
 * Membership Detail API
 * GET/PATCH/DELETE /api/memberships/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import { createApiErrorResponse, handleDatabaseError } from '@/lib/errors'
import { entityLoggers } from '@/lib/activity-logger'
import { z } from 'zod'

const updateMembershipSchema = z.object({
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended', 'expired']).optional(),
  profession: z.string().max(100).optional().nullable(),
  workplace: z.string().max(100).optional().nullable(),
  emergency_contact_name: z.string().max(100).optional().nullable(),
  emergency_contact_phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/memberships/[id] - Üye detayı
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:read' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id

    // Üye bilgileri
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select(`
        *,
        category:membership_categories(id, name, dues_amount, dues_frequency),
        city:cities(id, name),
        district:districts(id, name)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (membershipError) return handleDatabaseError(membershipError, 'GET /api/memberships/[id]')

    // Ödeme geçmişi
    const { data: payments, error: paymentsError } = await supabase
      .from('membership_payments')
      .select('*')
      .eq('membership_id', id)
      .eq('organization_id', orgId)
      .order('period_start', { ascending: false })

    if (paymentsError) return handleDatabaseError(paymentsError, 'GET /api/memberships/[id]/payments')

    // Aktivite logları
    const { data: logs, error: logsError } = await supabase
      .from('membership_logs')
      .select('*')
      .eq('membership_id', id)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsError) return handleDatabaseError(logsError, 'GET /api/memberships/[id]/logs')

    return NextResponse.json({
      data: {
        ...membership,
        payments: payments || [],
        logs: logs || [],
      },
    })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'GET /api/memberships/[id]' })
  }
}

/**
 * PATCH /api/memberships/[id] - Üye güncelle
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await withOrgAuth(request, { requiredPermission: 'data:update' })
    if (!authResult.success) return createOrgErrorResponse(authResult.error, authResult.status)

    const { id } = await params
    const body = await request.json()

    const validationResult = updateMembershipSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validasyon hatası', code: 'VALIDATION_ERROR', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const orgId = authResult.user.organization.id
    const userId = authResult.user.id

    // Mevcut veriyi al (log için)
    const { data: oldData, error: fetchError } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (fetchError) return handleDatabaseError(fetchError, 'PATCH /api/memberships/[id]')

    // Güncelle
    const { data, error } = await supabase
      .from('memberships')
      .update({
        ...validationResult.data,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single()

    if (error) return handleDatabaseError(error, 'PATCH /api/memberships/[id]')

    // Audit log
    await entityLoggers.update(
      'membership',
      id,
      `${data.first_name} ${data.last_name}`,
      oldData,
      validationResult.data
    )

    return NextResponse.json({ data })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'PATCH /api/memberships/[id]' })
  }
}

/**
 * DELETE /api/memberships/[id] - Üye sil
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
      .from('memberships')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (fetchError) return handleDatabaseError(fetchError, 'DELETE /api/memberships/[id]')

    // Sil
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId)

    if (error) return handleDatabaseError(error, 'DELETE /api/memberships/[id]')

    // Audit log
    await entityLoggers.delete('membership', id, `${oldData.first_name} ${oldData.last_name}`, oldData)

    return NextResponse.json({ success: true })
  } catch (error) {
    return createApiErrorResponse(error, 500, { route: 'DELETE /api/memberships/[id]' })
  }
}
