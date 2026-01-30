'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStockAlerts } from '@/hooks/queries/use-inventory'
import { useResolveStockAlert } from '@/hooks/mutations/use-inventory-mutations'
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle, Search } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

const alertTypeLabels: Record<string, string> = {
  low_stock: 'Düşük Stok',
  out_of_stock: 'Stok Tükendi',
  expiring: 'Son Kullanma Yaklaşıyor',
  expired: 'Son Kullanma Geçti',
  overstock: 'Fazla Stok',
  reorder: 'Yeniden Sipariş',
}

const severityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  low: { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  medium: { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  high: { icon: <AlertOctagon className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
  critical: { icon: <AlertOctagon className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
}

export default function AlertsPage() {
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({})
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  
  const { data: alerts, isLoading } = useStockAlerts({
    is_resolved: false,
    type: typeFilter === 'all' ? undefined : typeFilter,
    severity: severityFilter === 'all' ? undefined : severityFilter,
  })
  
  const resolveMutation = useResolveStockAlert()

  const handleResolve = async (alertId: string) => {
    await resolveMutation.mutateAsync({
      alertId,
      resolutionNotes: resolutionNotes[alertId] || 'Çözümlendi',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok Uyarıları</h1>
          <p className="text-muted-foreground mt-1">Düşük stok ve kritik uyarılar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Uyarı Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="low_stock">Düşük Stok</SelectItem>
                <SelectItem value="out_of_stock">Stok Tükendi</SelectItem>
                <SelectItem value="expiring">Son Kullanma</SelectItem>
                <SelectItem value="expired">Son Kullanma Geçti</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Önem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : alerts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">Aktif uyarı bulunmuyor</p>
              <p className="text-sm">Tüm stoklar normal seviyede</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts?.map((alert) => {
                const severity = severityConfig[alert.severity]
                return (
                  <Card key={alert.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={severity.color}>
                              {severity.icon}
                              <span className="ml-1 capitalize">{alert.severity}</span>
                            </Badge>
                            <Badge variant="outline">{alertTypeLabels[alert.type]}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(alert.created_at)}
                            </span>
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Ürün: {alert.item?.name}</span>
                            {alert.warehouse && (
                              <span>Depo: {alert.warehouse.name}</span>
                            )}
                            {alert.current_value != null && (
                              <span>
                                Mevcut: {formatNumber(alert.current_value ?? 0)} {alert.item?.unit}
                              </span>
                            )}
                            {alert.threshold_value != null && (
                              <span>
                                Eşik: {formatNumber(alert.threshold_value ?? 0)} {alert.item?.unit}
                              </span>
                            )}
                          </div>
                          <div className="mt-3">
                            <Input
                              placeholder="Çözüm notu..."
                              value={resolutionNotes[alert.id] || ''}
                              onChange={(e) => setResolutionNotes(prev => ({
                                ...prev,
                                [alert.id]: e.target.value
                              }))}
                              className="max-w-md"
                            />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Çözümlendi
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
