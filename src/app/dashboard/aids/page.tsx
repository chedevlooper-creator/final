'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAidsList } from '@/hooks/queries/use-aids'
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
import { HandHeart, MoreHorizontal, Eye, Pencil } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AID_TYPE_OPTIONS, DELIVERY_STATUS_OPTIONS } from '@/types/linked-records.types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type Aid = {
  id: string
  needy_person_id: string
  application_id: string | null
  aid_type: string
  aid_category: string | null
  description: string | null
  amount: number | null
  currency: string
  quantity: number | null
  unit: string | null
  aid_date: string
  delivery_date: string | null
  delivery_method: string | null
  delivery_status: string
  needy_person?: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
  } | null
}

export default function AidsListPage() {
  const [page, setPage] = useState(0)
  const [aidType, setAidType] = useState<string>('')
  const [deliveryStatus, setDeliveryStatus] = useState<string>('')

  const { data, isLoading } = useAidsList({
    page,
    aid_type: aidType || undefined,
    delivery_status: deliveryStatus || undefined,
  })

  const getDeliveryStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      delivered: 'bg-green-100 text-green-700',
      returned: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-700',
    }
    const statusLabels: Record<string, string> = {
      pending: 'Bekliyor',
      delivered: 'Teslim Edildi',
      returned: 'İade Edildi',
      cancelled: 'İptal',
    }
    return (
      <Badge className={statusColors[status] || 'bg-slate-100'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const formatAmount = (amount: number | null, currency: string) => {
    if (!amount) return '-'
    const currencySymbol = currency === 'TRY' ? '₺' : currency
    return `${currencySymbol}${amount.toLocaleString('tr-TR')}`
  }

  const columns: ColumnDef<Aid>[] = [
    {
      accessorKey: 'needy_person',
      header: 'İhtiyaç Sahibi',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.needy_person?.first_name} {row.original.needy_person?.last_name}
          </p>
          {row.original.needy_person?.phone && (
            <p className="text-xs text-slate-500">{row.original.needy_person.phone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'aid_type',
      header: 'Yardım Türü',
      cell: ({ row }) => {
        const typeConfig = AID_TYPE_OPTIONS.find((t) => t.value === row.original.aid_type)
        return <span>{typeConfig?.label || row.original.aid_type}</span>
      },
    },
    {
      accessorKey: 'amount',
      header: 'Tutar/Miktar',
      cell: ({ row }) => (
        <div>
          {row.original.amount && (
            <span className="font-bold text-emerald-600">
              {formatAmount(row.original.amount, row.original.currency)}
            </span>
          )}
          {row.original.quantity && (
            <span className="text-sm text-slate-600 ml-2">
              {row.original.quantity} {row.original.unit || 'adet'}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'aid_date',
      header: 'Yardım Tarihi',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.original.aid_date), 'dd MMM yyyy', { locale: tr })}
        </span>
      ),
    },
    {
      accessorKey: 'delivery_status',
      header: 'Teslimat Durumu',
      cell: ({ row }) => getDeliveryStatusBadge(row.original.delivery_status),
    },
    {
      id: 'actions',
      cell: () => (
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
        title="Tüm Yardımlar"
        description="Yapılan tüm yardımları görüntüleyin ve yönetin"
        icon={HandHeart}
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={aidType || 'all'} onValueChange={(v) => setAidType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Yardım Türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {AID_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deliveryStatus || 'all'} onValueChange={(v) => setDeliveryStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Teslimat Durumu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {DELIVERY_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
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
