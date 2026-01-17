/**
 * Role-Based Access Control (RBAC) System
 * 
 * Bu dosya, kullanıcı rolleri ve izinlerini yönetir.
 */

import type { UserRole } from '@/types/common'

/**
 * Permission types
 */
export type Permission = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage_users'
  | 'manage_settings'
  | 'view_reports'
  | 'export_data'
  | 'approve_applications'
  | 'manage_finances'

/**
 * Role permissions mapping
 * Her rolün sahip olduğu izinler
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'create',
    'read',
    'update',
    'delete',
    'manage_users',
    'manage_settings',
    'view_reports',
    'export_data',
    'approve_applications',
    'manage_finances'
  ],
  moderator: [
    'create',
    'read',
    'update',
    'view_reports',
    'export_data',
    'approve_applications'
  ],
  user: [
    'create',
    'read',
    'update'
  ],
  viewer: [
    'read'
  ]
}

/**
 * Resource-specific permissions
 * Kaynak bazlı izinler
 */
export const RESOURCE_PERMISSIONS = {
  needy_persons: {
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['create', 'read', 'update'],
    user: ['create', 'read', 'update'],
    viewer: ['read']
  },
  donations: {
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['create', 'read', 'update'],
    user: ['create', 'read'],
    viewer: ['read']
  },
  applications: {
    admin: ['create', 'read', 'update', 'delete', 'approve'],
    moderator: ['create', 'read', 'update', 'approve'],
    user: ['create', 'read', 'update'],
    viewer: ['read']
  },
  reports: {
    admin: ['read', 'export'],
    moderator: ['read', 'export'],
    user: ['read'],
    viewer: ['read']
  },
  settings: {
    admin: ['read', 'update'],
    moderator: ['read'],
    user: [],
    viewer: []
  },
  users: {
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['read'],
    user: [],
    viewer: []
  }
} as const

/**
 * Check if user has specific permission
 */
export function hasPermission(
  role: UserRole, 
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if user has permission for specific resource
 */
export function hasResourcePermission(
  role: UserRole,
  resource: keyof typeof RESOURCE_PERMISSIONS,
  action: string
): boolean {
  const permissions = RESOURCE_PERMISSIONS[resource]?.[role]
  return permissions?.includes(action as any) ?? false
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  role: UserRole,
  resource: string,
  action: string
): boolean {
  return hasResourcePermission(
    role,
    resource as keyof typeof RESOURCE_PERMISSIONS,
    action
  )
}

/**
 * Permission check for UI rendering
 */
export function usePermissions(role: UserRole = 'viewer') {
  return {
    // General permissions
    canCreate: hasPermission(role, 'create'),
    canRead: hasPermission(role, 'read'),
    canUpdate: hasPermission(role, 'update'),
    canDelete: hasPermission(role, 'delete'),
    canManageUsers: hasPermission(role, 'manage_users'),
    canManageSettings: hasPermission(role, 'manage_settings'),
    canViewReports: hasPermission(role, 'view_reports'),
    canExportData: hasPermission(role, 'export_data'),
    canApproveApplications: hasPermission(role, 'approve_applications'),
    canManageFinances: hasPermission(role, 'manage_finances'),

    // Resource-specific permissions
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

    // Current role
    role
  }
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission
) {
  return function PermissionWrapper(props: P & { role: UserRole }) {
    const { role, ...rest } = props
    
    if (!hasPermission(role, requiredPermission)) {
      return null
    }

    return <WrappedComponent {...rest as P} />
  }
}

/**
 * Permission check helper for conditional rendering
 */
export function IfPermission({
  role,
  permission,
  resource,
  action,
  children,
  fallback = null
}: {
  role: UserRole
  permission?: Permission
  resource?: keyof typeof RESOURCE_PERMISSIONS
  action?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(role, permission)
  } else if (resource && action) {
    hasAccess = hasResourcePermission(role, resource, action)
  }

  return <>{hasAccess ? children : fallback}</>
}
