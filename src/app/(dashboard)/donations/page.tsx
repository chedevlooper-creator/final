'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
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
import { DollarSign, Plus, MoreHorizontal, Eye, Pencil, Receipt } from 'lucide-react'
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

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    const statusLabels: Record<string, string> = {
      pending: 'Bekliyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    }
    return (
      <Badge className={statusColors[status] || 'bg-slate-100'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    const currencyConfig = CURRENCIES.find((c) => c.value === currency)
    return `${currencyConfig?.symbol || ''}${amount.toLocaleString('tr-TR')}`
  }

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: 'donation_number',
      header: 'Bağış No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.donation_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'donor_name',
      header: 'Bağışçı',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.donor_name || 'Anonim'}
          </p>
          {row.original.donor_phone && (
            <p className="text-xs text-slate-500">{row.original.donor_phone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'donation_type',
      header: 'Bağış Türü',
      cell: ({ row }) => {
        const typeConfig = DONATION_TYPES.find((t) => t.value === row.original.donation_type)
        return <span>{typeConfig?.label || row.original.donation_type}</span>
      },
    },
    {
      accessorKey: 'amount',
      header: 'Tutar',
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600">
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_method',
      header: 'Ödeme Yöntemi',
      cell: ({ row }) => {
        const methodConfig = PAYMENT_METHODS.find((m) => m.value === row.original.payment_method)
        return <span className="text-sm">{methodConfig?.label || '-'}</span>
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
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: tr })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Receipt className="mr-2 h-4 w-4" />
              Makbuz Oluştur
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bağışlar"
        description="Tüm bağışları yönetin"
        icon={DollarSign}
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
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

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={donationType || 'all'} onValueChange={(v) => setDonationType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Bağış Türü" />
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
        <Select value={paymentStatus || 'all'} onValueChange={(v) => setPaymentStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tablo */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pageCount={Math.ceil((data?.count || 0) / 20)}
        pageIndex={page}
        onPageChange={setPage}
      />
    </div>
  )
}
