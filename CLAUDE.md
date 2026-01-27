# CLAUDE.md - AI Development Context

## Project Overview

**Yardım Yönetim Paneli** (Aid Management Panel) is a comprehensive web application for Turkish NGOs and charitable organizations to manage aid operations, donations, volunteers, and beneficiaries.

- **Type:** Dashboard/Management Web Application
- **Language:** TypeScript (strict mode)
- **Framework:** Next.js 16.1.3 with App Router
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **UI Library:** Radix UI primitives (shadcn/ui) with Tailwind CSS
- **State Management:** TanStack Query (server), Zustand (client)
- **Deployment:** Vercel

## Technology Stack

### Frontend
- Next.js 16.1.3 (App Router, Turbopack, Server Components)
- React 18
- TypeScript 5.0
- Tailwind CSS 3.4
- Radix UI + shadcn/ui components
- Framer Motion (animations)
- Recharts (data visualization)

### Backend & Database
- Supabase (PostgreSQL, Auth, Storage)
- Next.js API Routes
- Row Level Security (RLS) on all tables

### State & Data Fetching
- TanStack Query (server state, caching)
- Zustand (client state)
- React Hook Form (form state)
- Zod (validation)

### Monitoring & Analytics
- Sentry (error tracking)
- PostHog (product analytics)
- Vercel Analytics

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages (login, register)
│   ├── api/                     # API routes
│   ├── dashboard/               # Main dashboard modules
│   │   ├── account/            # User account management
│   │   ├── aids/               # Aid distribution management
│   │   ├── applications/       # Aid application tracking
│   │   ├── calendar/           # Event calendar
│   │   ├── donations/          # Donation management (with charity-boxes/)
│   │   ├── events/             # Event management
│   │   ├── finance/            # Financial module
│   │   ├── messages/           # Messaging system
│   │   ├── needy/              # Beneficiary management
│   │   ├── orphans/            # Orphan/student tracking
│   │   ├── purchase/           # Purchase management
│   │   ├── reports/            # Reporting & analytics
│   │   ├── settings/           # System settings
│   │   └── volunteers/         # Volunteer management
│   └── test/                   # Test pages
│
├── components/                   # React components
│   ├── charts/                  # Recharts-based visualizations
│   ├── common/                  # Shared components (EmptyState, Loading)
│   ├── forms/                   # Form components (CharityBoxForm, etc.)
│   ├── layout/                  # Layout components (Header, Sidebar)
│   ├── navigation/              # Navigation components
│   ├── needy/                   # Beneficiary-specific components
│   ├── notification/            # Notification components
│   ├── performance/             # Performance monitoring
│   ├── ui/                      # UI primitives (shadcn/ui - 26 components)
│   └── upload/                  # File upload components
│
├── hooks/                        # Custom React hooks
│   ├── queries/                 # TanStack Query hooks
│   ├── use-auth.ts             # Authentication state
│   ├── use-notifications.ts    # Notification management
│   └── use-toast.ts            # Toast notifications
│
├── lib/                          # Utilities & services
│   ├── supabase/                # Supabase client config
│   ├── validations/             # Zod validation schemas
│   ├── analytics.ts            # PostHog integration
│   ├── api-docs.ts             # OpenAPI spec
│   ├── audit.ts                # Audit logging
│   ├── bulk.ts                 # Bulk operations
│   ├── email.ts                # Email templates
│   ├── errors.ts               # Error handling
│   ├── rbac.tsx                # Role-based access control
│   ├── security.ts             # Security utilities
│   └── utils.ts                # General utilities
│
├── stores/                       # Zustand state stores
├── types/                        # TypeScript definitions
│   └── database.types.ts       # Supabase generated types
└── middleware.ts                 # Next.js middleware (auth)

supabase/
└── migrations/                   # Database migrations (23 files)
```

## Core Modules

### 1. İhtiyaç Sahipleri (Beneficiaries)
- Personal information management
- MERNIS integration for Turkish identity verification
- Family and income tracking
- Status workflow (pending, approved, rejected, etc.)

### 2. Bağış Yönetimi (Donations)
- Cash and in-kind donation tracking
- Donor management
- Campaign management
- Payment status tracking

### 3. Kumbara Sistemi (Charity Boxes) - Recently Added
- Box location management
- Collection tracking
- QR code support
- Collection records with totals

### 4. Gönüllü Sistemi (Volunteers)
- Volunteer registration
- Skill matching
- Task assignment
- Hours tracking

### 5. Yetim Takibi (Orphan/Student Tracking)
- Student information
- Education status
- Sponsor matching
- Guardian information

### 6. Finans (Finance)
- Income/expense tracking
- Budget management
- Financial reports
- Bank account management

### 7. Başvurular (Applications)
- Online application forms
- Approval workflows
- Status tracking
- Document management

## Database Architecture

### Key Tables
- `needy_persons` - Beneficiary information
- `aid_applications` - Aid application tracking
- `donations` - Donation records
- `orphans` - Student/orphan tracking
- `charity_boxes` - Charity box locations
- `charity_box_collections` - Collection records
- `profiles` - User profiles with roles
- `notifications` - User notifications
- `meetings` - Meeting scheduling

### Geographic Hierarchy
- `countries` → `cities` → `districts` → `neighborhoods`

### Security
- Row Level Security (RLS) enabled on all tables
- UUID-based primary keys
- Audit columns (`created_at`, `updated_at`, `created_by`, `updated_by`)
- Soft delete support (`deleted_at`)

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, system settings |
| **Moderator** | CRUD operations, reporting, application approval |
| **User** | Create and edit own records |
| **Viewer** | Read-only access |

Role-based access control is implemented in `src/lib/rbac.tsx`

## Design System

### Color Scheme (Corporate Professional Blue)
```css
--primary: #1e40af (blue-800)
--primary-foreground: #ffffff
--secondary: #f1f5f9 (slate-100)
--accent: #3b82f6 (blue-500)
--muted: #64748b (slate-500)
--destructive: #ef4444 (red-500)
```

### UI Components
- 26 shadcn/ui primitives (Button, Card, Dialog, Form, etc.)
- Custom loading skeletons
- Empty state components
- Toast notifications (Sonner)

## Development Workflow

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
npm run test             # Unit tests (Vitest)
npm run test:ui          # Test UI
npm run test:coverage    # Test coverage report
npm run analyze          # Bundle analyzer
```

### Testing
- Framework: Vitest
- Testing Library: React Testing Library
- Coverage reports available

## TanStack Query Configuration

Default query options (configured in `src/hooks/queries/index.ts`):
- `staleTime`: 10 minutes (600,000ms)
- `gcTime`: 30 minutes (1,800,000ms)
- `refetchOnWindowFocus`: false
- `retry`: 2 attempts

## Important Patterns

### Creating a New Query Hook
```typescript
// src/hooks/queries/use-example.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useExample(id: string) {
  return useQuery({
    queryKey: ['example', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('example_table')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })
}

// Don't forget to export in src/hooks/queries/index.ts
```

### Creating a New Form Component
1. Create Zod schema in `src/lib/validations/`
2. Create form component using `@/components/ui/form` (shadcn/ui + React Hook Form)
3. Use `use-toast` for success/error notifications
4. Call appropriate mutation/query hooks

### Database Migrations
- Place new migrations in `supabase/migrations/`
- Use naming convention: `YYYYMMDDHHmmss_description.sql`
- Run via Supabase CLI or dashboard
- Regenerate types: `supabase gen types typescript --local > src/types/database.types.ts`

## Security Considerations

- All API routes check authentication
- RLS policies enforced at database level
- Input validation via Zod schemas
- Audit logging for sensitive operations
- CORS configured for allowed origins
- MERNIS integration for Turkish identity verification

## Deployment

- **Platform:** Vercel
- **Region:** iad1
- **Automatic deployments** on push to `main`
- **Cron jobs** configured in `vercel.json`
- **Environment variables** managed via Vercel dashboard

## Recent Updates

### Charity Box System (2026-01-26)
- Added `charity_boxes` table migration
- Created `CharityBoxForm` component
- Added `use-charity-boxes` query hook
- Created charity-boxes dashboard module

### Design System Update
- Transitioned from teal/nature theme to corporate blue
- Improved color contrast and accessibility
- Updated across all components

## Key Files to Reference

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Supabase client initialization |
| `src/lib/rbac.tsx` | Role-based access control helpers |
| `src/hooks/queries/index.ts` | TanStack Query configuration |
| `src/middleware.ts` | Next.js middleware for auth |
| `src/types/database.types.ts` | Database type definitions |
| `vercel.json` | Vercel deployment config |

## Notes for AI Assistants

1. **Type Safety:** Always use TypeScript with strict mode. Use generated types from `database.types.ts`
2. **Component Library:** Prefer shadcn/ui components. Build on top of existing primitives
3. **State Management:** Use TanStack Query for server state, Zustand for client state
4. **Forms:** Use React Hook Form + Zod validation pattern
5. **Database Changes:** Always create migrations, never modify schema directly
6. **UI Patterns:** Follow existing component patterns for consistency
7. **Internationalization:** UI is in Turkish. Keep user-facing text in Turkish
8. **Error Handling:** Use toast notifications for user feedback, Sentry for error tracking
