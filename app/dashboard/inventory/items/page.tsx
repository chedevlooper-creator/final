'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInventorySummary, useItemCategories } from '@/hooks/queries/use-inventory'
import { Package, Search, Plus, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

const stockStatusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  in_stock: { label: 'Stokta', variant: 'default' },
  low_stock: { label: 'Düşük', variant: 'secondary' },
  out_of_stock: { label: 'Tükendi', variant: 'destructive' },
  overstock: { label: 'Fazla Stok', variant: 'outline' },
}

export default function ItemsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data: items, isLoading } = useInventorySummary({
    search: searchQuery,
  })
  const { data: categories } = useItemCategories()
  
  const filteredItems = items?.filter(item => {
    if (categoryFilter !== 'all' && item.category_name !== categoryFilter) return false
    if (statusFilter !== 'all' && item.stock_status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Envanter kalemleri ve stok takibi</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inventory/items/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ürün ara..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stok Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="in_stock">Stokta</SelectItem>
                <SelectItem value="low_stock">Düşük</SelectItem>
                <SelectItem value="out_of_stock">Tükendi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : filteredItems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ürün bulunamadı
            </div>
          ) : (
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Ürün</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kategori</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Stok</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Durum</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems?.map((item) => (
                    <tr key={item.item_id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-xs text-muted-foreground">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.category_name || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium">{formatNumber(item.total_available || 0)}</span>
                        <span className="text-sm text-muted-foreground ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={stockStatusLabels[item.stock_status || 'in_stock']?.variant || 'default'}>
                          {stockStatusLabels[item.stock_status || 'in_stock']?.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/inventory/items/${item.item_id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
