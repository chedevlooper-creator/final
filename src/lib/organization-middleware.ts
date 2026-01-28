/**
 * Organization Middleware
 * Multi-tenant API erişimi için organizasyon context yönetimi
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  OrganizationContext,
  OrganizationRole,
  AuthenticatedUserWithOrg
} from '@/types/organization.types'

// Organizasyon context'li auth sonucu
export interface OrgAuthResult {
  success: true
  user: AuthenticatedUserWithOrg
}

export interface OrgAuthError {
  success: false
  error: string
  status: number
}

export type OrgAuthResponse = OrgAuthResult | OrgAuthError

/**
 * Organizasyon context'i ile birlikte auth kontrolü
 * Tüm multi-tenant API route'larında kullanılmalı
 */
export async function withOrgAuth(
  request: NextRequest,
  options?: {
    requiredRole?: OrganizationRole
    requiredPermission?: string
  }
): Promise<OrgAuthResponse> {
  const supabase = await createServerSupabaseClient()

  // 1. Kullanıcı auth kontrolü
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'Oturum açmanız gerekiyor',
      status: 401
    }
  }

  // 2. Header'dan organizasyon ID'sini al (opsiyonel, yoksa default kullan)
  const orgIdFromHeader = request.headers.get('x-organization-id')

  // 3. Kullanıcının organizasyon üyeliklerini getir
  const { data: memberships, error: memberError } = await supabase
    .from('organization_members')
    .select(`
      role,
      organization_id,
      is_active,
      organizations (
        id,
        name,
        slug,
        plan_tier,
        subscription_status,
        settings,
        is_active
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (memberError) {
    console.error('Organization membership query error:', memberError)
    return {
      success: false,
      error: 'Organizasyon bilgisi alınamadı',
      status: 500
    }
  }

  if (!memberships || memberships.length === 0) {
    return {
      success: false,
      error: 'Herhangi bir organizasyona üye değilsiniz',
      status: 403
    }
  }

  // 4. Aktif organizasyonu belirle
  let activeMembership = memberships[0]

  // Eğer header'da organizasyon ID varsa, onu kullan
  if (orgIdFromHeader) {
    const requestedMembership = memberships.find(
      m => m.organization_id === orgIdFromHeader
    )

    if (!requestedMembership) {
      return {
        success: false,
        error: 'Bu organizasyona erişim yetkiniz yok',
        status: 403
      }
    }

    activeMembership = requestedMembership
  }

  // Type assertion for organization data
  const orgData = activeMembership.organizations as unknown as {
    id: string
    name: string
    slug: string
    plan_tier: string
    subscription_status: string
    settings: Record<string, unknown>
    is_active: boolean
  }

  // 5. Organizasyon aktif mi kontrol et
  if (!orgData?.is_active) {
    return {
      success: false,
      error: 'Bu organizasyon aktif değil',
      status: 403
    }
  }

  // 6. Abonelik durumu kontrol et
  if (orgData.subscription_status === 'suspended') {
    return {
      success: false,
      error: 'Organizasyon aboneliği askıya alındı',
      status: 403
    }
  }

  if (orgData.subscription_status === 'cancelled') {
    return {
      success: false,
      error: 'Organizasyon aboneliği iptal edildi',
      status: 403
    }
  }

  // 7. Rol kontrolü (opsiyonel)
  const userRole = activeMembership.role as OrganizationRole

  if (options?.requiredRole) {
    const roleHierarchy: OrganizationRole[] = ['viewer', 'user', 'moderator', 'admin', 'owner']
    const userRoleIndex = roleHierarchy.indexOf(userRole)
    const requiredRoleIndex = roleHierarchy.indexOf(options.requiredRole)

    if (userRoleIndex < requiredRoleIndex) {
      return {
        success: false,
        error: 'Bu işlem için yetkiniz yok',
        status: 403
      }
    }
  }

  // 8. Permission kontrolü (opsiyonel)
  if (options?.requiredPermission) {
    const { hasOrgPermission } = await import('@/types/organization.types')
    if (!hasOrgPermission(userRole, options.requiredPermission)) {
      return {
        success: false,
        error: `'${options.requiredPermission}' yetkisine sahip değilsiniz`,
        status: 403
      }
    }
  }

  // 9. Kullanıcı profili getir
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()

  // 10. Organizasyon context'i oluştur
  const defaultSettings: OrganizationContext['settings'] = {
    currency: 'TRY',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    date_format: 'DD.MM.YYYY',
    max_users: 10,
    features: {
      sms_enabled: true,
      email_enabled: true,
      mernis_enabled: true,
      reports_enabled: true
    }
  }

  const orgContext: OrganizationContext = {
    id: orgData.id,
    name: orgData.name,
    slug: orgData.slug,
    plan_tier: orgData.plan_tier as 'free' | 'professional' | 'enterprise',
    role: userRole,
    settings: {
      ...defaultSettings,
      ...(orgData.settings as Partial<OrganizationContext['settings']> || {})
    }
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email || '',
      name: profile?.name || undefined,
      avatar_url: profile?.avatar_url || undefined,
      organization: orgContext
    }
  }
}

/**
 * Organizasyon context'i gerektiren route'lar için yardımcı
 */
export function createOrgErrorResponse(error: string, status: number): NextResponse {
  return NextResponse.json(
    { error, success: false },
    { status }
  )
}

/**
 * Supabase query'sine organizasyon filtresi ekle
 */
export function addOrgFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  organizationId: string
): T {
  return query.eq('organization_id', organizationId)
}

/**
 * Organizasyon bazlı query helper
 * @param organizationId - Organizasyon ID'si
 * @returns Supabase client ve organizasyon ID'si
 */
export async function createOrgQuery(organizationId: string) {
  const supabase = await createServerSupabaseClient()

  return {
    supabase,
    organizationId,
    // Insert için organization_id ekle
    withOrgId: <T extends Record<string, unknown>>(data: T) => ({
      ...data,
      organization_id: organizationId
    }),
    // Bulk insert için organization_id ekle
    withOrgIdMany: <T extends Record<string, unknown>>(records: T[]) =>
      records.map(record => ({
        ...record,
        organization_id: organizationId
      }))
  }
}

/**
 * API route'larında kullanım örneği:
 *
 * export async function GET(request: NextRequest) {
 *   const authResult = await withOrgAuth(request)
 *
 *   if (!authResult.success) {
 *     return createOrgErrorResponse(authResult.error, authResult.status)
 *   }
 *
 *   const { user } = authResult
 *   const orgId = user.organization.id
 *
 *   const supabase = await createServerSupabaseClient()
 *   const { data } = await supabase
 *     .from('needy_persons')
 *     .select('*')
 *     .eq('organization_id', orgId) // <-- ÖNEMLİ: Her zaman org filtresi ekle
 *
 *   return NextResponse.json({ data })
 * }
 */
