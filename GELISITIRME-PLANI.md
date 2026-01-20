# Yardım Yönetim Paneli - Geliştirme Planı (Düzeltilmiş)

## 🎯 Proje Durumu

**Tamamlanma Oranı:** %75
- ✅ Core altyapı: Supabase, Next.js 16, TypeScript, React Query
- ✅ Dashboard, İhtiyaç Sahipleri, Bağış, Gönüllüler, Toplantılar: %90+
- ⚠️ **Finance Module: Frontend var ama backend eksik** (tablolar + API routes)
- ⚠️ Authentication: Login sayfası var ama Supabase Auth integration eksik
- ⚠️ Orphan Form: %80 (UI eksik)
- ⚠️ Purchase Module: %30 (tablo + API + UI eksik)
- ⚠️ Raporlar: %50 (UI eksik)

---

## 🔴 HAFTA 1: Kritik Eksiklikler (Zorunlu)

### 1. Finance Module Backend Entegrasyonu

**Sorun:** Finance sayfaları mock data kullanıyor, gerçek Supabase tabloları ve API routes yok.

**Yapılacaklar:**

#### A) Database Tabloları
```bash
ulw: Create Supabase migrations for finance module

Tablolar:
1. bank_accounts
   - id, bank_name, account_number, iban, balance, currency
   - status, created_at, updated_at
   - is_primary (boolean)

2. cash_transactions
   - id, bank_account_id (FK)
   - type (income/expense), amount, description
   - transaction_date, reference_number
   - created_at, updated_at

3. merchants
   - id, name, contact_person, phone
   - address, tax_number, email
   - status, created_at, updated_at

4. purchase_requests
   - id, merchant_id (FK)
   - description, total_amount, request_date
   - status (pending/approved/rejected)
   - created_at, updated_at

RLS Policies:
- Admin: full read/write
- Moderator: read/write, no delete
- Viewer: read-only
```

#### B) API Routes
```bash
ulw: Create API routes for finance

Endpoints:
- GET/POST /api/finance/bank-accounts
- GET/POST /api/finance/cash-transactions
- GET/POST /api/finance/merchants
- GET/POST /api/finance/purchase-requests
- GET /api/finance/summary (tahmini)

Features:
- Input validation (Zod)
- RLS protection
- Error handling (ErrorHandler)
- Turkish error messages
```

#### C) React Query Hooks
```bash
ulw: Create finance hooks using useGenericQuery

Hooks:
- useBankAccounts() - CRUD operations
- useCashTransactions() - CRUD operations + filters
- useMerchants() - CRUD operations
- usePurchaseRequests() - CRUD operations + status workflow
- useFinanceSummary() - Dashboard stats
```

#### D) UI Updates
```bash
ulw: Update finance pages to use real data

Pages:
- /dashboard/finance/cash/page.tsx - Use useCashTransactions()
- /dashboard/finance/bank/page.tsx - Use useBankAccounts()
- /dashboard/finance/reports/page.tsx - Use real data
```

**Tahmini Süre:** 12-15 saat

---

### 2. Authentication System (Supabase Auth Entegrasyonu)

**Sorun:** Login sayfası var ama Supabase Auth ile tam entegrasyon yok.

**Yapılacaklar:**

#### A) Supabase Auth
```typescript
// Mevcut kodun kullanılması
import { createClient } from '@/lib/supabase/client'

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Register
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/auth/callback`
  }
})

// Logout
await supabase.auth.signOut()

// Session check
const { data: { session } } = await supabase.auth.getSession()
```

#### B) Middleware (Protected Routes)
```typescript
// middleware.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()

  // Login sayfası hariç koruma
  const protectedPaths = ['/dashboard', '/api']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!session && isProtectedPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}
```

#### C) Session Management Hook
```typescript
// hooks/use-auth.ts (zaten var, kullanılması)
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Session değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { session, user: session?.user }
}
```

**Tahmini Süre:** 8-10 saat

---

### 3. Orphan Form Tamamlama

**Sorun:** OrphanForm component eksik, UI incomplete.

**Yapılacaklar:**

#### A) Form Component
```bash
ulw: Create OrphanForm component

Features:
- React Hook Form + Zod validation
- Sponsor selection (dropdown from volunteers)
- Status management (active/inactive/graduated)
- Photo upload (integration with file-upload component)
- Support amount
- Monthly need amount
- Notes field

Turkish UI strings
Error messages
```

#### B) API Route
```bash
ulw: Create /api/orphans route

Methods:
- GET: List orphans (filter by status, sponsor)
- POST: Create orphan
- PATCH: Update orphan
- DELETE: Delete orphan
```

#### C) Hook
```bash
ulw: Create useOrphans hook

Operations:
- useOrphansList(options)
- useCreateOrphan()
- useUpdateOrphan()
- useDeleteOrphan()
- useOrphanDetail(id)
```

**Tahmini Süre:** 6-8 saat

---

## 🟡 HAFTA 2-3: Orta Öncelik

### 4. Purchase Module

```bash
ulw: Complete purchase management

1. merchants table (Finance module ile aynı)
2. purchase_requests table (Finance module ile aynı)
3. CRUD UI /dashboard/purchase
4. Approval workflow (pending → approved/rejected)
5. React Query hooks
6. API routes
```

### 5. SMS Integration

```bash
ulw: SMS module

1. sms_logs table
2. Bulk message UI
3. SMS template management
4. API integration (SMS provider)
5. Send status tracking
```

### 6. Advanced Reporting

```bash
ulw: Reports module

1. Custom report builder UI
2. Date range filters
3. Export functionality (PDF/Excel - functions hazır)
4. Report templates
5. Scheduled reports
```

### 7. Settings Pages

```bash
ulw: Settings pages

1. User management UI
2. Role-based permission UI
3. Definitions (kategoriler, durumlar) management
4. System settings
```

---

## 🟢 HAFTA 4: Optimizasyon

### 8. Performance
```bash
ulw: Performance optimizations

1. Virtual scrolling for large lists
2. Next.js Image component usage
3. Bundle size reduction (tree-shaking)
4. Query optimization (RPC functions)
5. Lazy loading heavy components
```

### 9. Test Coverage
```bash
ulw: Write tests

Kapsam:
- All new hooks (useBankAccounts, etc.)
- API routes
- Form validations
- Critical components
Hedef: %80+ coverage
```

### 10. Security Hardening
```bash
ulw: Security improvements

1. RLS policies update (rol bazlı strict policies)
2. Rate limiting on API routes
3. CSRF protection
4. File upload security (type/size validation)
5. Audit logging activation
```

---

## 📊 Tahmini Süre ve Oh-my-opencode Tasarrufu

| Görev | Manuel Süre | Oh-my-opencode | Tasarruf |
|-------|-------------|----------------|----------|
| Finance backend (tablolar + API + hooks) | 20 saat | 6 saat | **70%** |
| Authentication (Supabase Auth + middleware) | 10 saat | 3 saat | **70%** |
| Orphan Form (component + API + hook) | 8 saat | 3 saat | **62%** |
| Purchase Module | 12 saat | 4 saat | **67%** |
| SMS Integration | 10 saat | 3 saat | **70%** |
| Reports Module | 8 saat | 3 saat | **62%** |
| Settings Pages | 6 saat | 2 saat | **67%** |
| Performance | 10 saat | 4 saat | **60%** |
| Tests | 15 saat | 6 saat | **60%** |
| Security | 8 saat | 3 saat | **62%** |
| **TOPLAM** | **107 saat** | **37 saat** | **65%** |

---

## 🚀 Başlangıç Seçeneği

**Öneri:** Finance Module ile başlayalım. En büyük eksiklik ve mock data kullanımı hatayı düzeltir.

### Seçenek 1: Finance Module (Önerilen)
```bash
ulw: Finance module complete
  - Bank accounts (table + migration + API + hooks + UI)
  - Cash transactions (table + migration + API + hooks + UI)
  - Turkish validation
  - Dashboard summary
```

### Seçenek 2: Authentication
```bash
ulw: Supabase Auth integration
  - Login/Register flows
  - Middleware for protected routes
  - Session management
```

### Seçenek 3: Orphan Form
```bash
ulw: Orphan form completion
  - Form component with validation
  - API route
  - React Query hook
```

### Seçenek 4: Paralel İlerleme
```bash
ulw: Start all critical features in parallel
  - Finance module (background agent 1)
  - Auth system (background agent 2)
  - Orphan form (background agent 3)
  - Sisyphus orchestrates
```

---

Hangi seçeneği seçmek istiyorsunuz?
