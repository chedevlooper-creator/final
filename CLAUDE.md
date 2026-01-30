# CLAUDE.md

This file provides guidance for Claude Code (the AI assistant) when working on this codebase.

## Project Summary

**Yardim Yonetim Paneli** (Aid Management Panel) is a production-grade NGO management platform built with Next.js 16, TypeScript, and Supabase. It manages beneficiaries, donations, volunteers, orphans, finances, memberships, programs, and events for charitable organizations. The UI language is Turkish; database field names are in English.

## Quick Reference Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run lint             # ESLint (src/ directory)
npx tsc --noEmit         # Type-check without emitting
npm run test             # Run all Vitest tests
npm run test:coverage    # Tests with coverage report
ANALYZE=true npm run build  # Bundle analyzer
```

Run type-check and lint before considering work complete:
```bash
npx tsc --noEmit && npm run lint
```

Run a specific test file:
```bash
npx vitest src/__tests__/api/auth.test.ts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, Tailwind CSS 3.4, shadcn/ui, Radix UI |
| State (server) | TanStack React Query 5 |
| State (client) | Zustand 5 |
| Forms | React Hook Form 7 + Zod 3 |
| Database/Auth | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Animations | Framer Motion 12 |
| Charts | Recharts 3 |
| Error tracking | Sentry |
| Testing | Vitest 4, Testing Library |
| Node | >=22.0.0 |

## Project Structure

```
app/                         # Next.js App Router pages
  (auth)/                    # Auth group (login)
  api/                       # API routes (18+ endpoint groups)
  dashboard/                 # Dashboard pages (all feature modules)
  layout.tsx                 # Root layout
  globals.css                # Global styles + Tailwind

src/
  components/                # React components (~102 files)
    ui/                      # shadcn/ui primitives (40+ components)
    layout/                  # Sidebar, Header, Navigation
    forms/                   # Domain form components
    needy/                   # Needy persons module UI
    charts/                  # Data visualization
    donation-boxes/          # Donation box management
    inventory/               # Inventory management
    navigation/              # ViewTransitions, ProgressBar
    notification/            # Notification UI
    common/                  # Shared components
    upload/                  # File upload components
    providers.tsx            # Root providers (QueryClient, etc.)

  hooks/                     # Custom React hooks (22 files)
    queries/                 # TanStack Query read hooks
    mutations/               # TanStack Query write hooks
    use-auth.ts              # Auth hook (user, profile, roles)
    use-notifications.ts     # Notification management
    use-toast.ts             # Toast notifications

  lib/                       # Utilities and services (35+ files)
    supabase/                # Supabase clients
      client.ts              # Browser client (singleton)
      server.ts              # SSR client
      middleware.ts           # Session update middleware
    validations/             # Zod schemas (7 domain schemas)
    messaging/               # Email & SMS providers
    mernis/                  # Turkish ID verification (SOAP)
    errors.ts                # AppError class, ErrorType enum
    rbac.tsx                 # Role-based access control helpers
    security.ts              # CSP nonce, security headers
    rate-limit.ts            # In-memory rate limiter
    audit.ts                 # Audit logging
    permission-middleware.ts # API permission checks
    org-middleware.ts         # Organization context middleware
    env.ts                   # Environment variable validation
    utils.ts                 # General utilities (cn, etc.)

  stores/
    ui-store.ts              # Zustand UI state (sidebar, modals)

  types/                     # TypeScript definitions (12 files)
    database.types.ts        # Supabase auto-generated types
    organization.types.ts    # RBAC single source of truth
    needy.types.ts           # Beneficiary types
    finance.types.ts         # Financial types
    task.types.ts            # Task assignment types
    meeting.types.ts         # Meeting types
    donation-boxes.types.ts  # Donation box types
    common.ts                # Shared types

  __tests__/                 # Test suites (api, components, lib)

  middleware.ts              # Next.js middleware (session refresh)

supabase/
  migrations/                # SQL migration files (20+ files)

docs/                        # Turkish documentation (15 files)
```

## Architecture Patterns

### Supabase Client Selection

| Context | Function | Import From |
|---------|----------|-------------|
| Client components / hooks | `createClient()` | `@/lib/supabase/client` |
| Server components / API routes | `createServerSupabaseClient()` | `@/lib/supabase/server` |
| Admin/privileged operations | `createAdminClient()` | `@/lib/supabase/client` |

### API Route Pattern

All API routes live under `app/api/`. Standard structure:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'needy_persons',
  })
  if (!authResult.success) return authResult.response!

  // Build Supabase query, apply filters/pagination
  // Return: { data, meta: { page, limit, count, totalPages } }
}
```

API responses follow this shape:
```typescript
// Success
{ data: T, meta?: { page, limit, count, totalPages } }

// Error
{ error: string, code: string, fields?: string[], details?: Record<string, unknown> }
```

### Data Fetching (TanStack Query)

Query hooks go in `src/hooks/queries/`, mutation hooks in `src/hooks/mutations/`.

Naming conventions:
- `use[Domain]List` - paginated list queries
- `use[Domain]Detail` - single record queries
- `useCreate[Domain]` - create mutations
- `useUpdate[Domain]` - update mutations
- `useDelete[Domain]` - delete mutations
- `use[Domain]Stats` - aggregate queries

Cache defaults: `staleTime: 10min`, `gcTime: 30min`, `refetchOnWindowFocus: false`.

### Form Validation

All validation schemas live in `src/lib/validations/`. Always use Zod schemas with React Hook Form:

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { entitySchema, type EntityFormValues } from '@/lib/validations/entity'

const form = useForm<EntityFormValues>({
  resolver: zodResolver(entitySchema),
  defaultValues: { ... },
})
```

Custom Turkish validators exist for TC Kimlik numbers and IBAN.

### RBAC System

Source of truth: `src/types/organization.types.ts`

5-level role hierarchy (low to high): `viewer` < `user` < `moderator` < `admin` < `owner`

Permissions use `resource:action` format (e.g., `data:create`, `reports:export`, `members:manage`).

Client-side checks:
```typescript
import { usePermissions } from '@/lib/rbac'
const { canRead, canCreate, canUpdate, canDelete } = usePermissions('resource')
```

Server-side checks use `withAuth()` from `@/lib/permission-middleware`.

### Error Handling

Use the `AppError` class from `src/lib/errors.ts` with `ErrorType` enum and `ErrorSeverity` levels. User-facing error messages must be in Turkish.

### State Management

- **Server state**: TanStack React Query (all data fetching)
- **Client UI state**: Zustand store (`src/stores/ui-store.ts`) for sidebar, modals, mobile menu
- **Form state**: React Hook Form + Zod
- **Auth state**: `useAuth()` hook wrapping Supabase auth

## Code Conventions

### File Naming
- Components: `kebab-case.tsx` (e.g., `needy-list.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-auth.ts`)
- Types: `kebab-case.types.ts` (e.g., `needy.types.ts`)
- Validations: `kebab-case.ts` in `lib/validations/`
- API routes: `route.ts` inside route directories

### Import Order
```typescript
// 1. External libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 3. Type-only imports
import type { NeedyPerson } from '@/types/needy.types'

// 4. Relative imports
import { LocalComponent } from './local-component'
```

Path alias: `@/*` maps to `./src/*`.

### TypeScript Rules
- **Strict mode is on** - never use `any`
- Use `interface` for object shapes, `type` for unions/intersections
- Nullable DB fields: `string | null` (not `undefined`)
- Component props: `interface ComponentNameProps { ... }`
- Always type function return values for API routes and exported functions

### Component Structure
- Server components by default (Next.js App Router)
- Add `'use client'` only for interactive components
- Use composition over inheritance
- Error handling in try/catch with `toast.error()` from sonner

### Styling
- Tailwind CSS utility classes only (no custom CSS unless necessary)
- Dark mode via `class` strategy (HSL CSS variables)
- Use `cn()` from `@/lib/utils` to merge class names
- NGO corporate theme: navy primary, gold accent, semantic colors

### Language
- All UI text, error messages, toast messages, and form labels: **Turkish**
- Code identifiers (variables, functions, types): **English**
- Database column names: **English**
- Comments: Turkish (but avoid unnecessary comments)

## Testing

Tests live in `src/__tests__/` mirroring the source structure. Framework: Vitest + Testing Library.

```bash
npm run test                              # All tests
npx vitest src/__tests__/api/auth.test.ts # Specific file
npx vitest --run "needy"                  # Pattern match
npx vitest -t "should create needy"       # Test name match
```

Mock Supabase and auth middleware in tests:
```typescript
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({ from: () => ({ ... }) }),
}))
vi.mock('@/lib/permission-middleware', () => ({
  withAuth: vi.fn(() => Promise.resolve({ success: true, user: { id: 'u1', role: 'admin' } })),
}))
```

## Database

PostgreSQL via Supabase with ~25 tables. Migrations in `supabase/migrations/` (numbered sequentially).

Key tables: `needy_persons`, `aids`, `donations`, `volunteers`, `events`, `tasks`, `meetings`, `memberships`, `programs`, `profiles`, `organizations`, `bank_accounts`, `messages`.

Row-Level Security (RLS) is enabled on all sensitive tables with tenant isolation via `organization_id`.

## Environment Variables

Required (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `NEXT_PUBLIC_APP_URL` - Application URL

Optional:
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` - Sentry build config
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email
- `MERNIS_SERVICE_URL`, `MERNIS_USERNAME`, `MERNIS_PASSWORD` - Turkish ID verification
- `CRON_SECRET` - Cron job authentication
- `NEXTAUTH_SECRET` - JWT secret

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Security Considerations

- All API routes must use `withAuth()` or `withOrgAuth()` middleware
- Rate limiting exists for auth (5/15min) and create operations (100/hour)
- CSP headers with nonce-based inline scripts via `src/lib/security.ts`
- RLS policies enforce tenant isolation - always include `organization_id` in queries
- Validate all user input with Zod schemas at API boundaries
- Never commit `.env` files; use `.env.example` as reference

## Deployment

- **Platform**: Vercel
- **Build**: `npm run build` (TypeScript errors block builds)
- **Pre-deploy checklist**: type-check, lint, tests, build all must pass
- **Cron**: `/api/cron` runs daily at 10:00 UTC
- **Monitoring**: Sentry for errors + performance, tunnel via `/monitoring`
