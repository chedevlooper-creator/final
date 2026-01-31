# 🤖 AGENTS.md - Yardım Yönetim Paneli

> Bu dosya, AI kodlama asistanları için proje hakkında kapsamlı bilgiler içerir.

---

## 📋 Proje Özeti

**Yardım Yönetim Paneli**, sivil toplum kuruluşlarının yardım operasyonlarını dijital ortamda yönetmelerini sağlayan kapsamlı bir web uygulamasıdır. İhtiyaç sahiplerinin takibinden bağış yönetimine, gönüllü koordinasyonundan finansal raporlamaya kadar tüm süreçleri tek bir platformda birleştirir.

### 🎯 Hedef Kullanıcılar
- Yardım kuruluşları
- Sivil toplum organizasyonları
- Hayır kurumları
- Vakıflar ve dernekler

---

## 🛠 Teknoloji Stack

### Frontend
| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| Next.js | 16.1.3 | App Router, Server Components |
| React | 19.2.3 | UI rendering |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 3.4 | Utility-first styling |
| Radix UI | Latest | Accessible component primitives |
| Framer Motion | 12.x | Animations |

### Backend & Database
| Teknoloji | Amaç |
|-----------|------|
| Supabase | PostgreSQL, Auth, Storage |
| TanStack Query | Data fetching & caching |
| Zustand | Client state management |

### DevOps & Monitoring
| Teknoloji | Amaç |
|-----------|------|
| Sentry | Error tracking & performance |
| Vercel | Hosting & deployment |
| GitHub Actions | CI/CD pipelines |

---

## 📁 Klasör Yapısı

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (parantez = URL'de görünmez)
│   │   └── login/                # Login sayfası
│   ├── api/                      # API Routes (Route Handlers)
│   │   ├── auth/                 # Authentication API
│   │   ├── needy/                # İhtiyaç sahipleri API
│   │   ├── donations/            # Bağış API
│   │   ├── finance/              # Finans API
│   │   └── ...                   # Diğer API endpointleri
│   ├── dashboard/                # Korumalı dashboard alanı
│   │   ├── needy/                # İhtiyaç sahipleri modülü
│   │   ├── donations/            # Bağış yönetimi
│   │   ├── finance/              # Finans modülü
│   │   ├── volunteers/           # Gönüllü yönetimi
│   │   └── settings/             # Sistem ayarları
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Ana sayfa
│   ├── globals.css               # Global stiller
│   ├── error.tsx                 # Error boundary
│   └── not-found.tsx             # 404 sayfası
│
├── src/
│   ├── components/               # React bileşenleri
│   │   ├── ui/                   # UI primitives (shadcn/ui)
│   │   ├── charts/               # Grafik bileşenleri
│   │   ├── forms/                # Form bileşenleri
│   │   ├── layout/               # Layout bileşenleri
│   │   ├── needy/                # İhtiyaç sahibi modülü
│   │   └── upload/               # Dosya yükleme
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── queries/              # TanStack Query hooks (22+ dosya)
│   │   ├── mutations/            # Mutation hooks
│   │   ├── use-auth.ts
│   │   └── use-notifications.ts
│   │
│   ├── lib/                      # Utilities & Services
│   │   ├── supabase/             # Supabase client config
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── middleware.ts     # Middleware client
│   │   ├── validations/          # Zod schemas
│   │   ├── mernis/               # TC Kimlik doğrulama
│   │   ├── messaging/            # Email/SMS providers
│   │   ├── rbac.tsx              # Role-based access control
│   │   ├── security.ts           # Security headers
│   │   └── utils.ts              # General utilities
│   │
│   ├── stores/                   # Zustand stores
│   │   └── ui-store.ts
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── database.types.ts
│   │   ├── needy.types.ts
│   │   └── organization.types.ts
│   │
│   ├── __tests__/                # Test files
│   │   ├── api/                  # API route tests
│   │   ├── components/           # Component tests
│   │   └── lib/                  # Utility tests
│   │
│   └── middleware.ts             # Next.js middleware
│
├── supabase/
│   └── migrations/               # Database migrations (24+ dosya)
│
├── docs/                         # Dokümantasyon
│   ├── ARCHITECTURE.md           # Sistem mimarisi
│   ├── SETUP.md                  # Kurulum rehberi
│   ├── SECURITY.md               # Güvenlik dokümantasyonu
│   └── CONTRIBUTING.md           # Katkı rehberi
│
├── package.json                  # Dependencies & scripts
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration
├── vitest.config.ts              # Vitest configuration
├── eslint.config.js              # ESLint configuration
└── .env.example                  # Environment variables template
```

---

## 🏗️ Mimarisi

### Multi-Tenant Yapı
Sistem çoklu dernek (multi-tenant) yapısını destekler. Her dernek kendi verilerini izole olarak yönetir.

```
┌─────────────────────────────────────────────────────────────┐
│                     ORGANIZATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Dernek A  │    │   Dernek B  │    │   Dernek C  │     │
│  │  (org-123)  │    │  (org-456)  │    │  (org-789)  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         └───────────────────┼───────────────────┘           │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  DATA ISOLATION                      │    │
│  │  needy_persons.organization_id                      │    │
│  │  donations.organization_id                          │    │
│  │  orphans.organization_id                            │    │
│  │  RLS Policy: WHERE organization_id = current_org()  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow
```
Browser Request
       │
       ▼
┌─────────────────┐
│   Middleware    │ ── Auth check, org context
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Server Component│ ── Fetch data directly from DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HTML Stream   │ ── Streaming SSR
└─────────────────┘
```

---

## 🏃 Build ve Test Komutları

### Development
```bash
npm run dev           # Development server (Turbopack)
npm run build         # Production build
npm run start         # Production server
```

### Testing
```bash
npm run test              # Run all tests
npm run test:ui           # Run with UI
npm run test:coverage     # Coverage report
```

### Code Quality
```bash
npm run lint              # ESLint check
npx tsc --noEmit          # TypeScript type check
```

### Analysis
```bash
npm run analyze           # Bundle analyzer
```

---

## 📏 Code Style Kuralları

### Dosya İsimlendirme
```
# Components
my-component.tsx              # ✅ kebab-case
my-component/index.tsx       # ✅

# Hooks
use-my-hook.ts               # ✅ kebab-case

# Utils
my-utils.ts                  # ✅ kebab-case
```

### Import Sırası
```typescript
// 1. External libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 3. Relative imports
import { MyComponent } from './my-component'
```

### TypeScript Standartları
```typescript
// ✅ İyi - Interface kullanımı
interface UserProps {
  name: string
  age: number
  email?: string
}

function getUser(id: string): Promise<User> {
  return supabase.from('users').select('*').eq('id', id).single()
}

// ❌ Kötü - Tip güvenliği yok
function getUser(id) {
  return supabase.from('users').select('*').eq('id', id).single()
}
```

### React Component Standartları
```tsx
// ✅ İyi - Props interface ile
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {children}
    </button>
  )
}
```

---

## 🔄 Git Workflow

### Branch İsimlendirme
```
feature/feature-name          # Yeni özellik
bugfix/bug-description        # Bug düzeltmesi
hotfix/critical-fix           # Acil düzeltme
docs/documentation-update     # Dokümantasyon
refactor/refactor-desc        # Refactoring
```

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
| Type | Açıklama |
|------|----------|
| `feat` | Yeni özellik |
| `fix` | Bug düzeltmesi |
| `docs` | Dokümantasyon |
| `style` | Formatting |
| `refactor` | Kod refactoring |
| `test` | Test ekleme/düzeltme |
| `chore` | Build, config değişiklikleri |
| `perf` | Performance improvement |

**Örnekler:**
```bash
git commit -m "feat(needy): add bulk import feature"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs: update API documentation"
```

---

## 🧪 Testing Stratejisi

### Test Dosya Konumları
```
src/__tests__/
├── api/                    # API Route tests
│   ├── auth.test.ts
│   ├── donations.test.ts
│   └── needy.test.ts
├── components/             # Component tests
│   └── utils.test.ts
└── lib/                    # Utility tests
    ├── messaging.test.ts
    └── rbac.test.ts
```

### Test Pattern
```typescript
// src/__tests__/api/needy.test.ts
import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../../app/api/needy/route'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: { id: '123', first_name: 'Ahmet' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe('POST /api/needy', () => {
  it('should create a new needy person', async () => {
    const request = new Request('http://localhost/api/needy', {
      method: 'POST',
      body: JSON.stringify({ first_name: 'Ahmet', last_name: 'Yılmaz' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toBeDefined()
  })
})
```

---

## 🔐 Güvenlik

### RBAC (Role-Based Access Control)

| Rol | Yetkiler |
|-----|----------|
| `admin` | Tam erişim, kullanıcı yönetimi, sistem ayarları |
| `moderator` | CRUD işlemleri, raporlama, başvuru onayı |
| `user` | Kayıt oluşturma ve düzenleme |
| `viewer` | Sadece görüntüleme |

### RBAC Kullanımı
```typescript
// Hook kullanımı
import { usePermissions } from '@/lib/rbac'

function MyComponent() {
  const permissions = usePermissions(user.role)
  
  return (
    <div>
      {permissions.canDelete && <DeleteButton />}
      {permissions.donations.canCreate && <AddDonationButton />}
    </div>
  )
}

// Conditional rendering
import { IfPermission } from '@/lib/rbac'

<IfPermission role={role} resource="settings" action="update">
  <SettingsForm />
</IfPermission>
```

### Row Level Security (RLS)
Tüm veritabanı tablolarında RLS aktiftir.

```sql
-- Tenant izolasyonu
CREATE POLICY "tenant_isolation" ON needy_persons
  FOR ALL TO authenticated
  USING (organization_id = get_user_organization_id());
```

### Güvenlik Checklist
- [ ] `.env.local` `.gitignore`'da
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sadece server-side
- [ ] Tüm formlar Zod ile validate ediliyor
- [ ] RLS tüm tablolarda aktif
- [ ] Security headers yapılandırıldı
- [ ] XSS/CSRF koruması mevcut

---

## 🗄️ Veritabanı

### Migration Dosyaları
```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_extended_needy_schema.sql
├── 003_linked_records_schema.sql
├── ...
└── 20260131_program_management.sql
```

### Migration Çalıştırma
```bash
# Supabase CLI ile
supabase db push

# Veya SQL Editor'da manuel olarak
```

---

## 🔌 API Routes

### Route Handler Yapısı
```typescript
// app/api/needy/route.ts
import { withOrgAuth } from '@/lib/organization-middleware'

export async function GET(request: Request) {
  // 1. Authentication & Authorization
  const auth = await withOrgAuth(request)
  if (!auth.success) return auth.response
  
  // 2. Query params parsing
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  
  // 3. Database query
  const supabase = await createServerSupabaseClient()
  const { data, error, count } = await supabase
    .from('needy_persons')
    .select('*', { count: 'exact' })
    .eq('organization_id', auth.user.organization.id)
    .range((page - 1) * 20, page * 20 - 1)
  
  // 4. Response
  return Response.json({ data, pagination: { page, total: count } })
}
```

---

## ⚙️ Environment Variables

### Zorunlu Değişkenler
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Opsiyonel Değişkenler
```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-token

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# MERNIS
MERNIS_SERVICE_URL=https://tckimlik.nvi.gov.tr
MERNIS_USERNAME=your-username
MERNIS_PASSWORD=your-password
```

---

## 🚀 Deployment

### Vercel Deployment
```bash
# Local build test
npm run lint
npm run build

# Vercel CLI
npm i -g vercel
vercel --prod
```

### Vercel Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node Version:** 24.x

---

## 📊 State Management

| State Type | Tool | Use Case |
|------------|------|----------|
| Server State | TanStack Query | Database data, API responses |
| Client State | Zustand | UI state, form state, preferences |
| Form State | React Hook Form | Form inputs, validation |
| URL State | Next.js Router | Filters, pagination, tabs |
| Auth State | Supabase + Context | User session, permissions |

### TanStack Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,       // 10 minutes
      gcTime: 30 * 60 * 1000,          // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})
```

---

## 📝 Validation

### Zod Schema Örneği
```typescript
// src/lib/validations/needy.ts
import { z } from 'zod'

export const needyPersonSchema = z.object({
  first_name: z.string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  
  identity_number: z.string()
    .length(11, 'TC Kimlik No 11 haneli olmalı')
    .regex(/^\d+$/, 'Sadece rakam içermelidir')
    .optional(),
  
  email: z.string()
    .email('Geçerli email adresi giriniz')
    .optional(),
});
```

---

## 🔗 Faydalı Linkler

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

---

## 🆘 Sorun Giderme

### Sık Karşılaşılan Hatalar

**"Module not found" Hatası**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**TypeScript Hataları**
```bash
npx tsc --noEmit
rm -rf .next
npm run dev
```

**Port Çakışması**
```bash
lsof -i :3000
npm run dev -- -p 3001
```

---

> **Not:** Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için [CONTRIBUTING.md](./docs/CONTRIBUTING.md) dosyasına bakın.
