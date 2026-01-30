'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { WarehouseDialog } from '@/components/inventory/warehouse-dialog'
import { useWarehouses } from '@/hooks/queries/use-inventory'
import { useDeleteWarehouse } from '@/hooks/mutations/use-inventory-mutations'
import { Warehouse, MapPin, Phone, Mail, Edit, Trash, Plus, Store } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const warehouseTypeLabels: Record<string, string> = {
  main: 'Ana Depo',
  branch: 'Şube Depo',
  mobile: 'Mobil Depo',
  virtual: 'Sanal Depo',
}

export default function WarehousesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  const { data: warehouses, isLoading } = useWarehouses()
  const deleteMutation = useDeleteWarehouse()
  
  const filteredWarehouses = warehouses?.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (id: string) => {
    setEditingWarehouse(id)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    await deleteMutation.mutateAsync(deleteConfirmId)
    setDeleteConfirmId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Depo Yönetimi</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Depo tanımları ve konum yönetimi</p>
        </div>
        <Button 
          onClick={() => { setEditingWarehouse(null); setDialogOpen(true) }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Depo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Depo ara..."
              className="w-full sm:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : filteredWarehouses?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Depo bulunamadı
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWarehouses?.map((warehouse) => (
                <Card key={warehouse.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-base">{warehouse.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{warehouse.code}</p>
                        </div>
                      </div>
                      <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                        {warehouseTypeLabels[warehouse.type]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {warehouse.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {warehouse.address}{warehouse.city ? `, ${warehouse.city}` : ''}
                        </span>
                      </div>
                    )}
                    {warehouse.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{warehouse.phone}</span>
                      </div>
                    )}
                    {warehouse.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{warehouse.email}</span>
                      </div>
                    )}
                    {warehouse.manager && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4" />
                        <span className="text-muted-foreground">
                          Sorumlu: {warehouse.manager.full_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(warehouse.created_at)}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(warehouse.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(warehouse.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WarehouseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        warehouseId={editingWarehouse}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Depoyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu depoyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
