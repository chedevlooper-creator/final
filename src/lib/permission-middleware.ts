/**
 * Permission Middleware - Server-side Permission Control
 * 
 * BU DOSYA: Eski (single-tenant) sistem için yetkilendirme middleware'i
 * 
 * ⚠️ ÖNEMLİ: Bu middleware eski sistem için geriye uyumluluk sağlar.
 * Yeni multi-tenant kodda @/lib/organization-middleware.ts'deki
 * withOrgAuth() kullanılmalıdır.
 * 
 * FARKLAR:
 * - withAuth:    Eski sistem, profiles tablosundan rol okur
 * - withOrgAuth: Yeni sistem, organization_members tablosundan rol okur
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { 
  OrganizationRole, 
  OrganizationPermission,
  UserRole,
  Permission 
} from '@/types/organization.types'
import { 
  hasOrgPermission, 
  ORG_ROLE_PERMISSIONS,
  ROLE_PERMISSIONS 
} from '@/types/organization.types'

// ============================================
// TİP TANIMLARI
// ============================================

/**
 * Authenticated User
 * @deprecated AuthenticatedUserWithOrg kullanın (organization-middleware.ts)
 */
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole | OrganizationRole
  name?: string
  avatar_url?: string
}

/**
 * Middleware sonucu
 */
export interface MiddlewareResult {
  success: boolean
  user?: AuthenticatedUser
  error?: string
  response?: NextResponse
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Request'ten authenticated user al
 * Eski sistem: profiles tablosundan rol okur
 * @deprecated withOrgAuth kullanın (organization-middleware.ts)
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Kullanıcının profil bilgilerini al (eski sistem)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      role: (profile?.['role'] || user.user_metadata?.['role'] || 'viewer') as OrganizationRole,
      name: profile?.['name'] || user.user_metadata?.['name'],
      avatar_url: profile?.['avatar_url'] || user.user_metadata?.['avatar_url']
    }
  } catch (_error) {
    // Auth error logged securely without exposing sensitive data
    return null
  }
}

/**
 * Eski sistem için izin kontrolü
 * Yeni izinleri eski izinlere map eder
 * @deprecated hasOrgPermission kullanın
 */
export function checkPermission(
  userRole: OrganizationRole,
  requiredPermission: Permission,
  resource?: string
): boolean {
  // Owner her şeyi yapabilir
  if (userRole === 'owner') {
    return true
  }

  // Admin de eski sistemde her şeyi yapabilir
  if (userRole === 'admin' && !resource) {
    return true
  }

  // Eski izinleri yeni izinlere map et
  const permissionMap: Record<Permission, OrganizationPermission[]> = {
    create: ['data:create'],
    read: ['data:read'],
    update: ['data:update'],
    delete: ['data:delete'],
    manage_users: ['members:manage'],
    manage_settings: ['settings:manage'],
    view_reports: ['reports:view'],
    export_data: ['reports:export'],
    approve_applications: ['data:update'],
    manage_finances: ['data:delete'] // En yakın eşdeğer
  }

  const mappedPerms = permissionMap[requiredPermission]
  if (!mappedPerms) return false

  return mappedPerms.some(p => hasOrgPermission(userRole, p))
}

// ============================================
// MIDDLEWARE FONKSİYONLARI
// ============================================

/**
 * API route middleware - permission kontrolü (ESKİ SİSTEM)
 * 
 * ⚠️ GERİYE UYUMLULUK: Bu fonksiyon eski sistem için korunmaktadır.
 * Yeni multi-tenant kodda withOrgAuth() kullanın.
 * 
 * Kullanımı:
 * ```ts
 * // Eski sistem (single-tenant)
 * export async function POST(req: Request) {
 *   const middleware = await withAuth(req)
 *   if (!middleware.success) {
 *     return middleware.response
 *   }
 *   const user = middleware.user!
 *   // İşleme devam et...
 * }
 * 
 * // Yeni sistem (multi-tenant)
 * export async function POST(req: NextRequest) {
 *   const { withOrgAuth, createOrgErrorResponse } = await import('@/lib/organization-middleware')
 *   const authResult = await withOrgAuth(req, { requiredPermission: 'data:create' })
 *   if (!authResult.success) {
 *     return createOrgErrorResponse(authResult.error, authResult.status)
 *   }
 *   const { user } = authResult
 *   // İşleme devam et...
 * }
 * ```
 */
export async function withAuth(
  request?: NextRequest,
  options?: {
    requiredPermission?: Permission
    resource?: string
    allowedRoles?: (UserRole | OrganizationRole)[]
  }
): Promise<MiddlewareResult> {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized - No authenticated user found',
        response: NextResponse.json(
          { error: 'Giriş yapmalısınız' },
          { status: 401 }
        )
      }
    }

    // Rol kontrolü
    if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
      return {
        success: false,
        error: 'Forbidden - Insufficient role permissions',
        response: NextResponse.json(
          { error: 'Bu işlem için yetkiniz yok' },
          { status: 403 }
        )
      }
    }

    // Permission kontrolü
    if (options?.requiredPermission) {
      const hasPermission = checkPermission(
        user.role as OrganizationRole,
        options.requiredPermission,
        options.resource
      )

      if (!hasPermission) {
        return {
          success: false,
          error: 'Forbidden - Permission denied',
          response: NextResponse.json(
            { 
              error: 'Bu işlem için yetkiniz yok',
              required: options.requiredPermission,
              role: user.role
            },
            { status: 403 }
          )
        }
      }
    }

    return {
      success: true,
      user
    }
  } catch (_error) {
    return {
      success: false,
      error: 'Internal server error',
      response: NextResponse.json(
        { error: 'Bir hata oluştu' },
        { status: 500 }
      )
    }
  }
}

/**
 * Multiple permission kontrolü
 * Kullanıcının TÜM yetkilere sahip olup olmadığını kontrol eder
 * @deprecated withOrgAuth kullanın
 */
export async function withAllPermissions(
  request?: NextRequest,
  requiredPermissions?: Permission[],
  resource?: string
): Promise<MiddlewareResult> {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return withAuth(request)
  }

  const result = await withAuth(request)
  if (!result.success || !result.user) {
    return result
  }

  const hasAllPermissions = requiredPermissions.every(permission =>
    checkPermission(result.user!.role as OrganizationRole, permission, resource)
  )

  if (!hasAllPermissions) {
    return {
      success: false,
      error: 'Forbidden - Missing required permissions',
      response: NextResponse.json(
        { 
          error: 'Bu işlem için tüm yetkilere sahip olmalısınız',
          required: requiredPermissions,
          role: result.user.role
        },
        { status: 403 }
      )
    }
  }

  return result
}

/**
 * Any permission kontrolü
 * Kullanıcının HERHANGİ BİR yetkiye sahip olup olmadığını kontrol eder
 * @deprecated withOrgAuth kullanın
 */
export async function withAnyPermission(
  request?: NextRequest,
  requiredPermissions?: Permission[],
  resource?: string
): Promise<MiddlewareResult> {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return withAuth(request)
  }

  const result = await withAuth(request)
  if (!result.success || !result.user) {
    return result
  }

  const hasAnyPermission = requiredPermissions.some(permission =>
    checkPermission(result.user!.role as OrganizationRole, permission, resource)
  )

  if (!hasAnyPermission) {
    return {
      success: false,
      error: 'Forbidden - No valid permission found',
      response: NextResponse.json(
        { 
          error: 'Bu işlem için en az bir yetkiye sahip olmalısınız',
          required: requiredPermissions,
          role: result.user.role
        },
        { status: 403 }
      )
    }
  }

  return result
}

/**
 * Rol bazlı middleware helper
 * @deprecated withOrgAuth kullanın
 */
export function requireRole(...allowedRoles: (UserRole | OrganizationRole)[]) {
  return async (request?: NextRequest) => {
    return withAuth(request, { allowedRoles })
  }
}

/**
 * Permission bazlı middleware helper
 * @deprecated withOrgAuth kullanın
 */
export function requirePermission(permission: Permission, resource?: string) {
  return async (request?: NextRequest) => {
    return withAuth(request, { requiredPermission: permission, resource })
  }
}

/**
 * Admin-only middleware
 * @deprecated withOrgAuth kullanın (admin ve owner erişimi için)
 */
export async function requireAdmin(request?: NextRequest): Promise<MiddlewareResult> {
  return withAuth(request, { 
    allowedRoles: ['admin', 'owner']
  })
}

/**
 * Moderators ve Admin için middleware
 * @deprecated withOrgAuth kullanın
 */
export async function requireModerator(request?: NextRequest): Promise<MiddlewareResult> {
  return withAuth(request, { 
    allowedRoles: ['admin', 'owner', 'moderator']
  })
}

// ============================================
// YENİ SİSTEM İÇİN YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Yeni sistem için izin kontrol middleware'i
 * Bu fonksiyon withOrgAuth'a yönlendirir
 * 
 * Kullanım:
 * ```ts
 * const result = await withPermission(request, 'data:create')
 * ```
 */
export async function withPermission(
  request: NextRequest,
  requiredPermission: OrganizationPermission
): Promise<MiddlewareResult> {
  const { withOrgAuth } = await import('@/lib/organization-middleware')
  
  const result = await withOrgAuth(request, { requiredPermission })
  
  if (!result.success) {
    return {
      success: false,
      error: result.error,
      response: NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
  }
  
  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.organization.role,
      name: result.user.name,
      avatar_url: result.user.avatar_url
    }
  }
}
