'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useApplicationsList } from '@/hooks/queries/use-applications'
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
import { FileText, Plus, MoreHorizontal, Eye, Pencil, CheckCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { APPLICATION_TYPES, APPLICATION_STATUSES, PRIORITY_LEVELS } from '@/lib/validations/application'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ApplicationForm } from '@/components/forms/application-form'

type Application = {
  id: string
  application_number: string | null
  application_type: string
  status: string
  priority: string | null
  requested_amount: number | null
  created_at: string
  needy_person?: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
  } | null
}

export default function ApplicationsListPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')
  const [applicationType, setApplicationType] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useApplicationsList({
    page,
    status: status || undefined,
    application_type: applicationType || undefined,
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = APPLICATION_STATUSES.find((s) => s.value === status)
    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      orange: 'bg-orange-100 text-orange-700',
      gray: 'bg-slate-100 text-slate-700',
    }
    return (
      <Badge className={colorClasses[statusConfig?.color || 'gray']}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null
    const priorityConfig = PRIORITY_LEVELS.find((p) => p.value === priority)
    const colorClasses: Record<string, string> = {
      gray: 'bg-slate-100 text-slate-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
    }
    return (
      <Badge variant="outline" className={colorClasses[priorityConfig?.color || 'gray']}>
        {priorityConfig?.label || priority}
      </Badge>
    )
  }

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: 'application_number',
      header: 'Başvuru No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.application_number || '-'}
        </span>
      ),
    },
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
      accessorKey: 'application_type',
      header: 'Başvuru Türü',
      cell: ({ row }) => {
        const typeConfig = APPLICATION_TYPES.find((t) => t.value === row.original.application_type)
        return <span>{typeConfig?.label || row.original.application_type}</span>
      },
    },
    {
      accessorKey: 'requested_amount',
      header: 'Talep Tutarı',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.requested_amount
            ? `₺${row.original.requested_amount.toLocaleString('tr-TR')}`
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Öncelik',
      cell: ({ row }) => getPriorityBadge(row.original.priority),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'created_at',
      header: 'Tarih',
      cell: ({ row }) => {
        try {
          const date = row.original.created_at ? new Date(row.original.created_at) : null
          return (
            <span className="text-sm text-slate-500">
              {date && !isNaN(date.getTime()) ? format(date, 'dd MMM yyyy', { locale: tr }) : '-'}
            </span>
          )
        } catch (e) {
          return <span className="text-sm text-slate-500">-</span>
        }
      },
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
            <Link href={`/applications/${row.original.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Görüntüle
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem className="text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              Onayla
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yardım Başvuruları"
        description="Tüm yardım başvurularını yönetin"
        icon={FileText}
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Başvuru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Yardım Başvurusu</DialogTitle>
                <DialogDescription>
                  Yeni yardım başvurusu oluşturun
                </DialogDescription>
              </DialogHeader>
              <ApplicationForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={applicationType || 'all'} onValueChange={(v) => setApplicationType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Başvuru Türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {APPLICATION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
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
