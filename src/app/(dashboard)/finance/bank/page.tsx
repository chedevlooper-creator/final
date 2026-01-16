'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
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
import { CreditCard, Plus, MoreHorizontal, Eye, Pencil } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type BankTransaction = {
  id: string
  transaction_number: string | null
  bank_account: string | null
  transaction_type: string
  amount: number
  currency: string
  description: string | null
  created_at: string
}

export default function FinanceBankPage() {
  const [page, setPage] = useState(0)
  const [transactionType, setTransactionType] = useState<string>('')

  // TODO: Add useBankTransactions hook
  const data = { data: [], count: 0 }
  const isLoading = false

  const getTransactionTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      income: 'bg-green-100 text-green-700',
      expense: 'bg-red-100 text-red-700',
      transfer: 'bg-blue-100 text-blue-700',
    }
    const typeLabels: Record<string, string> = {
      income: 'Gelir',
      expense: 'Gider',
      transfer: 'Transfer',
    }
    return (
      <Badge className={typeColors[type] || 'bg-slate-100'}>
        {typeLabels[type] || type}
      </Badge>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'TRY' ? '₺' : currency
    const color = amount >= 0 ? 'text-emerald-600' : 'text-red-600'
    return (
      <span className={`font-bold ${color}`}>
        {symbol}{Math.abs(amount).toLocaleString('tr-TR')}
      </span>
    )
  }

  const columns: ColumnDef<BankTransaction>[] = [
    {
      accessorKey: 'transaction_number',
      header: 'İşlem No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.transaction_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'bank_account',
      header: 'Banka Hesabı',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.bank_account || '-'}</span>
      ),
    },
    {
      accessorKey: 'transaction_type',
      header: 'İşlem Türü',
      cell: ({ row }) => getTransactionTypeBadge(row.original.transaction_type),
    },
    {
      accessorKey: 'amount',
      header: 'Tutar',
      cell: ({ row }) => formatAmount(row.original.amount, row.original.currency),
    },
    {
      accessorKey: 'description',
      header: 'Açıklama',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.description || '-'}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Tarih',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banka İşlemleri"
        description="Banka işlemlerini görüntüleyin ve yönetin"
        icon={CreditCard}
        actions={
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Yeni İşlem
          </Button>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={transactionType || 'all'} onValueChange={(v) => setTransactionType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="İşlem Türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="income">Gelir</SelectItem>
            <SelectItem value="expense">Gider</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
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
