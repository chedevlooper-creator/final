import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasResourcePermission,
  getRolePermissions,
  canPerformAction,
  usePermissions
} from '@/lib/rbac'
import type { UserRole } from '@/types/common'

describe('RBAC System', () => {
  describe('hasPermission', () => {
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
  })

  describe('hasResourcePermission', () => {
    it('should check needy_persons permissions correctly', () => {
      expect(hasResourcePermission('admin', 'needy_persons', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'needy_persons', 'update')).toBe(true)
      expect(hasResourcePermission('user', 'needy_persons', 'create')).toBe(true)
      expect(hasResourcePermission('viewer', 'needy_persons', 'read')).toBe(true)
      expect(hasResourcePermission('viewer', 'needy_persons', 'delete')).toBe(false)
    })

    it('should check donations permissions correctly', () => {
      expect(hasResourcePermission('admin', 'donations', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'donations', 'update')).toBe(true)
      expect(hasResourcePermission('user', 'donations', 'read')).toBe(true)
      expect(hasResourcePermission('user', 'donations', 'delete')).toBe(false)
    })

    it('should check applications permissions correctly', () => {
      expect(hasResourcePermission('admin', 'applications', 'approve')).toBe(true)
      expect(hasResourcePermission('moderator', 'applications', 'approve')).toBe(true)
      expect(hasResourcePermission('user', 'applications', 'approve')).toBe(false)
      expect(hasResourcePermission('viewer', 'applications', 'read')).toBe(true)
    })

    it('should check reports permissions correctly', () => {
      expect(hasResourcePermission('admin', 'reports', 'export')).toBe(true)
      expect(hasResourcePermission('moderator', 'reports', 'export')).toBe(true)
      expect(hasResourcePermission('user', 'reports', 'export')).toBe(false)
    })

    it('should check settings permissions correctly', () => {
      expect(hasResourcePermission('admin', 'settings', 'update')).toBe(true)
      expect(hasResourcePermission('moderator', 'settings', 'read')).toBe(true)
      expect(hasResourcePermission('moderator', 'settings', 'update')).toBe(false)
      expect(hasResourcePermission('user', 'settings', 'read')).toBe(false)
    })

    it('should check users permissions correctly', () => {
      expect(hasResourcePermission('admin', 'users', 'delete')).toBe(true)
      expect(hasResourcePermission('moderator', 'users', 'read')).toBe(true)
      expect(hasResourcePermission('moderator', 'users', 'update')).toBe(false)
      expect(hasResourcePermission('user', 'users', 'create')).toBe(false)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for admin', () => {
      const permissions = getRolePermissions('admin')
      expect(permissions).toContain('create')
      expect(permissions).toContain('read')
      expect(permissions).toContain('update')
      expect(permissions).toContain('delete')
      expect(permissions).toContain('manage_users')
      expect(permissions).toContain('manage_settings')
    })

    it('should return moderator permissions', () => {
      const permissions = getRolePermissions('moderator')
      expect(permissions).toContain('create')
      expect(permissions).toContain('view_reports')
      expect(permissions).toContain('approve_applications')
      expect(permissions).not.toContain('delete')
      expect(permissions).not.toContain('manage_users')
    })

    it('should return user permissions', () => {
      const permissions = getRolePermissions('user')
      expect(permissions).toContain('create')
      expect(permissions).toContain('read')
      expect(permissions).toContain('update')
      expect(permissions).not.toContain('delete')
      expect(permissions).not.toContain('view_reports')
    })

    it('should return viewer permissions', () => {
      const permissions = getRolePermissions('viewer')
      expect(permissions).toEqual(['read'])
    })
  })

  describe('canPerformAction', () => {
    it('should check if user can perform action on resource', () => {
      expect(canPerformAction('admin', 'needy_persons', 'delete')).toBe(true)
      expect(canPerformAction('moderator', 'needy_persons', 'delete')).toBe(false)
      expect(canPerformAction('user', 'applications', 'create')).toBe(true)
      expect(canPerformAction('viewer', 'reports', 'export')).toBe(false)
    })
  })

  describe('usePermissions hook', () => {
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
      expect(permissions.canApproveApplications).toBe(true)
      expect(permissions.canManageFinances).toBe(true)
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
    })

    it('should return correct permissions for user', () => {
      const permissions = usePermissions('user')
      
      expect(permissions.canCreate).toBe(true)
      expect(permissions.canRead).toBe(true)
      expect(permissions.canUpdate).toBe(true)
      expect(permissions.canDelete).toBe(false)
      expect(permissions.canManageUsers).toBe(false)
      expect(permissions.canViewReports).toBe(false)
    })

    it('should return correct permissions for viewer', () => {
      const permissions = usePermissions('viewer')
      
      expect(permissions.canRead).toBe(true)
      expect(permissions.canCreate).toBe(false)
      expect(permissions.canUpdate).toBe(false)
      expect(permissions.canDelete).toBe(false)
    })

    it('should return correct resource-specific permissions', () => {
      const adminPerms = usePermissions('admin')
      const moderatorPerms = usePermissions('moderator')
      const userPerms = usePermissions('user')
      
      // Needy persons
      expect(adminPerms.needyPersons.canDelete).toBe(true)
      expect(moderatorPerms.needyPersons.canDelete).toBe(false)
      expect(userPerms.needyPersons.canUpdate).toBe(true)
      
      // Applications
      expect(adminPerms.applications.canApprove).toBe(true)
      expect(moderatorPerms.applications.canApprove).toBe(true)
      expect(userPerms.applications.canApprove).toBe(false)
      
      // Settings
      expect(adminPerms.settings.canUpdate).toBe(true)
      expect(moderatorPerms.settings.canUpdate).toBe(false)
      expect(userPerms.settings.canRead).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle invalid role gracefully', () => {
      expect(hasPermission('invalid' as UserRole, 'read')).toBe(false)
      expect(hasResourcePermission('invalid' as UserRole, 'needy_persons', 'read')).toBe(false)
    })

    it('should handle invalid resource gracefully', () => {
      expect(hasResourcePermission('admin', 'invalid_resource' as never, 'read')).toBe(false)
    })

    it('should handle invalid action gracefully', () => {
      expect(hasResourcePermission('admin', 'needy_persons', 'invalid_action')).toBe(false)
    })
  })
})
