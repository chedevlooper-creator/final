/**
 * Role-Based Access Control (RBAC) System
 * 
 * BU DOSYA: React bileşenleri için RBAC yardımcıları sağlar
 * Tek kaynak gerçek: @/types/organization.types.ts
 * 
 * NOT: Yeni kodda bu dosyadaki tipleri değil, doğrudan 
 * @/types/organization.types.ts'den import edin.
 */

import React from 'react'
import type {
  OrganizationRole,
  OrganizationPermission,
  UserRole,
  Permission
} from '@/types/organization.types'
import {
  ORG_ROLE_PERMISSIONS,
  RESOURCE_PERMISSIONS,
  ROLE_PERMISSIONS
} from '@/types/organization.types'

// ============================================
// RE-EXPORTS (Tek kaynak gerçek)
// ============================================

export type { OrganizationRole, OrganizationPermission }
export type { UserRole, Permission }

// Role permission mappings (re-export from source)
export { ORG_ROLE_PERMISSIONS, ROLE_PERMISSIONS, RESOURCE_PERMISSIONS }

// ============================================
// YENİ ORGANİZASYON TABANLI FONKSİYONLAR
// ============================================

/**
 * Organizasyon izni kontrolü
 * @param role - Kullanıcı rolü
 * @param permission - Kontrol edilecek izin
 * @returns İzin varsa true
 */
export function hasOrgPermission(
  role: OrganizationRole,
  permission: OrganizationPermission
): boolean {
  // owner her zaman tüm izinlere sahiptir
  if (role === 'owner') return true
  return ORG_ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Rol hiyerarşisi karşılaştırması
 * @returns Negatif: role1 daha düşük, Pozitif: role1 daha yüksek, 0: eşit
 */
export function compareRoles(role1: OrganizationRole, role2: OrganizationRole): number {
  const hierarchy: OrganizationRole[] = ['viewer', 'user', 'moderator', 'admin', 'owner']
  return hierarchy.indexOf(role1) - hierarchy.indexOf(role2)
}

/**
 * Rolün minimum gerekli rolü karşılayıp karşılamadığını kontrol eder
 */
export function hasMinimumRole(
  userRole: OrganizationRole,
  requiredRole: OrganizationRole
): boolean {
  return compareRoles(userRole, requiredRole) >= 0
}

// ============================================
// GERİYE UYUMLULUK FONKSİYONLARI (Eski Sistem)
// ============================================

/**
 * Eski sistem için izin kontrolü
 * @deprecated hasOrgPermission kullanın
 */
export function hasPermission(
  role: UserRole | OrganizationRole,
  permission: Permission
): boolean {
  // OrganizationRole için mapping
  const orgRole = role as OrganizationRole
  const permMap: Record<Permission, OrganizationPermission[]> = {
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
  
  const orgPerms = permMap[permission]
  if (!orgPerms) return false
  
  // owner her zaman true
  if (orgRole === 'owner') return true
  
  return orgPerms.some(p => ORG_ROLE_PERMISSIONS[orgRole]?.includes(p as OrganizationPermission))
}

/**
 * Kaynak bazlı izin kontrolü
 */
export function hasResourcePermission(
  role: OrganizationRole,
  resource: keyof typeof RESOURCE_PERMISSIONS,
  action: string
): boolean {
  const permissions = RESOURCE_PERMISSIONS[resource]?.[role] as readonly string[] | undefined
  return permissions?.includes(action) ?? false
}

/**
 * Tüm izinleri getir
 */
export function getRolePermissions(role: OrganizationRole): OrganizationPermission[] {
  return ORG_ROLE_PERMISSIONS[role] || []
}

/**
 * Eski sistem için izinleri getir
 * @deprecated getRolePermissions kullanın
 */
export function getLegacyRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Kullanıcının aksiyon yapıp yapamayacağını kontrol et
 */
export function canPerformAction(
  role: OrganizationRole,
  resource: string,
  action: string
): boolean {
  return hasResourcePermission(
    role,
    resource as keyof typeof RESOURCE_PERMISSIONS,
    action
  )
}

// ============================================
// REACT HOOK ve BİLEŞENLERİ
// ============================================

/**
 * Permission check for UI rendering (Hook)
 * 
 * Kullanım:
 * ```tsx
 * const permissions = usePermissions('admin')
 * {permissions.canCreate && <Button>Ekle</Button>}
 * {permissions.donations.canDelete && <Button>Sil</Button>}
 * ```
 */
export function usePermissions(role: OrganizationRole = 'viewer') {
  return {
    // Yeni granular izinler
    orgPermissions: {
      canManageOrg: hasOrgPermission(role, 'org:manage'),
      canDeleteOrg: hasOrgPermission(role, 'org:delete'),
      canViewBilling: hasOrgPermission(role, 'org:billing'),
      canManageMembers: hasOrgPermission(role, 'members:manage'),
      canInviteMembers: hasOrgPermission(role, 'members:invite'),
      canCreateData: hasOrgPermission(role, 'data:create'),
      canReadData: hasOrgPermission(role, 'data:read'),
      canUpdateData: hasOrgPermission(role, 'data:update'),
      canDeleteData: hasOrgPermission(role, 'data:delete'),
      canViewReports: hasOrgPermission(role, 'reports:view'),
      canExportReports: hasOrgPermission(role, 'reports:export'),
      canCreateReports: hasOrgPermission(role, 'reports:create'),
      canManageSettings: hasOrgPermission(role, 'settings:manage'),
    },

    // Eski sistem izinleri (geriye uyumluluk)
    canCreate: hasOrgPermission(role, 'data:create'),
    canRead: hasOrgPermission(role, 'data:read'),
    canUpdate: hasOrgPermission(role, 'data:update'),
    canDelete: hasOrgPermission(role, 'data:delete'),
    canManageUsers: hasOrgPermission(role, 'members:manage'),
    canManageSettings: hasOrgPermission(role, 'settings:manage'),
    canViewReports: hasOrgPermission(role, 'reports:view'),
    canViewReportsLegacy: hasOrgPermission(role, 'reports:view'),
    canExportData: hasOrgPermission(role, 'reports:export'),
    canApproveApplications: hasResourcePermission(role, 'applications', 'approve'),
    canManageFinances: hasOrgPermission(role, 'data:delete'),

    // Kaynak bazlı izinler
    needyPersons: {
      canCreate: hasResourcePermission(role, 'needy_persons', 'create'),
      canRead: hasResourcePermission(role, 'needy_persons', 'read'),
      canUpdate: hasResourcePermission(role, 'needy_persons', 'update'),
      canDelete: hasResourcePermission(role, 'needy_persons', 'delete'),
    },

    donations: {
      canCreate: hasResourcePermission(role, 'donations', 'create'),
      canRead: hasResourcePermission(role, 'donations', 'read'),
      canUpdate: hasResourcePermission(role, 'donations', 'update'),
      canDelete: hasResourcePermission(role, 'donations', 'delete'),
    },

    applications: {
      canCreate: hasResourcePermission(role, 'applications', 'create'),
      canRead: hasResourcePermission(role, 'applications', 'read'),
      canUpdate: hasResourcePermission(role, 'applications', 'update'),
      canDelete: hasResourcePermission(role, 'applications', 'delete'),
      canApprove: hasResourcePermission(role, 'applications', 'approve'),
    },

    reports: {
      canRead: hasResourcePermission(role, 'reports', 'read'),
      canExport: hasResourcePermission(role, 'reports', 'export'),
      canCreate: hasResourcePermission(role, 'reports', 'create'),
    },

    settings: {
      canRead: hasResourcePermission(role, 'settings', 'read'),
      canUpdate: hasResourcePermission(role, 'settings', 'update'),
    },

    users: {
      canCreate: hasResourcePermission(role, 'users', 'create'),
      canRead: hasResourcePermission(role, 'users', 'read'),
      canUpdate: hasResourcePermission(role, 'users', 'update'),
      canDelete: hasResourcePermission(role, 'users', 'delete'),
    },

    tasks: {
      canCreate: hasResourcePermission(role, 'tasks', 'create'),
      canRead: hasResourcePermission(role, 'tasks', 'read'),
      canUpdate: hasResourcePermission(role, 'tasks', 'update'),
      canDelete: hasResourcePermission(role, 'tasks', 'delete'),
    },

    activityLogs: {
      canCreate: hasResourcePermission(role, 'activity_logs', 'create'),
      canRead: hasResourcePermission(role, 'activity_logs', 'read'),
      canUpdate: hasResourcePermission(role, 'activity_logs', 'update'),
      canDelete: hasResourcePermission(role, 'activity_logs', 'delete'),
    },

    organizationMembers: {
      canCreate: hasResourcePermission(role, 'organization_members', 'create'),
      canRead: hasResourcePermission(role, 'organization_members', 'read'),
      canUpdate: hasResourcePermission(role, 'organization_members', 'update'),
      canDelete: hasResourcePermission(role, 'organization_members', 'delete'),
    },

    // Mevcut rol
    role,
    
    // Rol karşılaştırma yardımcıları
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner',
    isModerator: role === 'moderator' || role === 'admin' || role === 'owner',
    isUser: role === 'user',
    isViewer: role === 'viewer',
    hasMinimumRole: (requiredRole: OrganizationRole) => hasMinimumRole(role, requiredRole)
  }
}

/**
 * Higher-order component for permission-based rendering
 * 
 * Kullanım:
 * ```tsx
 * const AdminOnlyComponent = withPermission(MyComponent, 'settings:manage')
 * ```
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: OrganizationPermission
) {
  return function PermissionWrapper(props: P & { role: OrganizationRole }) {
    const { role, ...rest } = props
    
    if (!hasOrgPermission(role, requiredPermission)) {
      return null
    }

    return <WrappedComponent {...rest as P} />
  }
}

/**
 * Rol bazlı HOC
 * 
 * Kullanım:
 * ```tsx
 * const AdminOnlyComponent = withRole(MyComponent, 'admin')
 * ```
 */
export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  minimumRole: OrganizationRole
) {
  return function RoleWrapper(props: P & { role: OrganizationRole }) {
    const { role, ...rest } = props
    
    if (!hasMinimumRole(role, minimumRole)) {
      return null
    }

    return <WrappedComponent {...rest as P} />
  }
}

/**
 * Permission check helper for conditional rendering
 * 
 * Kullanım:
 * ```tsx
 * <IfPermission role={userRole} permission="data:create">
 *   <Button>Ekle</Button>
 * </IfPermission>
 * ```
 */
export function IfPermission({
  role,
  permission,
  resource,
  action,
  children,
  fallback = null
}: {
  role: OrganizationRole
  permission?: OrganizationPermission
  resource?: keyof typeof RESOURCE_PERMISSIONS
  action?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  let hasAccess = false

  if (permission) {
    hasAccess = hasOrgPermission(role, permission)
  } else if (resource && action) {
    hasAccess = hasResourcePermission(role, resource, action)
  }

  return <>{hasAccess ? children : fallback}</>
}

/**
 * Rol bazlı koşullu render bileşeni
 * 
 * Kullanım:
 * ```tsx
 * <IfRole role={userRole} minimumRole="admin">
 *   <AdminPanel />
 * </IfRole>
 * ```
 */
export function IfRole({
  role,
  minimumRole,
  children,
  fallback = null
}: {
  role: OrganizationRole
  minimumRole: OrganizationRole
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hasAccess = hasMinimumRole(role, minimumRole)
  return <>{hasAccess ? children : fallback}</>
}
