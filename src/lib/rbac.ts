/**
 * Role-Based Access Control (RBAC) System
 * Aid Management Panel - Permission Management
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type UserRole = 'ADMIN' | 'COORDINATOR' | 'VOLUNTEER' | 'VIEWER';

export type Permission = 
  // Dashboard
  | 'dashboard:view'
  // Donations
  | 'donations:view' | 'donations:create' | 'donations:edit' | 'donations:delete'
  // Needy Persons
  | 'needy_persons:view' | 'needy_persons:create' | 'needy_persons:edit' | 'needy_persons:delete'
  // Categories
  | 'categories:view' | 'categories:create' | 'categories:edit' | 'categories:delete'
  // Volunteers
  | 'volunteers:view' | 'volunteers:create' | 'volunteers:edit' | 'volunteers:delete' | 'volunteers:manage_shifts'
  // Inventory
  | 'inventory:view' | 'inventory:create' | 'inventory:edit' | 'inventory:delete' | 'inventory:manage_stock'
  // Money Boxes
  | 'money_boxes:view' | 'money_boxes:create' | 'money_boxes:edit' | 'money_boxes:delete' | 'money_boxes:record_collection'
  // Projects
  | 'projects:view' | 'projects:create' | 'projects:edit' | 'projects:delete' | 'projects:manage_tasks'
  // Reports
  | 'reports:view' | 'reports:create' | 'reports:export'
  // Communication
  | 'communication:view' | 'communication:create' | 'communication:send'
  // Financial
  | 'financial:view' | 'financial:edit'
  // Users
  | 'users:view' | 'users:create' | 'users:edit' | 'users:delete'
  // Settings
  | 'settings:view' | 'settings:edit'
  // Audit Logs
  | 'audit_logs:view';

// ============================================
// ROLE LABELS (Turkish)
// ============================================

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Yönetici',
  COORDINATOR: 'Koordinatör',
  VOLUNTEER: 'Gönüllü',
  VIEWER: 'Görüntüleyici',
};

// ============================================
// PERMISSION DEFINITIONS
// ============================================

const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'donations:view', 'donations:create', 'donations:edit', 'donations:delete',
  'needy_persons:view', 'needy_persons:create', 'needy_persons:edit', 'needy_persons:delete',
  'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
  'volunteers:view', 'volunteers:create', 'volunteers:edit', 'volunteers:delete', 'volunteers:manage_shifts',
  'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete', 'inventory:manage_stock',
  'money_boxes:view', 'money_boxes:create', 'money_boxes:edit', 'money_boxes:delete', 'money_boxes:record_collection',
  'projects:view', 'projects:create', 'projects:edit', 'projects:delete', 'projects:manage_tasks',
  'reports:view', 'reports:create', 'reports:export',
  'communication:view', 'communication:create', 'communication:send',
  'financial:view', 'financial:edit',
  'users:view', 'users:create', 'users:edit', 'users:delete',
  'settings:view', 'settings:edit',
  'audit_logs:view',
];

// ============================================
// ROLE-PERMISSION MAPPING
// ============================================

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  COORDINATOR: ALL_PERMISSIONS.filter(
    p => p !== 'users:delete' && p !== 'settings:edit'
  ),
  VOLUNTEER: [
    'dashboard:view',
    'donations:view', 'donations:create',
    'needy_persons:view', 'needy_persons:create',
    'categories:view',
    'volunteers:view',
    'inventory:view', 'inventory:create',
    'money_boxes:view', 'money_boxes:record_collection',
    'projects:view',
    'reports:view',
    'communication:view',
    'financial:view',
  ],
  VIEWER: [
    'dashboard:view',
    'donations:view',
    'needy_persons:view',
    'categories:view',
    'volunteers:view',
    'inventory:view',
    'money_boxes:view',
    'projects:view',
    'reports:view',
    'communication:view',
    'financial:view',
  ],
};

// ============================================
// ROUTE-PERMISSION MAPPING
// ============================================

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': 'dashboard:view',
  '/donations': 'donations:view',
  '/needy-persons': 'needy_persons:view',
  '/categories': 'categories:view',
  '/volunteers': 'volunteers:view',
  '/inventory': 'inventory:view',
  '/money-boxes': 'money_boxes:view',
  '/projects': 'projects:view',
  '/reports': 'reports:view',
  '/communication': 'communication:view',
  '/financial': 'financial:view',
  '/users': 'users:view',
  '/settings': 'settings:view',
  '/audit-logs': 'audit_logs:view',
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  const rolePermissions = ROLE_PERMISSIONS[role];
  return permissions.some(p => rolePermissions.includes(p));
}

export function hasAllPermissions(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  const rolePermissions = ROLE_PERMISSIONS[role];
  return permissions.every(p => rolePermissions.includes(p));
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function canAccessRoute(
  role: UserRole | null | undefined,
  route: string
): boolean {
  if (!role) return false;
  const permission = ROUTE_PERMISSIONS[route];
  if (!permission) return true;
  return hasPermission(role, permission);
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}

export function isValidRole(role: string): role is UserRole {
  return ['ADMIN', 'COORDINATOR', 'VOLUNTEER', 'VIEWER'].includes(role);
}

export function isValidPermission(permission: string): permission is Permission {
  return ALL_PERMISSIONS.includes(permission as Permission);
}
