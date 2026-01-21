# 🔐 Güvenlik Dokümantasyonu

> Yardım Yönetim Paneli güvenlik mimarisi ve best practices

---

## 📋 Genel Bakış

Uygulama, çok katmanlı güvenlik mimarisi kullanmaktadır:

1. **Authentication Layer** - Supabase Auth (JWT)
2. **Authorization Layer** - Role-Based Access Control (RBAC)
3. **Data Layer** - Row Level Security (RLS)
4. **Network Layer** - Security Headers
5. **Application Layer** - Input Validation

---

## 🔑 Authentication

### Supabase Auth

Kimlik doğrulama Supabase Auth servisi ile sağlanmaktadır.

**Desteklenen Yöntemler:**
- Email/Password
- Magic Link (opsiyonel)

### JWT Token Yapısı

```json
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "user_metadata": {
    "role": "admin"
  }
}
```

### Server-Side Authentication

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Middleware Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  // Giriş yapmamış kullanıcıları login'e yönlendir
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Giriş yapmış kullanıcıları login'den uzaklaştır
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard/dashboard', request.url))
  }

  return response
}
```

---

## 👥 Role-Based Access Control (RBAC)

### Roller

| Rol | Açıklama | Erişim Seviyesi |
|-----|----------|-----------------|
| `admin` | Sistem yöneticisi | Tam erişim |
| `moderator` | İçerik yöneticisi | CRUD + Onay |
| `user` | Standart kullanıcı | Oluşturma/Düzenleme |
| `viewer` | Salt okunur | Sadece görüntüleme |

### Permission Türleri

```typescript
type Permission = 
  | 'create'              // Kayıt oluşturma
  | 'read'                // Kayıt görüntüleme
  | 'update'              // Kayıt güncelleme
  | 'delete'              // Kayıt silme
  | 'manage_users'        // Kullanıcı yönetimi
  | 'manage_settings'     // Sistem ayarları
  | 'view_reports'        // Rapor görüntüleme
  | 'export_data'         // Veri dışa aktarma
  | 'approve_applications' // Başvuru onaylama
  | 'manage_finances'     // Finans yönetimi
```

### Rol-Permission Matrisi

| Permission | Admin | Moderator | User | Viewer |
|------------|:-----:|:---------:|:----:|:------:|
| create | ✅ | ✅ | ✅ | ❌ |
| read | ✅ | ✅ | ✅ | ✅ |
| update | ✅ | ✅ | ✅ | ❌ |
| delete | ✅ | ❌ | ❌ | ❌ |
| manage_users | ✅ | ❌ | ❌ | ❌ |
| manage_settings | ✅ | ❌ | ❌ | ❌ |
| view_reports | ✅ | ✅ | ✅ | ✅ |
| export_data | ✅ | ✅ | ❌ | ❌ |
| approve_applications | ✅ | ✅ | ❌ | ❌ |
| manage_finances | ✅ | ❌ | ❌ | ❌ |

### Kaynak Bazlı İzinler

```typescript
const RESOURCE_PERMISSIONS = {
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
}
```

### RBAC Kullanımı

#### Hook Kullanımı

```typescript
import { usePermissions } from '@/lib/rbac'

function MyComponent() {
  const permissions = usePermissions(user.role)
  
  return (
    <div>
      {permissions.canDelete && <DeleteButton />}
      {permissions.canExportData && <ExportButton />}
      {permissions.donations.canCreate && <AddDonationButton />}
    </div>
  )
}
```

#### Conditional Rendering

```typescript
import { IfPermission } from '@/lib/rbac'

function MyComponent({ role }) {
  return (
    <IfPermission 
      role={role} 
      resource="settings" 
      action="update"
      fallback={<AccessDenied />}
    >
      <SettingsForm />
    </IfPermission>
  )
}
```

#### HOC Pattern

```typescript
import { withPermission } from '@/lib/rbac'

const ProtectedSettings = withPermission(SettingsPage, 'manage_settings')

// Kullanım
<ProtectedSettings role={user.role} />
```

---

## 🛡️ Row Level Security (RLS)

### RLS Politikaları

Tüm veritabanı tablolarında RLS aktiftir.

```sql
-- Authenticated kullanıcılar için tam okuma
CREATE POLICY "Allow authenticated read" 
  ON needy_persons 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Sadece kendi kaydını düzenleyebilme (örnek)
CREATE POLICY "Users can update own records" 
  ON profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Admin full access (örnek)
CREATE POLICY "Admins have full access" 
  ON needy_persons 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

### RLS Kontrol

```sql
-- Tablo RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 🔒 Security Headers

### HTTP Güvenlik Başlıkları

```typescript
// src/lib/security.ts
export const securityHeaders = {
  // XSS koruması
  'X-XSS-Protection': '1; mode=block',
  
  // Clickjacking koruması
  'X-Frame-Options': 'DENY',
  
  // Content type sniffing koruması
  'X-Content-Type-Options': 'nosniff',
  
  // HTTPS zorlaması
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.posthog.com;
  `.replace(/\s+/g, ' ').trim()
}
```

### Next.js Config

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: Object.entries(securityHeaders).map(([key, value]) => ({
        key,
        value,
      })),
    },
  ]
}
```

---

## ✅ Input Validation

### Zod Schemas

```typescript
// src/lib/validations/needy.ts
import { z } from 'zod'

export const needyPersonSchema = z.object({
  first_name: z.string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  
  last_name: z.string()
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  
  identity_number: z.string()
    .length(11, 'TC Kimlik No 11 haneli olmalı')
    .regex(/^\d+$/, 'Sadece rakam içermelidir')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'Geçerli telefon numarası giriniz')
    .optional(),
  
  email: z.string()
    .email('Geçerli email adresi giriniz')
    .optional(),
  
  monthly_income: z.number()
    .min(0, 'Gelir negatif olamaz')
    .optional(),
});
```

### Form Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function NeedyForm() {
  const form = useForm({
    resolver: zodResolver(needyPersonSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    }
  })
  
  // ...
}
```

---

## 📝 Audit Logging

### Audit Log Yapısı

```typescript
// src/lib/audit.ts
interface AuditLog {
  id: string
  user_id: string
  action: AuditAction
  resource_type: string
  resource_id: string
  old_value?: object
  new_value?: object
  ip_address?: string
  user_agent?: string
  created_at: Date
}

type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'EXPORT'
```

### Audit Log Oluşturma

```typescript
import { createAuditLog } from '@/lib/audit'

// Kayıt oluşturma
await createAuditLog({
  action: 'CREATE',
  resource_type: 'needy_persons',
  resource_id: newRecord.id,
  new_value: newRecord,
})

// Kayıt güncelleme
await createAuditLog({
  action: 'UPDATE',
  resource_type: 'needy_persons',
  resource_id: record.id,
  old_value: oldRecord,
  new_value: newRecord,
})
```

---

## 🔐 Hassas Veri Yönetimi

### Environment Variables

```bash
# Asla commit etmeyin
.env.local
.env.production.local

# Hassas değişkenler
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only
SENTRY_AUTH_TOKEN=xxx          # Build-only
```

### Sentry Filtreleme

```typescript
// sentry.client.config.ts
Sentry.init({
  beforeSend(event) {
    // Şifre bilgilerini filtrele
    if (event.request?.data) {
      delete event.request.data.password
      delete event.request.data.password_confirmation
    }
    
    // Auth header'ları filtrele
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }
    
    // Email'i maskele
    if (event.user?.email) {
      event.user.email = event.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    }
    
    return event
  },
})
```

---

## 🚫 Rate Limiting

### API Rate Limiting

| Ortam | Limit | Periyot |
|-------|-------|---------|
| Production | 100 request | 15 dakika |
| Development | Limitsiz | - |

### Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 🔍 MERNIS Entegrasyonu

### TC Kimlik Doğrulama

```typescript
// API endpoint
POST /api/mernis/verify

// Request
{
  "tc_no": "12345678901",
  "first_name": "AHMET",
  "last_name": "YILMAZ",
  "birth_year": 1990
}

// Response (success)
{
  "verified": true,
  "tc_no": "12345678901"
}

// Response (failure)
{
  "verified": false,
  "error": "TC Kimlik doğrulanamadı"
}
```

---

## ✅ Güvenlik Checklist

### Development

- [ ] `.env.local` dosyası `.gitignore`'da
- [ ] Service role key sadece server-side'da kullanılıyor
- [ ] Tüm formlar Zod ile validate ediliyor
- [ ] RLS tüm tablolarda aktif

### Production

- [ ] HTTPS zorlaması aktif
- [ ] Security headers yapılandırıldı
- [ ] Rate limiting aktif
- [ ] Sentry hassas veri filtrelemesi yapılandırıldı
- [ ] Audit logging aktif
- [ ] CORS yapılandırması kontrol edildi

### Code Review

- [ ] SQL injection koruması (parameterized queries)
- [ ] XSS koruması (React otomatik escape)
- [ ] CSRF koruması (SameSite cookies)
- [ ] Authorization kontrolleri her endpoint'te

---

## 🔗 İlgili Dokümanlar

- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [API Documentation](./API.md)
