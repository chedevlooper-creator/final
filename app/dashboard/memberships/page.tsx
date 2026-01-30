'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  UserCheck,
  Clock,
  MoreHorizontal,
  CreditCard,
  FileText
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Aktif', variant: 'success' },
  inactive: { label: 'Pasif', variant: 'default' },
  suspended: { label: 'Askıda', variant: 'warning' },
  expired: { label: 'Süresi Doldu', variant: 'destructive' },
}

export default function MembershipsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: membershipsData, isLoading } = useQuery({
    queryKey: ['memberships', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('memberships')
        .select(`
          *,
          category:membership_categories(id, name, dues_amount)
        `)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query.limit(100)
      if (error) throw error
      return data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['membership-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_membership_stats')
      if (error) throw error
      return data
    },
  })

  const columns = [
    {
      key: 'member_number',
      header: 'Üye No',
      cell: (row: any) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.member_number || '-'}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Ad Soyad',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {row.first_name[0]}{row.last_name[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.first_name} {row.last_name}</p>
            <p className="text-sm text-muted-foreground">{row.email || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (row: any) => (
        <Badge variant="outline">
          {row.category?.name || 'Belirtilmemiş'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      cell: (row: any) => {
        const config = statusConfig[row.status] || { label: row.status, variant: 'default' }
        return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
      },
    },
    {
      key: 'membership_date',
      header: 'Üyelik Tarihi',
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.membership_date).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'İletişim',
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground">{row.phone || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/dashboard/memberships/${row.id}`)}>
              <FileText className="h-4 w-4 mr-2" />
              Detay
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/memberships/${row.id}/payments`)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Aidatlar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Üyelik Yönetimi"
        description="Dernek üyelerini ve aidat takibini yönetin"
        icon={Users}
        actions={
          <Button onClick={() => router.push('/dashboard/memberships/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Üye
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Üye</p>
              <p className="text-2xl font-bold">{stats?.total_members || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <UserCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktif Üye</p>
              <p className="text-2xl font-bold">{stats?.active_members || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gecikmiş Aidat</p>
              <p className="text-2xl font-bold">{stats?.overdue_count || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <CreditCard className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tahsilat Oranı</p>
              <p className="text-2xl font-bold">%{stats?.collection_rate || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Üye ara..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Tümü
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Aktif
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('inactive')}
            >
              Pasif
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={membershipsData || []}
        isLoading={isLoading}
        emptyMessage="Henüz üye kaydı bulunmuyor"
      />
    </div>
  )
}
