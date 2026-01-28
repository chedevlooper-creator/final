# AGENTS.md - Yardım Yönetim Paneli

> AI coding agents için proje rehberi

---

## 📋 Proje Özeti

**Yardım Yönetim Paneli**, sivil toplum kuruluşları ve hayır kurumları için geliştirilmiş kapsamlı bir yardım ve bağış yönetim sistemidir. Proje, ihtiyaç sahiplerinin takibinden bağış yönetimine, gönüllü koordinasyonundan finansal raporlamaya kadar tüm süreçleri tek bir platformda birleştirir.

**Önemli Not:** Proje dokümantasyonu ve kod yorumları **Türkçe** dilindedir.

---

## 🛠 Teknoloji Stack

### Core Framework
| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| Next.js | 16.1.3 | App Router, SSR, API Routes |
| React | 19.2.3 | UI Rendering |
| TypeScript | 5.x | Type-safe development |
| Node.js | >= 22.0.0 | Runtime |

### Styling & UI
| Teknoloji | Amaç |
|-----------|------|
| Tailwind CSS 3.4 | Utility-first CSS |
| Radix UI | Accessible primitives |
| shadcn/ui | UI component library |
| Framer Motion | Animations |
| Lucide React | Icons |

### Backend & Database
| Teknoloji | Amaç |
|-----------|------|
| Supabase | PostgreSQL, Auth, Storage |
| @supabase/ssr | Server-side auth |
| @supabase/supabase-js | Client SDK |

### State Management
| Teknoloji | Amaç |
|-----------|------|
| TanStack Query | Server state, caching |
| Zustand | Client state |
| React Hook Form | Form state |
| Zod | Validation |

### Monitoring & Analytics
| Teknoloji | Amaç |
|-----------|------|
| Sentry | Error tracking |
| PostHog | Product analytics |

---

## 📁 Klasör Yapısı

```
/
├── app/                          # Next.js App Router (Pages)
│   ├── (auth)/                   # Auth route group
│   │   └── login/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── needy/
│   │   ├── donations/
│   │   ├── finance/
│   │   ├── meetings/
│   │   ├── mernis/              # TC Kimlik doğrulama
│   │   └── ...
│   ├── dashboard/               # Korumalı dashboard alanı
│   │   ├── account/
│   │   ├── aids/                # Yardım yönetimi
│   │   ├── applications/        # Başvuru takibi
│   │   ├── calendar/            # Takvim
│   │   ├── donations/           # Bağış yönetimi
│   │   ├── finance/             # Finans modülü
│   │   ├── messages/            # Mesajlaşma
│   │   ├── needy/               # İhtiyaç sahipleri
│   │   ├── orphans/             # Yetim takibi
│   │   ├── purchase/            # Satın alma
│   │   ├── reports/             # Raporlama
│   │   ├── settings/            # Sistem ayarları
│   │   └── volunteers/          # Gönüllü yönetimi
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Ana sayfa
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 sayfası
│   └── globals.css              # Global stiller
│
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives
│   │   ├── common/              # Ortak bileşenler
│   │   ├── forms/               # Form bileşenleri
│   │   ├── layout/              # Layout bileşenleri
│   │   ├── needy/               # İhtiyaç sahibi modülü
│   │   ├── charts/              # Grafik bileşenleri
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── queries/             # TanStack Query hooks (22 dosya)
│   │   │   ├── use-needy.ts
│   │   │   ├── use-donations.ts
│   │   │   └── ...
│   │   ├── use-auth.ts
│   │   └── use-notifications.ts
│   │
│   ├── lib/
│   │   ├── supabase/            # Supabase clients
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Middleware client
│   │   ├── validations/         # Zod schemas
│   │   ├── rbac.tsx             # Role-based access control
│   │   ├── security.ts          # Security headers
│   │   ├── audit.ts             # Audit logging
│   │   ├── errors.ts            # Error handling
│   │   └── utils.ts             # Utilities (cn, formatters)
│   │
│   ├── stores/
│   │   └── ui-store.ts          # Zustand store
│   │
│   ├── types/
│   │   ├── database.types.ts    # Supabase types
│   │   ├── common.ts            # Common types
│   │   └── ...
│   │
│   └── __tests__/               # Test files
│       ├── api/
│       ├── components/
│       └── lib/
│
├── supabase/
│   └── migrations/              # Database migrations (16 dosya)
│       ├── 001_initial_schema.sql
│       └── ...
│
├── docs/                        # Dokümantasyon
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── SETUP.md
│   └── CONTRIBUTING.md
│
├── .github/
│   └── workflows/               # CI/CD pipelines
│       ├── ci.yml
│       ├── code-quality.yml
│       ├── security.yml
│       └── type-check.yml
│
├── next.config.ts               # Next.js konfigürasyonu
├── tailwind.config.ts           # Tailwind konfigürasyonu
├── tsconfig.json                # TypeScript konfigürasyonu
├── vitest.config.ts             # Vitest konfigürasyonu
├── eslint.config.js             # ESLint konfigürasyonu
└── package.json
```

---

## 🚀 Build ve Test Komutları

```bash
# Geliştirme
npm run dev              # Dev server (Turbopack)
npm run build            # Production build
npm run start            # Production server

# Kod Kalitesi
npm run lint             # ESLint kontrolü
npx tsc --noEmit         # TypeScript type check

# Test
npm run test             # Vitest testleri çalıştır
npm run test:ui          # Test UI
npm run test:coverage    # Coverage raporu

# Analiz
npm run analyze          # Bundle analyzer (ANALYZE=true)
```

---

## 🎨 Kod Stili Kuralları

### TypeScript
- **Strict mode** aktif
- Interface/Type isimleri PascalCase
- Function isimleri camelCase
- Component isimleri PascalCase
- Hook isimleri `use` prefix ile başlamalı

### Dosya İsimlendirme
```
# ✅ Doğru
my-component.tsx
use-my-hook.ts
my-utils.ts

# ❌ Yanlış
MyComponent.tsx
useMyHook.ts
myUtils.ts
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
import type { MyType } from './types'
```

### Component Yapısı
```tsx
// ✅ Doğru
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

## 🧪 Test Talimatları

### Test Framework
- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **jsdom** - DOM environment

### Test Dosya Konumu
```
src/__tests__/
├── api/                   # API route tests
├── components/            # Component tests
└── lib/                   # Utility tests
```

### Test Pattern
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## 🔐 Güvenlik Önemli Noktalar

### Kimlik Doğrulama
- **Supabase Auth** ile JWT tabanlı kimlik doğrulama
- Middleware'de otomatik redirect (login/dashboard)
- Cookie-based session management

### Rol Yapısı (RBAC)
| Rol | Yetkiler |
|-----|----------|
| `admin` | Tam erişim |
| `moderator` | CRUD + Onay |
| `user` | Oluşturma/Düzenleme |
| `viewer` | Sadece okuma |

### Row Level Security (RLS)
- Tüm tablolarda RLS aktif
- Authenticated kullanıcılar için okuma/yazma politikaları
- Admin için full access politikaları

### Security Headers
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy

### Environment Variables
```bash
# Zorunlu
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Sadece server-side

# Opsiyonel
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=                # Build-only
MERNIS_USERNAME=                  # TC Kimlik doğrulama
MERNIS_PASSWORD=
```

---

## 📊 Veritabanı Mimarisi

### Ana Tablolar
- `needy_persons` - İhtiyaç sahipleri
- `aid_applications` - Yardım başvuruları
- `donations` - Bağışlar
- `orphans` - Yetim/öğrenci takibi
- `profiles` - Kullanıcı profilleri
- `meetings` - Toplantılar
- `notifications` - Bildirimler

### Lookup Tabloları
- `countries`, `cities`, `districts`, `neighborhoods`
- `categories`, `partners`

### Özellikler
- UUID primary keys
- Automatic timestamps (`created_at`, `updated_at`)
- Soft delete (`is_active`)
- Audit columns (`created_by`, `updated_by`)
- Performance indexes

### Migration Çalıştırma
```bash
./run-migrations.sh        # Linux/macOS
run-migrations.bat         # Windows
```

---

## 🔄 Veri Akışı Pattern'leri

### Server State (TanStack Query)
```typescript
// src/hooks/queries/use-needy.ts
export function useNeedyList(params: NeedyListParams) {
  return useQuery({
    queryKey: ['needy', params],
    queryFn: async () => {
      const supabase = createClient()
      return supabase.from('needy_persons').select('*')
    },
    staleTime: 10 * 60 * 1000,  // 10 dakika
  })
}
```

### Form Validation
```typescript
// src/lib/validations/needy.ts
export const needyPersonSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  identity_number: z.string().length(11).optional(),
})

// Kullanım
const form = useForm({
  resolver: zodResolver(needyPersonSchema),
})
```

### API Route Pattern
```typescript
// app/api/needy/route.ts
import { withAuth } from '@/lib/permission-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'needy_persons',
  })
  if (!authResult.success) return authResult.response!
  // ... handle request
}
```

---

## 📝 Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/) standardı kullanılır:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - Yeni özellik
- `fix` - Bug düzeltmesi
- `docs` - Dokümantasyon
- `style` - Formatting
- `refactor` - Kod refactoring
- `test` - Test ekleme/düzeltme
- `chore` - Build, config değişiklikleri

**Örnekler:**
```bash
git commit -m "feat(needy): add bulk import feature"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs: update API documentation"
```

---

## 🔧 CI/CD Pipeline

GitHub Actions workflow'ları:

| Workflow | Tetikleyici | Amaç |
|----------|-------------|------|
| `ci.yml` | PR/Push | Lint, test, build |
| `code-quality.yml` | PR | Code quality checks |
| `security.yml` | PR/Push | Security audit |
| `type-check.yml` | PR | TypeScript type check |

Deployment **Vercel** üzerinden otomatik yapılır:
- `main` branch → Production
- Diğer branch'ler → Preview deployment

---

## 🐛 Debug ve Sorun Giderme

### Sık Karşılaşılan Sorunlar

**"Module not found" hatası:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**TypeScript hataları:**
```bash
rm -rf .next
npx tsc --noEmit
npm run dev
```

**Port çakışması:**
```bash
npm run dev -- -p 3001
```

### Environment Kontrol
```bash
node -v    # >= 22.0.0 olmalı
npm -v     # >= 10.0.0 olmalı
```

---

## 📚 Önemli Dokümanlar

| Doküman | Açıklama |
|---------|----------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Sistem mimarisi |
| [DATABASE.md](docs/DATABASE.md) | Veritabanı şeması |
| [API.md](docs/API.md) | API dokümantasyonu |
| [SECURITY.md](docs/SECURITY.md) | Güvenlik yapısı |
| [SETUP.md](docs/SETUP.md) | Kurulum rehberi |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Katkı rehberi |

---

## ⚠️ AI Agent Notları

1. **Dil:** Proje Türkçe dokümantasyon ve yorumlar kullanır. Kod değişiklikleri yaparken mevcut dil kullanımına uygun hareket edin.

2. **Supabase Client:**
   - Client components: `@/lib/supabase/client`
   - Server components: `@/lib/supabase/server`
   - Admin operations: Service role key sadece server-side

3. **RBAC:** Her UI değişikliğinde yetki kontrolü ekleyin. `usePermissions` hook veya `<IfPermission>` component kullanın.

4. **Type Safety:** Strict TypeScript kuralları geçerlidir. `any` kullanımından kaçının.

5. **Formlar:** Yeni form eklerken Zod schema oluşturun ve `react-hook-form` ile entegre edin.

6. **Query Hooks:** Yeni entity için TanStack Query hook'u oluşturun. `src/hooks/queries/` içine ekleyin.

7. **API Routes:** Yeni API endpoint'i eklerken `withAuth` middleware kullanın.

---

<div align="center">
  <sub>Built with ❤️ for NGOs and charitable organizations</sub>
</div>
