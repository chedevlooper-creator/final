'use client'

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)

import { useState, useCallback } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GraduationCap, Plus, Search, MoreHorizontal, Eye, Pencil, UserPlus, X } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

const ORPHAN_TYPES = [
  { value: 'ihh_orphan', label: 'İHH Yetimi' },
  { value: 'orphan', label: 'Yetim' },
  { value: 'family', label: 'Aile' },
  { value: 'education_scholarship', label: 'Eğitim Bursu' },
]

const ORPHAN_STATUSES = [
  { value: 'preparing', label: 'Hazırlanıyor', variant: 'warning' as const },
  { value: 'assigned', label: 'Atandı', variant: 'info' as const },
  { value: 'active', label: 'Aktif', variant: 'success' as const },
  { value: 'paused', label: 'Duraklatıldı', variant: 'warning' as const },
  { value: 'completed', label: 'Tamamlandı', variant: 'secondary' as const },
]

type Orphan = {
  id: string
  file_number: string | null
  type: string
  first_name: string
  last_name: string
  gender: string | null
  date_of_birth: string | null
  status: string
  photo_url: string | null
  guardian_name: string | null
  created_at: string
  country?: { name: string } | null
  sponsor?: { first_name: string; last_name: string } | null
  school?: { name: string } | null
}

function useOrphansList(filters?: { type?: string; status?: string; search?: string; page?: number }) {
  const supabase = createClient()
  const page = filters?.page || 0
  const limit = 20

  return useQuery({
    queryKey: ['orphans', filters],
    queryFn: async () => {
      let query = supabase
        .from('orphans')
        .select(`
          *,
          country:countries!country_id(name),
          sponsor:sponsors(first_name, last_name),
          school:schools(name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      return { data: data || [], count: count || 0, page, limit }
    },
  })
}

export default function OrphansListPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useOrphansList({
    page,
    type: type || undefined,
    status: status || undefined,
    search: search || undefined,
  })

  // Get status badge with design system colors
  const getStatusBadge = (status: string) => {
    const statusConfig = ORPHAN_STATUSES.find((s) => s.value === status)
    return (
      <Badge variant={statusConfig?.variant || 'secondary'} className="text-xs font-medium">
        {statusConfig?.label || status}
      </Badge>
    )
  }

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearch('')
    setType('')
    setStatus('')
  }, [])

  const hasActiveFilters = Boolean(search || type || status)

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return '-'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const columns: ColumnDef<Orphan>[] = [
    {
      accessorKey: 'photo',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.photo_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
            {row.original.first_name?.[0]}{row.original.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'file_number',
      header: 'Dosya No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.file_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'Ad Soyad',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.gender === 'male' ? 'Erkek' : 'Kız'} • {calculateAge(row.original.date_of_birth)} yaş
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tür',
      cell: ({ row }) => {
        const typeConfig = ORPHAN_TYPES.find((t) => t.value === row.original.type)
        return <span className="text-sm text-muted-foreground">{typeConfig?.label || row.original.type}</span>
      },
    },
    {
      accessorKey: 'country',
      header: 'Ülke',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.country?.name || '-'}</span>
      ),
    },
    {
      accessorKey: 'sponsor',
      header: 'Sponsor',
      cell: ({ row }) => (
        row.original.sponsor ? (
          <span className="text-sm text-foreground">
            {row.original.sponsor.first_name} {row.original.sponsor.last_name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Atanmamış</span>
        )
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="İşlemler">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orphans/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                Görüntüle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orphans/${row.original.id}`}>
                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                Düzenle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-info">
              <UserPlus className="mr-2 h-4 w-4" />
              Sponsor Ata
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Yetimler & Öğrenciler"
          description="Yetim ve öğrenci kayıtlarını yönetin"
          icon={GraduationCap}
          actions={
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Kayıt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni Yetim/Öğrenci Kaydı</DialogTitle>
                  <DialogDescription>
                    Yeni yetim veya öğrenci kaydı oluşturun
                  </DialogDescription>
                </DialogHeader>
                {/* OrphanForm component buraya eklenecek */}
                <div className="py-8 text-center text-muted-foreground">
                  Form bileşeni yükleniyor...
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Ad veya soyad ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-muted/50 focus:bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tür:</span>
              <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {ORPHAN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {ORPHAN_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            )}

            {/* Results Count */}
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data?.count || 0}</span>
              <span>kayıt</span>
              {data?.count && data.count > 20 && (
                <>
                  <span>•</span>
                  <span>Sayfa {page + 1} / {Math.ceil((data?.count || 0) / 20)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pageCount={Math.ceil((data?.count || 0) / 20)}
          pageIndex={page}
          onPageChange={setPage}
        />

        {/* Empty State */}
        {!isLoading && data?.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Kayıt Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters ? 'Filtre kriterlerinize uygun kayıt bulunamadı.' : 'Henüz yetim veya öğrenci kaydı oluşturulmadı.'}
            </p>
            {!hasActiveFilters && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-1" />
                İlk Kaydı Oluştur
              </Button>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
