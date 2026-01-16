---
name: yardim-panel-bilesenler
description: Yardım Paneli bileşen oluşturma kalıpları. shadcn/ui kullanımı, form bileşenleri, TanStack Query hooks ve React Hook Form + Zod validasyonu için kullanın.
---

# Bileşen Oluşturma Skill

## shadcn/ui Bileşenleri

Projede 27 shadcn/ui bileşeni mevcut: `src/components/ui/`

### Mevcut Bileşenler
Button, Card, Dialog, Form, Input, Select, Table, Tabs, Calendar, Command, Popover, Toast, Avatar, Badge, Checkbox, Dropdown, Label, Radio, Scroll Area, Separator, Sheet, Skeleton, Textarea, Tooltip, Collapsible, Sonner, Switch

### Yeni shadcn Bileşeni Ekleme
```bash
npx shadcn@latest add [bileşen-adı]
```

## Form Bileşeni Kalıbı

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter gerekli'),
  email: z.string().email('Geçerli email giriniz'),
  phone: z.string().optional(),
  status: z.enum(['active', 'passive']).default('active'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface MyFormProps {
  initialValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => Promise<void>
  isLoading?: boolean
}

export function MyForm({ initialValues, onSubmit, isLoading }: MyFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'active',
      description: '',
      ...initialValues,
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values)
      toast.success('Kayıt başarıyla oluşturuldu')
      form.reset()
    } catch (error) {
      toast.error('Bir hata oluştu')
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input placeholder="Ad giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durum</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="passive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Açıklama giriniz" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                İsteğe bağlı bir açıklama ekleyebilirsiniz.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Temizle
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

## TanStack Query Hook Kalıbı

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database.types'

// Mock data kontrolü
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export interface MyEntityFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
}

// Liste Hook
export function useMyEntityList(filters?: MyEntityFilters) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = filters?.limit || 20

  return useQuery({
    queryKey: ['my-entity', filters],
    queryFn: async () => {
      // Mock data desteği
      if (USE_MOCK_DATA) {
        // Mock data'dan döndür
        return { data: [], count: 0, page, limit }
      }

      // Gerçek Supabase sorgusu
      let query = supabase
        .from('my_table')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Arama
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%`)
      }

      // Filtreleme
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // Pagination
      const { data, error, count } = await query.range(
        page * limit, 
        (page + 1) * limit - 1
      )

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

// Detay Hook
export function useMyEntityDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['my-entity', id],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Mock data'dan detay döndür
        return null
      }

      const { data, error } = await supabase
        .from('my_table')
        .select(`
          *,
          relation:related_table(id, name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Oluşturma Hook
export function useCreateMyEntity() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (values: Partial<Tables<'my_table'>>) => {
      const { data, error } = await supabase
        .from('my_table')
        .insert(values)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-entity'] })
    },
  })
}

// Güncelleme Hook
export function useUpdateMyEntity() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Tables<'my_table'>> }) => {
      const { data, error } = await supabase
        .from('my_table')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-entity', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['my-entity'] })
    },
  })
}

// Silme Hook
export function useDeleteMyEntity() {
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
      queryClient.invalidateQueries({ queryKey: ['my-entity'] })
    },
  })
}
```

## Sayfa Bileşeni Kalıbı

```tsx
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Search } from 'lucide-react'
import { useMyEntityList } from '@/hooks/queries/use-my-entity'
import Link from 'next/link'

export default function MyPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, error } = useMyEntityList({ search })

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Sayfa Başlığı"
        description="Sayfa açıklaması buraya gelecek"
        icon={Users}
        actions={
          <Link href="/my-page/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ekle
            </Button>
          </Link>
        }
      />

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Toplam Kayıt" 
          value={data?.count || 0} 
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        {/* Diğer stat kartları */}
      </div>

      {/* Arama ve Filtreler */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Filtre butonları */}
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
              Veri yüklenirken hata oluştu
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/my-page/${item.id}`}>
                        <Button variant="ghost" size="sm">Detay</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Boş durum */}
          {!isLoading && data?.data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Kayıt bulunamadı
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

## Ortak Bileşenler

### PageHeader Kullanımı
```tsx
import { PageHeader } from '@/components/common/page-header'
import { Users } from 'lucide-react'

<PageHeader
  title="Başlık"
  description="Açıklama"
  icon={Users}
  actions={<Button>Aksiyon</Button>}
/>
```

### StatCard Kullanımı
```tsx
import { StatCard } from '@/components/common/stat-card'
import { Users } from 'lucide-react'

<StatCard 
  title="Toplam" 
  value={100} 
  icon={Users}
  trend={{ value: 12, isPositive: true }}
  description="Son 30 günde"
/>
```

### Dialog Kullanımı
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Aç</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Başlık</DialogTitle>
      <DialogDescription>Açıklama</DialogDescription>
    </DialogHeader>
    {/* İçerik */}
  </DialogContent>
</Dialog>
```

## Stil Kuralları

- **Gradient renk paleti:** emerald → cyan
- **Tema:** Dark sidebar, light content
- **Tailwind sınıfları:** Spacing için `space-y-*`, `gap-*`
- **Responsive:** `md:`, `lg:`, `xl:` prefix'leri
- **Hover efektleri:** `hover:bg-accent`, `transition-colors`
- **Gölgeler:** `shadow-sm`, `shadow-md`

## İkon Kullanımı

```tsx
import { Users, Plus, Search, Edit, Trash, Eye } from 'lucide-react'

// Boyutlandırma
<Users className="h-4 w-4" />  // Küçük
<Users className="h-5 w-5" />  // Normal
<Users className="h-6 w-6" />  // Büyük

// Renkler
<Users className="text-muted-foreground" />
<Users className="text-primary" />
<Users className="text-emerald-500" />
```
