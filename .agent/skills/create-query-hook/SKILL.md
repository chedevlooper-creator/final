---
name: create-query-hook
description: Bir tablo için standart TanStack Query hookları oluşturur (list, detail, create, update, delete).
---

# 🪝 Create Query Hook Skill

Bu skill, YYP projesinde bir Supabase tablosu için standartlaştırılmış TanStack Query hookları oluşturur.

## Kullanım

Kullanıcıdan aşağıdaki bilgileri al:
1. **Tablo Adı** (örn: "courses", "medical_records")
2. **Hook Adı** (örn: "Courses", "MedicalRecords") - PascalCase
3. **İlişkili Tablolar** (varsa, örn: "category:categories(id,name)")

## Oluşturulan Hook Yapısı

### Dosya: `src/hooks/queries/use-[table-name].ts`

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// 1. List Hook
export function use[HookName]List(filters?: FilterType) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['[table-name]', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('[table-name]')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, count }
    },
    staleTime: 5 * 60 * 1000,
  })
}

// 2. Detail Hook
export function use[HookName]Detail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['[table-name]', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('[table-name]')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id && id !== 'new',
    staleTime: 5 * 60 * 1000,
  })
}

// 3. Create Mutation
export function useCreate[HookName]() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('[table-name]')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Kayıt başarıyla oluşturuldu.')
      queryClient.invalidateQueries({ queryKey: ['[table-name]', 'list'] })
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message)
    },
  })
}

// 4. Update Mutation
export function useUpdate[HookName]() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase
        .from('[table-name]')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      toast.success('Kayıt başarıyla güncellendi.')
      queryClient.invalidateQueries({ queryKey: ['[table-name]', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['[table-name]', 'detail', variables.id] })
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message)
    },
  })
}

// 5. Delete Mutation
export function useDelete[HookName]() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('[table-name]')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      toast.success('Kayıt başarıyla silindi.')
      queryClient.invalidateQueries({ queryKey: ['[table-name]', 'list'] })
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message)
    },
  })
}
```

## Özellikler

### ✅ YYP-Engine Standartları
- Client-side hooks (`'use client'` direktifi)
- Merkezi Supabase client kullanımı
- TanStack Query 5+ pattern'leri
- Proper cache invalidation
- Loading ve error states
- Toast notifications (sonner)

### ✅ Best Practices
- TypeScript tip güvenliği
- Optimistic updates hazır
- Filter desteği
- Pagination desteği (eklenebilir)
- Relations support (select ile)

### ✅ Cache Yönetimi
- `staleTime: 5 minutes` - Gereksiz refetch'leri önle
- `invalidateQueries` - Mutation'lardan sonra cache'i güncelle
- Granular cache keys - Spesifik query'leri hedefle

## İleri Seviye Özellikler

### Pagination Desteği

```typescript
export function use[HookName]List(filters?: FilterType & { page?: number; limit?: number }) {
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  // ...query içinde
  const { data, error, count } = await query
    .range(page * limit, (page + 1) * limit - 1)
}
```

### Relations (Join) Desteği

```typescript
.select(`
  *,
  category:categories(id, name),
  user:users(id, email, full_name)
`)
```

### Optimistic Updates

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['[table-name]', 'list'] })

  const previousData = queryClient.getQueryData(['[table-name]', 'list'])

  queryClient.setQueryData(['[table-name]', 'list'], (old: any) => {
    return { ...old, data: [...old.data, newData] }
  })

  return { previousData }
},
onError: (err, newData, context) => {
  queryClient.setQueryData(['[table-name]', 'list'], context?.previousData)
},
```

## Kullanım Örneği

```typescript
// Component içinde
const { data, isLoading } = useCourseslist({ status: 'active' })
const createMutation = useCreateCourses()
const updateMutation = useUpdateCourses()
const deleteMutation = useDeleteCourses()

// Create
createMutation.mutate({ name: 'Yeni Kurs', ... })

// Update
updateMutation.mutate({ id: '123', values: { name: 'Güncel Kurs' } })

// Delete
deleteMutation.mutate('123')
```

---
*Bu skill YYP-Engine standartlarını ve TanStack Query best practices'lerini takip eder.*
