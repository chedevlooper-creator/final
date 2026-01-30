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
import { useCollections, useMonthlyCollectionSummary } from '@/hooks/queries/use-donation-boxes'
import { CollectionDialog } from '@/components/donation-boxes/collection-dialog'
import { 
  useStartCollection, 
  useCompleteCollection, 
  useCancelCollection 
} from '@/hooks/mutations/use-donation-box-mutations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Play, CheckCircle, XCircle, Calendar, Route } from 'lucide-react'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  scheduled: { label: 'Planlandı', variant: 'secondary' },
  in_progress: { label: 'Devam Ediyor', variant: 'default' },
  completed: { label: 'Tamamlandı', variant: 'outline' },
  cancelled: { label: 'İptal', variant: 'destructive' },
  postponed: { label: 'Ertelendi', variant: 'secondary' },
}

export default function CollectionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data: collections, isLoading } = useCollections({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const { data: monthlySummary } = useMonthlyCollectionSummary()
  
  const startMutation = useStartCollection()
  const completeMutation = useCompleteCollection()
  const cancelMutation = useCancelCollection()

  const handleStart = async (id: string) => {
    await startMutation.mutateAsync(id)
  }

  const handleComplete = async (id: string) => {
    await completeMutation.mutateAsync({ collectionId: id })
  }

  const handleCancel = async (id: string) => {
    const reason = window.prompt('İptal sebebini girin:')
    if (reason) {
      await cancelMutation.mutateAsync({ collectionId: id, reason })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Toplama İşlemleri</h1>
          <p className="text-muted-foreground mt-1">Kumbara toplama planları ve kayıtları</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Toplama
        </Button>
      </div>

      {/* Monthly Summary */}
      {monthlySummary && monthlySummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Özet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Bu Ay Toplama</p>
                <p className="text-2xl font-bold">{monthlySummary[0]?.collection_count || 0}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlySummary[0]?.total_amount || 0)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Toplanan Kumbara</p>
                <p className="text-2xl font-bold">{monthlySummary[0]?.collected_boxes || 0}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Ortalama</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlySummary[0]?.average_amount || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="scheduled">Planlandı</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : collections?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Toplama kaydı bulunamadı</div>
          ) : (
            <div className="space-y-2">
              {collections?.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{collection.collection_number}</span>
                      <Badge variant={statusLabels[collection.status]?.variant || 'default'}>
                        {statusLabels[collection.status]?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(collection.scheduled_date)}
                      </span>
                      {collection.route && (
                        <span className="flex items-center gap-1">
                          <Route className="h-3 w-3" />
                          {collection.route.name}
                        </span>
                      )}
                      {collection.collector && (
                        <span>{collection.collector.first_name} {collection.collector.last_name}</span>
                      )}
                    </div>
                    {collection.status === 'completed' && (
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>{collection.collected_boxes} kumbara toplandı</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(collection.total_amount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {collection.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleStart(collection.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Başlat
                      </Button>
                    )}
                    {collection.status === 'in_progress' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleComplete(collection.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tamamla
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleCancel(collection.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          İptal
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CollectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
