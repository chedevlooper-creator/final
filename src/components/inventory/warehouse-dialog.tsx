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
import { useWarehouseById } from '@/hooks/queries/use-inventory'
import { useCreateWarehouse, useUpdateWarehouse } from '@/hooks/mutations/use-inventory-mutations'
import { warehouseSchema, type WarehouseFormValues } from '@/lib/validations/inventory'

interface WarehouseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouseId: string | null
}

const warehouseTypes = [
  { value: 'main', label: 'Ana Depo' },
  { value: 'branch', label: 'Şube Depo' },
  { value: 'mobile', label: 'Mobil Depo' },
  { value: 'virtual', label: 'Sanal Depo' },
]

export function WarehouseDialog({ open, onOpenChange, warehouseId }: WarehouseDialogProps) {
  const { data: warehouse } = useWarehouseById(warehouseId)
  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      type: 'main',
    },
  })
  
  useEffect(() => {
    if (warehouse) {
      reset({
        code: warehouse.code,
        name: warehouse.name,
        type: warehouse.type,
        address: warehouse.address || '',
        city: warehouse.city || '',
        district: warehouse.district || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        notes: warehouse.notes || '',
      })
    } else {
      reset({
        code: '',
        name: '',
        type: 'main',
        address: '',
        city: '',
        district: '',
        phone: '',
        email: '',
        notes: '',
      })
    }
  }, [warehouse, reset, open])

  const onSubmit = async (values: WarehouseFormValues) => {
    try {
      if (warehouseId) {
        await updateMutation.mutateAsync({ id: warehouseId, values })
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
          <DialogTitle>
            {warehouseId ? 'Depo Düzenle' : 'Yeni Depo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kod</Label>
              <Input {...register('code')} placeholder="DEPO-001" />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tip</Label>
              <Select
                value={warehouse?.type || 'main'}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouseTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Depo Adı</Label>
            <Input {...register('name')} placeholder="Ana Depo" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input {...register('address')} placeholder="Adres..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input {...register('city')} placeholder="İstanbul" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <Input {...register('district')} placeholder="Kadıköy" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input {...register('phone')} placeholder="0555-000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input {...register('email')} type="email" placeholder="depo@ornek.com" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input {...register('notes')} placeholder="Ek bilgiler..." />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {warehouseId ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
