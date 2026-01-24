'use client'


import { useState, useCallback } from 'react'
import { useDonationsList } from '@/hooks/queries/use-donations'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, MoreHorizontal, Eye, Pencil, Receipt, X } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DONATION_TYPES, PAYMENT_METHODS, CURRENCIES } from '@/lib/validations/donation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { DonationForm } from '@/components/forms/donation-form'
import { cn } from '@/lib/utils'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

type Donation = {
  id: string
  donation_number: string | null
  donor_name: string | null
  donor_phone: string | null
  donation_type: string
  amount: number
  currency: string
  payment_method: string | null
  payment_status: string
  created_at: string
  category?: { id: string; name: string } | null
}

export default function DonationsListPage() {
  const [page, setPage] = useState(0)
  const [donationType, setDonationType] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useDonationsList({
    page,
    donation_type: donationType || undefined,
    payment_status: paymentStatus || undefined,
  })

  // Get payment status badge with design system colors
  const getPaymentStatusBadge = (status: string) => {
    const variantMap: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'destructive',
    }
    const statusLabels: Record<string, string> = {
      pending: 'Bekliyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    }
    return (
      <Badge variant={variantMap[status] || 'secondary'} className="text-xs font-medium">
        {statusLabels[status] || status}
      </Badge>
    )
  }

  // Clear filters
  const clearFilters = useCallback(() => {
    setDonationType('')
    setPaymentStatus('')
  }, [])

  const hasActiveFilters = Boolean(donationType || paymentStatus)

  const formatAmount = (amount: number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return '-'
    const currencyConfig = CURRENCIES.find((c) => c.value === currency)
    try {
      return `${currencyConfig?.symbol || ''}${amount.toLocaleString('tr-TR')}`
    } catch (e) {
      return `${currencyConfig?.symbol || ''}${amount}`
    }
  }

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: 'donation_number',
      header: 'Bağış No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.donation_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'donor_name',
      header: 'Bağışçı',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {row.original.donor_name || 'Anonim'}
          </p>
          {row.original.donor_phone && (
            <a
              href={`tel:${row.original.donor_phone}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {row.original.donor_phone}
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'donation_type',
      header: 'Bağış Türü',
      cell: ({ row }) => {
        const typeConfig = DONATION_TYPES.find((t) => t.value === row.original.donation_type)
        return <span className="text-sm text-muted-foreground">{typeConfig?.label || row.original.donation_type}</span>
      },
    },
    {
      accessorKey: 'amount',
      header: 'Tutar',
      cell: ({ row }) => (
        <span className="font-bold text-sm text-success">
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_method',
      header: 'Ödeme Yöntemi',
      cell: ({ row }) => {
        const methodConfig = PAYMENT_METHODS.find((m) => m.value === row.original.payment_method)
        return <span className="text-sm text-muted-foreground">{methodConfig?.label || '-'}</span>
      },
    },
    {
      accessorKey: 'payment_status',
      header: 'Durum',
      cell: ({ row }) => getPaymentStatusBadge(row.original.payment_status),
    },
    {
      accessorKey: 'created_at',
      header: 'Tarih',
      cell: ({ row }) => {
        try {
          const date = row.original.created_at ? new Date(row.original.created_at) : null
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
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="İşlemler">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
              Makbuz Oluştur
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
          title="Bağışlar"
          description="Tüm bağışları yönetin"
          icon={DollarSign}
          actions={
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Bağış
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yeni Bağış Kaydı</DialogTitle>
                  <DialogDescription>
                    Yeni bağış kaydı oluşturun
                  </DialogDescription>
                </DialogHeader>
                <DonationForm onSuccess={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          }
        />

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tür:</span>
              <Select value={donationType || 'all'} onValueChange={(v) => setDonationType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {DONATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select value={paymentStatus || 'all'} onValueChange={(v) => setPaymentStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
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
              <span>bağış</span>
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
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Bağış Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters ? 'Filtre kriterlerinize uygun bağış bulunamadı.' : 'Henüz bağış kaydı oluşturulmadı.'}
            </p>
            {!hasActiveFilters && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-1" />
                İlk Bağışı Oluştur
              </Button>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
