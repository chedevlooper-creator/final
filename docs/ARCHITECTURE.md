# 📐 Sistem Mimarisi

> Yardım Yönetim Paneli teknik mimari dokümantasyonu

---

## 🖥️💻📱 Platform Desteği

**UYGULAMA TAM RESPONSIVE (DUyarlı) TASARIM SUNAR VE HEM DESKTOP HEM MOBİL CİHAZLARDA ÇALIŞIR.**

| Platform | Destek | Özellikler |
|----------|--------|------------|
| **Desktop** | ✅ Full | Geniş sidebar, mouse hover, keyboard shortcuts, multi-column layouts |
| **Tablet** | ✅ Full | Collapsible sidebar, touch-friendly, responsive grids |
| **Mobile** | ✅ Full | Hamburger menu, bottom navigation, swipe gestures, optimized tables |

- **Desktop-First Approach**: Tüm tasarımlar önce desktop için yapılır, sonra mobil cihazlara adapte edilir
- **PWA Ready**: Progressive Web App desteği ile mobil cihazlarda native app deneyimi
- **Touch Optimized**: Tüm interaktif elemanlar minimum 44px touch target
- **Adaptive Layouts**: Ekran boyutuna göre otomatik layout değişimi

---

## 🏗️ Genel Bakış

Uygulama, modern bir **Next.js 16 App Router** mimarisi üzerine kurulmuştur. Server-side rendering (SSR), client-side interactivity ve API routes tek bir projede birleştirilmiştir.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browser   │  │   Mobile    │  │   Progressive Web   │  │
│  │   (React)   │  │   Browser   │  │   App (PWA Ready)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Middleware                         │   │
│  │            (Authentication & Routing)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐   │
│  │  Server         │  │  Client         │  │  API       │   │
│  │  Components     │  │  Components     │  │  Routes    │   │
│  └────────┬────────┘  └────────┬────────┘  └─────┬──────┘   │
└───────────┼────────────────────┼─────────────────┼──────────┘
            │                    │                 │
            ▼                    ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌───────────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │  TanStack Query   │  │    Zustand     │  │   React    │  │
│  │  (Server State)   │  │ (Client State) │  │   Context  │  │
│  └─────────┬─────────┘  └───────┬────────┘  └─────┬──────┘  │
└────────────┼────────────────────┼─────────────────┼─────────┘
             │                    │                 │
             ▼                    ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │    Auth     │  │      Storage        │  │
│  │  Database   │  │   (JWT)     │  │   (File Upload)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Klasör Yapısı Detayı

### `/app` - Next.js App Router

```
app/
├── layout.tsx              # Root layout (HTML, fonts, metadata)
├── page.tsx                # Ana sayfa (redirect to /dashboard)
├── globals.css             # Global stiller
├── error.tsx               # Error boundary (client-side)
├── global-error.tsx        # Global error boundary
├── not-found.tsx           # 404 sayfası
├── manifest.ts             # PWA manifest
├── fonts/                  # Font dosyaları
│
├── (auth)/                 # Auth route group (parantez = layout grouping)
│   └── login/              # Login sayfası
│       └── page.tsx
│
├── api/                    # API Routes (Route Handlers)
│   ├── auth/login/         # Auth API
│   ├── cron/               # Zamanlanmış görevler (Vercel Cron)
│   ├── dashboard/stats/    # Dashboard istatistikleri
│   ├── docs/               # API dokümantasyonu endpoint
│   ├── donations/          # Bağış API'leri
│   ├── examples/           # Örnek API'ler
│   ├── finance/
│   │   └── bank-accounts/  # Banka hesapları API
│   ├── meetings/           # Toplantı yönetimi API
│   │   ├── [id]/           # Meeting detail
│   │   ├── [id]/attend/    # Meeting attendance
│   │   └── [id]/tasks/     # Meeting tasks
│   ├── messages/           # Mesajlaşma API (Email/SMS)
│   ├── mernis/verify/      # TC Kimlik doğrulama (MERNIS)
│   ├── needy/              # İhtiyaç sahipleri API
│   │   └── [needyPersonId]/
│   │       └── orphan-relations/
│   ├── orphans/            # Yetim takibi API
│   └── sentry-example-api/ # Sentry test endpoint
│
└── dashboard/              # Ana dashboard (korumalı alan)
    ├── layout.tsx          # Dashboard layout (sidebar, header)
    ├── page.tsx            # Ana dashboard görünümü
    ├── account/            # Kullanıcı hesap ayarları
    ├── aids/               # Yardım yönetimi
    ├── applications/       # Başvuru yönetimi
    ├── calendar/           # Takvim modülü
    ├── donations/          # Bağış yönetimi
    ├── events/             # Etkinlik yönetimi
    ├── finance/            # Finans modülü
    ├── messages/           # Mesajlaşma
    ├── needy/              # İhtiyaç sahipleri
    │   ├── page.tsx
    │   ├── loading.tsx     # Loading UI (React Suspense)
    │   └── error.tsx       # Error UI
    ├── orphans/            # Yetim takibi
    ├── purchase/           # Satın alma talepleri
    ├── reports/            # Raporlama
    ├── settings/           # Sistem ayarları
    └── volunteers/         # Gönüllü yönetimi
```

#### Route Groups Kullanımı

Parantez içindeki klasörler `(auth)`, `(dashboard)` URL'de görünmez ama layout gruplama sağlar:

```typescript
// app/(auth)/layout.tsx - Sadece auth sayfaları için
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}

// app/dashboard/layout.tsx - Dashboard için sidebar + header
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

#### Loading ve Error UI

```typescript
// app/dashboard/needy/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return <Skeleton className="h-[400px] w-full" />
}

// app/dashboard/needy/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div className="error-container">
      <h2>Bir hata oluştu</h2>
      <button onClick={reset}>Tekrar Dene</button>
    </div>
  )
}
```

---

### `/src/components` - UI Bileşenleri

```
components/
├── providers.tsx           # Global providers (Query, Theme)
├── error-boundary.tsx      # Error boundary component
│
├── ui/                     # UI primitives (shadcn/ui - 28 dosya)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── toast.tsx
│   ├── sonner.tsx          # Toast notifications
│   ├── form.tsx            # React Hook Form integration
│   └── ... (Radix UI based)
│
├── charts/                 # Grafik bileşenleri (Recharts)
│   └── index.tsx
│
├── common/                 # Ortak kullanım bileşenleri
│   ├── client-only.tsx     # SSR-safe client component wrapper
│   ├── list-optimization.tsx
│   ├── mobile-table-row.tsx
│   ├── optimized-image.tsx
│   ├── stat-card.tsx
│   └── status-badge.tsx
│
├── forms/                  # Form bileşenleri
│   ├── application-form.tsx
│   ├── event-form.tsx
│   ├── id-scanner.tsx      # Kimlik okuma (Tesseract.js)
│   ├── index.ts            # Barrel export
│   └── orphan-form.tsx
│
├── layout/                 # Layout bileşenleri
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── mobile-nav.tsx
│
├── navigation/             # Navigasyon bileşenleri
│   ├── optimized-link.tsx
│   ├── progress-bar.tsx    # Sayfa geçiş progress
│   └── view-transitions.tsx
│
├── needy/                  # İhtiyaç sahibi modülü
│   ├── AddNeedyModal.tsx
│   └── detail/
│       ├── PhotoSection.tsx
│       └── SystemInfoPanel.tsx
│
├── donation-boxes/         # Bağış kutuları modülü
│   ├── collection-dialog.tsx
│   ├── donation-box-dialog.tsx
│   ├── qr-code-display.tsx
│   └── route-dialog.tsx
│
├── inventory/              # Envanter modülü
│   ├── count-dialog.tsx
│   ├── quick-stock-dialog.tsx
│   ├── transaction-dialog.tsx
│   └── warehouse-dialog.tsx
│
├── notification/           # Bildirim sistemi
│   ├── notification-container.tsx
│   └── notification-item.tsx
│
├── performance/            # Performans monitoring
│   └── web-vitals.tsx      # Core Web Vitals + Sentry
│
└── upload/                 # File upload
    └── file-upload.tsx
```

---

### `/src/hooks` - Custom Hooks

```
hooks/
├── queries/                # TanStack Query hooks
│   ├── index.ts
│   ├── use-bank-accounts.ts
│   ├── use-calendar.ts
│   ├── use-dashboard-stats.ts
│   ├── use-donations.ts
│   ├── use-generic-query.ts    # Generic query builder
│   ├── use-linked-records.ts
│   ├── use-meetings.ts
│   ├── use-needy.ts
│   ├── use-reports.ts
│   ├── use-skills.ts
│   ├── use-users.ts
│   └── use-volunteers.ts
│
├── mutations/              # Mutation hooks
│   ├── use-donation-box-mutations.ts
│   └── use-inventory-mutations.ts
│
├── use-auth.ts
├── use-device-type.ts
├── use-media-query.ts
├── use-notifications.ts
├── use-storage-upload.ts
└── use-toast.ts
```

---

### `/src/lib` - Utilities & Services

```
lib/
├── supabase/               # Supabase clients
│   ├── client.ts          # Browser client (CSR)
│   ├── server.ts          # Server client (SSR/RSC)
│   └── middleware.ts      # Middleware client
│
├── validations/            # Zod schemas
│   └── *.ts
│
├── mernis/                 # TC Kimlik doğrulama
│   ├── client.ts
│   └── types.ts
│
├── messaging/              # Email/SMS providers
│   ├── email.provider.ts
│   └── sms.provider.ts
│
├── bulk.ts                 # Import/Export
├── notification.ts         # Notification service
├── permission-middleware.ts # API auth middleware
├── organization-middleware.ts # Multi-tenant middleware
├── performance.ts
├── rbac.tsx                # Role-based access control
├── security.ts             # Security headers
├── upload.ts
└── utils.ts                # General utilities (cn, formatters)
```

---

## 🏢 Multi-Tenant Mimarisi

Sistem çoklu dernek (multi-tenant) yapısını destekler. Her dernek kendi verilerini izole olarak yönetir.

```
┌─────────────────────────────────────────────────────────────┐
│                     ORGANIZATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Dernek A  │    │   Dernek B  │    │   Dernek C  │     │
│  │  (org-123)  │    │  (org-456)  │    │  (org-789)  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  DATA ISOLATION                      │    │
│  │                                                      │    │
│  │  needy_persons.organization_id                      │    │
│  │  donations.organization_id                          │    │
│  │  orphans.organization_id                            │    │
│  │  volunteers.organization_id                         │    │
│  │  ...                                                │    │
│  │                                                      │    │
│  │  RLS Policy: WHERE organization_id = current_org()  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Tenant Context Flow

```typescript
// 1. Middleware'de tenant kontrolü
// middleware.ts
export async function middleware(request: NextRequest) {
  const user = await getUser()
  const organization = await getUserOrganization(user.id)
  
  // Request header'a organization ekle
  request.headers.set('x-organization-id', organization.id)
}

// 2. API Route'ta tenant kontrolü
// app/api/needy/route.ts
import { withOrgAuth } from '@/lib/organization-middleware'

export async function POST(request: Request) {
  const auth = await withOrgAuth(request)
  if (!auth.success) return auth.response
  
  // Her query'de organization_id filtresi
  const { data } = await supabase
    .from('needy_persons')
    .insert({
      ...body,
      organization_id: auth.user.organization.id
    })
}

// 3. RLS Policy ile database seviyesinde izolasyon
-- needy_persons tablosunda
CREATE POLICY "tenant_isolation" ON needy_persons
  FOR ALL TO authenticated
  USING (organization_id = get_user_organization_id());
```

---

## 🔌 API Routes Mimarisi

### Route Handler Yapısı

```typescript
// app/api/needy/route.ts
import { withOrgAuth } from '@/lib/organization-middleware'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  // 4. Response
  return Response.json({
    data,
    pagination: { page, total: count }
  })
}

export async function POST(request: Request) {
  const auth = await withOrgAuth(request, { requiredPermission: 'create' })
  if (!auth.success) return auth.response
  
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('needy_persons')
    .insert({
      ...body,
      organization_id: auth.user.organization.id,
      created_by: auth.user.id
    })
    .select()
    .single()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json({ data }, { status: 201 })
}
```

### Nested Routes

```
api/
├── meetings/
│   ├── route.ts              # GET /api/meetings, POST /api/meetings
│   └── [id]/
│       ├── route.ts          # GET /api/meetings/123, PUT /api/meetings/123
│       ├── attend/
│       │   └── route.ts      # POST /api/meetings/123/attend
│       └── tasks/
│           └── route.ts      # GET/POST /api/meetings/123/tasks
│
└── needy/
    ├── route.ts
    └── [needyPersonId]/
        └── orphan-relations/
            ├── route.ts
            └── [id]/
                └── route.ts
```

---

## 🔄 Data Flow

### 1. Server Component Flow (RSC)

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

### 2. Client Component + TanStack Query Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Client Component                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              useQuery / useMutation               │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      ┌───────────────┐       ┌───────────────┐
      │   Cache Hit   │       │  Cache Miss   │
      │   (staleTime) │       │   (fetch)     │
      └───────────────┘       └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   Supabase    │
                              │    Client     │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   PostgreSQL  │
                              └───────────────┘
```

### TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,       // 10 minutes
      gcTime: 30 * 60 * 1000,          // 30 minutes
      refetchOnWindowFocus: false,     // Performance
      refetchOnMount: false,           // Use cache
      retry: (failureCount, error) => {
        // 404 ve 403 hatalarında retry yapma
        const err = error as { status?: number }
        if (err?.status === 404 || err?.status === 403) return false
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})
```

---

## 🔐 Authentication Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    Browser     │     │   Middleware   │     │    Supabase    │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │  1. Request /dashboard                      │
        │─────────────────────▶│                      │
        │                      │                      │
        │                      │ 2. Check cookies     │
        │                      │─────────────────────▶│
        │                      │                      │
        │                      │◀─────────────────────│
        │                      │ 3. Validate JWT      │
        │                      │                      │
        │  4a. No user ─ Redirect to /login           │
        │◀─────────────────────│                      │
        │                      │                      │
        │  4b. Valid user ─ Continue to page          │
        │◀─────────────────────│                      │
        │                      │                      │
```

### Permission Middleware Kullanımı

```typescript
// API Route örneği
import { withAuth, requirePermission } from '@/lib/permission-middleware'

export async function DELETE(request: Request) {
  // Basit auth kontrolü
  const auth = await withAuth(request)
  if (!auth.success) return auth.response
  
  // Permission bazlı kontrol
  const authWithPerm = await withAuth(request, {
    requiredPermission: 'delete',
    resource: 'needy_persons'
  })
  if (!authWithPerm.success) return authWithPerm.response
  
  // Admin-only endpoint
  const adminAuth = await requireAdmin(request)
  if (!adminAuth.success) return adminAuth.response
}
```

---

## 🧪 Testing Stratejisi

### Test Klasör Yapısı

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

vi.mock('@/lib/organization-middleware', () => ({
  withOrgAuth: vi.fn(() => Promise.resolve({
    success: true,
    user: {
      id: 'user-1',
      organization: { id: 'org-1', slug: 'test-org' }
    }
  })),
}))

describe('POST /api/needy', () => {
  it('should create a new needy person', async () => {
    const request = new Request('http://localhost/api/needy', {
      method: 'POST',
      body: JSON.stringify({
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toBeDefined()
  })
})
```

### Test Commands

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run single test file
npx vitest src/__tests__/api/needy.test.ts

# Run tests matching pattern
npx vitest --run "needy"
```

---

## 🛡️ Error Handling Patterns

### 1. Error Boundaries

```typescript
// app/error.tsx - Segment error boundary
'use client'

import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="error-container">
      <h2>Bir hata oluştu</h2>
      <button onClick={reset}>Tekrar Dene</button>
    </div>
  )
}

// app/global-error.tsx - Global error boundary
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

### 2. API Error Handling

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
  }
}

// API Route'ta kullanım
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.first_name) {
      throw new APIError('Ad alanı zorunludur', 400, 'VALIDATION_ERROR')
    }
    
    const { data, error } = await supabase
      .from('needy_persons')
      .insert(body)
      .select()
      .single()
    
    if (error) {
      throw new APIError(error.message, 500, 'DB_ERROR')
    }
    
    return Response.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof APIError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    // Unknown error - log to Sentry
    Sentry.captureException(error)
    return Response.json(
      { error: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}
```

### 3. Mutation Error Handling

```typescript
// hooks/mutations/use-needy-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCreateNeedy() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (values: NeedyValues) => {
      const response = await fetch('/api/needy', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bir hata oluştu')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['needy-persons'] })
      toast.success('Kayıt oluşturuldu')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Bir hata oluştu'
      toast.error(message)
    },
  })
}
```

---

## 📊 State Management Strategy

| State Type | Tool | Use Case |
|------------|------|----------|
| **Server State** | TanStack Query | Database data, API responses |
| **Client State** | Zustand | UI state, form state, preferences |
| **Form State** | React Hook Form | Form inputs, validation |
| **URL State** | Next.js Router | Filters, pagination, tabs |
| **Auth State** | Supabase + Context | User session, permissions |

### Zustand Store Örneği

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}))
```

---

## 📈 Monitoring & Observability

### Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env['NEXT_PUBLIC_SENTRY_DSN'],
  environment: process.env['NODE_ENV'],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

// next.config.ts
import { withSentryConfig } from '@sentry/nextjs'

export default withSentryConfig(nextConfig, {
  org: 'kaf-g0',
  project: 'javascript-nextjs',
  tunnelRoute: '/monitoring',
  widenClientFileUpload: true,
})
```

### Performance Monitoring

```typescript
// components/performance/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    Sentry.captureMessage(
      `Web Vital: ${metric.name}`,
      {
        level: 'info',
        extra: metric,
      }
    )
  })

  return null
}
```

---

## 🔒 Security

### Security Headers

```typescript
// lib/security.ts
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\'',
}

// next.config.ts
export default {
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
  },
}
```

### RLS (Row Level Security)

```sql
-- Her tablo için RLS aktif
ALTER TABLE needy_persons ENABLE ROW LEVEL SECURITY;

-- Tenant izolasyonu
CREATE POLICY "tenant_isolation" ON needy_persons
  FOR ALL TO authenticated
  USING (organization_id = get_user_organization_id());
```

---

## 🚀 Performance Optimizations

1. **Code Splitting**: Dynamic imports with `next/dynamic`
2. **Image Optimization**: Next.js Image component with AVIF/WebP
3. **Font Optimization**: `next/font` with display swap
4. **Bundle Analysis**: `@next/bundle-analyzer`
5. **Prefetching**: Link prefetch, idle prefetch
6. **Caching**: TanStack Query aggressive caching
7. **Compression**: Gzip via Next.js config
8. **Webpack Optimizations**: Tree shaking, usedExports

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      '@tanstack/react-query',
      'recharts',
    ],
  },
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: true,
    }
    return config
  },
}
```

---

## 📱 Responsive Design

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Layout Strategy
- **Mobile First**: Base styles for mobile
- **Collapsible Sidebar**: Hidden on mobile, toggle on tablet
- **Responsive Tables**: Horizontal scroll on mobile
- **Stack to Grid**: Forms stack on mobile, grid on desktop

---

## 🔗 İlgili Dokümanlar

- [Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Security](./SECURITY.md)
- [Testing Guide](./CONTRIBUTING.md#testing)
