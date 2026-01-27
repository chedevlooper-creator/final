'use client'


import { useState } from 'react'
import { useVolunteersList } from '@/hooks/queries/use-volunteers'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VolunteerForm } from '@/components/forms/volunteer-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Plus, Search, MoreHorizontal, Eye, Pencil, Phone, Mail } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type Volunteer = {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  status: string
  skills: string[] | null
  created_at: string
}

export default function VolunteersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useVolunteersList({
    page,
    search: search || undefined,
    status: status || undefined,
  })

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-muted text-muted-foreground',
      pending: 'bg-warning/10 text-warning',
    }
    const statusLabels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      pending: 'Beklemede',
    }
    return (
      <Badge className={statusColors[status] || 'bg-slate-100'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const columns: ColumnDef<Volunteer>[] = [
    {
      accessorKey: 'first_name',
      header: 'Ad Soyad',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </p>
          <div className="flex gap-2 mt-1">
            {row.original.phone && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {row.original.phone}
              </span>
            )}
            {row.original.email && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'skills',
      header: 'Yetenekler',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.skills?.slice(0, 3).map((skill, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {row.original.skills && row.original.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.skills.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'created_at',
      header: 'Kayıt Tarihi',
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
        title="Gönüllüler"
        description="Gönüllüleri görüntüleyin ve yönetin"
        icon={UserCheck}
        actions={
          <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Gönüllü
          </Button>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Gönüllü ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
            <SelectItem value="pending">Beklemede</SelectItem>
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

      {/* Gönüllü Ekleme Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Gönüllü Ekle</DialogTitle>
            <DialogDescription>
              Yeni gönüllü kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <VolunteerForm onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
