'use client'


import { useState } from 'react'
import { useMissionsList } from '@/hooks/queries/use-volunteers'
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
import { Calendar, Plus, MoreHorizontal, Eye, Pencil, CheckCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type Mission = {
  id: string
  mission_number: string | null
  title: string
  volunteer_id: string
  volunteer?: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
  } | null
  mission_date: string
  status: string
  location: string | null
  description: string | null
  created_at: string
}

export default function MissionsPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useMissionsList({
    page,
    status: status || undefined,
  })

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    const statusLabels: Record<string, string> = {
      assigned: 'Atandı',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    }
    return (
      <Badge className={statusColors[status] || 'bg-muted'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const columns: ColumnDef<Mission>[] = [
    {
      accessorKey: 'mission_number',
      header: 'Görev No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.mission_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Görev Başlığı',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.location && (
            <p className="text-xs text-muted-foreground">{row.original.location}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'volunteer',
      header: 'Gönüllü',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.volunteer?.first_name} {row.original.volunteer?.last_name}
          </p>
          {row.original.volunteer?.phone && (
            <p className="text-xs text-muted-foreground">{row.original.volunteer.phone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'mission_date',
      header: 'Görev Tarihi',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.mission_date), 'dd MMM yyyy', { locale: tr })}
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
            {row.original.status !== 'completed' && (
              <DropdownMenuItem className="text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Tamamlandı İşaretle
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
        title="Görevlendirmeler"
        description="Gönüllü görevlendirmelerini görüntüleyin ve yönetin"
        icon={Calendar}
        actions={
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Görevlendirme
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
            <SelectItem value="assigned">Atandı</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
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
