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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDonationBoxes, useLocationTypes, useDonationBoxPerformance } from '@/hooks/queries/use-donation-boxes'
import { QRCodeDisplay } from '@/components/donation-boxes/qr-code-display'
import { DonationBoxDialog } from '@/components/donation-boxes/donation-box-dialog'
import { 
  Box, 
  MapPin, 
  Phone, 
  Plus, 
  TrendingUp, 
  AlertCircle,
  Search,
  ArrowUpRight
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Aktif', variant: 'default' },
  inactive: { label: 'Pasif', variant: 'secondary' },
  maintenance: { label: 'Bakımda', variant: 'destructive' },
  removed: { label: 'Kaldırıldı', variant: 'outline' },
}

export default function DonationBoxesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBox, setEditingBox] = useState<string | null>(null)
  
  const { data: boxes, isLoading } = useDonationBoxes({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const { data: locationTypes } = useLocationTypes()
  const { data: performance } = useDonationBoxPerformance()
  
  const filteredBoxes = boxes?.filter(box => {
    if (searchQuery && !box.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !box.code.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (locationTypeFilter !== 'all' && box.location_type_id !== locationTypeFilter) return false
    return true
  })
  
  const lowPerformanceBoxes = performance?.filter(p => p.performance_percentage < 50 && p.status === 'active').slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bağış Kumbaraları</h1>
          <p className="text-muted-foreground mt-1">Fiziksel bağış kutuları takip sistemi</p>
        </div>
        <Button onClick={() => { setEditingBox(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kumbara
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kumbara</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boxes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {boxes?.filter(b => b.status === 'active').length || 0} aktif
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Hedef</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(boxes?.reduce((sum, b) => sum + b.estimated_monthly_amount, 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tahmini toplam</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bakımda</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {boxes?.filter(b => b.status === 'maintenance').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Bakım gerektiren</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Performans</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performance && performance.length > 0
                ? Math.round(performance.reduce((sum, p) => sum + p.performance_percentage, 0) / performance.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Hedef başarım</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Kumbara Listesi</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="low">Düşük Performanslı</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kumbara ara..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                    <SelectItem value="maintenance">Bakımda</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lokasyon Tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {locationTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : filteredBoxes?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Kumbara bulunamadı</div>
              ) : (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Kumbara</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Lokasyon</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">QR Kod</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Durum</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Son Toplama</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBoxes?.map((box) => (
                        <tr key={box.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Box className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{box.name}</p>
                                <p className="text-xs text-muted-foreground">{box.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {box.location_name}
                            </div>
                            <p className="text-xs text-muted-foreground">{box.district}, {box.city}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <QRCodeDisplay 
                                qrCodeUrl={box.qr_code_url} 
                                boxCode={box.code}
                                boxName={box.name}
                                size="sm"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={statusLabels[box.status]?.variant || 'default'}>
                              {statusLabels[box.status]?.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {box.last_collection_date ? (
                              <span>{new Date(box.last_collection_date).toLocaleDateString('tr-TR')}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingBox(box.id); setDialogOpen(true) }}>
                              Düzenle
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
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kumbara Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performance?.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.location_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(p.average_collection_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        Hedef: {formatCurrency(p.estimated_monthly_amount)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${p.performance_percentage >= 80 ? 'bg-green-500' : p.performance_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(p.performance_percentage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${p.performance_percentage >= 80 ? 'text-green-600' : p.performance_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(p.performance_percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Düşük Performanslı Kumbaralar</CardTitle>
            </CardHeader>
            <CardContent>
              {lowPerformanceBoxes?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Düşük performanslı kumbara bulunmuyor
                </div>
              ) : (
                <div className="space-y-2">
                  {lowPerformanceBoxes?.map((box) => (
                    <div
                      key={box.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 border-red-200 bg-red-50/30"
                    >
                      <div>
                        <p className="font-medium">{box.name}</p>
                        <p className="text-sm text-muted-foreground">{box.location_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{Math.round(box.performance_percentage)}%</p>
                        <p className="text-sm text-muted-foreground">Performans</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DonationBoxDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        boxId={editingBox}
      />
    </div>
  )
}
