# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yardım Yönetim Paneli** (Charity Management Panel) is a comprehensive web application for NGOs and charitable organizations to manage aid operations. Built with Next.js 16, TypeScript, Supabase, and Tailwind CSS.

**Key Technologies:** Next.js 16 App Router, Supabase (PostgreSQL + Auth), TanStack Query, Zustand, React Hook Form + Zod, shadcn/ui components

---

## Development Commands

```bash
# Core development
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run start            # Start production server

# Code quality
npm run lint             # ESLint
npx tsc --noEmit         # Type check (important - do this before committing)
npm run test             # Run Vitest tests
npm run test:ui          # Test UI
npm run test:coverage    # Coverage report

# Analysis
npm run analyze          # Bundle size analysis (requires ANALYZE=true)
```

---

## Architecture

### App Router Structure

```
src/app/
├── (auth)/              # Auth route group (no layout pollution)
│   └── login/           # Authentication pages
├── api/                 # Route Handlers (RESTful API)
│   ├── cron/           # Scheduled jobs
│   ├── docs/           # OpenAPI spec at /api/docs
│   ├── finance/        # Finance endpoints
│   └── mernis/         # TC Kimlik verification
├── dashboard/           # Protected area (middleware-enforced)
│   └── [module]/       # Feature modules (aids, donations, needy, etc.)
└── layout.tsx           # Root layout with providers
```

### State Management Strategy

| State Type | Tool | Use Case |
|------------|------|----------|
| Server State | TanStack Query | Database data, API responses (10min cache) |
| Client State | Zustand | UI state, form state, preferences |
| Form State | React Hook Form + Zod | Form validation |
| Auth State | Supabase + Context | User session, permissions |

### Component Patterns

- **Compound Components**: DataTable with Header, Body, Pagination sub-components
- **Render Props**: `IfPermission` component for RBAC
- **Container/Presenter**: Data fetching in container, UI in presenter
- **Custom Hooks**: `/src/hooks/queries/` for TanStack Query abstractions

---

## Security & RBAC

### Roles (4 levels)
- `admin` - Full access, user management, settings
- `moderator` - CRUD + approval, reports
- `user` - Create/edit own records
- `viewer` - Read-only

### Permission Check Pattern

```typescript
// Using the RBAC helper
import { IfPermission } from '@/lib/rbac'

<IfPermission role={user.role} resource="needy_persons" action="delete">
  <DeleteButton />
</IfPermission>

// Or use the hook
import { usePermissions } from '@/lib/rbac'
const { canDelete, needyPersons: { canUpdate } } = usePermissions(user.role)
```

### Important Security Constraints

- **Service Role Key**: NEVER use on client-side; only in API routes or server components
- **RLS**: All database tables have Row Level Security enabled
- **MERNIS**: Turkish identity verification via `/api/mernis/verify`
- **Audit Logging**: All CREATE/UPDATE/DELETE operations are logged via `lib/audit.ts`

---

## Data Layer

### Supabase Clients (3 types)

```typescript
// Client-side - use in browser components
import { createClient } from '@/lib/supabase/client'

// Server-side - use in Server Components / Route Handlers
import { createClient } from '@/lib/supabase/server'

// Middleware - for auth checks
import { createClient } from '@/lib/supabase/middleware'
```

### Query Hooks Pattern

```typescript
// Custom hooks in src/hooks/queries/
import { useNeedyList, useNeedyDetail } from '@/hooks/queries'

// List query with filters/pagination
const { data, isLoading, error } = useNeedyList({
  page: 1,
  limit: 20,
  filters: { city_id: 34 }
})

// Detail query
const { data: person } = useNeedyDetail(id)
```

---

## File Naming Conventions

```
# Components - kebab-case
my-component.tsx           ✅
MyComponent.tsx            ❌

# Hooks - camelCase
useAuth.ts                 ✅
use-auth.ts                ❌

# Folders for multi-file components
components/my-feature/
  index.tsx                # Main export
  my-feature-card.tsx      # Sub-components
  my-feature.types.ts      # Types
```

---

## Import Order

```typescript
// 1. External libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 3. Relative imports
import { SubComponent } from './sub-component'
```

---

## Database & Migrations

- Migrations in `supabase/migrations/` (16 files)
- All tables use UUID primary keys
- Standard audit columns: `created_at`, `updated_at`, `created_by`, `updated_by`
- Lookup tables: countries, cities, districts, neighborhoods, categories

---

## API Routes

- RESTful design with pagination
- Error responses: `{ error: string, code: string }`
- Rate limiting: 100 req/15min in production
- OpenAPI spec: `GET /api/docs`

---

## Module-Specific Notes

### Needy Persons (`/dashboard/needy`)
- Core entity with 27 component files
- Bulk import/export via `lib/bulk.ts`
- Excel/PDF export capabilities

### Finance (`/dashboard/finance`)
- Multi-currency support (TRY, USD, EUR, GBP)
- Bank account management
- Income/expense tracking with categories

### Applications (`/dashboard/applications`)
- Approval workflow (pending → approved/rejected)
- Status transitions tracked in audit log

---

## Testing

```bash
npm run test              # Run tests
npm run test:coverage     # Coverage report
```

Tests use Vitest with Testing Library. Test files should be co-located or in `src/__tests__/`.

---

## Common Patterns

### Generic Table with Search/Filter

```typescript
import { DataTable } from '@/components/common/data-table'
import { useDataTable } from '@/hooks/use-data-table'

function MyList() {
  const { data, isLoading, filters, setFilters } = useNeedyList()
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Search value={filters.search} onChange={setFilters} />
      </DataTable.Header>
      <DataTable.Body columns={columns} data={data} />
      <DataTable.Pagination />
    </DataTable>
  )
}
```

### Form with Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mySchema } from '@/lib/validations/my-schema'

function MyForm() {
  const form = useForm({
    resolver: zodResolver(mySchema),
    defaultValues: { ... }
  })
  // ...
}
```

---

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only, never commit
```

Optional:
```bash
NEXT_PUBLIC_SENTRY_DSN=xxx
NEXT_PUBLIC_POSTHOG_KEY=xxx
MERNIS_SERVICE_URL=xxx
CRON_SECRET=xxx
```

---

## Deployment

- Platform: Vercel
- CI/CD: GitHub Actions (lint, test, build, security scan)
- Auto-deploy on push to `main` branch
- Environment variables configured in Vercel dashboard

---

## Key Documentation

- `docs/ARCHITECTURE.md` - Detailed architecture diagrams
- `docs/API.md` - Full API documentation
- `docs/DATABASE.md` - Database schema
- `docs/SECURITY.md` - Security policies and RBAC matrix
- `docs/SETUP.md` - Development environment setup
- `docs/PRODUCTION_CHECKLIST.md` - Production deployment checklist

---

## Production Deployment

### Prerequisites
1. Supabase project with all migrations applied
2. Environment variables configured (see `.env.example`)
3. GitHub secrets set for CI/CD
4. Vercel project connected

### Pre-Commit Validation
```bash
# Run all checks before committing
/validate          # Runs type-check, lint, and test
```

### Deployment Steps
```bash
# 1. Build locally to verify
npm run build

# 2. Test production build
npm start

# 3. Deploy (via Vercel CLI or GitHub Actions)
vercel --prod
# or push to main branch for auto-deploy
```

### Known Issues
- **xlsx package v0.18.5**: Has known security vulnerabilities (Prototype Pollution, ReDoS)
  - Mitigation: Used only server-side for Excel export
  - Override added in package.json
  - Consider replacing with `exceljs` for future releases

### Post-Deployment
1. Verify all API endpoints
2. Test authentication flow
3. Check Sentry error reporting
4. Validate PostHog analytics
5. Run through `docs/PRODUCTION_CHECKLIST.md`
