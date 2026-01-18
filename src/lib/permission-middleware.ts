/**
 * Permission Middleware - Server-side Permission Control
 * 
 * Bu middleware, API route'larında yetkilendirme kontrolü yapar.
 * Client-side permission checks ek güvenlik sağlar ama yeterli değildir.
 * Her zaman server-side kontrol yapılmalıdır.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Permission, UserRole } from '@/lib/rbac'
import { ROLE_PERMISSIONS, RESOURCE_PERMISSIONS } from '@/lib/rbac'

/**
 * Kullanıcı profili ve yetkileri
 */
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
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

/**
 * Request'ten authenticated user al
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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Kullanıcının profil bilgilerini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      role: profile?.['role'] || user.user_metadata?.['role'] || 'viewer',
      name: profile?.['name'] || user.user_metadata?.['name'],
      avatar_url: profile?.['avatar_url'] || user.user_metadata?.['avatar_url']
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return null
  }
}

/**
 * Permission kontrolü yap
 */
export function checkPermission(
  userRole: UserRole,
  requiredPermission: Permission,
  resource?: string
): boolean {
  // Admin her şeyi yapabilir
  if (userRole === 'admin') {
    return true
  }

  // Rolün genel yetkilerini kontrol et
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  
  if (resource && resource in RESOURCE_PERMISSIONS) {
    // Kaynak özelinde yetki kontrolü
    const resourceKey = resource as keyof typeof RESOURCE_PERMISSIONS
    const resourcePerms = RESOURCE_PERMISSIONS[resourceKey]
    const userResourcePerms = resourcePerms?.[userRole] as readonly string[] | undefined
    if (userResourcePerms?.includes(requiredPermission)) {
      return true
    }
  }

  // Genel yetki kontrolü
  return rolePermissions.includes(requiredPermission)
}

/**
 * API route middleware - permission kontrolü
 * 
 * Kullanımı:
 * ```ts
 * export async function POST(req: Request) {
 *   const middleware = await withAuth(req)
 *   if (!middleware.success) {
 *     return middleware.response
 *   }
 *   
 *   // İşleme devam et
 *   const user = middleware.user!
 * }
 * ```
 */
export async function withAuth(
  request?: NextRequest,
  options?: {
    requiredPermission?: Permission
    resource?: string
    allowedRoles?: UserRole[]
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
        user.role,
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
  } catch (error) {
    console.error('Auth middleware error:', error)
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
    checkPermission(result.user!.role, permission, resource)
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
    checkPermission(result.user!.role, permission, resource)
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
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (request?: NextRequest) => {
    return withAuth(request, { allowedRoles })
  }
}

/**
 * Permission bazlı middleware helper
 */
export function requirePermission(permission: Permission, resource?: string) {
  return async (request?: NextRequest) => {
    return withAuth(request, { requiredPermission: permission, resource })
  }
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(request?: NextRequest): Promise<MiddlewareResult> {
  return withAuth(request, { 
    allowedRoles: ['admin']
  })
}

/**
 * Moderators ve Admin için middleware
 */
export async function requireModerator(request?: NextRequest): Promise<MiddlewareResult> {
  return withAuth(request, { 
    allowedRoles: ['admin', 'moderator']
  })
}
