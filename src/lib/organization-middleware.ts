/**
 * Organization Middleware
 * Multi-tenant API erişimi için organizasyon context yönetimi
 * 
 * BU DOSYA: Yeni multi-tenant sistem için yetkilendirme middleware'i
 * 
 * ⚠️ ÖNEMLİ: Bu middleware yeni multi-tenant sistem içindir.
 * Eski single-tenant kodda @/lib/permission-middleware.ts'deki
 * withAuth() kullanılmaya devam edilebilir.
 * 
 * FARKLAR:
 * - withAuth:    Eski sistem, profiles tablosundan rol okur
 * - withOrgAuth: Yeni sistem, organization_members tablosundan rol okur,
 *                organizasyon context'i ve subscription kontrolü yapar
 * 
 * YENİ SİSTEM KULLANIMI:
 * ```ts
 * import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
 * 
 * export async function GET(request: NextRequest) {
 *   const authResult = await withOrgAuth(request, { 
 *     requiredPermission: 'data:read' 
 *   })
 *   
 *   if (!authResult.success) {
 *     return createOrgErrorResponse(authResult.error, authResult.status)
 *   }
 *   
 *   const { user } = authResult
 *   const orgId = user.organization.id
 *   // ...
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  OrganizationContext,
  OrganizationRole,
  AuthenticatedUserWithOrg,
  OrganizationPermission
} from '@/types/organization.types'
import { hasOrgPermission, hasMinimumRole } from '@/types/organization.types'

// ============================================
// TİP TANIMLARI
// ============================================

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

// ============================================
// ANA MIDDLEWARE FONKSİYONU
// ============================================

export interface WithOrgAuthOptions {
  /** Minimum gerekli rol (hiyerarşik kontrol) */
  requiredRole?: OrganizationRole
  /** Spesifik izin kontrolü */
  requiredPermission?: OrganizationPermission
  /** Organizasyon ID'si header'dan zorunlu mu? */
  requireOrgHeader?: boolean
}

/**
 * Organizasyon context'i ile birlikte auth kontrolü
 * Tüm multi-tenant API route'larında kullanılmalı
 * 
 * @param request - Next.js request objesi
 * @param options - Yetkilendirme seçenekleri
 * @returns OrgAuthResponse - Başarılı veya hata durumu
 */
export async function withOrgAuth(
  request: NextRequest,
  options: WithOrgAuthOptions = {}
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

  if (options.requireOrgHeader && !orgIdFromHeader) {
    return {
      success: false,
      error: 'Organizasyon ID\'si gerekli (x-organization-id header)',
      status: 400
    }
  }

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
    if (!hasMinimumRole(userRole, options.requiredRole)) {
      return {
        success: false,
        error: 'Bu işlem için yetkiniz yok',
        status: 403
      }
    }
  }

  // 8. Permission kontrolü (opsiyonel)
  if (options?.requiredPermission) {
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

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Organizasyon context'i gerektiren route'lar için hata yanıtı oluştur
 */
export function createOrgErrorResponse(error: string, status: number): NextResponse {
  return NextResponse.json(
    { error, success: false },
    { status }
  )
}

/**
 * Rol bazlı middleware helper
 * Belirli bir rol veya üstü gerektirir
 * 
 * Kullanım:
 * ```ts
 * export const GET = requireOrgRole('admin')(async (request) => {
 *   // Sadece admin ve owner erişebilir
 * })
 * ```
 */
export function requireOrgRole(minimumRole: OrganizationRole) {
  return async (request: NextRequest): Promise<OrgAuthResponse> => {
    return withOrgAuth(request, { requiredRole: minimumRole })
  }
}

/**
 * İzin bazlı middleware helper
 * Belirli bir izin gerektirir
 * 
 * Kullanım:
 * ```ts
 * export const POST = requireOrgPermission('data:create')(async (request) => {
 *   // data:create izni olanlar erişebilir
 * })
 * ```
 */
export function requireOrgPermission(permission: OrganizationPermission) {
  return async (request: NextRequest): Promise<OrgAuthResponse> => {
    return withOrgAuth(request, { requiredPermission: permission })
  }
}

/**
 * Owner-only middleware
 */
export async function requireOwner(request: NextRequest): Promise<OrgAuthResponse> {
  return withOrgAuth(request, { requiredRole: 'owner' })
}

/**
 * Admin ve Owner için middleware
 */
export async function requireAdmin(request: NextRequest): Promise<OrgAuthResponse> {
  return withOrgAuth(request, { requiredRole: 'admin' })
}

// ============================================
// VERİ FİLTRELEME YARDIMCILARI
// ============================================

/**
 * Supabase query'sine organizasyon filtresi ekle
 * 
 * Kullanım:
 * ```ts
 * const { data } = await supabase
 *   .from('needy_persons')
 *   .select('*')
 *   .eq('organization_id', orgId)
 * ```
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
 * 
 * Kullanım:
 * ```ts
 * const { supabase, withOrgId } = await createOrgQuery(orgId)
 * await supabase.from('table').insert(withOrgId(data))
 * ```
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
      })),
    // Query'ye organizasyon filtresi ekle
    filterByOrg: <T extends { eq: (column: string, value: string) => T }>(query: T) =>
      query.eq('organization_id', organizationId)
  }
}

// ============================================
// KULLANIM ÖRNEKLERİ
// ============================================

/**
 * API route'larında kullanım örneği:
 *
 * ```ts
 * import { NextRequest, NextResponse } from 'next/server'
 * import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
 * import { createServerSupabaseClient } from '@/lib/supabase/server'
 * 
 * export async function GET(request: NextRequest) {
 *   const authResult = await withOrgAuth(request, {
 *     requiredPermission: 'data:read'
 *   })
 *
 *   if (!authResult.success) {
 *     return createOrgErrorResponse(authResult.error, authResult.status)
 *   }
 *
 *   const { user } = authResult
 *   const orgId = user.organization.id
 *   const userRole = user.organization.role
 *
 *   const supabase = await createServerSupabaseClient()
 *   const { data } = await supabase
 *     .from('needy_persons')
 *     .select('*')
 *     .eq('organization_id', orgId) // <-- ÖNEMLİ: Her zaman org filtresi ekle
 *
 *   return NextResponse.json({ data })
 * }
 * ```
 */
