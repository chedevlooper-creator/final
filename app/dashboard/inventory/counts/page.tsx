'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStockCounts, useWarehouses } from '@/hooks/queries/use-inventory'
import { useCreateStockCount, useStartStockCount, useCompleteStockCount } from '@/hooks/mutations/use-inventory-mutations'
import { CountDialog } from '@/components/inventory/count-dialog'
import { ClipboardList, Play, CheckCircle, Plus, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Taslak', variant: 'secondary' },
  in_progress: { label: 'Devam Ediyor', variant: 'default' },
  completed: { label: 'Tamamlandı', variant: 'outline' },
  cancelled: { label: 'İptal', variant: 'destructive' },
}

const typeLabels: Record<string, string> = {
  full: 'Tam Sayım',
  partial: 'Kısmi Sayım',
  cycle: 'Döngü Sayım',
  spot: 'Spot Sayım',
}

export default function CountsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data: counts, isLoading } = useStockCounts()
  const { data: warehouses } = useWarehouses()
  
  const createMutation = useCreateStockCount()
  const startMutation = useStartStockCount()
  const completeMutation = useCompleteStockCount()
  
  const filteredCounts = counts?.filter(c =>
    statusFilter === 'all' ? true : c.status === statusFilter
  )

  const handleStart = async (id: string) => {
    await startMutation.mutateAsync(id)
  }

  const handleComplete = async (id: string) => {
    await completeMutation.mutateAsync(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok Sayımı</h1>
          <p className="text-muted-foreground mt-1">Dönemsel stok sayımı ve kontrol</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sayım
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : filteredCounts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Sayım kaydı bulunamadı
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCounts?.map((count) => {
                const status = statusLabels[count.status]
                return (
                  <Card key={count.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">{count.count_number}</span>
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <Badge variant="outline">{typeLabels[count.type]}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Depo: {count.warehouse?.name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Planlanan: {count.planned_date ? formatDate(count.planned_date) : 'Belirtilmemiş'}
                            </span>
                            {count.planner && (
                              <span>Planlayan: {count.planner.full_name}</span>
                            )}
                          </div>
                          {count.status === 'completed' && (
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>Toplam: {count.total_items} ürün</span>
                              <span className="text-green-600">Eşleşen: {count.matched_items}</span>
                              {count.discrepancy_items > 0 && (
                                <span className="text-red-600">Fark: {count.discrepancy_items}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {count.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleStart(count.id)}
                              disabled={startMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Başlat
                            </Button>
                          )}
                          {count.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplete(count.id)}
                              disabled={completeMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Tamamla
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CountDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
