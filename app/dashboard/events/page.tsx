'use client'

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)

import { useState, useCallback } from 'react'
import { useEventsList } from '@/hooks/queries/use-calendar'
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
import { Calendar, Plus, MoreHorizontal, Eye, Pencil, MapPin, Clock, X } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {children}
    </div>
  )
}

type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  event_type: string
  status: string
  created_at: string
}

export default function EventsPage() {
  const [page, setPage] = useState(0)
  const [eventType, setEventType] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const { data, isLoading } = useEventsList({
    page,
    event_type: eventType || undefined,
    status: status || undefined,
  })

  // Get event type badge with design system colors
  const getEventTypeBadge = (type: string) => {
    const variantMap: Record<string, 'info' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      meeting: 'info',
      task: 'success',
      event: 'warning',
      reminder: 'secondary',
    }
    const typeLabels: Record<string, string> = {
      meeting: 'Toplantı',
      task: 'Görev',
      event: 'Etkinlik',
      reminder: 'Hatırlatıcı',
    }
    return (
      <Badge variant={variantMap[type] || 'secondary'} className="text-xs font-medium">
        {typeLabels[type] || type}
      </Badge>
    )
  }

  // Get status badge with design system colors
  const getStatusBadge = (status: string) => {
    const variantMap: Record<string, 'info' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      upcoming: 'info',
      ongoing: 'warning',
      completed: 'success',
      cancelled: 'destructive',
    }
    const statusLabels: Record<string, string> = {
      upcoming: 'Yaklaşan',
      ongoing: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    }
    return (
      <Badge variant={variantMap[status] || 'secondary'} className="text-xs font-medium">
        {statusLabels[status] || status}
      </Badge>
    )
  }

  // Clear filters
  const clearFilters = useCallback(() => {
    setEventType('')
    setStatus('')
  }, [])

  const hasActiveFilters = Boolean(eventType || status)

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'title',
      header: 'Etkinlik',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">{row.original.title}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'event_date',
      header: 'Tarih & Saat',
      cell: ({ row }) => {
        try {
          const date = row.original.event_date ? new Date(row.original.event_date) : null
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {date && !isNaN(date.getTime()) ? format(date, 'dd MMM yyyy', { locale: tr }) : '-'}
              </div>
              {row.original.event_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {row.original.event_time}
                </div>
              )}
            </div>
          )
        } catch (e) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
      },
    },
    {
      accessorKey: 'location',
      header: 'Konum',
      cell: ({ row }) => (
        row.original.location ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[200px]">{row.original.location}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
    },
    {
      accessorKey: 'event_type',
      header: 'Tür',
      cell: ({ row }) => getEventTypeBadge(row.original.event_type),
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="İşlemler">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
              Düzenle
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
          title="Etkinlikler"
          description="Etkinlikleri görüntüleyin ve yönetin"
          icon={Calendar}
          actions={
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Etkinlik
            </Button>
          }
        />

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl shadow-soft p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tür:</span>
              <Select value={eventType || 'all'} onValueChange={(v) => setEventType(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="meeting">Toplantı</SelectItem>
                  <SelectItem value="task">Görev</SelectItem>
                  <SelectItem value="event">Etkinlik</SelectItem>
                  <SelectItem value="reminder">Hatırlatıcı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="upcoming">Yaklaşan</SelectItem>
                  <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            )}

            {/* Results Count */}
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data?.count || 0}</span>
              <span>etkinlik</span>
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
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Etkinlik Bulunmuyor</h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? 'Filtre kriterlerinize uygun etkinlik bulunamadı.' : 'Henüz etkinlik oluşturulmadı.'}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
