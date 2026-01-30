# AGENTS.md - AI Coding Agent Guide

> Comprehensive guide for AI coding agents working on this codebase

## Project Overview

**Yardım Yönetim Paneli** (Help Management Dashboard) is a comprehensive NGO/charitable organization management system built with Next.js 16, TypeScript, and Supabase. The platform enables NGOs to manage aid operations, donations, volunteers, orphans, financial records, and applications in a single integrated platform.

### Key Features
- **Needy Persons Management**: Track individuals and families requiring assistance
- **Donation Management**: Handle cash, in-kind, zakat, and sacrifice donations
- **Volunteer Coordination**: Manage volunteers, assign tasks, track performance
- **Orphan/Student Tracking**: Educational status monitoring and sponsor matching
- **Financial Management**: Income/expense tracking, budgeting, reports
- **Application Workflow**: Online applications with approval workflows
- **Event Calendar**: Meeting planning, distribution events, reminders
- **Reporting**: Detailed statistics with Excel/PDF export

### Language & Localization
- **Documentation Language**: Turkish (all comments, documentation, UI labels)
- **UI Language**: Turkish
- **Database Field Names**: English with Turkish display labels

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.3 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type-safe development (strict mode) |
| Tailwind CSS | 3.4.19 | Utility-first styling |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database, Auth, Storage |
| @supabase/ssr | Server-side rendering support |
| @supabase/supabase-js | Client SDK |

### State Management & Data Fetching
| Technology | Purpose |
|------------|---------|
| TanStack Query | Server state management, caching |
| Zustand | Client state management |
| React Hook Form | Form state management |
| Zod | Schema validation |

### UI Components
| Technology | Purpose |
|------------|---------|
| Radix UI | Accessible component primitives |
| shadcn/ui | UI component library |
| Lucide React | Icons |
| Framer Motion | Animations |
| Recharts | Charts and graphs |

### Development Tools
| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing |
| ESLint | Linting |
| Sentry | Error tracking |
| PostHog | Analytics (optional) |

---

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (login page)
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── dashboard/            # Dashboard stats
│   │   ├── donations/            # Donation management
│   │   ├── finance/              # Financial operations
│   │   ├── meetings/             # Meeting management
│   │   ├── messages/             # Email/SMS messaging
│   │   ├── needy/                # Needy persons CRUD
│   │   └── ...                   # Other API routes
│   ├── dashboard/                # Main dashboard pages
│   │   ├── account/              # User account settings
│   │   ├── aids/                 # Aid management modules
│   │   ├── applications/         # Application tracking
│   │   ├── calendar/             # Event calendar
│   │   ├── donations/            # Donation modules
│   │   ├── events/               # Event management
│   │   ├── finance/              # Financial modules
│   │   ├── inventory/            # Inventory management
│   │   ├── messages/             # Messaging center
│   │   ├── needy/                # Needy persons list/detail
│   │   ├── orphans/              # Orphan/student tracking
│   │   ├── purchase/             # Purchase management
│   │   ├── reports/              # Reporting module
│   │   ├── settings/             # System settings
│   │   └── volunteers/           # Volunteer management
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Landing page
│
├── src/                          # Source code
│   ├── __tests__/                # Unit tests
│   │   ├── api/                  # API route tests
│   │   ├── components/           # Component tests
│   │   └── lib/                  # Utility tests
│   │
│   ├── app/                      # Server actions
│   │   └── actions/              # Next.js server actions
│   │
│   ├── components/               # React components
│   │   ├── charts/               # Chart components
│   │   ├── common/               # Shared components
│   │   ├── donation-boxes/       # Donation box components
│   │   ├── forms/                # Form components
│   │   ├── inventory/            # Inventory components
│   │   ├── layout/               # Layout components
│   │   ├── needy/                # Needy person components
│   │   ├── navigation/           # Navigation components
│   │   ├── notification/         # Notification components
│   │   ├── performance/          # Performance monitoring
│   │   ├── ui/                   # shadcn/ui primitives
│   │   └── upload/               # File upload components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── mutations/            # TanStack Query mutations
│   │   ├── queries/              # TanStack Query hooks
│   │   ├── use-auth.ts           # Authentication hook
│   │   ├── use-notifications.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                      # Utilities & services
│   │   ├── supabase/             # Supabase clients
│   │   │   ├── client.ts         # Browser client (singleton)
│   │   │   ├── server.ts         # Server client
│   │   │   └── middleware.ts     # Auth middleware
│   │   ├── validations/          # Zod validation schemas
│   │   ├── audit.ts              # Audit logging
│   │   ├── env.ts                # Environment variables
│   │   ├── errors.ts             # Error handling
│   │   ├── rbac.tsx              # Role-based access control
│   │   ├── security.ts           # Security headers
│   │   └── utils.ts              # Utility functions
│   │
│   ├── stores/                   # Zustand stores
│   │   └── ui-store.ts           # UI state management
│   │
│   └── types/                    # TypeScript definitions
│       ├── common.ts             # Shared types
│       ├── database.types.ts     # Database types
│       ├── needy.types.ts        # Needy person types
│       └── ...                   # Other domain types
│
├── supabase/
│   └── migrations/               # Database migrations (22 files)
│
├── docs/                         # Documentation
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest configuration
└── eslint.config.js              # ESLint configuration
```

---

## Essential Commands

### Development
```bash
npm run dev              # Start development server (Turbopack)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
npx tsc --noEmit         # TypeScript type check
```

### Testing
```bash
npm run test             # Run all tests
npm run test:ui          # Test with Vitest UI
npm run test:coverage    # Coverage report

# Run specific test file
npx vitest src/__tests__/api/auth.test.ts

# Run tests matching pattern
npx vitest --run "needy"

# Run specific test by name
npx vitest -t "should create needy person"
```

### Build & Analysis
```bash
npm run analyze          # Bundle analyzer (ANALYZE=true)
```

---

## Code Style Guidelines

### File Naming Conventions
| Type | Pattern | Example |
|------|---------|---------|
| Components | kebab-case | `my-component.tsx` |
| Hooks | camelCase with `use` prefix | `use-my-hook.ts` |
| Utils | kebab-case | `my-utils.ts` |
| Types | kebab-case | `my-types.ts` |
| API Routes | kebab-case | `route.ts` |

### Import Order
```typescript
// 1. External libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 3. Type imports (separate if needed)
import type { MyType } from '@/types/common'

// 4. Relative imports
import { MyComponent } from './my-component'
```

### TypeScript Guidelines
- **Strict mode enabled** - never use `any`
- Use `interface` for object shapes
- Use `type` for unions/intersections
- Nullable types: `string | null` (not `undefined` for DB fields)
- Component props: `interface ComponentProps { ... }`

### Component Structure
```tsx
'use client'  // Only for client components

import { useState } from 'react'
import { toast } from 'sonner'

interface ComponentProps {
  title: string
  variant?: 'primary' | 'secondary'
  onSuccess?: () => void
}

export function Component({ title, variant = 'primary', onSuccess }: ComponentProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    try {
      setLoading(true)
      // logic
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata oluştu'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return <div>{title}</div>
}
```

---

## Data Fetching Patterns

### TanStack Query Hooks

```typescript
// src/hooks/queries/use-entity.ts
export function useEntityList(filters?: EntityFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['entity', 'list', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    staleTime: 10 * 60 * 1000,  // 10 min
    gcTime: 30 * 60 * 1000,     // 30 min
  })
}
```

### Mutations with Cache Updates

```typescript
export function useCreateEntity() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: EntityValues) => {
      const { data, error } = await supabase
        .from('entities')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', 'list'] })
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

## Form Validation Patterns

### Zod Schema Validation

```typescript
// src/lib/validations/entity.ts
import { z } from 'zod'

export const entitySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
})

export type EntityFormValues = z.infer<typeof entitySchema>

// Component usage
const form = useForm<EntityFormValues>({
  resolver: zodResolver(entitySchema),
  defaultValues: { name: '', status: 'active' },
})
```

---

## Supabase Client Usage

### Client Selection Guide

| Context | Import Path | Usage |
|---------|-------------|-------|
| Client Components | `@/lib/supabase/client` | Browser-side data fetching |
| Server Components | `@/lib/supabase/server` | Server-side data fetching |
| Admin Operations | `@/lib/supabase/client` with `createAdminClient()` | Privileged operations (server-only) |

### Client Component Example
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function useEntity() {
  const supabase = createClient() // Singleton pattern
  // ...
}
```

### Server Component Example
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('entities').select()
  // ...
}
```

---

## RBAC (Role-Based Access Control)

### User Roles
| Role | Permissions |
|------|-------------|
| `admin` | Full access, user management, settings |
| `moderator` | CRUD operations, reports, application approval |
| `user` | Create and edit records |
| `viewer` | Read-only access |

### Permission Checking in Components

```typescript
import { usePermissions } from '@/lib/rbac'

const { canRead, canCreate, canUpdate, canDelete } = usePermissions('needy_persons')

// Conditional rendering
{canCreate && <Button>Yeni Ekle</Button>}
```

### API Route Protection

```typescript
import { withAuth } from '@/lib/permission-middleware'

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'create',
    resource: 'needy_persons',
  })
  
  if (!authResult.success) return authResult.response!
  
  // Handle request...
}
```

---

## Error Handling Patterns

### Component Error Handling
```typescript
const handleSubmit = async () => {
  try {
    await createMutation.mutateAsync(values)
  } catch (error) {
    // Error already handled in mutation onError
  }
}
```

### API Route Error Handling
```typescript
export async function POST(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

---

## Testing Guidelines

### Test File Structure
- Located in `src/__tests__/`
- Mirror source structure
- Naming: `*.test.ts` or `*.test.tsx`

### Mocking Pattern
```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => ({ data: mockData, error: null }),
        }),
      }),
    }),
  }),
}))

// Mock Auth middleware
vi.mock('@/lib/permission-middleware', () => ({
  withAuth: vi.fn(() => Promise.resolve({
    success: true,
    user: { id: 'user-1', role: 'admin' },
  })),
}))
```

### Running Tests
```bash
# Single test file
npx vitest src/__tests__/api/needy.test.ts

# Watch mode
npx vitest --watch

# Coverage
npm run test:coverage
```

---

## Environment Variables

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Optional Variables
```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# MERNIS (Identity Verification)
MERNIS_SERVICE_URL=https://tckimlik.nvi.gov.tr/...
MERNIS_USERNAME=your_username
MERNIS_PASSWORD=your_password

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
CRON_SECRET=your-random-cron-secret
NEXTAUTH_SECRET=your-random-secret
```

---

## Security Considerations

### Security Headers
Configured in `next.config.ts` via `securityHeaders`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Content-Security-Policy
- Strict-Transport-Security (production)

### CSP (Content Security Policy)
Nonce-based CSP support available via `buildCSPHeader()` function in `src/lib/security.ts`.

### Authentication Flow
1. Supabase Auth handles authentication
2. Session stored in HTTP-only cookies
3. Middleware validates session on protected routes
4. RBAC checks on both client and server

### Important Security Notes
- **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to client
- Always validate permissions server-side
- Use parameterized queries (Supabase handles this)
- RLS policies active on all tables

---

## Deployment

### Platform
- **Primary**: Vercel
- **Regions**: `iad1` (US East)

### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Pre-Deployment Checklist
1. ✅ Type check: `npx tsc --noEmit`
2. ✅ Lint: `npm run lint`
3. ✅ Tests: `npm run test`
4. ✅ Build test: `npm run build`
5. ✅ Environment variables set in Vercel dashboard
6. ✅ Database migrations applied

### Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## Design System

### Colors (Corporate NGO Theme)
- **Primary**: Corporate Navy Blue (`hsl(222 47% 31%)`)
- **Secondary**: Dark Gray (`hsl(215 25% 27%)`)
- **Accent**: Gold (`hsl(38 92% 40%)`)
- **Success**: Green
- **Warning**: Orange
- **Danger**: Red

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Base Size**: 16px

### Border Radius
- Default: `0.5rem`
- Small: `0.375rem`
- Large: `0.75rem`
- Full: `9999px`

### Shadows
- Card: `0 1px 3px 0 hsl(var(--shadow-color) / 0.05)`
- Elevated: `0 4px 12px 0 hsl(var(--shadow-color) / 0.08)`
- Soft: `0 2px 8px 0 hsl(var(--shadow-color) / 0.06)`

---

## Performance Guidelines

### Caching Strategy
- **Query Cache**: 10 minutes stale time
- **GC Time**: 30 minutes
- **Image Cache**: 24 hours (static assets)

### Optimizations
- Turbopack for development
- Tree shaking enabled
- Image optimization with Next.js Image
- Lazy loading for routes
- Code splitting by route

### Bundle Analysis
```bash
ANALYZE=true npm run build
```

---

## Important Notes

1. **Language**: All code comments and documentation in Turkish
2. **Type Safety**: Never use `any` - strict TypeScript enforced
3. **Forms**: Always use Zod schemas with react-hook-form
4. **Queries**: Create TanStack Query hooks in `src/hooks/queries/`
5. **API Routes**: Use `withAuth` middleware for protected endpoints
6. **RBAC**: Add permission checks for all UI changes
7. **No Comments**: Do not add code comments unless specifically requested
8. **Error Messages**: User-facing messages in Turkish
9. **Date Format**: Turkish locale (DD.MM.YYYY)
10. **Currency**: Turkish Lira (TRY) default

---

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
```bash
npx tsc --noEmit  # Check errors
```

**Supabase connection issues:**
- Check environment variables
- Verify RLS policies
- Check connection limits

**Cache issues:**
- Clear `.next` folder
- Restart dev server

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com)

---

*Last updated: 2026-01-30*
