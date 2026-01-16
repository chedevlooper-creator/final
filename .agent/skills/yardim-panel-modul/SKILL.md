---
name: yardim-panel-modul
description: Yardım Paneli'ne yeni modül ekleme. Sayfa, hook, tip, bileşen oluşturma ve menü konfigürasyonu için kullanın.
---

# Yeni Modül Ekleme Skill

## Modül Yapısı

Yeni bir modül eklerken şu dosyaları oluştur:

```
src/
├── app/(dashboard)/
│   └── [modul-adi]/
│       ├── page.tsx           # Liste sayfası
│       ├── new/
│       │   └── page.tsx       # Yeni kayıt sayfası
│       └── [id]/
│           ├── page.tsx       # Detay sayfası
│           └── edit/
│               └── page.tsx   # Düzenleme sayfası
├── components/
│   └── [modul-adi]/
│       ├── list.tsx           # Liste bileşeni
│       ├── form.tsx           # Form bileşeni
│       ├── detail.tsx         # Detay bileşeni
│       └── table.tsx          # Tablo bileşeni
├── hooks/queries/
│   └── use-[modul-adi].ts     # TanStack Query hooks
├── lib/validations/
│   └── [modul-adi].ts         # Zod şemaları
└── types/
    └── [modul-adi].types.ts   # TypeScript tipleri (opsiyonel)
```

## Adım 1: Menüye Ekle

`src/lib/menu-config.ts`:

```typescript
import { YeniIcon } from 'lucide-react'

// menuItems dizisine yeni grup ekle veya mevcut gruba item ekle
{
  title: 'Yeni Modül',
  icon: YeniIcon,
  items: [
    { title: 'Liste', href: '/yeni-modul', icon: YeniIcon },
    { title: 'Yeni Kayıt', href: '/yeni-modul/new', icon: Plus },
  ]
}
```

## Adım 2: Veritabanı Tipi

### Seçenek A: database.types.ts'e ekle
`src/types/database.types.ts` dosyasına tablo tipini ekle.

### Seçenek B: Supabase'den tip üret
```bash
npx supabase gen types typescript --project-id jdrncdqyymlwcyvnnzoj > src/types/database.types.ts
```

### Manuel tip tanımı
```typescript
// src/types/database.types.ts içinde Tables interface'ine ekle
my_table: {
  Row: {
    id: string
    name: string
    status: string
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    name: string
    status?: string
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    name?: string
    status?: string
    created_at?: string
    updated_at?: string
  }
}
```

## Adım 3: Zod Validasyonu

`src/lib/validations/[modul].ts`:

```typescript
import { z } from 'zod'

// Form validasyon şeması
export const myModuleSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter gerekli'),
  email: z.string().email('Geçerli email giriniz').optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['active', 'passive']).default('active'),
  category_id: z.string().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, 'Pozitif değer giriniz').optional(),
  date: z.string().optional(),
})

export type MyModuleFormValues = z.infer<typeof myModuleSchema>

// Filtre şeması
export const myModuleFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'passive']).optional(),
  category_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

export type MyModuleFilterValues = z.infer<typeof myModuleFilterSchema>
```

## Adım 4: Query Hook

`src/hooks/queries/use-[modul].ts`:

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database.types'
import { MyModuleFormValues } from '@/lib/validations/my-module'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export interface MyModuleFilters {
  search?: string
  status?: string
  category_id?: string
  page?: number
  limit?: number
}

// Liste hook
export function useMyModuleList(filters?: MyModuleFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20
  
  return useQuery({
    queryKey: ['my-module', filters],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { data: [], count: 0, page, limit }
      }

      let query = supabase
        .from('my_table')
        .select(`
          *,
          category:categories(id, name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%`)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      const { data, error, count } = await query.range(
        page * limit, 
        (page + 1) * limit - 1
      )
      
      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

// Detay hook
export function useMyModuleDetail(id: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['my-module', id],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return null
      }

      const { data, error } = await supabase
        .from('my_table')
        .select(`
          *,
          category:categories(id, name),
          created_by_user:users!created_by(id, full_name)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Oluşturma hook
export function useCreateMyModule() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (values: MyModuleFormValues) => {
      const { data, error } = await supabase
        .from('my_table')
        .insert(values)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-module'] })
    },
  })
}

// Güncelleme hook
export function useUpdateMyModule() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<MyModuleFormValues> }) => {
      const { data, error } = await supabase
        .from('my_table')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-module', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['my-module'] })
    },
  })
}

// Silme hook
export function useDeleteMyModule() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('my_table')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-module'] })
    },
  })
}

// İstatistik hook
export function useMyModuleStats() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['my-module', 'stats'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { total: 0, active: 0, passive: 0 }
      }

      const { count: total } = await supabase
        .from('my_table')
        .select('*', { count: 'exact', head: true })

      const { count: active } = await supabase
        .from('my_table')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      return {
        total: total || 0,
        active: active || 0,
        passive: (total || 0) - (active || 0),
      }
    },
  })
}
```

## Adım 5: Liste Sayfası

`src/app/(dashboard)/[modul]/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMyModuleList, useMyModuleStats } from '@/hooks/queries/use-my-module'
import { Plus, Search, ListIcon, Eye, Edit, Trash } from 'lucide-react'
import Link from 'next/link'

export default function MyModulePage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(0)

  const { data, isLoading, error } = useMyModuleList({ search, status, page })
  const { data: stats } = useMyModuleStats()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modül Adı"
        description="Modül açıklaması"
        icon={ListIcon}
        actions={
          <Link href="/my-module/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ekle
            </Button>
          </Link>
        }
      />

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Toplam" value={stats?.total || 0} icon={ListIcon} />
        <StatCard title="Aktif" value={stats?.active || 0} icon={ListIcon} />
        <StatCard title="Pasif" value={stats?.passive || 0} icon={ListIcon} />
      </div>

      {/* Arama ve Filtreler */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="passive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tablo */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Veri yüklenirken hata oluştu: {error.message}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Kayıt bulunamadı
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/my-module/${item.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/my-module/${item.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {data && data.count > 20 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Toplam {data.count} kayıt
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * 20 >= data.count}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

## Mevcut Modüller (Referans)

| Modül | Route | Hook Dosyası |
|-------|-------|--------------|
| İhtiyaç Sahipleri | `/needy` | `use-needy.ts` |
| Başvurular | `/applications` | `use-applications.ts` |
| Bağışlar | `/donations` | `use-donations.ts` |
| Yetimler | `/orphans` | `use-orphans.ts` |
| Gönüllüler | `/volunteers` | `use-volunteers.ts` |
| Yardımlar | `/aids` | `use-aids.ts` |
| Finans | `/finance` | `use-finance.ts` |
| Satın Alma | `/purchase` | `use-purchase.ts` |
| Mesajlar | `/messages` | `use-messages.ts` |
| Takvim | `/calendar` | `use-calendar.ts` |
| Etkinlikler | `/events` | `use-events.ts` |
| Raporlar | `/reports` | `use-reports.ts` |

## Checklist

Yeni modül eklerken:

- [ ] Menüye eklendi (`src/lib/menu-config.ts`)
- [ ] Veritabanı tipi tanımlandı (`src/types/database.types.ts`)
- [ ] Zod validasyon şeması oluşturuldu (`src/lib/validations/`)
- [ ] Query hook'ları yazıldı (`src/hooks/queries/`)
- [ ] Liste sayfası oluşturuldu (`src/app/(dashboard)/[modul]/page.tsx`)
- [ ] Detay sayfası oluşturuldu (`src/app/(dashboard)/[modul]/[id]/page.tsx`)
- [ ] Form bileşeni oluşturuldu (`src/components/[modul]/form.tsx`)
- [ ] Yeni kayıt sayfası oluşturuldu (`src/app/(dashboard)/[modul]/new/page.tsx`)
- [ ] Düzenleme sayfası oluşturuldu (`src/app/(dashboard)/[modul]/[id]/edit/page.tsx`)
- [ ] Mock data eklendi (gerekirse) (`src/lib/mock-data/`)
