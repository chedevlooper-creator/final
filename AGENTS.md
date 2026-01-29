# AGENTS.md - AI Coding Agent Guide

> Guide for AI coding agents working on this codebase

## Project Overview
**Yardım Yönetim Paneli** - NGO/charitable organization management system (Next.js 16, TypeScript, Supabase). Documentation and comments are in **Turkish**.

## Essential Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
npx tsc --noEmit         # TypeScript type check
```

### Testing
```bash
npm run test             # Run all tests
npm run test:ui          # Test UI interface
npm run test:coverage    # Coverage report

# Run single test file
npx vitest src/__tests__/api/auth.test.ts

# Run tests matching pattern
npx vitest --run "needy"

# Run specific test by name
npx vitest -t "should create needy person"
```

## Code Style Guidelines

### File Naming
- Components: `my-component.tsx` (kebab-case)
- Hooks: `use-my-hook.ts` (camelCase with use prefix)
- Utils: `my-utils.ts` (kebab-case)
- Types: `my-types.ts` (kebab-case)

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
- Strict mode enabled
- Use `interface` for object shapes, `type` for unions/intersections
- Component props: `interface ComponentProps { ... }`
- Avoid `any` - use `unknown` with type guards instead
- Nullable types: `string | null` (not `string | undefined` for database fields)

### Component Structure
```tsx
'use client'  // Only for client components

import { useState } from 'react'

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

### Error Handling Pattern
```typescript
// In hooks/mutations
export function useCreateNeedy() {
  return useMutation({
    mutationFn: async (values: NeedyValues) => {
      const { data, error } = await supabase
        .from('needy_persons')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
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

// In components
const handleSubmit = async () => {
  try {
    await createMutation.mutateAsync(values)
  } catch (error) {
    // Error already handled in mutation onError
  }
}
```

### Query Hooks Pattern
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
    gcTime: 30 * 60 * 1000,    // 30 min
  })
}
```

### Form Validation Pattern
```typescript
// src/lib/validations/entity.ts
import { z } from 'zod'

export const entitySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
})

export type EntityFormValues = z.infer<typeof entitySchema>

// Usage in component
const form = useForm<EntityFormValues>({
  resolver: zodResolver(entitySchema),
  defaultValues: { name: '', status: 'active' },
})
```

### Supabase Client Selection
- **Client components:** `import { createClient } from '@/lib/supabase/client'`
- **Server components:** `import { createServerSupabaseClient } from '@/lib/supabase/server'`
- **Admin operations:** Use service role key (server-side only)

### RBAC (Role-Based Access Control)
```typescript
// Check permissions in API routes
import { withAuth } from '@/lib/permission-middleware'

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, {
    requiredPermission: 'read',
    resource: 'needy_persons',
  })
  if (!authResult.success) return authResult.response!
  // ... handle request
}

// Check permissions in components
import { usePermissions } from '@/hooks/use-permissions'

const { canRead } = usePermissions('needy_persons')
```

### UI Components
- Use shadcn/ui primitives from `@/components/ui/*`
- Tailwind classes: use `cn()` utility for conditional classes
- Icons: `import { IconName } from 'lucide-react'`
- Toasts: `import { toast } from 'sonner'`

## Important Notes

1. **Language:** Turkish comments and documentation throughout
2. **Type Safety:** Never use `any` - strict TypeScript enforced
3. **Forms:** Always use Zod schemas with react-hook-form
4. **Queries:** Create TanStack Query hooks in `src/hooks/queries/`
5. **API Routes:** Use `withAuth` middleware for protected endpoints
6. **RBAC:** Add permission checks for all UI changes
7. **No Comments:** Do not add code comments unless specifically requested

## Environment
- Node.js: >=22.0.0
- npm: >=10.0.0
- Next.js: 16.1.3 (App Router)
- TypeScript: Strict mode enabled
