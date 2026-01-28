/**
 * Multi-Tenant Organization Types
 * Çoklu dernek (STK) desteği için tip tanımlamaları
 */

// Abonelik seviyeleri
export type PlanTier = 'free' | 'professional' | 'enterprise'

// Abonelik durumları
export type SubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled'

// Organizasyon rolleri
export type OrganizationRole = 'owner' | 'admin' | 'moderator' | 'user' | 'viewer'

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
  logo_url?: string | null

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

// Plan limitleri
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

// Rol yetkileri
export const ROLE_PERMISSIONS: Record<OrganizationRole, string[]> = {
  owner: [
    'org:manage',
    'org:delete',
    'org:billing',
    'members:manage',
    'members:invite',
    'data:create',
    'data:read',
    'data:update',
    'data:delete',
    'reports:view',
    'reports:export',
    'settings:manage'
  ],
  admin: [
    'org:manage',
    'members:manage',
    'members:invite',
    'data:create',
    'data:read',
    'data:update',
    'data:delete',
    'reports:view',
    'reports:export',
    'settings:manage'
  ],
  moderator: [
    'members:invite',
    'data:create',
    'data:read',
    'data:update',
    'reports:view',
    'reports:export'
  ],
  user: [
    'data:create',
    'data:read',
    'data:update'
  ],
  viewer: [
    'data:read'
  ]
}

// Rol kontrolü yardımcı fonksiyon
export function hasOrgPermission(
  role: OrganizationRole,
  permission: string
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Rol karşılaştırması (hangi rol daha yetkili)
export function compareRoles(role1: OrganizationRole, role2: OrganizationRole): number {
  const hierarchy: OrganizationRole[] = ['viewer', 'user', 'moderator', 'admin', 'owner']
  return hierarchy.indexOf(role1) - hierarchy.indexOf(role2)
}
