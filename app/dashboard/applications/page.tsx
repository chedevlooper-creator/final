'use client'

import { useState, useCallback } from 'react'
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
import { FileText, Plus, MoreHorizontal, Eye, Pencil, CheckCircle, X, Users, AlertCircle } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { cn } from '@/lib/utils'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

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
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<string>('')
  const [applicationType, setApplicationType] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useApplicationsList({
    page,
    status: status || undefined,
    application_type: applicationType || undefined,
  })

  // Get status badge with design system colors
  const getStatusBadge = (status: string) => {
    const statusConfig = APPLICATION_STATUSES.find((s) => s.value === status)
    const variantMap: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'secondary'> = {
      new: 'info',
      in_review: 'warning',
      approved: 'success',
      rejected: 'destructive',
      pending_delivery: 'warning',
      delivered: 'success',
      completed: 'secondary',
    }
    return (
      <Badge variant={variantMap[status] || 'secondary'} className="text-xs">
        {statusConfig?.label || status}
      </Badge>
    )
  }

  // Get priority badge with design system colors
  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null
    const priorityConfig = PRIORITY_LEVELS.find((p) => p.value === priority)
    const variantMap: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary'> = {
      low: 'secondary',
      medium: 'default',
      high: 'warning',
      urgent: 'destructive',
    }
    return (
      <Badge variant={variantMap[priority] || 'secondary'} className="text-xs font-medium">
        {priorityConfig?.label || priority}
      </Badge>
    )
  }

  // Clear filters
  const clearFilters = useCallback(() => {
    setStatus('')
    setApplicationType('')
  }, [])

  const hasActiveFilters = Boolean(status || applicationType)

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: 'application_number',
      header: 'Başvuru No',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.application_number || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'needy_person',
      header: 'İhtiyaç Sahibi',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {row.original.needy_person?.first_name} {row.original.needy_person?.last_name}
          </p>
          {row.original.needy_person?.phone && (
            <a
              href={`tel:${row.original.needy_person.phone}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {row.original.needy_person.phone}
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'application_type',
      header: 'Başvuru Türü',
      cell: ({ row }) => {
        const typeConfig = APPLICATION_TYPES.find((t) => t.value === row.original.application_type)
        return <span className="text-sm text-muted-foreground">{typeConfig?.label || row.original.application_type}</span>
      },
    },
    {
      accessorKey: 'requested_amount',
      header: 'Talep Tutarı',
      cell: ({ row }) => (
        <span className="font-medium text-sm text-foreground">
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
            <span className="text-sm text-muted-foreground">
              {date && !isNaN(date.getTime()) ? format(date, 'dd MMM yyyy', { locale: tr }) : '-'}
            </span>
          )
        } catch (e) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="İşlemler">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/applications/${row.original.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                Görüntüle
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem className="text-success focus:text-success">
              <CheckCircle className="mr-2 h-4 w-4" />
              Onayla
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Yardım Başvuruları"
          description="Tüm yardım başvurularını yönetin"
          icon={FileText}
          actions={
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
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

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Tümü" />
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
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tür:</span>
              <Select value={applicationType || 'all'} onValueChange={(v) => setApplicationType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Tümü" />
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

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            )}

            {/* Results Count */}
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data?.count || 0}</span>
              <span>başvuru</span>
              {data?.count && data.count > 20 && (
                <>
                  <span>•</span>
                  <span>Sayfa {page + 1} / {Math.ceil((data?.count || 0) / 20)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pageCount={Math.ceil((data?.count || 0) / 20)}
          pageIndex={page}
          onPageChange={setPage}
        />

        {/* Empty State */}
        {!isLoading && data?.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Başvuru Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters ? 'Filtre kriterlerinize uygun başvuru bulunamadı.' : 'Henüz yardım başvurusu oluşturulmadı.'}
            </p>
            {!hasActiveFilters && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-1" />
                İlk Başvuruyu Oluştur
              </Button>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
