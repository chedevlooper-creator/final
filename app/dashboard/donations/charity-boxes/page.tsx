'use client'

import { useState, useCallback } from 'react'
import { useCharityBoxesList, useCharityBoxStats } from '@/hooks/queries/use-charity-boxes'
import { useCreateCharityBox, useDeleteCharityBox } from '@/hooks/queries/use-charity-boxes'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Archive, Plus, MoreHorizontal, Eye, Pencil, Trash2, MapPin, Phone, Mail, X } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CHARITY_BOX_STATUSES, CURRENCIES } from '@/lib/validations/charity-box'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CharityBoxForm } from '@/components/forms/charity-box-form'
import { useToast } from '@/hooks/use-toast'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

type CharityBox = {
  id: string
  box_number: string
  box_code: string | null
  location_name: string
  location_address: string | null
  location_city: string | null
  location_district: string | null
  responsible_person: string | null
  responsible_phone: string | null
  responsible_email: string | null
  current_amount: number
  currency: string
  status: string
  last_collection_date: string | null
  created_at: string
}

export default function CharityBoxesPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBox, setSelectedBox] = useState<CharityBox | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [boxToDelete, setBoxToDelete] = useState<string | null>(null)
  
  const { data, isLoading } = useCharityBoxesList({
    page,
    status: status || undefined,
  })

  const { data: stats } = useCharityBoxStats()
  const createCharityBox = useCreateCharityBox()
  const deleteCharityBox = useDeleteCharityBox()
  const { toast } = useToast()

  // Get status badge with design system colors
  const getStatusBadge = (status: string) => {
    const variantMap: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
      active: 'success',
      inactive: 'secondary',
      full: 'warning',
      collected: 'destructive',
    }
    const statusLabels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      full: 'Dolu',
      collected: 'Toplandı',
    }
    return (
      <Badge variant={variantMap[status] || 'secondary'} className="text-xs font-medium">
        {statusLabels[status] || status}
      </Badge>
    )
  }

  // Clear filters
  const clearFilters = useCallback(() => {
    setStatus('')
  }, [])

  const hasActiveFilters = Boolean(status)

  const formatAmount = (amount: number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return '-'
    const currencyConfig = CURRENCIES.find((c) => c.value === currency)
    try {
      return `${currencyConfig?.symbol || ''}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    } catch (e) {
      return `${currencyConfig?.symbol || ''}${amount}`
    }
  }

  const handleCreateBox = async (data: any) => {
    try {
      await createCharityBox.mutateAsync(data)
      toast({
        title: 'Başarılı',
        description: 'Kumbara başarıyla oluşturuldu.',
      })
      setIsFormOpen(false)
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Kumbara oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteBox = async () => {
    if (!boxToDelete) return
    
    try {
      await deleteCharityBox.mutateAsync(boxToDelete)
      toast({
        title: 'Başarılı',
        description: 'Kumbara başarıyla silindi.',
      })
      setDeleteDialogOpen(false)
      setBoxToDelete(null)
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Kumbara silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  const columns: ColumnDef<CharityBox>[] = [
    {
      accessorKey: 'box_number',
      header: 'Kumbara No',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">
          {row.original.box_number}
        </span>
      ),
    },
    {
      accessorKey: 'location_name',
      header: 'Konum',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {row.original.location_name}
          </p>
          {row.original.location_city && (
            <p className="text-xs text-muted-foreground">
              {row.original.location_city}
              {row.original.location_district && ` / ${row.original.location_district}`}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'responsible_person',
      header: 'Sorumlu Kişi',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.responsible_person && (
            <p className="text-sm text-foreground">{row.original.responsible_person}</p>
          )}
          {row.original.responsible_phone && (
            <a
              href={`tel:${row.original.responsible_phone}`}
              className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-3 w-3 mr-1" />
              {row.original.responsible_phone}
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'current_amount',
      header: 'Mevcut Tutar',
      cell: ({ row }) => (
        <span className="font-bold text-sm text-success">
          {formatAmount(row.original.current_amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'last_collection_date',
      header: 'Son Toplama',
      cell: ({ row }) => {
        try {
          const date = row.original.last_collection_date ? new Date(row.original.last_collection_date) : null
          const isValidDate = date && !isNaN(date.getTime())
          return (
            <span className="text-sm text-muted-foreground">
              {isValidDate ? format(date!, 'dd MMM yyyy', { locale: tr }) : '-'}
            </span>
          )
        } catch (e) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
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
            <DropdownMenuItem onClick={() => setSelectedBox(row.original)}>
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedBox(row.original)}>
              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setBoxToDelete(row.original.id)
                setDeleteDialogOpen(true)
              }}
              className="text-destructive"
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
      <div className="space-y-6">
        <PageHeader
          title="Kumbara Takibi"
          description="Kumbara yönetimini takip edin"
          icon={Archive}
          actions={
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Kumbara
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni Kumbara Oluştur</DialogTitle>
                  <DialogDescription>
                    Yeni kumbara kaydı oluşturun
                  </DialogDescription>
                </DialogHeader>
                <CharityBoxForm
                  onSuccess={(data) => handleCreateBox(data)}
                  isLoading={createCharityBox.isPending}
                />
              </DialogContent>
            </Dialog>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Kumbara</p>
                  <p className="text-2xl font-bold">{stats?.totalBoxes || 0}</p>
                </div>
                <Archive className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktif Kumbara</p>
                  <p className="text-2xl font-bold text-success">{stats?.activeBoxes || 0}</p>
                </div>
                <Archive className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dolu Kumbara</p>
                  <p className="text-2xl font-bold text-warning">{stats?.fullBoxes || 0}</p>
                </div>
                <Archive className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatAmount(stats?.totalAmount, 'TRY')}
                  </p>
                </div>
                <Archive className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {CHARITY_BOX_STATUSES.map((s) => (
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
                className="text-muted-foreground hover:text-foreground ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            )}

            {/* Results Count */}
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data?.count || 0}</span>
              <span>kumbara</span>
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
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Kumbara Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters ? 'Filtre kriterlerinize uygun kumbara bulunamadı.' : 'Henüz kumbara kaydı oluşturulmadı.'}
            </p>
            {!hasActiveFilters && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-1" />
                İlk Kumbarayı Oluştur
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kumbarayı Sil</DialogTitle>
            <DialogDescription>
              Bu kumbara kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleDeleteBox}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteCharityBox.isPending}
            >
              {deleteCharityBox.isPending ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
