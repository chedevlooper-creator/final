# CLAUDE.md

This file provides guidance for Claude Code (the AI assistant) when working on this codebase.

## Project Summary

**Yardim Yonetim Paneli** (Aid Management Panel) is a production-grade NGO management platform built with Next.js 16, TypeScript, and Supabase. It manages beneficiaries, donations, volunteers, orphans, finances, memberships, programs, tasks, and events for charitable organizations. The UI language is Turkish; database field names and code identifiers are in English.

## Quick Reference Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run lint             # ESLint (src/ directory)
npx tsc --noEmit         # Type-check without emitting
npm run test             # Run all Vitest tests
npm run test:coverage    # Tests with coverage report
npm run test:ui          # Test UI dashboard
ANALYZE=true npm run build  # Bundle analyzer
```

Run type-check and lint before considering work complete:
```bash
npx tsc --noEmit && npm run lint
```

Run a specific test file:
```bash
npx vitest src/__tests__/api/auth.test.ts
npx vitest --run "needy"               # Pattern match
npx vitest -t "should create needy"    # Test name match
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
| Excel export | ExcelJS 4 |
| OCR | Tesseract.js 7 |
| QR codes | qrcode 1.5 |
| Error tracking | Sentry |
| Testing | Vitest 4, Testing Library |
| Node | >=22.0.0 |

## Project Structure

```
app/                         # Next.js App Router pages
  (auth)/                    # Auth group (login page)
  api/                       # API routes (31 route files, 16+ groups)
  dashboard/                 # Dashboard pages (17 feature modules)
  layout.tsx                 # Root layout
  globals.css                # Global styles + Tailwind

src/
  components/                # React components (~110 files)
    ui/                      # shadcn/ui primitives (28 components)
    layout/                  # Sidebar, Header, Navigation (7 files)
    forms/                   # Domain form components (9 files)
    needy/                   # Needy persons module UI (26 files)
    common/                  # Shared components (14 files)
    charts/                  # Data visualization
    donation-boxes/          # Donation box management (4 files)
    inventory/               # Inventory management (4 files)
    navigation/              # ViewTransitions, ProgressBar (3 files)
    notification/            # Notification UI (2 files)
    upload/                  # File upload components
    performance/             # WebVitals monitoring
    providers/               # Nonce provider for CSP
    examples/                # Responsive design demo
    providers.tsx            # Root providers (QueryClient, etc.)

  hooks/                     # Custom React hooks (33 files)
    queries/                 # TanStack Query read hooks (24 files)
    mutations/               # TanStack Query write hooks (2 files)
    use-auth.ts              # Auth hook (user, profile, roles)
    use-notifications.ts     # Notification management
    use-toast.ts             # Toast notifications
    use-device-type.ts       # Mobile/tablet/desktop detection
    use-media-query.ts       # CSS media query hooks
    use-storage-upload.ts    # Supabase storage file upload

  lib/                       # Utilities and services (35+ files)
    supabase/                # Supabase clients
      client.ts              # Browser client (singleton)
      server.ts              # SSR client
      middleware.ts           # Session update middleware
    validations/             # Zod schemas (7 domain schemas)
    messaging/               # Email & SMS providers (factory pattern)
    mernis/                  # Turkish ID verification (SOAP)
    export/                  # Excel export utilities (ExcelJS)
    config/                  # Mobile nav config
    notifications/           # Notification type definitions
    errors.ts                # AppError class, ErrorType enum, error classes
    rbac.tsx                 # Role-based access control helpers
    security.ts              # CSP nonce, security headers, CORS
    rate-limit.ts            # In-memory rate limiter
    audit.ts                 # Audit logging
    activity-logger.ts       # User activity logging
    permission-middleware.ts  # Legacy API permission checks (single-tenant)
    organization-middleware.ts # Multi-tenant org permission checks
    env.ts                   # Environment variable validation
    utils.ts                 # General utilities (cn, format*, debounce, etc.)
    qr-code.ts               # QR code generation
    bulk.ts                  # Bulk operations
    performance.ts           # Performance monitoring
    production-check.ts      # Production environment checks
    lazy-loading.tsx         # Lazy loading wrapper
    menu-config.ts           # Navigation menu structure

  stores/
    ui-store.ts              # Zustand UI state (sidebar, modals, mobile menu)

  types/                     # TypeScript definitions (12 files)
    database.types.ts        # Supabase auto-generated types
    organization.types.ts    # RBAC single source of truth (roles, permissions, plans)
    needy.types.ts           # Beneficiary types
    finance.types.ts         # Financial types
    task.types.ts            # Task assignment types
    meeting.types.ts         # Meeting types
    donation-boxes.types.ts  # Donation box types
    linked-records.types.ts  # Documents, dependents, interviews
    inventory.ts             # Inventory types
    skills.types.ts          # Volunteer skills
    common.ts                # Shared types

  __tests__/                 # Test suites
    api/                     # auth, donations, needy
    components/              # utils
    lib/                     # rbac, messaging

  middleware.ts              # Next.js middleware (session refresh)

supabase/
  migrations/                # SQL migration files (20+ files)

docs/                        # Turkish documentation (15 files)
```

## Dashboard Feature Modules

All under `app/dashboard/`:

| Module | Path | Description |
|--------|------|-------------|
| Home | `/` | Dashboard stats, charts, recent activity |
| Needy | `/needy`, `/needy/[id]` | Beneficiary management |
| Donations | `/donations`, `/donations/[id]`, `/donations/cash`, `/donations/sacrifice`, `/donations/boxes`, `/donations/collections`, `/donations/routes` | Donations, sacrifice, collection boxes, routes |
| Aids | `/aids`, `/aids/cash`, `/aids/cashdesk`, `/aids/service`, `/aids/logistics`, `/aids/transfer` | Aid distribution |
| Volunteers | `/volunteers`, `/volunteers/[id]`, `/volunteers/missions` | Volunteer management |
| Orphans | `/orphans`, `/orphans/[id]` | Orphan records |
| Events | `/events`, `/events/[id]` | Event calendar |
| Inventory | `/inventory`, `/inventory/items`, `/inventory/warehouses`, `/inventory/transactions`, `/inventory/counts`, `/inventory/alerts` | Stock management |
| Finance | `/finance`, `/finance/cash`, `/finance/bank`, `/finance/reports` | Financial tracking |
| Programs | `/programs`, `/programs/new`, `/programs/[id]`, `/programs/[id]/beneficiaries`, `/programs/[id]/activities` | Program management |
| Memberships | `/memberships` | Membership management |
| Tasks | `/tasks` | Task management |
| My Tasks | `/my-tasks` | User-assigned tasks |
| Team Activity | `/team-activity` | Team performance tracking |
| Applications | `/applications`, `/applications/[id]` | Application processing |
| Purchase | `/purchase`, `/purchase/[id]`, `/purchase/merchants` | Purchase management |
| Messages | `/messages/sms`, `/messages/bulk` | SMS & email |
| Calendar | `/calendar` | Calendar view |
| Reports | `/reports` | Reporting |
| Settings | `/settings/*` (organization, users, security, notifications, appearance, integrations, backup, definitions) | System settings |
| Account | `/account` | User account |

## Architecture Patterns

### Supabase Client Selection

| Context | Function | Import From |
|---------|----------|-------------|
| Client components / hooks | `createClient()` | `@/lib/supabase/client` |
| Server components / API routes | `createServerSupabaseClient()` | `@/lib/supabase/server` |
| Admin/privileged operations | `createAdminClient()` | `@/lib/supabase/client` |

The browser client uses a singleton pattern. Server and admin clients create fresh instances per request. During SSG/build, placeholder values are used to allow prerendering.

### API Route Patterns

All API routes live under `app/api/` (31 route files across 16+ groups). Two auth middleware approaches coexist:

**Legacy single-tenant** (`withAuth` from `@/lib/permission-middleware`):
```typescript
import { withAuth } from '@/lib/permission-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'needy_persons',
  })
  if (!authResult.success) return authResult.response!
  // ...
}
```

**Multi-tenant org-scoped** (`withOrgAuth` from `@/lib/organization-middleware`):
```typescript
import { withOrgAuth } from '@/lib/organization-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withOrgAuth(request, {
    resource: 'data',
    permission: 'data:read',
  })
  if (!authResult.success) return authResult.response!
  // Use authResult.organizationId for tenant isolation
}
```

New routes should prefer `withOrgAuth` for multi-tenant support.

**API response shape:**
```typescript
// Success
{ data: T, meta?: { page, limit, count, totalPages } }

// Error
{ error: string, code: string, fields?: string[], details?: Record<string, unknown> }
```

**Rate limits by endpoint:**
| Endpoint | Limit |
|----------|-------|
| Login | 5 / 15 min |
| SMS | 20 / hour |
| Programs | 30 / hour |
| Email | 50 / hour |
| Memberships | 50 / hour |
| Needy | 100 / hour |
| Donations | 200 / hour |

### API Route Map

```
api/
  auth/login/                   # POST - Email/password auth
  needy/                        # GET/POST - Beneficiaries
  needy/[id]/orphan-relations/  # GET/POST/DELETE - Orphan links
  orphans/                      # GET/POST - Orphan records
  donations/                    # GET/POST - Donations
  finance/bank-accounts/        # GET/POST/PATCH/DELETE - Bank accounts
  memberships/                  # GET/POST - Memberships (org-scoped)
  memberships/[id]/             # GET/PATCH/DELETE
  programs/                     # GET/POST - Programs (org-scoped)
  programs/[id]/                # GET/PATCH/DELETE
  programs/[id]/beneficiaries/  # GET/POST
  programs/[id]/activities/     # GET/POST
  meetings/                     # GET/POST - Meetings
  meetings/[id]/                # GET/PATCH/DELETE
  meetings/[id]/attend/         # POST - Attendance
  meetings/[id]/tasks/          # GET/POST/PATCH - Meeting tasks
  tasks/                        # GET/POST - Task management
  tasks/[id]/                   # GET/PATCH/DELETE
  my-tasks/                     # GET/PATCH - User's assigned tasks
  messages/send-email/          # POST - Bulk email
  messages/send-sms/            # POST - Bulk SMS
  messages/recipients/          # GET - Recipient lists
  mernis/verify/                # GET/POST - Turkish ID verification
  dashboard/stats/              # GET - Dashboard statistics
  dashboard/team-stats/         # GET - Team performance (admin only)
  dashboard/team/               # GET - Active team members
  activities/                   # GET - Activity logs
  cron/                         # GET - Scheduled jobs (bearer token)
  docs/                         # GET - OpenAPI spec
  examples/                     # Reference RBAC patterns (demo only)
```

### Data Fetching (TanStack Query)

Query hooks in `src/hooks/queries/` (24 files), mutation hooks in `src/hooks/mutations/` (2 files). A generic query factory in `use-generic-query.ts` provides typed base hooks.

**Hook naming conventions:**
- `use[Domain]List` - paginated list queries
- `use[Domain]Detail` - single record queries
- `useCreate[Domain]` - create mutations
- `useUpdate[Domain]` - update mutations
- `useDelete[Domain]` - delete mutations
- `use[Domain]Stats` - aggregate queries
- `useBulk[Action][Domain]` - bulk operations

**Query hook domains:** needy, donations, aids, volunteers, events, finance, applications, bank-accounts, linked-records, messages, users, orphans, lookups, inventory, calendar, tasks, reports, donation-boxes, purchase, meetings, skills, dashboard-stats.

**Cache defaults:** `staleTime: 5-10min`, `gcTime: 30min`, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`.

All mutations include automatic cache invalidation and Turkish toast notifications.

### Form Validation

All validation schemas live in `src/lib/validations/` (7 files). Always use Zod schemas with React Hook Form:

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { entitySchema, type EntityFormValues } from '@/lib/validations/entity'

const form = useForm<EntityFormValues>({
  resolver: zodResolver(entitySchema),
  defaultValues: { ... },
})
```

**Validation domains:** needy (30+ fields, TC ID, IBAN), donation, finance, application, donation-boxes, inventory, common (shared validators: phone, email, UUID, TC Kimlik, sanitized strings).

### RBAC System

Source of truth: `src/types/organization.types.ts`

5-level role hierarchy (low to high): `viewer` < `user` < `moderator` < `admin` < `owner`

Permissions use `resource:action` format:
- `org:manage`, `org:delete`, `org:billing`, `org:view`
- `members:manage`, `members:invite`, `members:view`
- `data:create`, `data:read`, `data:update`, `data:delete`
- `reports:view`, `reports:export`, `reports:create`
- `settings:manage`, `settings:view`

Multi-tenancy support with `PlanTier` (free/professional/enterprise) and `SubscriptionStatus`.

Client-side checks:
```typescript
import { usePermissions } from '@/lib/rbac'
const { canRead, canCreate, canUpdate, canDelete } = usePermissions('resource')
```

Server-side: `withAuth()` (legacy) or `withOrgAuth()` (org-scoped).

### Error Handling

`src/lib/errors.ts` provides a rich error hierarchy:

- `AppError` (base) with `ErrorType` enum and `ErrorSeverity` levels
- Specialized: `AuthError`, `AuthorizationError`, `ValidationError`, `NetworkError`, `NotFoundError`, `ConflictError`, `RateLimitError`, `DatabaseError`
- `ErrorHandler` utility with Turkish messages, sanitization, and API response helpers
- `ErrorLogger` for structured error logging

User-facing error messages must be in Turkish.

### State Management

- **Server state**: TanStack React Query (all data fetching via hooks)
- **Client UI state**: Zustand store (`src/stores/ui-store.ts`) for sidebar collapse, active modal, modal data, mobile menu; persists sidebar state to localStorage
- **Form state**: React Hook Form + Zod
- **Auth state**: `useAuth()` hook wrapping Supabase auth (user, profile, role, permissions, isAdmin/isModerator/isUser/isViewer booleans)

### Messaging System

Email and SMS use a factory/provider pattern in `src/lib/messaging/`:

- **Email**: `getEmailProvider()` returns Resend, SendGrid, or Mock provider based on `EMAIL_PROVIDER` env var
- **SMS**: `getSMSProvider()` returns Twilio, NetGSM (Turkish), or Mock provider based on `SMS_PROVIDER` env var

Both support bulk operations with queue-to-database and provider dispatch.

### Excel Export

`src/lib/export/excel.ts` uses ExcelJS for browser-based downloads. Supports single/multiple sheets, custom column formatting, and domain-specific exports (`exportNeedyPersonsToExcel`, `exportDonationsToExcel`, `exportReportToExcel`).

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
- NGO corporate theme: navy primary, gold accent, semantic colors (success, warning, danger, info)
- Custom shadows: soft, card, elevated, inner-soft

### Language
- All UI text, error messages, toast messages, and form labels: **Turkish**
- Code identifiers (variables, functions, types): **English**
- Database column names: **English**
- Comments: Turkish (but avoid unnecessary comments)

## Testing

Tests live in `src/__tests__/` mirroring the source structure. Framework: Vitest + Testing Library.

**Test suites:**
- `api/auth.test.ts` - Authentication
- `api/donations.test.ts` - Donation API
- `api/needy.test.ts` - Needy persons API
- `components/utils.test.ts` - Component utilities
- `lib/rbac.test.ts` - RBAC system
- `lib/messaging.test.ts` - Messaging system

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

PostgreSQL via Supabase with ~25+ tables. Migrations in `supabase/migrations/` (20+ files, numbered sequentially).

**Key tables:** `needy_persons`, `aids`, `donations`, `volunteers`, `events`, `tasks`, `task_assignments`, `meetings`, `meeting_participants`, `memberships`, `programs`, `program_activities`, `program_beneficiaries`, `profiles`, `organizations`, `bank_accounts`, `messages`, `notifications`, `activity_logs`, `skills`.

**Lookup tables:** `countries`, `cities`, `districts`, `neighborhoods`, `categories`, `partners`.

Row-Level Security (RLS) is enabled on all sensitive tables with tenant isolation via `organization_id`.

**Recent migrations:** membership management, program management, task assignment system, donation boxes/QR, bank accounts, meeting management, RLS tenant policies, storage documents.

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
- `EMAIL_PROVIDER` - Email provider (resend/sendgrid/mock)
- `SMS_PROVIDER` - SMS provider (twilio/netgsm/mock)
- `MERNIS_SERVICE_URL`, `MERNIS_USERNAME`, `MERNIS_PASSWORD` - Turkish ID verification
- `CRON_SECRET` - Cron job authentication
- `NEXTAUTH_SECRET` - JWT secret
- `NEXT_PUBLIC_STORAGE_BUCKET` - Supabase storage bucket name

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Security Considerations

- All API routes must use `withAuth()` or `withOrgAuth()` middleware
- Rate limiting exists per endpoint (see rate limits table above)
- CSP headers with nonce-based inline scripts via `src/lib/security.ts`
- CORS configuration with origin validation in `src/lib/security.ts`
- RLS policies enforce tenant isolation - always include `organization_id` in queries
- Validate all user input with Zod schemas at API boundaries
- `safeJsonParse()` from `@/lib/utils` for safe JSON parsing
- Never commit `.env` files; use `.env.example` as reference

## Deployment

- **Platform**: Vercel
- **Build**: `npm run build` (TypeScript errors block builds)
- **Pre-deploy checklist**: type-check, lint, tests, build all must pass
- **Cron**: `/api/cron` runs daily at 10:00 UTC
- **Monitoring**: Sentry for errors + performance, tunnel via `/monitoring`
- **Sentry config**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **Instrumentation**: `instrumentation.ts`, `instrumentation-client.ts`
