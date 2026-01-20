# Agent Guidelines for Yardım Yönetim Paneli

This guide helps AI coding agents work effectively in this Next.js 16 + Supabase project.

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run all tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Single test execution
npx vitest src/__tests__/lib/search.test.ts
npx vitest --run search
npx vitest watch src/__tests__/lib/search.test.ts
```

## Tech Stack

Next.js 16 (App Router), React 18, TypeScript (strict), Supabase (PostgreSQL + RLS), React Query, Zustand, React Hook Form + Zod, Tailwind CSS, shadcn/ui, Vitest

Path alias: `@/*` → `./src/*`

## Import Style

```typescript
// Order: external → UI libs → utilities → internal → types
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { NeedyPerson } from '@/types/common'
```

## Naming Conventions

Components: PascalCase (`UserProfile`)
Files: kebab-case (`needy-detail.tsx`, `use-auth.ts`)
Functions/Variables: camelCase (`formatDate`, `userCount`)
Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
Hooks: use prefix (`useAuth`)
Types: Domain-based (`needy.types.ts`, `common.ts`)

## TypeScript Best Practices

```typescript
// Interfaces for object shapes
interface ApiResponse<T> { data: T; error: null }

// Types for unions/primitives
type Status = 'active' | 'inactive' | 'pending'

// Use generics with T prefix
type PaginatedResponse<T> = { data: T[]; count: number }

// Avoid any - use unknown for dynamic data
function process(data: unknown) { ... }
```

## Error Handling

```typescript
import { AuthError, ValidationError, ErrorHandler } from '@/lib/errors'

try {
  await operation()
} catch (error) {
  const message = ErrorHandler.handle(error)
  toast.error(message)
}

if (!user) throw new AuthError('Authentication required')
```

## React Query Patterns

```typescript
import { useGenericQuery, useGenericMutation } from '@/hooks/queries/use-generic-query'

export function useNeedyList(options?: QueryOptions) {
  return useGenericQuery<NeedyPerson[]>({
    queryKey: ['needy', 'list', options],
    queryFn: () => fetchNeedyList(options),
    options: { staleTime: 1000 * 60 * 5 }
  })
}

const mutation = useGenericMutation({
  mutationFn: createNeedyPerson,
  successMessage: 'Kişi başarıyla eklendi'
})
```

## Supabase Usage

```typescript
// Client-side - use singleton
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server-side
import { createServerSupabaseClient } from '@/lib/supabase/server'
const supabase = await createServerSupabaseClient()

// Admin only - never on client!
import { createAdminClient } from '@/lib/supabase/client'
const supabaseAdmin = createAdminClient()
```

## Validation (Zod)

```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter'),
  email: z.string().email('Geçersiz e-posta')
})

type FormValues = z.infer<typeof schema>
```

## Environment Variables

```typescript
import { env } from '@/lib/env'
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
```

## API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from('table').select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature', () => {
  it('should behave as expected', () => {
    const result = functionToTest()
    expect(result).toBe(expected)
  })
})
```

## Important Rules

1. **Never commit secrets** - Service role keys, API keys, passwords
2. **Use Turkish for UI strings** - All user-facing text in Turkish
3. **RLS on Supabase** - Always enable Row Level Security
4. **Type-safe everything** - Avoid `any`, use explicit types
5. **Error handling** - Wrap async operations in try-catch
6. **Validate inputs** - Use Zod schemas for forms
7. **Server-side validation** - Mandatory, client-side is UX only

## Common Patterns

```typescript
// Debounce
import { debounce } from '@/lib/utils'
const debouncedSearch = debounce((q) => setQuery(q), 300)

// Turkish date formatting
import { formatDate } from '@/lib/utils'
formatDate('2026-01-20') // '20 Ocak 2026'

// Toast
import { toast } from 'sonner'
toast.success('İşlem başarılı')
```

## MCP Tools Integration

This project uses oh-my-opencode with MCP tools for enhanced functionality:

### Supabase MCP
- **Purpose:** Run Supabase migrations and database operations
- **Usage:**
  ```bash
  ulw: Supabase migration çalıştır bank_accounts
  ```
- **Capabilities:**
  - Execute SQL migrations
  - Query database tables
  - Create/update/delete tables
  - Manage RLS policies

### Context7 MCP
- **Purpose:** Search official documentation (React, Next.js, Supabase, etc.)
- **Usage:**
  ```bash
  ulw: React Hook Form useMemo nasıl çalışır bak
  ulw: Next.js dynamic import örneği
  ```
- **Capabilities:**
  - Official docs search
  - API reference lookup
  - Code examples

### Grep by Vercel MCP
- **Purpose:** Search GitHub code for examples
- **Usage:**
  ```bash
  ulw: shadcn/ui Button component kodunu bul
  ulw: recharts kullanım örneği
  ```
- **Capabilities:**
  - GitHub code search
  - Open-source project examples
  - Code snippets

### MCP Everything (Local MCP)
- **Purpose:** File system access and command execution
- **Usage:**
  ```bash
  ulw: src/hooks klasörüne dosya listele
  ulw: package.json dosyasını oku
  ulw: README.md içeriğini göster
  ```
- **Capabilities:**
  - Read/write files
  - Execute commands
  - List directories
  - File system operations

## When to Use MCP Tools

### Use Supabase MCP
- Running Supabase migrations
- Creating new database tables
- Updating RLS policies
- Querying database directly

### Use Context7 MCP
- Looking up React API documentation
- Finding Next.js examples
- Supabase reference
- Best practices

### Use Grep by Vercel MCP
- Finding UI component examples
- Searching open-source implementations
- Code patterns

### Use MCP Everything
- Reading/writing files
- Listing directory contents
- File operations

## MCP Integration Examples

### Example 1: Run Supabase Migration
```bash
ulw: Supabase migration çalıştır
  - bank_accounts tablosunu oluştur
  - cash_transactions tablosunu oluştur
  - RLS policies ekle
  - Indexes oluştur
```

### Example 2: Search Documentation
```bash
ulw: React Hook Form useMemo nasıl çalışır bak
  - Context7 MCP kullanarak React docs ara
  - Best practices bul
  - Kod örnekleri göster
```

### Example 3: Search GitHub Code
```bash
ulw: shadcn/ui Button component kodunu bul
  - Grep by Vercel MCP kullanarak
  - GitHub'da shadcn/ui ara
  - Button implementasyonunu göster
```

### Example 4: File Operations
```bash
ulw: src/hooks klasörüne dosya listele
  - MCP Everything kullanarak
  - Tüm .ts dosyalarını göster
  - Dosya sayısı al
```

## Oh-My-OpenCode Integration

This project uses oh-my-opencode with Sisyphus agent orchestration:

### Sisyphus Agent
- Main orchestrator for complex tasks
- Coordinates multiple agents and tools
- Manages background tasks
- Ensures task completion

### Multi-Agent Team
- **Sisyphus**: Main orchestrator (Opus)
- **Oracle**: Architecture and debugging (GPT 5.2)
- **Librarian**: Documentation and codebase search (Claude Sonnet)
- **Frontend Engineer**: UI/UX development (Gemini 3 Pro)
- **Explore**: Fast codebase exploration (Grok Code)

### MCP Tools Available
- Supabase: Remote MCP for database operations
- Context7: Remote MCP for docs search
- Grep by Vercel: Remote MCP for GitHub code search
- MCP Everything: Local MCP for file system access
- Exa: Web search (already configured in oh-my-opencode)

### Skills Available
- supabase-setup: Create Supabase tables and migrations
- nextjs-page: Create Next.js pages and components
- react-query-hook: Create React Query hooks
- zod-schema: Create Zod validation schemas
- api-route: Create Next.js API routes
- finance-backend: Complete finance module backend

### Key Features
- Todo Enforcer: Forces task completion
- Comment Checker: Keeps code clean
- LSP Support: Refactoring and diagnostics
- Context Injection: Auto-loads AGENTS.md and README.md

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── finance/      # Finance module endpoints
│   │   └── ...
│   └── dashboard/       # Dashboard pages
├── components/            # React components
│   ├── ui/             # shadcn/ui components
│   └── forms/          # Form components
├── hooks/
│   ├── queries/         # React Query hooks
│   └── use-*.ts        # Custom hooks
├── lib/
│   ├── supabase/      # Supabase clients
│   ├── validations/    # Zod schemas
│   └── utils.ts        # Utilities
└── types/               # TypeScript types
```

## Development Workflow

1. Use `ulw` (ultrawork) for complex multi-agent tasks
2. MCP tools automatically available through oh-my-opencode
3. Sisyphus orchestrates multiple agents in parallel
4. Background tasks handle expensive operations
5. Todo enforcer ensures completion

## Important Rules (Reminders)

1. **Never commit secrets** - Service role keys, API keys, passwords
2. **Use Turkish for UI strings** - All user-facing text in Turkish
3. **RLS on Supabase** - Always enable Row Level Security
4. **Type-safe everything** - Avoid `any`, use explicit types
5. **Error handling** - Wrap async operations in try-catch
6. **Validate inputs** - Use Zod schemas for forms
7. **Server-side validation** - Mandatory, client-side is UX only
8. **Optimization** - Use Next.js Image, lazy loading, code splitting
