# AGENTS.md

This file provides guidelines and commands for agentic coding assistants working in this repository.

## Build/Lint Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
```

### Build
```bash
npm run build        # Production build (standalone output for Docker)
npm start            # Start production server
```

### Linting & Type Checking
```bash
npm run lint         # Run ESLint via Next.js
```

## Tech Stack
- **Framework**: Next.js 16 (App Router) with Server Components
- **Language**: TypeScript (strict mode enabled)
- **Database**: Supabase (PostgreSQL) with RLS
- **UI**: shadcn/ui components + Tailwind CSS
- **State**: Zustand (client state) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` alias for all src imports
- External library imports first, then internal imports
- Group imports: 1) React/Next.js, 2) External libraries, 3) Internal imports
```typescript
'use client' // Add at top for client components

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useNeedyList } from '@/hooks/queries/use-needy'
```

### TypeScript
- Strict mode enabled with `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Avoid `any` - use proper types from `@/types/` or define interfaces
- Use type imports: `import type { UserRole } from '@/types/common'`
- For database types, use generated types: `import { Tables } from '@/types/database.types'`
- Define types in appropriate `src/types/` files

### Naming Conventions
- **Files**: kebab-case for components and pages, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase, meaningful names

### Component Structure
- Client components must have `'use client'` at top
- Use function components, prefer `React.forwardRef` for ref forwarding
- Use `cn()` utility for conditional Tailwind classes
```typescript
'use client'
import { cn } from '@/lib/utils'

interface ButtonProps { variant?: 'default' | 'outline'; className?: string }
export function Button({ variant = 'default', className }: ButtonProps) {
  return <button className={cn('base-classes', variant === 'default' && 'default-classes', className)} />
}
```

### Query Hooks (TanStack Query)
- Place query hooks in `src/hooks/queries/`
- Use descriptive names: `useNeedyList`, `useNeedyDetail`, `useCreateNeedy`
- Always provide queryKey arrays for cache invalidation
- Invalidate queries on mutations using `queryClient.invalidateQueries()`

### Forms & Validation
- Use React Hook Form with Zod schema validation
- Define schemas in `src/lib/validations/`
- Use zodResolver from `@hookform/resolvers/zod`
- Form components use shadcn/ui Form components

### Error Handling
- Use centralized error handling from `@/lib/errors`
- Show user-friendly error messages via toast from `sonner`
- Log errors with context using ErrorHandler.handle()

### Styling
- Use Tailwind CSS with utility classes
- Use `cn()` from `@/lib/utils` to merge classes conditionally
- Prefer shadcn/ui components over custom implementations
- Gradient colors: `bg-gradient-to-r from-emerald-500 to-cyan-500`

### Environment Variables
- Use centralized `@/lib/env.ts` for type-safe access
- Never expose secrets (SERVER_ prefixed) to client code
- Public variables must start with `NEXT_PUBLIC_`

### File Organization
- `src/app/` - Next.js App Router pages (grouped with route groups like `(auth)`, `(dashboard)`)
- `src/components/ui/` - shadcn/ui primitive components (don't modify, regenerate via CLI)
- `src/components/common/` - Shared application components
- `src/components/forms/` - Form components
- `src/hooks/queries/` - TanStack Query hooks
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities, Supabase clients, validations
- `src/types/` - TypeScript type definitions
- `src/stores/` - Zustand stores

### Page Patterns
- Use `'use client'` for pages needing interactivity
- Add `export const dynamic = 'force-dynamic'` for pages with dynamic data
- Use `export default function PageName()` for page components

### Turkish Language Support
- This project uses Turkish language for UI text
- User-facing messages should be in Turkish
- Technical comments can be in English or Turkish

### Environment Setup
- Copy `.env.example` to `.env.local` for local development
- Required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never commit `.env.local` files to version control

### Comments
- Keep comments minimal - code should be self-documenting
- Add JSDoc comments for complex utility functions
- Use descriptive variable/function names instead of excessive comments
