'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCollectionRoutes, useVolunteers } from '@/hooks/queries/use-donation-boxes'
import { useCreateCollection } from '@/hooks/mutations/use-donation-box-mutations'
import { collectionSchema, type CollectionFormValues } from '@/lib/validations/donation-boxes'

interface CollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollectionDialog({ open, onOpenChange }: CollectionDialogProps) {
  const { data: routes } = useCollectionRoutes()
  const { data: volunteers } = useVolunteers()
  const createMutation = useCreateCollection()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      scheduled_date: new Date().toISOString().split('T')[0],
    },
  })
  
  const selectedRouteId = watch('route_id')
  const selectedRoute = routes?.find(r => r.id === selectedRouteId)
  
  // Auto-fill collector when route is selected
  const handleRouteChange = (routeId: string) => {
    setValue('route_id', routeId)
    const route = routes?.find(r => r.id === routeId)
    if (route?.collector_id) {
      setValue('collector_id', route.collector_id)
    }
  }

  const onSubmit = async (values: CollectionFormValues) => {
    try {
      await createMutation.mutateAsync(values)
      reset()
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Toplama Planı</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Rota</Label>
            <Select onValueChange={handleRouteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Rota seçin" />
              </SelectTrigger>
              <SelectContent>
                {routes?.filter(r => r.is_active).map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name} ({route.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.route_id && <p className="text-sm text-red-500">{errors.route_id.message}</p>}
          </div>
          
          {selectedRoute && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Rota Detayı:</strong> {selectedRoute.description || 'Açıklama yok'}</p>
              <p className="mt-1 text-muted-foreground">
                {selectedRoute.frequency === 'weekly' && selectedRoute.collection_day && 
                  `Toplama günleri: ${selectedRoute.collection_day.map(d => ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][d]).join(', ')}`
                }
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Toplayıcı</Label>
            <Select onValueChange={(v) => setValue('collector_id', v)} value={watch('collector_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Toplayıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                {volunteers?.map((v: { id: string; first_name: string; last_name: string }) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.first_name} {v.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Tarih</Label>
              <Input {...register('scheduled_date')} type="date" />
              {errors.scheduled_date && (
                <p className="text-sm text-red-500">{errors.scheduled_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Saat (Opsiyonel)</Label>
              <Input {...register('scheduled_time')} type="time" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input {...register('notes')} placeholder="Toplama ile ilgili notlar..." />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              Planla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
