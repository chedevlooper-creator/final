import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasResourcePermission,
  getRolePermissions,
  canPerformAction,
  usePermissions,
  hasOrgPermission,
  hasMinimumRole,
  compareRoles
} from '@/lib/rbac'
import type { UserRole, OrganizationRole, OrganizationPermission } from '@/types/organization.types'

describe('RBAC System', () => {
  describe('hasPermission (Legacy)', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('admin', 'create')).toBe(true)
      expect(hasPermission('admin', 'delete')).toBe(true)
      expect(hasPermission('admin', 'manage_users')).toBe(true)
    })

    it('should return true for moderator with allowed permissions', () => {
      expect(hasPermission('moderator', 'create')).toBe(true)
      expect(hasPermission('moderator', 'update')).toBe(true)
      expect(hasPermission('moderator', 'view_reports')).toBe(true)
    })

    it('should return false for moderator with restricted permissions', () => {
      expect(hasPermission('moderator', 'delete')).toBe(false)
      expect(hasPermission('moderator', 'manage_users')).toBe(false)
      expect(hasPermission('moderator', 'manage_settings')).toBe(false)
    })

    it('should return true for user with basic permissions', () => {
      expect(hasPermission('user', 'create')).toBe(true)
      expect(hasPermission('user', 'read')).toBe(true)
      expect(hasPermission('user', 'update')).toBe(true)
    })

    it('should return false for user with advanced permissions', () => {
      expect(hasPermission('user', 'delete')).toBe(false)
      expect(hasPermission('user', 'manage_users')).toBe(false)
    })

    it('should return true for viewer with read permission', () => {
      expect(hasPermission('viewer', 'read')).toBe(true)
    })

    it('should return false for viewer with any other permission', () => {
      expect(hasPermission('viewer', 'create')).toBe(false)
      expect(hasPermission('viewer', 'update')).toBe(false)
      expect(hasPermission('viewer', 'delete')).toBe(false)
    })

    it('should return true for owner with all permissions', () => {
      expect(hasPermission('owner', 'create')).toBe(true)
      expect(hasPermission('owner', 'delete')).toBe(true)
      expect(hasPermission('owner', 'manage_users')).toBe(true)
      expect(hasPermission('owner', 'manage_settings')).toBe(true)
    })
  })

  describe('hasOrgPermission (New System)', () => {
    it('should return true for owner with any permission', () => {
      expect(hasOrgPermission('owner', 'data:create')).toBe(true)
      expect(hasOrgPermission('owner', 'data:delete')).toBe(true)
      expect(hasOrgPermission('owner', 'org:delete')).toBe(true)
      expect(hasOrgPermission('owner', 'members:manage')).toBe(true)
    })

    it('should return true for admin with data permissions', () => {
      expect(hasOrgPermission('admin', 'data:create')).toBe(true)
      expect(hasOrgPermission('admin', 'data:read')).toBe(true)
      expect(hasOrgPermission('admin', 'data:update')).toBe(true)
      expect(hasOrgPermission('admin', 'data:delete')).toBe(true)
    })

    it('should return true for admin with member management', () => {
      expect(hasOrgPermission('admin', 'members:manage')).toBe(true)
      expect(hasOrgPermission('admin', 'members:invite')).toBe(true)
    })

    it('should return false for admin with org delete permission', () => {
      expect(hasOrgPermission('admin', 'org:delete')).toBe(false)
      expect(hasOrgPermission('admin', 'org:billing')).toBe(false)
    })

    it('should return correct permissions for moderator', () => {
      expect(hasOrgPermission('moderator', 'data:create')).toBe(true)
      expect(hasOrgPermission('moderator', 'data:read')).toBe(true)
      expect(hasOrgPermission('moderator', 'data:update')).toBe(true)
      expect(hasOrgPermission('moderator', 'data:delete')).toBe(false)
      expect(hasOrgPermission('moderator', 'members:invite')).toBe(true)
      expect(hasOrgPermission('moderator', 'members:manage')).toBe(false)
    })

    it('should return correct permissions for user', () => {
      expect(hasOrgPermission('user', 'data:create')).toBe(true)
      expect(hasOrgPermission('user', 'data:read')).toBe(true)
      expect(hasOrgPermission('user', 'data:update')).toBe(true)
      expect(hasOrgPermission('user', 'data:delete')).toBe(false)
      expect(hasOrgPermission('user', 'reports:view')).toBe(true)
      expect(hasOrgPermission('user', 'reports:export')).toBe(false)
    })

    it('should return correct permissions for viewer', () => {
      expect(hasOrgPermission('viewer', 'data:read')).toBe(true)
      expect(hasOrgPermission('viewer', 'data:create')).toBe(false)
      expect(hasOrgPermission('viewer', 'data:update')).toBe(false)
      expect(hasOrgPermission('viewer', 'data:delete')).toBe(false)
    })
  })

  describe('hasResourcePermission', () => {
    it('should check needy_persons permissions correctly', () => {
      expect(hasResourcePermission('owner', 'needy_persons', 'delete')).toBe(true)
      expect(hasResourcePermission('admin', 'needy_persons', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'needy_persons', 'update')).toBe(true)
      expect(hasResourcePermission('user', 'needy_persons', 'create')).toBe(true)
      expect(hasResourcePermission('viewer', 'needy_persons', 'read')).toBe(true)
      expect(hasResourcePermission('viewer', 'needy_persons', 'delete')).toBe(false)
    })

    it('should check donations permissions correctly', () => {
      expect(hasResourcePermission('owner', 'donations', 'delete')).toBe(true)
      expect(hasResourcePermission('admin', 'donations', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'donations', 'update')).toBe(true)
      expect(hasResourcePermission('user', 'donations', 'read')).toBe(true)
      expect(hasResourcePermission('user', 'donations', 'delete')).toBe(false)
    })

    it('should check applications permissions correctly', () => {
      expect(hasResourcePermission('owner', 'applications', 'approve')).toBe(true)
      expect(hasResourcePermission('admin', 'applications', 'approve')).toBe(true)
      expect(hasResourcePermission('moderator', 'applications', 'approve')).toBe(true)
      expect(hasResourcePermission('user', 'applications', 'approve')).toBe(false)
      expect(hasResourcePermission('viewer', 'applications', 'read')).toBe(true)
    })

    it('should check reports permissions correctly', () => {
      expect(hasResourcePermission('owner', 'reports', 'export')).toBe(true)
      expect(hasResourcePermission('admin', 'reports', 'export')).toBe(true)
      expect(hasResourcePermission('moderator', 'reports', 'export')).toBe(true)
      expect(hasResourcePermission('user', 'reports', 'export')).toBe(false)
    })

    it('should check settings permissions correctly', () => {
      expect(hasResourcePermission('owner', 'settings', 'update')).toBe(true)
      expect(hasResourcePermission('admin', 'settings', 'update')).toBe(true)
      expect(hasResourcePermission('moderator', 'settings', 'read')).toBe(true)
      expect(hasResourcePermission('moderator', 'settings', 'update')).toBe(false)
      expect(hasResourcePermission('user', 'settings', 'read')).toBe(false)
    })

    it('should check users permissions correctly', () => {
      expect(hasResourcePermission('owner', 'users', 'delete')).toBe(true)
      expect(hasResourcePermission('admin', 'users', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'users', 'read')).toBe(true)
      expect(hasResourcePermission('moderator', 'users', 'update')).toBe(false)
      expect(hasResourcePermission('user', 'users', 'create')).toBe(false)
    })

    it('should check activity_logs permissions for all roles', () => {
      expect(hasResourcePermission('owner', 'activity_logs', 'delete')).toBe(true)
      expect(hasResourcePermission('admin', 'activity_logs', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'activity_logs', 'read')).toBe(true)
      expect(hasResourcePermission('user', 'activity_logs', 'read')).toBe(true)
      expect(hasResourcePermission('viewer', 'activity_logs', 'read')).toBe(false)
    })

    it('should check organization_members permissions', () => {
      expect(hasResourcePermission('owner', 'organization_members', 'delete')).toBe(true)
      expect(hasResourcePermission('admin', 'organization_members', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'organization_members', 'read')).toBe(true)
      expect(hasResourcePermission('user', 'organization_members', 'read')).toBe(true)
      expect(hasResourcePermission('viewer', 'organization_members', 'read')).toBe(true)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for owner', () => {
      const permissions = getRolePermissions('owner')
      expect(permissions).toContain('data:create')
      expect(permissions).toContain('data:delete')
      expect(permissions).toContain('org:delete')
      expect(permissions).toContain('org:billing')
      expect(permissions).toContain('members:manage')
      expect(permissions).toContain('settings:manage')
    })

    it('should return all permissions for admin', () => {
      const permissions = getRolePermissions('admin')
      expect(permissions).toContain('data:create')
      expect(permissions).toContain('data:read')
      expect(permissions).toContain('data:update')
      expect(permissions).toContain('data:delete')
      expect(permissions).toContain('members:manage')
      expect(permissions).toContain('settings:manage')
      expect(permissions).not.toContain('org:delete')
      expect(permissions).not.toContain('org:billing')
    })

    it('should return moderator permissions', () => {
      const permissions = getRolePermissions('moderator')
      expect(permissions).toContain('data:create')
      expect(permissions).toContain('reports:view')
      expect(permissions).toContain('reports:export')
      expect(permissions).not.toContain('data:delete')
      expect(permissions).not.toContain('members:manage')
      expect(permissions).not.toContain('settings:manage')
    })

    it('should return user permissions', () => {
      const permissions = getRolePermissions('user')
      expect(permissions).toContain('data:create')
      expect(permissions).toContain('data:read')
      expect(permissions).toContain('data:update')
      expect(permissions).not.toContain('data:delete')
      expect(permissions).not.toContain('reports:export')
    })

    it('should return viewer permissions', () => {
      const permissions = getRolePermissions('viewer')
      expect(permissions).toContain('data:read')
      expect(permissions).toContain('reports:view')
      expect(permissions).not.toContain('data:create')
      expect(permissions).not.toContain('data:update')
    })
  })

  describe('canPerformAction', () => {
    it('should check if user can perform action on resource', () => {
      expect(canPerformAction('owner', 'needy_persons', 'delete')).toBe(true)
      expect(canPerformAction('admin', 'needy_persons', 'delete')).toBe(true)
      expect(canPerformAction('moderator', 'needy_persons', 'delete')).toBe(false)
      expect(canPerformAction('user', 'applications', 'create')).toBe(true)
      expect(canPerformAction('viewer', 'reports', 'export')).toBe(false)
    })
  })

  describe('hasMinimumRole', () => {
    it('should correctly compare role hierarchy', () => {
      expect(hasMinimumRole('owner', 'admin')).toBe(true)
      expect(hasMinimumRole('owner', 'owner')).toBe(true)
      expect(hasMinimumRole('admin', 'admin')).toBe(true)
      expect(hasMinimumRole('admin', 'owner')).toBe(false)
      expect(hasMinimumRole('moderator', 'user')).toBe(true)
      expect(hasMinimumRole('user', 'moderator')).toBe(false)
      expect(hasMinimumRole('viewer', 'viewer')).toBe(true)
    })
  })

  describe('compareRoles', () => {
    it('should return positive when role1 is higher', () => {
      expect(compareRoles('owner', 'admin')).toBeGreaterThan(0)
      expect(compareRoles('admin', 'moderator')).toBeGreaterThan(0)
      expect(compareRoles('moderator', 'user')).toBeGreaterThan(0)
      expect(compareRoles('user', 'viewer')).toBeGreaterThan(0)
    })

    it('should return negative when role1 is lower', () => {
      expect(compareRoles('admin', 'owner')).toBeLessThan(0)
      expect(compareRoles('moderator', 'admin')).toBeLessThan(0)
      expect(compareRoles('user', 'moderator')).toBeLessThan(0)
      expect(compareRoles('viewer', 'user')).toBeLessThan(0)
    })

    it('should return zero when roles are equal', () => {
      expect(compareRoles('owner', 'owner')).toBe(0)
      expect(compareRoles('admin', 'admin')).toBe(0)
      expect(compareRoles('viewer', 'viewer')).toBe(0)
    })
  })

  describe('usePermissions hook', () => {
    it('should return correct permissions for owner', () => {
      const permissions = usePermissions('owner')
      
      expect(permissions.canCreate).toBe(true)
      expect(permissions.canRead).toBe(true)
      expect(permissions.canUpdate).toBe(true)
      expect(permissions.canDelete).toBe(true)
      expect(permissions.canManageUsers).toBe(true)
      expect(permissions.canManageSettings).toBe(true)
      expect(permissions.canViewReports).toBe(true)
      expect(permissions.canExportData).toBe(true)
      
      // Role checks
      expect(permissions.isOwner).toBe(true)
      expect(permissions.isAdmin).toBe(true)
      expect(permissions.isModerator).toBe(true)
    })

    it('should return correct permissions for admin', () => {
      const permissions = usePermissions('admin')
      
      expect(permissions.canCreate).toBe(true)
      expect(permissions.canRead).toBe(true)
      expect(permissions.canUpdate).toBe(true)
      expect(permissions.canDelete).toBe(true)
      expect(permissions.canManageUsers).toBe(true)
      expect(permissions.canManageSettings).toBe(true)
      expect(permissions.canViewReports).toBe(true)
      expect(permissions.canExportData).toBe(true)
      
      // Role checks
      expect(permissions.isOwner).toBe(false)
      expect(permissions.isAdmin).toBe(true)
      expect(permissions.isModerator).toBe(true)
    })

    it('should return correct permissions for moderator', () => {
      const permissions = usePermissions('moderator')
      
      expect(permissions.canCreate).toBe(true)
      expect(permissions.canRead).toBe(true)
      expect(permissions.canUpdate).toBe(true)
      expect(permissions.canDelete).toBe(false)
      expect(permissions.canManageUsers).toBe(false)
      expect(permissions.canManageSettings).toBe(false)
      expect(permissions.canViewReports).toBe(true)
      expect(permissions.canApproveApplications).toBe(true)
      
      // Role checks
      expect(permissions.isOwner).toBe(false)
      expect(permissions.isAdmin).toBe(false)
      expect(permissions.isModerator).toBe(true)
    })

    it('should return correct permissions for user', () => {
      const permissions = usePermissions('user')
      
      expect(permissions.canCreate).toBe(true)
      expect(permissions.canRead).toBe(true)
      expect(permissions.canUpdate).toBe(true)
      expect(permissions.canDelete).toBe(false)
      expect(permissions.canManageUsers).toBe(false)
      expect(permissions.canViewReports).toBe(true)
      
      // Role checks
      expect(permissions.isOwner).toBe(false)
      expect(permissions.isAdmin).toBe(false)
      expect(permissions.isModerator).toBe(false)
      expect(permissions.isUser).toBe(true)
    })

    it('should return correct permissions for viewer', () => {
      const permissions = usePermissions('viewer')
      
      expect(permissions.canRead).toBe(true)
      expect(permissions.canCreate).toBe(false)
      expect(permissions.canUpdate).toBe(false)
      expect(permissions.canDelete).toBe(false)
      
      // Role checks
      expect(permissions.isOwner).toBe(false)
      expect(permissions.isAdmin).toBe(false)
      expect(permissions.isModerator).toBe(false)
      expect(permissions.isViewer).toBe(true)
    })

    it('should return correct resource-specific permissions', () => {
      const ownerPerms = usePermissions('owner')
      const adminPerms = usePermissions('admin')
      const moderatorPerms = usePermissions('moderator')
      const userPerms = usePermissions('user')
      
      // Needy persons
      expect(ownerPerms.needyPersons.canDelete).toBe(true)
      expect(adminPerms.needyPersons.canDelete).toBe(true)
      expect(moderatorPerms.needyPersons.canDelete).toBe(false)
      expect(userPerms.needyPersons.canUpdate).toBe(true)
      
      // Applications
      expect(ownerPerms.applications.canApprove).toBe(true)
      expect(adminPerms.applications.canApprove).toBe(true)
      expect(moderatorPerms.applications.canApprove).toBe(true)
      expect(userPerms.applications.canApprove).toBe(false)
      
      // Settings
      expect(ownerPerms.settings.canUpdate).toBe(true)
      expect(adminPerms.settings.canUpdate).toBe(true)
      expect(moderatorPerms.settings.canUpdate).toBe(false)
      expect(userPerms.settings.canRead).toBe(false)
    })

    it('should provide hasMinimumRole helper', () => {
      const adminPerms = usePermissions('admin')
      
      expect(adminPerms.hasMinimumRole('moderator')).toBe(true)
      expect(adminPerms.hasMinimumRole('admin')).toBe(true)
      expect(adminPerms.hasMinimumRole('owner')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle invalid role gracefully', () => {
      expect(hasPermission('invalid' as UserRole, 'read')).toBe(false)
      expect(hasResourcePermission('invalid' as OrganizationRole, 'needy_persons', 'read')).toBe(false)
      expect(hasOrgPermission('invalid' as OrganizationRole, 'data:read')).toBe(false)
    })

    it('should handle invalid resource gracefully', () => {
      expect(hasResourcePermission('admin', 'invalid_resource' as never, 'read')).toBe(false)
    })

    it('should handle invalid action gracefully', () => {
      expect(hasResourcePermission('admin', 'needy_persons', 'invalid_action')).toBe(false)
    })

    it('should handle invalid permission gracefully', () => {
      expect(hasOrgPermission('admin', 'invalid:permission' as OrganizationPermission)).toBe(false)
    })
  })
})
