'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useFindItemByBarcode } from '@/hooks/queries/use-inventory'
import { useQuickStockIn, useQuickStockOut } from '@/hooks/mutations/use-inventory-mutations'
import { Barcode, Package, Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface QuickStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'in' | 'out'
}

export function QuickStockDialog({ open, onOpenChange, type }: QuickStockDialogProps) {
  const [barcode, setBarcode] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [warehouseId, setWarehouseId] = useState('')
  const [notes, setNotes] = useState('')
  
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  
  const { data: warehouses } = useWarehouses()
  const { data: foundItem, isLoading: searching } = useFindItemByBarcode(barcode)
  
  const quickStockIn = useQuickStockIn()
  const quickStockOut = useQuickStockOut()
  
  useEffect(() => {
    if (open) {
      setTimeout(() => barcodeInputRef.current?.focus(), 100)
    }
  }, [open, type])
  
  useEffect(() => {
    if (warehouses && warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id)
    }
  }, [warehouses, warehouseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foundItem || !warehouseId) return
    
    const values = {
      barcode,
      warehouse_id: warehouseId,
      type,
      quantity: Number(quantity),
      notes: notes || undefined,
    }
    
    try {
      if (type === 'in') {
        await quickStockIn.mutateAsync(values)
      } else {
        await quickStockOut.mutateAsync(values)
      }
      
      // Reset form
      setBarcode('')
      setQuantity('1')
      setNotes('')
      setTimeout(() => barcodeInputRef.current?.focus(), 100)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'in' ? (
              <>
                <ArrowDownLeft className="h-5 w-5 text-green-500" />
                Hızlı Stok Girişi
              </>
            ) : (
              <>
                <ArrowUpRight className="h-5 w-5 text-red-500" />
                Hızlı Stok Çıkışı
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warehouse">Depo</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder="Depo seçin" />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Barkod / SKU</Label>
            <div className="relative">
              <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={barcodeInputRef}
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Barkod okutun veya girin"
                className="pl-9"
                autoComplete="off"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          
          {foundItem && (
            <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">{foundItem.name}</p>
                <p className="text-sm text-muted-foreground">{foundItem.sku}</p>
              </div>
              <Badge variant="outline">{foundItem.unit}</Badge>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Miktar</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ek bilgi..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Kapat
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!foundItem || !warehouseId || (type === 'in' ? quickStockIn.isPending : quickStockOut.isPending)}
            >
              {type === 'in' ? 'Giriş Yap' : 'Çıkış Yap'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
