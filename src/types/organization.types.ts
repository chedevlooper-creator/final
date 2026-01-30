/**
 * Multi-Tenant Organization Types
 * Çoklu dernek (STK) desteği için tip tanımlamaları
 * 
 * BU DOSYA: RBAC sistemi için tek kaynak gerçek (single source of truth)
 * Tüm rol ve izin tanımlamaları buradan yapılır
 */

// ============================================
// ABONELİK ve PLAN TİPLERİ
// ============================================

// Abonelik seviyeleri
export type PlanTier = 'free' | 'professional' | 'enterprise'

// Abonelik durumları
export type SubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled'

// ============================================
// RBAC - ROL ve İZİN TİPLERİ
// ============================================

/**
 * Organizasyon Rolleri (5 seviye hiyerarşi)
 * 
 * Hiyerarşi (düşükten yükseğe):
 * 1. viewer - Sadece görüntüleme
 * 2. user - Veri girişi ve düzenleme
 * 3. moderator - Veri yönetimi ve raporlar
 * 4. admin - Tam yönetim (owner hariç)
 * 5. owner - Organizasyon sahibi, tüm yetkiler
 */
export type OrganizationRole = 'owner' | 'admin' | 'moderator' | 'user' | 'viewer'

/**
 * Eski sistem için geriye uyumluluk tipi
 * @deprecated OrganizationRole kullanın
 */
export type UserRole = Exclude<OrganizationRole, 'owner'>

/**
 * İzin türleri - Granular yetkilendirme için
 * Format: resource:action
 */
export type OrganizationPermission =
  // Organizasyon yönetimi
  | 'org:manage'
  | 'org:delete'
  | 'org:billing'
  | 'org:view'
  // Üye yönetimi
  | 'members:manage'
  | 'members:invite'
  | 'members:view'
  // Veri işlemleri (CRUD)
  | 'data:create'
  | 'data:read'
  | 'data:update'
  | 'data:delete'
  // Raporlar
  | 'reports:view'
  | 'reports:export'
  | 'reports:create'
  // Ayarlar
  | 'settings:manage'
  | 'settings:view'

/**
 * Eski sistem için geriye uyumluluk izinleri
 * @deprecated OrganizationPermission kullanın
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

// ============================================
// ORGANİZASYON AYARLARI ve TİPLERİ
// ============================================

// Organizasyon ayarları
export interface OrganizationSettings {
  currency: string
  language: string
  timezone: string
  date_format: string
  max_users: number
  features: {
    sms_enabled: boolean
    email_enabled: boolean
    mernis_enabled: boolean
    reports_enabled: boolean
  }
}

// Ana organizasyon tipi
export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null

  // İletişim
  email?: string | null
  phone?: string | null
  website?: string | null
  address?: string | null
  city?: string | null

  // Abonelik
  plan_tier: PlanTier
  subscription_status: SubscriptionStatus
  trial_ends_at?: string | null
  subscription_ends_at?: string | null

  // Stripe
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null

  // Ayarlar
  settings: OrganizationSettings

  // Meta
  created_at: string
  updated_at: string
  created_by?: string | null
  is_active: boolean
}

// Organizasyon üyeliği
export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrganizationRole
  invited_by?: string | null
  invited_at?: string | null
  joined_at: string
  is_active: boolean
  last_active_at?: string | null
  created_at: string
  updated_at: string
}

// Organizasyon daveti
export interface OrganizationInvite {
  id: string
  organization_id: string
  email: string
  role: OrganizationRole
  token: string
  invited_by: string
  expires_at: string
  accepted_at?: string | null
  created_at: string
}

// Üyelik ile birlikte organizasyon
export interface OrganizationWithMembership extends Organization {
  membership: {
    role: OrganizationRole
    joined_at: string
  }
}

// Organizasyon oluşturma
export interface CreateOrganizationInput {
  name: string
  slug: string
  description?: string
  email?: string
  phone?: string
  plan_tier?: PlanTier
}

// Organizasyon güncelleme
export interface UpdateOrganizationInput {
  name?: string
  description?: string
  logo_url?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  settings?: Partial<OrganizationSettings>
}

// Üye davet etme
export interface InviteMemberInput {
  email: string
  role: OrganizationRole
}

// Organizasyon context (API'lerde kullanılacak)
export interface OrganizationContext {
  id: string
  name: string
  slug: string
  plan_tier: PlanTier
  role: OrganizationRole
  settings: OrganizationSettings
}

// Auth user ile birlikte organizasyon bilgisi
export interface AuthenticatedUserWithOrg {
  id: string
  email: string
  name?: string
  avatar_url?: string
  organization: OrganizationContext
}

// Eski sistem için geriye uyumluluk
/**
 * @deprecated AuthenticatedUserWithOrg kullanın
 */
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  name?: string
  avatar_url?: string
}

// ============================================
// PLAN LİMİTLERİ
// ============================================

export const PLAN_LIMITS: Record<PlanTier, {
  max_users: number
  max_needy: number
  max_storage_mb: number
  features: string[]
}> = {
  free: {
    max_users: 3,
    max_needy: 100,
    max_storage_mb: 500,
    features: ['basic_reports', 'email_support']
  },
  professional: {
    max_users: 10,
    max_needy: 1000,
    max_storage_mb: 5000,
    features: [
      'basic_reports',
      'advanced_reports',
      'sms',
      'email',
      'mernis',
      'priority_support'
    ]
  },
  enterprise: {
    max_users: -1, // Unlimited
    max_needy: -1, // Unlimited
    max_storage_mb: 50000,
    features: [
      'basic_reports',
      'advanced_reports',
      'sms',
      'email',
      'mernis',
      'api_access',
      'white_label',
      'dedicated_support',
      'custom_integrations'
    ]
  }
}

// ============================================
// RBAC - ROL İZİN HARİTALARI
// ============================================

/**
 * Organizasyon Rol İzin Haritası (Multi-tenant)
 * Her rolün sahip olduğu granular izinler
 */
export const ORG_ROLE_PERMISSIONS: Record<OrganizationRole, OrganizationPermission[]> = {
  owner: [
    // Organizasyon
    'org:manage',
    'org:delete',
    'org:billing',
    'org:view',
    // Üyeler
    'members:manage',
    'members:invite',
    'members:view',
    // Veri (CRUD)
    'data:create',
    'data:read',
    'data:update',
    'data:delete',
    // Raporlar
    'reports:view',
    'reports:export',
    'reports:create',
    // Ayarlar
    'settings:manage',
    'settings:view'
  ],
  admin: [
    // Organizasyon
    'org:manage',
    'org:view',
    // Üyeler
    'members:manage',
    'members:invite',
    'members:view',
    // Veri (CRUD)
    'data:create',
    'data:read',
    'data:update',
    'data:delete',
    // Raporlar
    'reports:view',
    'reports:export',
    'reports:create',
    // Ayarlar
    'settings:manage',
    'settings:view'
  ],
  moderator: [
    // Organizasyon
    'org:view',
    // Üyeler (davet hariç)
    'members:invite',
    'members:view',
    // Veri (Create, Read, Update - Delete yok)
    'data:create',
    'data:read',
    'data:update',
    // Raporlar
    'reports:view',
    'reports:export',
    'reports:create',
    // Ayarlar (sadece görüntüleme)
    'settings:view'
  ],
  user: [
    // Organizasyon
    'org:view',
    // Üyeler (sadece görüntüleme)
    'members:view',
    // Veri (Create, Read, Update - Delete yok)
    'data:create',
    'data:read',
    'data:update',
    // Raporlar (sadece görüntüleme)
    'reports:view',
    // Ayarlar (sadece görüntüleme)
    'settings:view'
  ],
  viewer: [
    // Organizasyon
    'org:view',
    // Üyeler (sadece görüntüleme)
    'members:view',
    // Veri (sadece okuma)
    'data:read',
    // Raporlar (sadece görüntüleme)
    'reports:view',
    // Ayarlar (sadece görüntüleme)
    'settings:view'
  ]
}

/**
 * Kaynak bazlı izin haritası
 * Eski sistem için geriye uyumluluk
 * @deprecated ORG_ROLE_PERMISSIONS kullanın
 */
export const RESOURCE_PERMISSIONS = {
  needy_persons: {
    owner: ['create', 'read', 'update', 'delete'],
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['create', 'read', 'update'],
    user: ['create', 'read', 'update'],
    viewer: ['read']
  },
  donations: {
    owner: ['create', 'read', 'update', 'delete'],
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['create', 'read', 'update'],
    user: ['create', 'read'],
    viewer: ['read']
  },
  applications: {
    owner: ['create', 'read', 'update', 'delete', 'approve'],
    admin: ['create', 'read', 'update', 'delete', 'approve'],
    moderator: ['create', 'read', 'update', 'approve'],
    user: ['create', 'read', 'update'],
    viewer: ['read']
  },
  reports: {
    owner: ['read', 'export', 'create'],
    admin: ['read', 'export', 'create'],
    moderator: ['read', 'export', 'create'],
    user: ['read'],
    viewer: ['read']
  },
  settings: {
    owner: ['read', 'update'],
    admin: ['read', 'update'],
    moderator: ['read'],
    user: [],
    viewer: []
  },
  users: {
    owner: ['create', 'read', 'update', 'delete'],
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['read'],
    user: [],
    viewer: []
  },
  tasks: {
    owner: ['create', 'read', 'update', 'delete'],
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['create', 'read', 'update'],
    user: ['read', 'update'],
    viewer: ['read']
  },
  activity_logs: {
    owner: ['create', 'read', 'update', 'delete'],
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['read'],
    user: ['read'],
    viewer: []
  },
  organization_members: {
    owner: ['create', 'read', 'update', 'delete'],
    admin: ['create', 'read', 'update', 'delete'],
    moderator: ['read'],
    user: ['read'],
    viewer: ['read']
  }
} as const

/**
 * Eski sistem için rol izin haritası
 * @deprecated ORG_ROLE_PERMISSIONS kullanın
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

// ============================================
// RBAC YARDIMCI FONKSİYONLAR
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
  return ORG_ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Kaynak bazlı izin kontrolü (Eski sistem)
 * @deprecated hasOrgPermission kullanın
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
 * Eski sistem için izin kontrolü
 * @deprecated hasOrgPermission kullanın
 */
export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
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
 * Rolün başka bir rolden daha yüksek veya eşit olup olmadığını kontrol eder
 * @param userRole - Kullanıcı rolü
 * @param requiredRole - Gerekli minimum rol
 * @returns Yetki yeterliyse true
 */
export function hasMinimumRole(
  userRole: OrganizationRole,
  requiredRole: OrganizationRole
): boolean {
  return compareRoles(userRole, requiredRole) >= 0
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
