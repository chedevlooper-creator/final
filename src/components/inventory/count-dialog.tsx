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
import { useWarehouses } from '@/hooks/queries/use-inventory'
import { useCreateStockCount } from '@/hooks/mutations/use-inventory-mutations'
import { stockCountSchema, type StockCountFormValues } from '@/lib/validations/inventory'

interface CountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const countTypes = [
  { value: 'full', label: 'Tam Sayım' },
  { value: 'partial', label: 'Kısmi Sayım' },
  { value: 'cycle', label: 'Döngü Sayım' },
  { value: 'spot', label: 'Spot Sayım' },
]

export function CountDialog({ open, onOpenChange }: CountDialogProps) {
  const { data: warehouses } = useWarehouses()
  const createMutation = useCreateStockCount()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StockCountFormValues>({
    resolver: zodResolver(stockCountSchema),
    defaultValues: {
      type: 'full',
    },
  })

  const onSubmit = async (values: StockCountFormValues) => {
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
          <DialogTitle>Yeni Stok Sayımı</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Depo</Label>
            <Select onValueChange={(value) => setValue('warehouse_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Depo seçin" />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.warehouse_id && (
              <p className="text-sm text-red-500">{errors.warehouse_id.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Sayım Tipi</Label>
            <Select
              defaultValue="full"
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="planned_date">Planlanan Tarih</Label>
            <Input {...register('planned_date')} type="date" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input {...register('notes')} placeholder="Sayım ile ilgili notlar..." />
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
              disabled={createMutation.isPending}
            >
              Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
