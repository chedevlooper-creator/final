'use client'


import { useState } from 'react'
import { useSMSList } from '@/hooks/queries/use-messages'
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
import { MessageSquare, MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type SMS = {
  id: string
  phone: string
  message: string
  status: string
  sent_at: string | null
  delivered_at: string | null
  error_message: string | null
  recipient_name: string | null
}

export default function SMSPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useSMSList({
    page,
    status: status || undefined,
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      pending: {
        label: 'Bekliyor',
        color: 'bg-warning/10 text-warning',
        icon: null,
      },
      sent: {
        label: 'Gönderildi',
        color: 'bg-info/10 text-info',
        icon: CheckCircle,
      },
      delivered: {
        label: 'Teslim Edildi',
        color: 'bg-success/10 text-success',
        icon: CheckCircle,
      },
      failed: {
        label: 'Başarısız',
        color: 'bg-destructive/10 text-destructive',
        icon: XCircle,
      },
    }

    const config = statusConfig[status] || { label: status, color: 'bg-slate-100', icon: null }
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<SMS>[] = [
    {
      accessorKey: 'phone',
      header: 'Telefon',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.phone}</p>
          {row.original.recipient_name && (
            <p className="text-xs text-muted-foreground">{row.original.recipient_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'message',
      header: 'Mesaj',
      cell: ({ row }) => (
        <p className="text-sm max-w-md truncate">{row.original.message}</p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'sent_at',
      header: 'Gönderim Tarihi',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.sent_at
            ? format(new Date(row.original.sent_at), 'dd MMM yyyy HH:mm', { locale: tr })
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'delivered_at',
      header: 'Teslim Tarihi',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.delivered_at
            ? format(new Date(row.original.delivered_at), 'dd MMM yyyy HH:mm', { locale: tr })
            : '-'}
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
              Detayları Görüntüle
            </DropdownMenuItem>
            {row.original.status === 'failed' && (
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Tekrar Gönder
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
        title="SMS Yönetimi"
        description="Gönderilen SMS mesajlarını görüntüleyin ve yönetin"
        icon={MessageSquare}
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="sent">Gönderildi</SelectItem>
            <SelectItem value="delivered">Teslim Edildi</SelectItem>
            <SelectItem value="failed">Başarısız</SelectItem>
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
