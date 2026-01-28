'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNeedyList, useDeleteNeedy } from '@/hooks/queries/use-needy'
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
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Filter, Download, X, AlertCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Tables } from '@/types/database.types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

// Lazy loading large libraries for performance
const exportToExcelLazy = async (data: any[]) => {
  const { exportNeedyPersonsToExcel } = await import('@/lib/export/excel')
  exportNeedyPersonsToExcel(data)
}

// Lazy loading modal - reduces initial bundle size
const AddNeedyModal = dynamic(
  () => import('@/components/needy/AddNeedyModal').then(mod => ({ default: mod.AddNeedyModal })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false
  }
)

type NeedyPerson = Tables<'needy_persons'> & {
  category?: { name: string } | null
  partner?: { name: string } | null
  country?: { name: string } | null
  city?: { name: string } | null
}

// Status badge configuration with design system colors
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary' }> = {
    active: { label: 'Aktif', variant: 'success' },
    inactive: { label: 'Pasif', variant: 'secondary' },
    pending: { label: 'Taslak', variant: 'warning' },
  }
  return config[status] || { label: status, variant: 'secondary' }
}

export default function NeedyListPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Hash routing için modal durumu kontrolü
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#!/crea/relief/needy/add') {
        setIsAddModalOpen(true)
      } else if (hash === '' || !hash.startsWith('#!')) {
        setIsAddModalOpen(false)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Arama filtreleri
  const [idFilter, setIdFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [identityFilter, setIdentityFilter] = useState('')
  const [fileNumberFilter, setFileNumberFilter] = useState('')

  const { data, isLoading } = useNeedyList({
    page,
    search: nameFilter || search || undefined,
    status: status || undefined,
  })

  const deleteMutation = useDeleteNeedy()

  const handleDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Kayıt silindi')
      } catch (error) {
        toast.error('Kayıt silinemedi')
      }
    }
  }

  // Clear all filters
  const clearFilters = useCallback(() => {
    setIdFilter('')
    setNameFilter('')
    setIdentityFilter('')
    setFileNumberFilter('')
    setStatus('')
  }, [])

  // Has active filters
  const hasActiveFilters = Boolean(
    idFilter || nameFilter || identityFilter || fileNumberFilter || status
  )

  const columns: ColumnDef<NeedyPerson>[] = [
    {
      id: 'detail',
      header: '',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/needy/${row.original.id}`}
          prefetch={true}
          aria-label={`${row.original.first_name} ${row.original.last_name} detayını görüntüle`}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Görüntüle">
            <Eye className="h-4 w-4 text-primary" />
          </Button>
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tür',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          İhtiyaç Sahibi
        </span>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'İsim',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {row.original.first_name} {row.original.last_name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category?.name || 'Yetim Ailesi'}
        </span>
      ),
    },
    {
      accessorKey: 'age',
      header: 'Yaş',
      cell: ({ row }) => {
        if (row.original.date_of_birth) {
          const birthDate = new Date(row.original.date_of_birth)
          const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          return <span className="text-sm text-foreground">{age}</span>
        }
        return <span className="text-sm text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: 'nationality',
      header: 'Uyruk',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.country?.name || 'Türkiye'}
        </span>
      ),
    },
    {
      accessorKey: 'identity_number',
      header: 'Kimlik No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.identity_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Cep Telefonu',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.phone ? (
            <a href={`tel:${row.original.phone}`} className="hover:text-primary transition-colors">
              {row.original.phone}
            </a>
          ) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Şehir',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.city?.name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'family_size',
      header: 'Kişi',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.family_size || '-'}
        </span>
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
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => {
        const statusConfig = getStatusConfig(row.original.status)
        return (
          <Badge variant={statusConfig.variant} className="text-xs">
            {statusConfig.label}
          </Badge>
        )
      },
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
            <Link href={`/dashboard/needy/${row.original.id}`} prefetch={true}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                Görüntüle
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/needy/${row.original.id}?edit=true`} prefetch={true}>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                Düzenle
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <PageTransition>
      <div className="space-y-4">
        <PageHeader
          title="İhtiyaç Sahipleri"
          description="Sistemdeki tüm ihtiyaç sahiplerini yönetin"
          icon={Users}
          actions={
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => {
                window.location.hash = '#!/crea/relief/needy/add'
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Yeni Ekle
            </Button>
          }
        />

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft">
          {/* Main Search Row */}
          <div className="flex flex-wrap items-center gap-2 p-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="İsim ara..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-9 h-9 bg-muted/50 focus:bg-background"
              />
            </div>

            {/* Toggle Advanced Filters */}
            <Button
              size="sm"
              variant={isFilterOpen ? 'default' : 'outline'}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                'transition-all duration-200',
                isFilterOpen && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtrele
            </Button>

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

            {/* Export */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToExcelLazy(data?.data || [])}
              disabled={!data?.data?.length || isLoading}
              aria-label="Excel'e aktar"
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>

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

          {/* Advanced Filters */}
          {isFilterOpen && (
            <div className="border-t border-border p-3 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Dosya No"
                  value={fileNumberFilter}
                  onChange={(e) => setFileNumberFilter(e.target.value)}
                  className="w-32 h-9"
                />
                <Input
                  placeholder="Kimlik No"
                  value={identityFilter}
                  onChange={(e) => setIdentityFilter(e.target.value)}
                  className="w-36 h-9"
                />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                    <SelectItem value="pending">Taslak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pageCount={Math.ceil((data?.count || 0) / 20)}
          pageIndex={page}
          totalCount={data?.count}
          onPageChange={setPage}
          onRowClick={(row) => router.push(`/dashboard/needy/${row.id}`)}
        />

        {/* Empty State */}
        {!isLoading && data?.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Kayıt Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters ? 'Filtre kriterilerinize uygun kayıt bulunamadı.' : 'Henüz ihtiyaç sahibi kaydı oluşturulmadı.'}
            </p>
            {!hasActiveFilters && (
              <Button
                onClick={() => {
                  window.location.hash = '#!/crea/relief/needy/add'
                }}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-1" />
                İlk Kaydı Oluştur
              </Button>
            )}
          </div>
        )}

        {/* Add Modal */}
        <AddNeedyModal
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open)
            if (!open) {
              window.history.pushState(null, '', window.location.pathname)
            }
          }}
        />
      </div>
    </PageTransition>
  )
}
