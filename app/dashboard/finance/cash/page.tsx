'use client'


import { useState, useCallback } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Banknote, Plus, MoreHorizontal, Eye, Pencil, Trash2, X } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useCashTransactions, useDeleteFinanceTransaction, FinanceTransaction } from '@/hooks/queries/use-finance'
import { toast } from 'sonner'
import { CashTransactionForm } from '@/components/forms/cash-transaction-form'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

export default function FinanceCashPage() {
  const [page, setPage] = useState(0)
  const [transactionType, setTransactionType] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useCashTransactions({
    type: transactionType as 'income' | 'expense' | undefined,
    page,
    limit: 20,
  })

  const deleteMutation = useDeleteFinanceTransaction()

  const handleDelete = async (id: string) => {
    if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('İşlem silindi')
      } catch (error) {
        toast.error('İşlem silinemedi')
      }
    }
  }

  // Get transaction type badge with design system colors
  const getTransactionTypeBadge = (type: string) => {
    const variantMap: Record<string, 'success' | 'destructive' | 'info' | 'secondary'> = {
      income: 'success',
      expense: 'destructive',
      transfer: 'info',
    }
    const typeLabels: Record<string, string> = {
      income: 'Gelir',
      expense: 'Gider',
      transfer: 'Transfer',
    }
    return (
      <Badge variant={variantMap[type] || 'secondary'} className="text-xs font-medium">
        {typeLabels[type] || type}
      </Badge>
    )
  }

  const formatAmount = (amount: number, currency: string, type: string) => {
    const symbol = currency === 'TRY' ? '₺' : currency
    const colorClass = type === 'income' ? 'text-success' : 'text-destructive'
    const prefix = type === 'income' ? '+' : '-'
    return (
      <span className={`font-bold text-sm ${colorClass}`}>
        {prefix}{symbol}{Math.abs(amount).toLocaleString('tr-TR')}
      </span>
    )
  }

  // Clear filters
  const clearFilters = useCallback(() => {
    setTransactionType('')
  }, [])

  const hasActiveFilters = Boolean(transactionType)

  const columns: ColumnDef<FinanceTransaction>[] = [
    {
      accessorKey: 'transaction_number',
      header: 'İşlem No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.transaction_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'İşlem Türü',
      cell: ({ row }) => getTransactionTypeBadge(row.original.type),
    },
    {
      accessorKey: 'amount',
      header: 'Tutar',
      cell: ({ row }) => formatAmount(row.original.amount, row.original.currency, row.original.type),
    },
    {
      accessorKey: 'description',
      header: 'Açıklama',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Tarih',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
        </span>
      ),
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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
              Düzenle
            </DropdownMenuItem>
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
      <div className="space-y-6">
        <PageHeader
          title="Kasa İşlemleri"
          description="Kasa işlemlerini görüntüleyin ve yönetin"
          icon={Banknote}
          actions={
            <Button
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni İşlem
            </Button>
          }
        />

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tür:</span>
              <Select value={transactionType || 'all'} onValueChange={(v) => setTransactionType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
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
              <span>işlem</span>
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
              <Banknote className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">İşlem Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? 'Filtre kriterlerinize uygun işlem bulunamadı.' : 'Henüz kasa işlemi oluşturulmadı.'}
            </p>
          </div>
        )}
      </div>

      {/* New Transaction Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Kasa İşlemi</DialogTitle>
            <DialogDescription>
              Yeni bir kasa işlemi oluşturun. Tüm gerekli alanları doldurun.
            </DialogDescription>
          </DialogHeader>
          <CashTransactionForm onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
