'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { usePurchaseRequestsList } from '@/hooks/queries/use-purchase'
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
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, MoreHorizontal, Eye, Pencil, CheckCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type PurchaseRequest = {
  id: string
  request_number: string | null
  title: string
  merchant_id: string | null
  merchant?: {
    id: string
    name: string
  } | null
  requested_amount: number
  currency: string
  status: string
  requested_date: string
  created_at: string
}

export default function PurchasePage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = usePurchaseRequestsList({
    page,
    status: status || undefined,
  })

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    }
    const statusLabels: Record<string, string> = {
      draft: 'Taslak',
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      completed: 'Tamamlandı',
    }
    return (
      <Badge className={statusColors[status] || 'bg-slate-100'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'TRY' ? '₺' : currency
    return `${symbol}${amount.toLocaleString('tr-TR')}`
  }

  const columns: ColumnDef<PurchaseRequest>[] = [
    {
      accessorKey: 'request_number',
      header: 'Talep No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.request_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Başlık',
      cell: ({ row }) => (
        <p className="font-medium">{row.original.title}</p>
      ),
    },
    {
      accessorKey: 'merchant',
      header: 'Tedarikçi',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.merchant?.name || '-'}</span>
      ),
    },
    {
      accessorKey: 'requested_amount',
      header: 'Talep Tutarı',
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600">
          {formatAmount(row.original.requested_amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'requested_date',
      header: 'Talep Tarihi',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.original.requested_date), 'dd MMM yyyy', { locale: tr })}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
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
            {row.original.status === 'pending' && (
              <DropdownMenuItem className="text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Onayla
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satın Alma Talepleri"
        description="Satın alma taleplerini görüntüleyin ve yönetin"
        icon={ShoppingCart}
        actions={
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Talep
          </Button>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="approved">Onaylandı</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
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
