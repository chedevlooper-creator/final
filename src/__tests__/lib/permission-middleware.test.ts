/**
 * Tests for permission middleware
 * src/lib/permission-middleware.ts
 *
 * Tests checkPermission() which maps old-system permissions to
 * org-level permissions via hasOrgPermission.
 */

import { describe, it, expect, vi } from 'vitest'

// Mock the modules that checkPermission imports indirectly
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

vi.mock('@/lib/organization-middleware', () => ({
  withOrgAuth: vi.fn(),
}))

import { checkPermission } from '@/lib/permission-middleware'

// ============================================
// checkPermission
// ============================================
describe('checkPermission', () => {
  // Owner
  describe('owner role', () => {
    it('should always return true for any permission', () => {
      expect(checkPermission('owner', 'read')).toBe(true)
      expect(checkPermission('owner', 'create')).toBe(true)
      expect(checkPermission('owner', 'update')).toBe(true)
      expect(checkPermission('owner', 'delete')).toBe(true)
      expect(checkPermission('owner', 'manage_users')).toBe(true)
      expect(checkPermission('owner', 'manage_settings')).toBe(true)
      expect(checkPermission('owner', 'view_reports')).toBe(true)
      expect(checkPermission('owner', 'export_data')).toBe(true)
      expect(checkPermission('owner', 'approve_applications')).toBe(true)
      expect(checkPermission('owner', 'manage_finances')).toBe(true)
    })
  })

  // Admin
  describe('admin role', () => {
    it('should return true for any permission without resource', () => {
      expect(checkPermission('admin', 'read')).toBe(true)
      expect(checkPermission('admin', 'create')).toBe(true)
      expect(checkPermission('admin', 'delete')).toBe(true)
      expect(checkPermission('admin', 'manage_users')).toBe(true)
      expect(checkPermission('admin', 'manage_settings')).toBe(true)
    })

    it('should check mapped permissions when resource is provided', () => {
      // Admin has all org permissions including data:read
      expect(checkPermission('admin', 'read', 'needy_persons')).toBe(true)
      expect(checkPermission('admin', 'create', 'needy_persons')).toBe(true)
      expect(checkPermission('admin', 'delete', 'needy_persons')).toBe(true)
    })
  })

  // Moderator
  describe('moderator role', () => {
    it('should allow read', () => {
      expect(checkPermission('moderator', 'read')).toBe(true)
    })

    it('should allow create', () => {
      expect(checkPermission('moderator', 'create')).toBe(true)
    })

    it('should allow update', () => {
      expect(checkPermission('moderator', 'update')).toBe(true)
    })

    it('should deny delete (moderator has no data:delete)', () => {
      expect(checkPermission('moderator', 'delete')).toBe(false)
    })

    it('should deny manage_users (no members:manage)', () => {
      expect(checkPermission('moderator', 'manage_users')).toBe(false)
    })

    it('should deny manage_settings (no settings:manage)', () => {
      expect(checkPermission('moderator', 'manage_settings')).toBe(false)
    })

    it('should allow view_reports (has reports:view)', () => {
      expect(checkPermission('moderator', 'view_reports')).toBe(true)
    })

    it('should allow export_data (has reports:export)', () => {
      expect(checkPermission('moderator', 'export_data')).toBe(true)
    })
  })

  // User
  describe('user role', () => {
    it('should allow read and create', () => {
      expect(checkPermission('user', 'read')).toBe(true)
      expect(checkPermission('user', 'create')).toBe(true)
    })

    it('should allow update', () => {
      expect(checkPermission('user', 'update')).toBe(true)
    })

    it('should deny delete (no data:delete)', () => {
      expect(checkPermission('user', 'delete')).toBe(false)
    })

    it('should deny manage_users (no members:manage)', () => {
      expect(checkPermission('user', 'manage_users')).toBe(false)
    })

    it('should deny manage_settings (no settings:manage)', () => {
      expect(checkPermission('user', 'manage_settings')).toBe(false)
    })

    it('should allow view_reports (has reports:view)', () => {
      expect(checkPermission('user', 'view_reports')).toBe(true)
    })

    it('should deny export_data (no reports:export)', () => {
      expect(checkPermission('user', 'export_data')).toBe(false)
    })
  })

  // Viewer
  describe('viewer role', () => {
    it('should allow read', () => {
      expect(checkPermission('viewer', 'read')).toBe(true)
    })

    it('should deny create', () => {
      expect(checkPermission('viewer', 'create')).toBe(false)
    })

    it('should deny update', () => {
      expect(checkPermission('viewer', 'update')).toBe(false)
    })

    it('should deny delete', () => {
      expect(checkPermission('viewer', 'delete')).toBe(false)
    })

    it('should deny manage_users', () => {
      expect(checkPermission('viewer', 'manage_users')).toBe(false)
    })

    it('should deny manage_settings', () => {
      expect(checkPermission('viewer', 'manage_settings')).toBe(false)
    })

    it('should allow view_reports (has reports:view)', () => {
      expect(checkPermission('viewer', 'view_reports')).toBe(true)
    })

    it('should deny export_data (no reports:export)', () => {
      expect(checkPermission('viewer', 'export_data')).toBe(false)
    })

    it('should deny approve_applications', () => {
      expect(checkPermission('viewer', 'approve_applications')).toBe(false)
    })

    it('should deny manage_finances', () => {
      expect(checkPermission('viewer', 'manage_finances')).toBe(false)
    })
  })
})
