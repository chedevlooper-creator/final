/**
 * Example API Route - Permission Middleware Kullanımı
 * 
 * Bu dosya, permission-middleware.ts'in nasıl kullanılacağını gösterir.
 * Gerçek API route'larınızda bu pattern'ı takip edebilirsiniz.
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  withAuth, 
  withAllPermissions,
  requireAdmin,
  requireModerator
} from '@/lib/permission-middleware'

// ============================================
// ÖRNEK 1: Basit Auth Kontrolü
// ============================================

/**
 * GET /api/examples/user-profile
 * 
 * Giriş yapmış herhangi bir kullanıcı kendi profilini görebilir
 */
export async function GET(request: NextRequest) {
  // Middleware ile auth kontrolü
  const middleware = await withAuth(request)
  
  if (!middleware.success) {
    return middleware.response!
  }
  
  const user = middleware.user!
  
  // İşleme devam et
  return NextResponse.json({
    profile: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  })
}

// ============================================
// ÖRNEK 2: Rol Bazlı Korumalı Route
// ============================================

/**
 * POST /api/examples/admin-action
 * 
 * Sadece adminler erişebilir
 */
export async function POST(request: NextRequest) {
  // Sadece admin erişebilir
  const middleware = await requireAdmin(request)
  
  if (!middleware.success) {
    return middleware.response!
  }
  
  // Admin işlemi
  return NextResponse.json({
    message: 'Admin işlemi başarılı',
    performedBy: middleware.user!.email
  })
}

// ============================================
// ÖRNEK 3: Permission Bazlı Korumalı Route
// ============================================

/**
 * DELETE /api/examples/resource?id=123
 * 
 * Delete yetkisi olanlar silebilir
 */
export async function DELETE(request: NextRequest) {
  // 'delete' yetkisi gerektirir
  const middleware = await withAuth(request, {
    requiredPermission: 'delete',
    resource: 'needy_persons'
  })
  
  if (!middleware.success) {
    return middleware.response!
  }
  
  // Silme işlemi
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  return NextResponse.json({
    message: 'Kayıt silindi',
    id,
    deletedBy: middleware.user!.email
  })
}

// ============================================
// ÖRNEK 4: Multiple Permission Kontrolü
// ============================================

/**
 * PUT /api/examples/manage-finances
 * 
 * Hem 'manage_finances' hem 'update' yetkisi gerektirir
 */
export async function PUT(request: NextRequest) {
  const middleware = await withAllPermissions(
    request,
    ['manage_finances', 'update']
  )
  
  if (!middleware.success) {
    return middleware.response!
  }
  
  // Finansal işlem
  return NextResponse.json({
    message: 'Finansal işlem güncellendi',
    performedBy: middleware.user!.email
  })
}

// ============================================
// ÖRNEK 5: Rol Bazlı Esnek Kontrol
// ============================================

/**
 * PATCH /api/examples/moderate-content
 * 
 * Moderator veya Admin erişebilir
 */
export async function PATCH(request: NextRequest) {
  const middleware = await requireModerator(request)
  
  if (!middleware.success) {
    return middleware.response!
  }
  
  return NextResponse.json({
    message: 'İçerik moderasyonu yapıldı',
    moderatedBy: middleware.user!.email,
    role: middleware.user!.role
  })
}

// ============================================
// KULLANIM İPUÇLARI
// ============================================

/**
 * 1. Basit Auth Gerekirse:
 *    const middleware = await withAuth(request)
 * 
 * 2. Rol Kontrolü Gerekirse:
 *    const middleware = await withAuth(request, { 
 *      allowedRoles: ['admin', 'moderator'] 
 *    })
 * 
 * 3. Permission Kontrolü Gerekirse:
 *    const middleware = await withAuth(request, { 
 *      requiredPermission: 'delete',
 *      resource: 'needy_persons' 
 *    })
 * 
 * 4. Admin Only:
 *    const middleware = await requireAdmin(request)
 * 
 * 5. Moderator+:
 *    const middleware = await requireModerator(request)
 * 
 * 6. Multiple Permissions (Tümü gerekli):
 *    const middleware = await withAllPermissions(
 *      request,
 *      ['create', 'update']
 *    )
 */
