'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Search,
  Plus,
  ArrowRight,
  Barcode,
} from 'lucide-react'
import Link from 'next/link'
import { useInventoryDashboardStats, useInventorySummary, useExpiringLots } from '@/hooks/queries/use-inventory'
import { QuickStockDialog } from '@/components/inventory/quick-stock-dialog'
import { formatNumber } from '@/lib/utils'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [quickStockOpen, setQuickStockOpen] = useState(false)
  const [quickStockType, setQuickStockType] = useState<'in' | 'out'>('in')
  
  const { data: stats, isLoading: statsLoading } = useInventoryDashboardStats()
  const { data: items, isLoading: itemsLoading } = useInventorySummary({ search: searchQuery })
  const { data: expiringItems } = useExpiringLots(30)
  
  const lowStockItems = items?.filter(i => i.stock_status === 'low_stock').slice(0, 5)
  const outOfStockItems = items?.filter(i => i.stock_status === 'out_of_stock').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok / Depo Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Envanter takibi, depo yönetimi ve stok hareketleri
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setQuickStockType('in'); setQuickStockOpen(true) }}>
            <Barcode className="mr-2 h-4 w-4" />
            Hızlı Giriş
          </Button>
          <Button variant="outline" onClick={() => { setQuickStockType('out'); setQuickStockOpen(true) }}>
            <Barcode className="mr-2 h-4 w-4" />
            Hızlı Çıkış
          </Button>
          <Button asChild>
            <Link href="/dashboard/inventory/items/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ürün
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatNumber(stats?.totalItems || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Aktif envanter kalemi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Düşük Stok</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? '...' : stats?.lowStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Minimum seviye altında</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Tükendi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statsLoading ? '...' : stats?.outOfStockCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Acil sipariş gerekli</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Kullanma</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statsLoading ? '...' : stats?.expiringCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">30 gün içinde</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/dashboard/inventory/warehouses">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <Warehouse className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Depolar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Depo yönetimi ve konumlar</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inventory/items">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <Package className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Envanter kalemleri</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inventory/transactions">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <ArrowRight className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-lg">Hareketler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Giriş/Çıkış kayıtları</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inventory/alerts">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full relative">
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle className="text-lg">Uyarılar</CardTitle>
              {stats?.recentAlerts && stats.recentAlerts.length > 0 && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  {stats.recentAlerts.length}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Stok uyarıları</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="low-stock">Düşük Stok</TabsTrigger>
          <TabsTrigger value="expiring">Son Kullanma</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ürün Arama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün adı, SKU veya barkod ile ara..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {itemsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                ) : items?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Ürün bulunamadı</div>
                ) : (
                  items?.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.sku} • {item.category_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(item.total_available || 0)} {item.unit}</p>
                        <Badge variant={
                          item.stock_status === 'out_of_stock' ? 'destructive' :
                          item.stock_status === 'low_stock' ? 'default' :
                          'secondary'
                        }>
                          {item.stock_status === 'out_of_stock' ? 'Tükendi' :
                           item.stock_status === 'low_stock' ? 'Düşük' : 'Normal'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {items && items.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="link" asChild>
                    <Link href="/dashboard/inventory/items">Tümünü Gör</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Düşük Stoklu Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Düşük stoklu ürün bulunmuyor
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStockItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Min: {item.min_stock_level} {item.unit}</p>
                      </div>
                      <Badge variant="destructive">
                        {formatNumber(item.total_available || 0)} {item.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Son Kullanma Tarihi Yaklaşan Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringItems?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Yaklaşan son kullanma tarihi bulunmuyor
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringItems?.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-muted-foreground">Parti: {item.lot_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.remaining_quantity} {item.item?.unit}</p>
                        <Badge variant={(item.days_until_expiry || 0) < 7 ? 'destructive' : 'default'}>
                          {item.days_until_expiry} gün
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QuickStockDialog
        open={quickStockOpen}
        onOpenChange={setQuickStockOpen}
        type={quickStockType}
      />
    </div>
  )
}
