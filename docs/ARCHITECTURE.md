# 📐 Sistem Mimarisi

> Yardım Yönetim Paneli teknik mimari dokümantasyonu

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

### `/src/app` - Next.js App Router

```
app/
├── (auth)/                 # Auth route group (parantez = layout grouping)
│   └── login/             # Login sayfası
│
├── api/                    # API Routes (Route Handlers)
│   ├── cron/              # Zamanlanmış görevler
│   ├── docs/              # API dokümantasyonu endpoint
│   ├── examples/          # Örnek API'ler
│   ├── finance/           # Finans API'leri
│   ├── meetings/          # Toplantı yönetimi API
│   └── mernis/            # TC Kimlik doğrulama
│
├── dashboard/              # Ana dashboard (korumalı alan)
│   ├── layout.tsx         # Dashboard layout (sidebar, header)
│   ├── account/           # Kullanıcı hesap ayarları
│   ├── aids/              # Yardım yönetimi (7 sayfa)
│   ├── applications/      # Başvuru yönetimi
│   ├── calendar/          # Takvim modülü
│   ├── dashboard/         # Ana dashboard görünümü
│   ├── donations/         # Bağış yönetimi (6 sayfa)
│   ├── events/            # Etkinlik yönetimi
│   ├── finance/           # Finans modülü (4 sayfa)
│   ├── messages/          # Mesajlaşma
│   ├── needy/             # İhtiyaç sahipleri
│   ├── orphans/           # Yetim takibi
│   ├── purchase/          # Satın alma
│   ├── reports/           # Raporlama
│   ├── settings/          # Sistem ayarları
│   └── volunteers/        # Gönüllü yönetimi
│
├── test/                   # Test sayfaları (development)
├── layout.tsx             # Root layout
├── page.tsx               # Ana sayfa (redirect)
├── error.tsx              # Error boundary
├── not-found.tsx          # 404 sayfası
└── globals.css            # Global stiller
```

### `/src/components` - UI Bileşenleri

```
components/
├── charts/                 # Grafik bileşenleri (Recharts)
│   └── ...
│
├── common/                 # Ortak bileşenler
│   ├── data-table.tsx     # Generic data table
│   ├── loading-skeleton.tsx
│   ├── empty-state.tsx
│   ├── confirm-dialog.tsx
│   ├── search-input.tsx
│   └── pagination.tsx
│
├── forms/                  # Form bileşenleri (10 dosya)
│   ├── needy-form.tsx     # İhtiyaç sahibi formu
│   ├── donation-form.tsx  # Bağış formu
│   ├── volunteer-form.tsx # Gönüllü formu
│   └── ...
│
├── layout/                 # Layout bileşenleri
│   ├── sidebar.tsx        # Ana sidebar
│   ├── header.tsx         # Üst bar
│   └── mobile-nav.tsx     # Mobil navigasyon
│
├── navigation/             # Navigasyon bileşenleri
│   ├── progress-bar.tsx   # Sayfa geçiş progress
│   ├── view-transitions.tsx
│   └── breadcrumb.tsx
│
├── needy/                  # İhtiyaç sahibi modülü (27 dosya)
│   ├── needy-list.tsx
│   ├── needy-detail.tsx
│   ├── needy-card.tsx
│   └── ...
│
├── notification/           # Bildirim sistemi
│   ├── notification-bell.tsx
│   └── notification-list.tsx
│
├── performance/            # Performans monitoring
│   └── web-vitals.tsx
│
├── ui/                     # UI primitives (shadcn/ui - 28 dosya)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── toast.tsx
│   └── ... (Radix UI based)
│
├── upload/                 # File upload
│   └── file-uploader.tsx
│
├── providers.tsx           # Global providers (Query, Theme)
├── providers-posthog.tsx   # PostHog analytics provider
└── error-boundary.tsx      # Error boundary component
```

### `/src/hooks` - Custom Hooks

```
hooks/
├── queries/                # TanStack Query hooks (22 dosya)
│   ├── index.ts           # Barrel export
│   ├── use-aids.ts        # Yardım queries
│   ├── use-applications.ts
│   ├── use-bank-accounts.ts
│   ├── use-calendar.ts
│   ├── use-dashboard-stats.ts  # Dashboard istatistikleri
│   ├── use-donations.ts   # Bağış queries
│   ├── use-events.ts
│   ├── use-finance.ts     # Finans queries
│   ├── use-generic-query.ts    # Generic query builder
│   ├── use-linked-records.ts
│   ├── use-lookups.ts     # Lookup tabloları
│   ├── use-meetings.ts    # Toplantı yönetimi
│   ├── use-messages.ts
│   ├── use-needy.ts       # İhtiyaç sahipleri
│   ├── use-orphans.ts
│   ├── use-purchase.ts
│   ├── use-reports.ts
│   ├── use-skills.ts      # Beceri yönetimi
│   ├── use-user-bank-accounts.ts
│   ├── use-users.ts
│   └── use-volunteers.ts
│
├── use-auth.ts             # Authentication hook
├── use-notifications.ts    # Bildirim hook
└── use-toast.ts            # Toast mesajları
```

### `/src/lib` - Utilities & Services

```
lib/
├── supabase/               # Supabase configuration
│   ├── client.ts          # Browser client
│   ├── server.ts          # Server client
│   └── middleware.ts      # Middleware client
│
├── validations/            # Zod schemas
│   ├── needy.ts           # İhtiyaç sahibi validation
│   ├── donation.ts
│   ├── volunteer.ts
│   └── common.ts
│
├── analytics.ts            # PostHog tracking functions
├── api-docs.ts             # OpenAPI specification
├── audit.ts                # Audit logging system
├── audit.types.ts          # Audit type definitions
├── bulk.ts                 # Bulk operations (import/export)
├── email.ts                # Email templates (26KB)
├── env.ts                  # Environment validation
├── errors.ts               # Error handling utilities
├── lazy-loading.tsx        # Lazy load components
├── loading.tsx             # Loading state utilities
├── menu-config.ts          # Sidebar menu configuration
├── notification.context.tsx
├── notification.ts         # Notification utilities
├── performance.ts          # Performance monitoring
├── permission-middleware.ts
├── posthog.ts              # PostHog configuration
├── rbac.tsx                # Role-based access control
├── security.ts             # Security headers & utilities
├── upload.ts               # File upload utilities
├── upload.types.ts         # Upload type definitions
└── utils.ts                # General utilities (cn, formatters)
```

---

## 🔄 Data Flow

### 1. Server Component Flow
```
Browser Request
      │
      ▼
┌─────────────────┐
│   Middleware    │ ── Auth check, redirect
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Server Component│ ── Fetch data directly
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HTML Stream   │ ── Send to browser
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

---

## 📊 State Management Strategy

| State Type | Tool | Use Case |
|------------|------|----------|
| **Server State** | TanStack Query | Database data, API responses |
| **Client State** | Zustand | UI state, form state, preferences |
| **Form State** | React Hook Form | Form inputs, validation |
| **URL State** | Next.js Router | Filters, pagination, tabs |
| **Auth State** | Supabase + Context | User session, permissions |

### TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,      // 10 minutes
      gcTime: 30 * 60 * 1000,          // 30 minutes
      refetchOnWindowFocus: false,     // Performance
      refetchOnMount: false,           // Use cache
      retry: 2,                        // Max retries
    },
  },
})
```

---

## 🎨 Component Design Patterns

### 1. Compound Components
```tsx
<DataTable>
  <DataTable.Header>
    <DataTable.Search />
    <DataTable.Filters />
  </DataTable.Header>
  <DataTable.Body columns={columns} data={data} />
  <DataTable.Pagination />
</DataTable>
```

### 2. Render Props Pattern
```tsx
<WithPermission role={user.role} permission="delete">
  {(hasAccess) => hasAccess && <DeleteButton />}
</WithPermission>
```

### 3. Container/Presenter Pattern
```
needy/
├── needy-list.tsx          # Container (data fetching)
├── needy-list-view.tsx     # Presenter (UI only)
├── needy-card.tsx          # Presenter
└── use-needy-filters.ts    # Logic hook
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

## 🚀 Performance Optimizations

1. **Code Splitting**: Dynamic imports with `next/dynamic`
2. **Image Optimization**: Next.js Image component with AVIF/WebP
3. **Font Optimization**: `next/font` with display swap
4. **Bundle Analysis**: `@next/bundle-analyzer`
5. **Prefetching**: Link prefetch, idle prefetch
6. **Caching**: TanStack Query aggressive caching
7. **Compression**: Gzip via Next.js config

---

## 🔗 İlgili Dokümanlar

- [Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Security](./SECURITY.md)
