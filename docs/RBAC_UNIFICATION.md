# RBAC (Role-Based Access Control) Sistem Birleştirme

## Özet

RBAC sistemindeki tutarsızlık giderildi. Artık tek bir kaynak gerçek (single source of truth) var: `@/types/organization.types.ts`

## Değişiklik Özeti

### 1. Önceki Durum (Tutarsız)

| Dosya | Rol Sistemi | Sorun |
|-------|-------------|-------|
| `src/types/common.ts` | `UserRole` (4 rol) | Eski sistem |
| `src/types/organization.types.ts` | `OrganizationRole` (5 rol) | Yeni sistem, owner ekli |
| `src/lib/rbac.tsx` | `UserRole` kullanıyor | Tutarsız |
| `src/lib/permission-middleware.ts` | `UserRole` kullanıyor | Tutarsız |

### 2. Yeni Durum (Birleştirilmiş)

| Dosya | Rol Sistemi | Açıklama |
|-------|-------------|----------|
| `src/types/organization.types.ts` | `OrganizationRole` (5 rol) | **Tek kaynak gerçek** |
| `src/lib/rbac.tsx` | `OrganizationRole` kullanıyor | Re-export + React helpers |
| `src/lib/permission-middleware.ts` | `OrganizationRole` kullanıyor | Eski sistem middleware |
| `src/lib/organization-middleware.ts` | `OrganizationRole` kullanıyor | Yeni sistem middleware |
| `src/types/common.ts` | Re-export | Geriye uyumluluk |

## Rol Hiyerarşisi

```
owner     (En yüksek) - Organizasyon sahibi, tüm yetkiler
admin     - Tam yönetim (owner hariç yetkiler)
moderator - Veri yönetimi ve raporlar
user      - Veri girişi ve düzenleme
viewer    (En düşük)  - Sadece görüntüleme
```

## İzin Türleri

### Yeni Granular İzinler (Önerilen)

```typescript
type OrganizationPermission =
  // Organizasyon yönetimi
  | 'org:manage' | 'org:delete' | 'org:billing' | 'org:view'
  // Üye yönetimi
  | 'members:manage' | 'members:invite' | 'members:view'
  // Veri işlemleri (CRUD)
  | 'data:create' | 'data:read' | 'data:update' | 'data:delete'
  // Raporlar
  | 'reports:view' | 'reports:export' | 'reports:create'
  // Ayarlar
  | 'settings:manage' | 'settings:view'
```

### Eski İzinler (Geriye Uyumluluk)

```typescript
type Permission =
  | 'create' | 'read' | 'update' | 'delete'
  | 'manage_users' | 'manage_settings'
  | 'view_reports' | 'export_data'
  | 'approve_applications' | 'manage_finances'
```

## Kullanım Rehberi

### 1. React Bileşenlerinde

```tsx
import { usePermissions } from '@/lib/rbac'

function MyComponent() {
  const { role } = useAuth() // OrganizationRole döner
  const permissions = usePermissions(role)
  
  // Yeni granular izinler
  if (permissions.orgPermissions.canCreateData) {
    // ...
  }
  
  // Eski sistem izinleri (geriye uyumluluk)
  if (permissions.canCreate) {
    // ...
  }
  
  // Kaynak bazlı izinler
  if (permissions.needyPersons.canDelete) {
    // ...
  }
  
  // Rol bazlı kontrol
  if (permissions.isAdmin) {
    // ...
  }
  
  return (
    <>
      {permissions.canCreate && <Button>Ekle</Button>}
      {permissions.isOwner && <Button>Organizasyonu Sil</Button>}
    </>
  )
}
```

### 2. API Route'larında - Yeni Sistem (Multi-tenant)

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withOrgAuth(request, {
    requiredPermission: 'data:read'  // Yeni granular izin
  })
  
  if (!authResult.success) {
    return createOrgErrorResponse(authResult.error, authResult.status)
  }
  
  const { user } = authResult
  const orgId = user.organization.id
  const userRole = user.organization.role
  
  // ...
}
```

### 3. API Route'larında - Eski Sistem (Geriye Uyumluluk)

```tsx
import { withAuth } from '@/lib/permission-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',  // Eski izin
    resource: 'needy_persons'
  })
  
  if (!authResult.success) {
    return authResult.response
  }
  
  const { user } = authResult
  // user.role: OrganizationRole
  
  // ...
}
```

## Middleware Karşılaştırması

| Özellik | `withAuth` (Eski) | `withOrgAuth` (Yeni) |
|---------|-------------------|----------------------|
| Rol kaynağı | `profiles` tablosu | `organization_members` tablosu |
| Organizasyon context | Yok | Var |
| Subscription kontrolü | Yok | Var |
| Multi-tenant | Hayır | Evet |
| Header'dan org ID | Hayır | Evet (`x-organization-id`) |
| Kullanım | Eski kod | Yeni kod |

## Rol İzin Haritası

| Rol | `data:create` | `data:delete` | `members:manage` | `org:delete` | `reports:export` |
|-----|---------------|---------------|------------------|--------------|------------------|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ❌ | ✅ |
| moderator | ✅ | ❌ | ❌ | ❌ | ✅ |
| user | ✅ | ❌ | ❌ | ❌ | ❌ |
| viewer | ❌ | ❌ | ❌ | ❌ | ❌ |

## Fonksiyon Referansı

### `hasOrgPermission(role, permission)`

Yeni sistem için granular izin kontrolü.

```typescript
hasOrgPermission('admin', 'data:create') // true
hasOrgPermission('moderator', 'data:delete') // false
```

### `hasMinimumRole(userRole, requiredRole)`

Rol hiyerarşisi kontrolü.

```typescript
hasMinimumRole('admin', 'moderator') // true (admin > moderator)
hasMinimumRole('user', 'admin') // false
```

### `compareRoles(role1, role2)`

Rol karşılaştırması.

```typescript
compareRoles('admin', 'moderator') // 1 (admin daha yüksek)
compareRoles('user', 'admin') // -2 (user daha düşük)
```

### `hasResourcePermission(role, resource, action)`

Kaynak bazlı izin kontrolü.

```typescript
hasResourcePermission('admin', 'needy_persons', 'delete') // true
hasResourcePermission('user', 'settings', 'update') // false
```

## Migrasyon Rehberi

### Eski Koddan Yeni Koda

**Eski:**
```typescript
import { withAuth } from '@/lib/permission-middleware'
import type { UserRole } from '@/types/common'

const result = await withAuth(request, {
  requiredPermission: 'read',
  resource: 'needy_persons'
})
```

**Yeni:**
```typescript
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'
import type { OrganizationRole } from '@/types/organization.types'

const result = await withOrgAuth(request, {
  requiredPermission: 'data:read'
})

if (!result.success) {
  return createOrgErrorResponse(result.error, result.status)
}
```

### Tip Değişiklikleri

| Eski | Yeni |
|------|------|
| `UserRole` | `OrganizationRole` (genişletilmiş) |
| `Permission` | `OrganizationPermission` (granular) |
| `ROLE_PERMISSIONS` | `ORG_ROLE_PERMISSIONS` |

## Önemli Notlar

1. **Owner rolü** her zaman tüm izinlere sahiptir (özel kontrol gerekmez)
2. **Geriye uyumluluk** için `hasPermission` fonksiyonu korunmuştur
3. **Yeni kod** `OrganizationRole` ve `OrganizationPermission` kullanmalıdır
4. **withAuth** eski sistem için kullanılmaya devam edilebilir
5. **withOrgAuth** yeni multi-tenant sistem için kullanılmalıdır

## Test

```bash
# RBAC testlerini çalıştır
npx vitest run src/__tests__/lib/rbac.test.ts
```

Tüm 44 test geçmelidir.

## Dosya Değişiklik Listesi

| Dosya | Değişiklik |
|-------|------------|
| `src/types/organization.types.ts` | Tek kaynak gerçek, tüm RBAC tipleri ve fonksiyonları |
| `src/types/common.ts` | Re-export, geriye uyumluluk |
| `src/lib/rbac.tsx` | React helpers, re-export |
| `src/lib/permission-middleware.ts` | Eski middleware, güncellendi |
| `src/lib/organization-middleware.ts` | Yeni middleware, güncellendi |
| `src/hooks/use-auth.ts` | `OrganizationRole` kullanıyor |
| `src/hooks/queries/use-users.ts` | `OrganizationRole` kullanıyor |
| `src/__tests__/lib/rbac.test.ts` | Owner rolü testleri eklendi |
