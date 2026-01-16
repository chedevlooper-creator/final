'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useNeedyList, useDeleteNeedy } from '@/hooks/queries/use-needy'
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
import { Users, Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Filter, Download } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Tables } from '@/types/database.types'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { AddNeedyModal } from '@/components/needy/AddNeedyModal'

type NeedyPerson = Tables<'needy_persons'> & {
  category?: { name: string } | null
  partner?: { name: string } | null
  country?: { name: string } | null
  city?: { name: string } | null
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function NeedyListPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Hash routing için modal durumu kontrolü
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#!/crea/relief/needy/add') {
        setIsAddModalOpen(true)
      } else if (hash === '' || !hash.startsWith('#!')) {
        setIsAddModalOpen(false)
      }
    }

    // İlk yüklemede kontrol
    handleHashChange()

    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Arama filtreleri (orijinal sistemdeki gibi)
  const [idFilter, setIdFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [identityFilter, setIdentityFilter] = useState('')
  const [fileNumberFilter, setFileNumberFilter] = useState('')

  const { data, isLoading } = useNeedyList({
    page,
    search: nameFilter || search || undefined,
    status: status || undefined,
  })

  const deleteMutation = useDeleteNeedy()

  const handleDelete = async (id: string) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Kayıt silindi')
      } catch (error) {
        toast.error('Kayıt silinemedi')
      }
    }
  }

  const columns: ColumnDef<NeedyPerson>[] = [
    {
      id: 'detail',
      cell: ({ row }) => (
        <Link href={`/needy/${row.original.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tür',
      cell: ({ row }) => (
        <span className="text-sm">
          İhtiyaç Sahibi Kişi
        </span>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'İsim',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.category?.name || 'Yetim Ailesi'}
        </span>
      ),
    },
    {
      accessorKey: 'age',
      header: 'Yaş',
      cell: ({ row }) => {
        if (row.original.date_of_birth) {
          const birthDate = new Date(row.original.date_of_birth)
          const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          return <span className="text-sm">{age}</span>
        }
        return <span className="text-sm text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: 'nationality',
      header: 'Uyruk',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.country?.name || 'Türkiye'}
        </span>
      ),
    },
    {
      accessorKey: 'identity_number',
      header: 'Kimlik No',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.identity_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Cep Telefonu',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.phone || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Şehir',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.city?.name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'family_size',
      header: 'Kişi',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.family_size || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'file_number',
      header: 'Dosya No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.file_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status] || 'bg-slate-100'}>
          {row.original.status === 'active' ? 'Aktif' :
           row.original.status === 'inactive' ? 'Pasif' : 'Taslak'}
        </Badge>
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
            <Link href={`/needy/${row.original.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Görüntüle
              </DropdownMenuItem>
            </Link>
            <Link href={`/needy/${row.original.id}?edit=true`}>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600"
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
    <div className="space-y-4">
      <PageHeader
        title="İhtiyaç Sahipleri"
        description="Sistemdeki tüm ihtiyaç sahiplerini yönetin"
        icon={Users}
      />

      {/* Üst Araç Çubuğu - Orijinal sistemdeki gibi */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border">
        {/* Arama Alanları */}
        <Input
          placeholder="ID"
          value={idFilter}
          onChange={(e) => setIdFilter(e.target.value)}
          className="w-20 h-9"
        />
        <Input
          placeholder="Kişi / Kurum Ünvanı"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-48 h-9"
        />
        <Input
          placeholder="Kimlik No"
          value={identityFilter}
          onChange={(e) => setIdentityFilter(e.target.value)}
          className="w-32 h-9"
        />
        <Input
          placeholder="Dosya No"
          value={fileNumberFilter}
          onChange={(e) => setFileNumberFilter(e.target.value)}
          className="w-28 h-9"
        />

        {/* Aksiyon Butonları */}
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          <Search className="h-4 w-4 mr-1" />
          Ara
        </Button>
        <Button size="sm" variant="outline">
          <Filter className="h-4 w-4 mr-1" />
          Filtre
        </Button>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            // Hash routing ile modal aç
            window.location.hash = '#!/crea/relief/needy/add'
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Ekle
        </Button>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          İndir
        </Button>

        {/* Sayfalama Bilgisi */}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{data?.count || 0} Kayıt</span>
          <span>|</span>
          <span>{page + 1} / {Math.ceil((data?.count || 0) / 20) || 1}</span>
        </div>
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

      {/* Ekle Modal */}
      <AddNeedyModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          // Modal kapatıldığında hash'i temizle
          if (!open) {
            window.history.pushState(null, '', window.location.pathname)
          }
        }}
      />
    </div>
  )
}
