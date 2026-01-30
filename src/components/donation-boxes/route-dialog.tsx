'use client'

import { useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useRouteById, useVolunteers } from '@/hooks/queries/use-donation-boxes'
import { useCreateCollectionRoute, useUpdateCollectionRoute } from '@/hooks/mutations/use-donation-box-mutations'
import { collectionRouteSchema, type CollectionRouteFormValues } from '@/lib/validations/donation-boxes'

interface RouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routeId: string | null
}

const frequencyOptions = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'biweekly', label: '2 Haftada Bir' },
  { value: 'monthly', label: 'Aylık' },
]

const daysOfWeek = [
  { value: 1, label: 'Pazartesi' },
  { value: 2, label: 'Salı' },
  { value: 3, label: 'Çarşamba' },
  { value: 4, label: 'Perşembe' },
  { value: 5, label: 'Cuma' },
  { value: 6, label: 'Cumartesi' },
  { value: 0, label: 'Pazar' },
]

export function RouteDialog({ open, onOpenChange, routeId }: RouteDialogProps) {
  const { data: route } = useRouteById(routeId)
  const { data: volunteers } = useVolunteers()
  const createMutation = useCreateCollectionRoute()
  const updateMutation = useUpdateCollectionRoute()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollectionRouteFormValues>({
    resolver: zodResolver(collectionRouteSchema),
    defaultValues: {
      city: 'İstanbul',
      frequency: 'weekly',
      collection_day: [1],
    },
  })
  
  const selectedDays = watch('collection_day') || []
  
  useEffect(() => {
    if (route) {
      reset({
        code: route.code,
        name: route.name,
        description: route.description || '',
        city: route.city,
        district: route.district || '',
        collector_id: route.collector_id || '',
        backup_collector_id: route.backup_collector_id || '',
        frequency: route.frequency,
        collection_day: route.collection_day,
        estimated_duration: route.estimated_duration || undefined,
      })
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        city: 'İstanbul',
        district: '',
        collector_id: '',
        backup_collector_id: '',
        frequency: 'weekly',
        collection_day: [1],
        estimated_duration: undefined,
      })
    }
  }, [route, reset, open])
  
  const toggleDay = (day: number) => {
    const current = selectedDays
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort()
    setValue('collection_day', updated)
  }

  const onSubmit = async (values: CollectionRouteFormValues) => {
    try {
      if (routeId) {
        await updateMutation.mutateAsync({ id: routeId, values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{routeId ? 'Rota Düzenle' : 'Yeni Rota'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kod</Label>
              <Input {...register('code')} placeholder="ROTA-001" />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Rota Adı</Label>
              <Input {...register('name')} placeholder="Avrupa Yakası Rota 1" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input {...register('description')} placeholder="Rota açıklaması..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <Input {...register('district')} placeholder="Kadıköy" />
            </div>
          </div>
          
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
          
          <div className="space-y-2">
            <Label>Yedek Toplayıcı</Label>
            <Select onValueChange={(v) => setValue('backup_collector_id', v)} value={watch('backup_collector_id') || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Yedek seçin (opsiyonel)" />
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
          
          <div className="space-y-2">
            <Label>Sıklık</Label>
            <Select onValueChange={(v) => setValue('frequency', v as any)} defaultValue="weekly">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Toplama Günleri</Label>
            <div className="flex flex-wrap gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimated_duration">Tahmini Süre (dakika)</Label>
            <Input 
              {...register('estimated_duration', { valueAsNumber: true })} 
              type="number" 
              min="0"
              placeholder="120"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {routeId ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
