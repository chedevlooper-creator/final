# Kod Kalitesi Rehberi

Bu doküman, Yardım Yönetim Paneli projesinde yüksek kaliteli kod yazmak için best practices ve standartları içerir.

## 📋 Kod Standartları

### TypeScript Kuralları

#### 1. Strict Mode Kullanımı
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 2. Type Imports
```typescript
// ✅ DO: Type imports için 'type' keyword kullan
import type { User, Role } from '@/types/common'
import { myFunction } from '@/utils'

// ❌ DON'T: Regular import for types
import { User, Role } from '@/types/common'
```

#### 3. Interface vs Type
```typescript
// ✅ Interface: Object shapes için
interface User {
  id: string
  name: string
  email: string
}

// ✅ Type: Union types, computed types için
type Status = 'active' | 'inactive' | 'pending'
type UserKeys = keyof User
type PartialUser = Partial<User>
```

#### 4. Generic Types
```typescript
// ✅ DO: Generic types kullan
interface ApiResponse<T> {
  data: T
  error: Error | null
  status: number
}

interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// Kullanımı
type UsersResponse = ApiResponse<User[]>
type DonationsResponse = PaginatedResponse<Donation>
```

### React Best Practices

#### 1. Component Structure
```typescript
// ✅ DO: Organize component structure
'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useNeedyList } from '@/hooks/queries/use-needy'

interface NeedyListProps {
  limit?: number
  filter?: string
}

export function NeedyList({ limit = 10, filter }: NeedyListProps) {
  // 1. Hooks
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isLoading, error } = useNeedyList({ limit })

  // 2. Memoized values
  const filteredData = useMemo(() => {
    if (!filter) return data
    return data?.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [data, filter])

  // 3. Callbacks
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  // 4. Conditional rendering
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      {filteredData?.map(item => (
        <NeedyCard 
          key={item.id}
          data={item}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
```

#### 2. Custom Hooks
```typescript
// ✅ DO: Reusable logic'i custom hook'a taşı
// hooks/use-needy-filter.ts
export function useNeedyFilter(initialFilter?: string) {
  const [filter, setFilter] = useState(initialFilter || '')
  const { data, isLoading } = useNeedyList()

  const filteredData = useMemo(() => {
    if (!filter) return data
    return data?.filter(item => 
      matchesFilter(item, filter)
    )
  }, [data, filter])

  return {
    filter,
    setFilter,
    filteredData,
    isLoading
  }
}

// Kullanımı
function NeedyPage() {
  const { filter, setFilter, filteredData } = useNeedyFilter()
  // ...
}
```

#### 3. Props Destructuring
```typescript
// ✅ DO: Props'u destructuring yap
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### State Management

#### 1. Server State (TanStack Query)
```typescript
// ✅ DO: Server state için React Query kullan
export function useNeedyList(options: QueryOptions) {
  return useQuery({
    queryKey: ['needy', options],
    queryFn: () => fetchNeedyList(options),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  })
}

// ✅ DO: Mutations için useMutation
export function useCreateNeedy() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: NeedyFormValues) => createNeedy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['needy'] })
      toast.success('İhtiyaç sahibi oluşturuldu')
    },
    onError: (error) => {
      ErrorHandler.handle(error, { action: 'createNeedy' })
    }
  })
}
```

#### 2. Client State (Zustand)
```typescript
// ✅ DO: Global client state için Zustand kullan
// stores/ui-store.ts
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  setTheme: (theme) => set({ theme })
}))
```

### Error Handling

#### 1. Custom Error Classes
```typescript
// ✅ DO: Specific error types kullan
class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

class ValidationError extends Error {
  constructor(
    message: string, 
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}
```

#### 2. Error Handler
```typescript
// ✅ DO: Centralized error handler
class ErrorHandler {
  static handle(error: unknown, context?: Record<string, unknown>): string {
    // Log error
    console.error('[Error]', error, context)

    // Specific handling
    if (error instanceof AuthError) {
      return 'Kimlik doğrulama hatası'
    }
    
    if (error instanceof ValidationError) {
      return `Geçersiz veri: ${error.field}`
    }
    
    if (error instanceof NetworkError) {
      return 'Bağlantı hatası'
    }

    // Generic fallback
    return 'Beklenmeyen bir hata oluştu'
  }

  static async logToService(error: Error, context?: Record<string, unknown>) {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    // await sendError({ error, context })
  }
}
```

### Form Validation

#### 1. Zod Schemas
```typescript
// ✅ DO: Type-safe validation için Zod kullan
import { z } from 'zod'

export const needyFormSchema = z.object({
  first_name: z.string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  
  last_name: z.string()
    .min(2, 'Soyad en az 2 karakter olmalı'),
  
  email: z.string()
    .email('Geçersiz e-posta adresi')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^5\d{9}$/, 'Geçersiz telefon numarası')
    .optional(),
  
  identity_number: z.string()
    .length(11, 'TC Kimlik 11 haneli olmalı')
    .refine(validateTC, 'Geçersiz TC Kimlik numarası')
    .optional(),
  
  date_of_birth: z.string()
    .refine((val) => {
      const date = new Date(val)
      const now = new Date()
      const age = now.getFullYear() - date.getFullYear()
      return age >= 18 && age <= 120
    }, 'Yaş 18-120 arası olmalı')
    .optional(),
})

export type NeedyFormValues = z.infer<typeof needyFormSchema>
```

#### 2. Form Handling
```typescript
// ✅ DO: React Hook Form + Zod entegrasyonu
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { needyFormSchema, type NeedyFormValues } from '@/lib/validations/needy'

export function NeedyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<NeedyFormValues>({
    resolver: zodResolver(needyFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    }
  })

  const onSubmit = async (data: NeedyFormValues) => {
    try {
      await createNeedyPerson(data)
      toast.success('Başarılı!')
    } catch (error) {
      ErrorHandler.handle(error, { action: 'createNeedy' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('first_name')} error={errors.first_name?.message} />
      {/* ... */}
    </form>
  )
}
```

### Performance Optimizations

#### 1. React.memo
```typescript
// ✅ DO: Expensive components için memo kullan
export const NeedyCard = memo(function NeedyCard({ 
  data, 
  onSelect 
}: NeedyCardProps) {
  return (
    <div onClick={() => onSelect(data.id)}>
      {/* ... */}
    </div>
  })
})
```

#### 2. useMemo ve useCallback
```typescript
// ✅ DO: Expensive computations için useMemo
const sortedData = useMemo(() => {
  return data?.sort((a, b) => 
    a.name.localeCompare(b.name)
  )
}, [data])

// ✅ DO: Callback functions için useCallback
const handleSelect = useCallback((id: string) => {
  setSelectedId(id)
  // ... other logic
}, [/* dependencies */])
```

#### 3. Code Splitting
```typescript
// ✅ DO: Dynamic import ile code splitting
const Dashboard = dynamic(() => import('./dashboard'))
const Reports = dynamic(() => import('./reports'))
const Settings = dynamic(() => import('./settings'))

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: dynamic(() => import('./dashboard'))
  }
]
```

### Testing

#### 1. Unit Tests
```typescript
// ✅ DO: Pure functions için unit test
import { validateTC } from '@/lib/utils/tc-validator'

describe('validateTC', () => {
  it('should validate correct TC number', () => {
    expect(validateTC('12345678901')).toBe(true)
  })

  it('should reject invalid TC number', () => {
    expect(validateTC('12345678900')).toBe(false)
  })

  it('should reject wrong length', () => {
    expect(validateTC('123456789')).toBe(false)
  })
})
```

#### 2. Component Tests
```typescript
// ✅ DO: Component rendering için test
import { render, screen } from '@testing-library/react'
import { NeedyCard } from './NeedyCard'

describe('NeedyCard', () => {
  const mockData = {
    id: '1',
    first_name: 'Ahmet',
    last_name: 'Yılmaz'
  }

  it('should render needy person name', () => {
    render(<NeedyCard data={mockData} onSelect={() => {}} />)
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
  })

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(<NeedyCard data={mockData} onSelect={onSelect} />)
    
    screen.getByText('Ahmet Yılmaz').click()
    expect(onSelect).toHaveBeenCalledWith('1')
  })
})
```

### Documentation

#### 1. JSDoc Comments
```typescript
/**
 * İhtiyaç sahipleri listesini getirir
 * 
 * @param options - Sorgu seçenekleri
 * @param options.limit - Kayıt sayısı limiti
 * @param options.offset - Kayıt başlangıç index'i
 * @param options.search - Arama terimi
 * @returns Promise<NeedyPerson[]> İhtiyaç sahipleri listesi
 * @throws {NetworkError} Bağlantı hatası durumunda
 * @example
 * ```ts
 * const needy = await getNeedyList({ limit: 10, search: 'Ahmet' })
 * ```
 */
export async function getNeedyList(
  options: QueryOptions
): Promise<NeedyPerson[]> {
  // Implementation
}
```

#### 2. README.md
```markdown
# Component Name

Kısa açıklama.

## Usage

```tsx
import { MyComponent } from '@/components/my-component'

<MyComponent prop1="value" prop2={123} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Açıklama |
| prop2 | number | 0 | Açıklama |

## Examples

### Basic Usage
```tsx
<MyComponent prop1="test" />
```

### Advanced Usage
```tsx
<MyComponent prop1="test" prop2={123} onCallback={() => {}} />
```
```

## 🎯 Code Review Checklist

Her PR (Pull Request) öncesi kontrol et:

### Functionality
- [ ] Özellik requirements'ları karşılıyor
- [ ] Edge cases handle ediliyor
- [ ] Error handling var
- [ ] Loading states var
- [ ] Form validation var (client + server)

### Code Quality
- [ ] TypeScript hataları yok
- [ ] ESLint hataları yok
- [ ] Console'da warning yok
- [ ] 'any' types kullanılmıyor
- [ ] Code duplication yok
- [ ] Fonksiyonlar single responsibility

### Performance
- [ ] Unnecessary re-renders yok
- [ ] useMemo/useCallback gerektiğinde kullanılmış
- [ ] Large components lazy loading
- [ ] Images optimize edilmiş

### Testing
- [ ] Unit tests yazılmış
- [ ] Component tests yazılmış
- [ ] All tests passing
- [ ] Coverage yeterli (>80%)

### Documentation
- [ ] JSDoc comments var
- [ ] README güncellenmiş
- [ ] Changelog güncellenmiş
- [ ] Examples eklenmiş

## 🔧 Tools ve Plugins

### VS Code Extensions
- ESLint
- Prettier
- TypeScript Hero
- Import Cost
- Code Spell Checker
- GitLens

### npm Packages
```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3"
  }
}
```

---

**Son Güncelleme:** 17 Ocak 2026  
**Versiyon:** 1.0.0
