'use client'


import { useState } from 'react'
import { useUsersList } from '@/hooks/queries/use-users'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Search, MoreHorizontal, Eye, Pencil, Shield, Mail, Phone } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

type User = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  status: string
  last_login: string | null
  created_at: string
}

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useUsersList({
    page,
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
  })

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-purple-100 text-purple-700',
      user: 'bg-blue-100 text-blue-700',
      viewer: 'bg-slate-100 text-slate-700',
    }
    const roleLabels: Record<string, string> = {
      admin: 'Yönetici',
      manager: 'Müdür',
      user: 'Kullanıcı',
      viewer: 'Görüntüleyici',
    }
    return (
      <Badge className={roleColors[role] || 'bg-slate-100'}>
        <Shield className="mr-1 h-3 w-3" />
        {roleLabels[role] || role}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-700',
      suspended: 'bg-red-100 text-red-700',
    }
    const statusLabels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      suspended: 'Askıya Alındı',
    }
    return (
      <Badge className={statusColors[status] || 'bg-slate-100'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'full_name',
      header: 'Kullanıcı',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.full_name || 'İsimsiz Kullanıcı'}
          </p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </span>
            {row.original.phone && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {row.original.phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => getRoleBadge(row.original.role),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'last_login',
      header: 'Son Giriş',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {row.original.last_login
            ? format(new Date(row.original.last_login), 'dd MMM yyyy HH:mm', { locale: tr })
            : 'Hiç giriş yapmadı'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Kayıt Tarihi',
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcılar"
        description="Sistem kullanıcılarını görüntüleyin ve yönetin"
        icon={Users}
        actions={
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Kullanıcı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={role || 'all'} onValueChange={(v) => setRole(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Roller</SelectItem>
            <SelectItem value="admin">Yönetici</SelectItem>
            <SelectItem value="manager">Müdür</SelectItem>
            <SelectItem value="user">Kullanıcı</SelectItem>
            <SelectItem value="viewer">Görüntüleyici</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
            <SelectItem value="suspended">Askıya Alındı</SelectItem>
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
