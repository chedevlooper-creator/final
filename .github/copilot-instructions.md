# Copilot Instructions - Yardım Yönetim Paneli

## Project Overview
Turkish NGO aid management system built with **Next.js 16 App Router**, **TypeScript**, **Supabase** (PostgreSQL + Auth + Storage), and **TanStack Query**. The codebase is primarily in Turkish.

## Architecture Patterns

### Data Flow
1. **Server State**: TanStack Query hooks in [src/hooks/queries/](src/hooks/queries/) - one file per domain (e.g., `use-needy.ts`, `use-donations.ts`)
2. **Client State**: Zustand store in [src/stores/ui-store.ts](src/stores/ui-store.ts)
3. **Forms**: React Hook Form + Zod schemas in [src/lib/validations/](src/lib/validations/)

### Supabase Client Usage
```typescript
// Client components: use singleton browser client
import { createClient } from '@/lib/supabase/client'

// Server components/API routes: create fresh server client
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Admin operations (server-only): bypasses RLS
import { createAdminClient } from '@/lib/supabase/client'
```

### API Route Pattern
All API routes in [app/api/](app/api/) use the permission middleware:
```typescript
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

### RBAC System
Roles: `admin`, `moderator`, `user`, `viewer` defined in [src/lib/rbac.tsx](src/lib/rbac.tsx). Use `<PermissionGuard>` component or `hasPermission()` helper for UI gating.

## Component Conventions

### UI Components
- Base primitives in [src/components/ui/](src/components/ui/) (shadcn/ui + Radix)
- Feature components in domain folders (e.g., [src/components/needy/](src/components/needy/))
- Common reusables in [src/components/common/](src/components/common/)

### Form Pattern
```typescript
// 1. Schema in src/lib/validations/{domain}.ts
export const needyFormSchema = z.object({ ... })

// 2. Form component uses react-hook-form + zodResolver
const form = useForm<NeedyPersonFormValues>({
  resolver: zodResolver(needyFormSchema),
  defaultValues: { ... }
})
```

## Key Commands
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run test         # Vitest tests
npm run lint         # ESLint
npm run analyze      # Bundle analyzer (ANALYZE=true)
```

## Database
- Migrations in [supabase/migrations/](supabase/migrations/) (numbered sequentially)
- Types generated in [src/types/database.types.ts](src/types/database.types.ts)
- All tables use UUID primary keys, soft delete via `is_active`, audit columns

## Import Aliases
Use `@/*` for imports from `./src/*`:
```typescript
import { Button } from '@/components/ui/button'
import { useNeedyList } from '@/hooks/queries/use-needy'
```

## Error Handling
Use typed errors from [src/lib/errors.ts](src/lib/errors.ts):
```typescript
throw new AppError('Not found', { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.MEDIUM })
```

## Testing
- Test files in [src/__tests__/](src/__tests__/) mirroring src structure
- Use Vitest + React Testing Library
- Setup in [vitest.setup.ts](vitest.setup.ts)

## ⛔ KRİTİK GIT KURALLARI - ASLA İHLAL ETME

### YASAK KOMUTLAR (Değişiklik varken ASLA kullanma):
```bash
# ❌ YASAK - Yerel değişiklikleri siler
git reset --hard origin/main
git reset --hard HEAD
git clean -fd
git checkout -- .
```

### CONFLICT DURUMUNDA:
```bash
# ✅ DOĞRU - Önce yedekle
git stash                          # Değişiklikleri yedekle
git branch backup-$(date +%s)      # Yedek branch oluştur

# ✅ DOĞRU - Manuel çöz
# Conflict'leri editörde manuel düzelt, asla reset atma

# ✅ KURTARMA - Hata yaptıysan
git reflog                         # Kayıp commit'i bul
git reset --hard <commit-hash>     # Geri al
```

### PUSH ÖNCE KONTROL:
```bash
# ✅ DOĞRU SIRA
git stash                          # 1. Değişiklikleri yedekle (varsa)
git pull origin main --rebase      # 2. Remote'u çek
git stash pop                      # 3. Değişiklikleri geri al
# Conflict varsa manuel çöz
git add . && git commit            # 4. Commit
git push                           # 5. Push
```

### ALTIN KURAL:
> **Kullanıcının yerel değişikliklerini ASLA silme. Şüphe varsa önce `git stash` veya yedek branch oluştur.**
