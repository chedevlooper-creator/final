'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouteDetails } from '@/hooks/queries/use-donation-boxes'
import { RouteDialog } from '@/components/donation-boxes/route-dialog'
import { Plus, MapPin, User, Clock, Boxes } from 'lucide-react'
import Link from 'next/link'

const dayLabels: Record<number, string> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
}

const frequencyLabels: Record<string, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  biweekly: '2 Haftada Bir',
  monthly: 'Aylık',
}

export default function RoutesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<string | null>(null)
  
  const { data: routes, isLoading } = useRouteDetails()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Toplama Rotaları</h1>
          <p className="text-muted-foreground mt-1">Kumbara toplama güzergahları</p>
        </div>
        <Button onClick={() => { setEditingRoute(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Rota
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-3 text-center py-8">Yükleniyor...</div>
        ) : routes?.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">Rota bulunamadı</div>
        ) : (
          routes?.map((route) => (
            <Card key={route.id} className={!route.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{route.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{route.code}</p>
                  </div>
                  <Badge variant={route.is_active ? 'default' : 'secondary'}>
                    {route.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{route.city}{route.district ? `, ${route.district}` : ''}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{route.collector_name || 'Atanmamış'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{frequencyLabels[route.frequency]}</span>
                  {route.collection_day && route.collection_day.length > 0 && (
                    <span className="text-muted-foreground">
                      ({route.collection_day.map(d => dayLabels[d]).join(', ')})
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Boxes className="h-4 w-4 text-muted-foreground" />
                  <span>{route.box_count} kumbara</span>
                  {route.total_estimated_minutes > 0 && (
                    <span className="text-muted-foreground">
                      (~{Math.ceil(route.total_estimated_minutes / 60)} saat)
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/donations/routes/${route.id}`}>
                      Detay
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setEditingRoute(route.id); setDialogOpen(true) }}
                  >
                    Düzenle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <RouteDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        routeId={editingRoute}
      />
    </div>
  )
}
