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
import { useWarehouses, useInventorySummary } from '@/hooks/queries/use-inventory'
import { useCreateInventoryTransaction } from '@/hooks/mutations/use-inventory-mutations'
import { inventoryTransactionSchema, type InventoryTransactionFormValues } from '@/lib/validations/inventory'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const transactionTypes = [
  { value: 'in', label: 'Stok Girişi' },
  { value: 'out', label: 'Stok Çıkışı' },
  { value: 'transfer', label: 'Depo Transferi' },
  { value: 'adjustment', label: 'Stok Düzeltme' },
]

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const { data: warehouses } = useWarehouses()
  const { data: items } = useInventorySummary()
  const createMutation = useCreateInventoryTransaction()
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InventoryTransactionFormValues>({
    resolver: zodResolver(inventoryTransactionSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split('T')[0],
      quantity: 1,
    },
  })
  
  const transactionType = watch('type')

  const onSubmit = async (values: InventoryTransactionFormValues) => {
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
          <DialogTitle>Yeni Stok Hareketi</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Hareket Tipi</Label>
            <Select onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Tip seçin" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Ürün</Label>
            <Select onValueChange={(value) => setValue('item_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ürün seçin" />
              </SelectTrigger>
              <SelectContent>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.item_id && (
              <p className="text-sm text-red-500">{errors.item_id.message}</p>
            )}
          </div>
          
          {transactionType === 'transfer' ? (
            <>
              <div className="space-y-2">
                <Label>Kaynak Depo</Label>
                <Select onValueChange={(value) => setValue('source_warehouse_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kaynak depo seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hedef Depo</Label>
                <Select onValueChange={(value) => setValue('destination_warehouse_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hedef depo seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
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
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Miktar</Label>
              <Input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                min="0.01"
                step="0.01"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Tarih</Label>
              <Input {...register('transaction_date')} type="date" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input {...register('notes')} placeholder="Hareket ile ilgili notlar..." />
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
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
