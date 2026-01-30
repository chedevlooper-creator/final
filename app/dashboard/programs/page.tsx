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
import { Progress } from '@/components/ui/progress'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Target,
  TrendingUp,
  MoreHorizontal,
  FileText,
  Activity
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

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' }> = {
  planning: { label: 'Planlama', variant: 'info' },
  active: { label: 'Aktif', variant: 'success' },
  paused: { label: 'Duraklatıldı', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'default' },
  cancelled: { label: 'İptal', variant: 'destructive' },
}

const typeConfig: Record<string, string> = {
  ongoing: 'Sürekli',
  project: 'Proje',
  campaign: 'Kampanya',
  emergency: 'Acil Yardım',
}

export default function ProgramsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const { data: programsData, isLoading } = useQuery({
    queryKey: ['programs', searchQuery, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('programs')
        .select(`
          *,
          manager:profiles!programs_program_manager_id_fkey(id, name),
          coordinator:profiles!programs_coordinator_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`)
      }
      if (statusFilter) query = query.eq('status', statusFilter)
      if (typeFilter) query = query.eq('type', typeFilter)

      const { data, error } = await query.limit(100)
      if (error) throw error
      return data
    },
  })

  const { data: summary } = useQuery({
    queryKey: ['program-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_organization_program_summary')
      if (error) throw error
      return data
    },
  })

  const columns = [
    {
      key: 'code',
      header: 'Kod',
      cell: (row: any) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.code || '-'}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Program Adı',
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{typeConfig[row.type] || row.type}</p>
        </div>
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
      key: 'dates',
      header: 'Tarihler',
      cell: (row: any) => (
        <div className="text-sm text-muted-foreground">
          {row.start_date ? (
            <>
              {new Date(row.start_date).toLocaleDateString('tr-TR')}
              {row.end_date && ` - ${new Date(row.end_date).toLocaleDateString('tr-TR')}`}
            </>
          ) : (
            'Belirtilmemiş'
          )}
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Bütçe',
      cell: (row: any) => {
        const utilization = row.budget_allocated > 0 
          ? Math.round((row.budget_spent / row.budget_allocated) * 100) 
          : 0
        return (
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{utilization}%</span>
              <span className="font-medium">
                {new Intl.NumberFormat('tr-TR', { notation: 'compact', compactDisplay: 'short' }).format(row.budget_allocated)}
              </span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>
        )
      },
    },
    {
      key: 'beneficiaries',
      header: 'Faydalanıcı',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.actual_beneficiaries || 0} / {row.target_beneficiaries || '-'}
          </span>
        </div>
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${row.id}`)}>
              <FileText className="h-4 w-4 mr-2" />
              Detay
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${row.id}/activities`)}>
              <Activity className="h-4 w-4 mr-2" />
              Aktiviteler
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proje ve Program Yönetimi"
        description="Yardım programlarını ve projelerini yönetin"
        icon={ClipboardList}
        actions={
          <Button onClick={() => router.push('/dashboard/programs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Program
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Program</p>
              <p className="text-2xl font-bold">{summary?.total_programs || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Activity className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktif Program</p>
              <p className="text-2xl font-bold">{summary?.active_programs || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Bütçe</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('tr-TR', { notation: 'compact', compactDisplay: 'short' }).format(summary?.total_budget_allocated || 0)} ₺
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-info/10">
              <TrendingUp className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bütçe Kullanımı</p>
              <p className="text-2xl font-bold">%{summary?.average_budget_utilization || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Program ara..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Tüm Durumlar
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Aktif
            </Button>
            <Button
              variant={statusFilter === 'planning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('planning')}
            >
              Planlama
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Tamamlandı
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant={typeFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(null)}
            >
              Tüm Tipler
            </Button>
            <Button
              variant={typeFilter === 'project' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('project')}
            >
              Proje
            </Button>
            <Button
              variant={typeFilter === 'campaign' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('campaign')}
            >
              Kampanya
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={programsData || []}
        isLoading={isLoading}
        emptyMessage="Henüz program kaydı bulunmuyor"
      />
    </div>
  )
}
