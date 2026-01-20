# Development Guidelines for Agentic Coding Agents

## Build & Test Commands

### Core Commands
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run analyze` - Analyze bundle size (ANALYZE=true)

### Testing
- `npm test` - Run all tests (Vitest)
- `npm run test:ui` - Run Vitest with UI interface
- `npm run test:coverage` - Generate coverage report
- `npm test -- use-needy.test.ts` - Run specific test file
- `npm test -- -t "useNeedyList"` - Run tests matching pattern
- `npm test -- --reporter=verbose` - Verbose output

### Environment Requirements
- Node.js >= 20.20.0
- npm >= 10.0.0

## Code Style Guidelines

### Imports & Organization
- Group imports: external libraries → internal modules → components
- Use named imports: `import { Button } from '@/components/ui/button'`
- Path aliases: `@/*` maps to `./src/*`
- External libraries first, then internal, then types
- Use `'use client'` directive at top of client components
- Example:
  ```ts
  'use client'
  import { useState } from 'react'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { Button } from '@/components/ui/button'
  import { Tables } from '@/types/database.types'
  ```

### Component Patterns
- Functional components with TypeScript
- Use `'use client'` directive for client components
- Use React.forwardRef for components that need ref forwarding
- Compound component pattern for complex UI (e.g., Form, Tabs)
- Default exports for main components, named exports for utilities

### Styling & UI
- Use Tailwind CSS with cn() utility from `@/lib/utils`
- shadcn/ui components in `src/components/ui/` are base primitives
- Radix UI primitives for accessible headless components
- Use CVA (class-variance-authority) for component variants
- Gradients and animations via tailwindcss-animate, framer-motion
- Color scheme: emerald/cyan gradients for primary actions

### Forms & Validation
- Use react-hook-form with zod validation
- Use @hookform/resolvers for schema integration
- Custom hooks in `src/hooks/queries/` for form mutations
- Field-level validation with Zod schemas in `src/lib/validations/`
- Null handling: use `value={field.value || ''}` for controlled inputs

### State Management
- React Query (@tanstack/react-query) for server state
- Custom hooks in `src/hooks/queries/` using useQuery/useMutation
- Zustand for global client state
- Supabase realtime subscriptions via `src/lib/supabase/subscriptions.ts`

### TypeScript & Types
- Strict TypeScript enabled (tsconfig.json)
- Use Tables<> type from `@/types/database.types` for Supabase tables
- Interface for component props, type for data structures
- Generic types for reusable components: `<TData, TValue>`
- Use proper typing with .nullable(), .optional() for Zod schemas

### Database & API
- Supabase as primary database (client/server separation)
- Server client: `@/lib/supabase/server.ts`
- Browser client: `@/lib/supabase/client.ts` (singleton pattern)
- API routes in `src/app/api/`
- Use admin client (service role) only in server contexts
- Implement RLS policies in Supabase for row-level security

### Error Handling
- Try/catch in async functions
- Use toast notifications (sonner) for user feedback
- Error boundaries: `src/components/error-boundary.tsx`
- Log errors with Sentry (configured in sentry.*.config.ts)
- Return meaningful error messages in mutations

### Naming Conventions
- Components: PascalCase (e.g., DataTable, NeedyForm)
- Files: kebab-case (e.g., data-table.tsx, needy-form.tsx)
- Variables/Functions: camelCase (e.g., formatDate, isLoading)
- Constants: UPPER_SNAKE_CASE for exported constants
- Types/Interfaces: PascalCase (e.g., DataTableProps, NeedyFormValues)
- Hooks: use prefix (e.g., useNeedy, useCreateNeedy)

### File Structure
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
  - `ui/` - shadcn/ui base components
  - `forms/` - Form components
  - `common/` - Shared components
  - `layout/` - Layout components
- `src/hooks/` - Custom React hooks
  - `queries/` - React Query hooks
- `src/lib/` - Utility functions and helpers
  - `validations/` - Zod schemas
  - `supabase/` - Supabase client configs
- `src/types/` - TypeScript type definitions

### Performance & Optimization
- Use React.lazy() for code splitting (not currently implemented)
- Optimize imports with next.config.ts experimental.optimizePackageImports
- Image optimization: use next/image, specify remotePatterns
- Debounce search inputs (debounce() utility in utils.ts)
- Use virtualization for long lists (list-optimization.tsx)
- Next.js image optimization with AVIF/WebP formats
- Webpack tree shaking enabled in next.config.ts

### Testing Best Practices
- Unit tests with Vitest + @testing-library/react
- Test files: `*.test.tsx` or `*.spec.tsx`
- Mock external dependencies (Supabase, API calls)
- Test user interactions with testing-library
- Coverage excludes API routes (configured in vitest.config.ts)

### Security
- Never commit secrets (.env.example for reference)
- Use Supabase RLS for row-level access control
- Security headers in `@/lib/security.ts`
- Input validation with Zod schemas
- Sanitize user inputs
- Admin operations require service role key (server-side only)

### Accessibility
- Use Radix UI primitives for keyboard navigation
- ARIA labels on interactive elements
- Form labels associated with inputs
- Focus management in modals and dialogs
- Error messages visible and descriptive

### Internationalization
- Turkish language in UI strings
- Turkish comments in codebase
- Date/number formatting with tr-TR locale
- Currency format: TRY symbol
- Use format utilities from `@/lib/utils.ts`

### Git Conventions
- Commit messages: conventional format (if enforced)
- Branch naming: feature/, bugfix/, hotfix/
- Never commit .env files, node_modules, .next
- Use .gitignore for generated files

### When Working on This Codebase
1. Always run `npm run lint` after making changes
2. Run `npm test` to ensure tests pass
3. Check TypeScript errors in tsconfig (currently ignoreBuildErrors: true)
4. Follow existing patterns when creating new components/hooks
5. Use existing UI components from shadcn/ui before creating new ones
6. Consult SUPABASE_OPTIMIZATION.md for database queries
7. Reference PERFORMANCE.md for performance guidelines
8. Check SETUP.md for project setup instructions
