'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Database, 
  Download, 
  Upload, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileJson,
  FileSpreadsheet,
  Trash2,
  RefreshCw
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const backupHistory = [
  { id: 1, date: '2024-01-30 08:00', size: '245 MB', type: 'Otomatik', status: 'success', tables: 42 },
  { id: 2, date: '2024-01-29 08:00', size: '243 MB', type: 'Otomatik', status: 'success', tables: 42 },
  { id: 3, date: '2024-01-28 08:00', size: '241 MB', type: 'Otomatik', status: 'success', tables: 42 },
  { id: 4, date: '2024-01-27 08:00', size: '239 MB', type: 'Otomatik', status: 'success', tables: 42 },
  { id: 5, date: '2024-01-26 08:00', size: '237 MB', type: 'Otomatik', status: 'success', tables: 42 },
]

const exportModules = [
  { id: 'needy', name: 'İhtiyaç Sahipleri', records: 1240, lastExport: '2024-01-25' },
  { id: 'donations', name: 'Bağışlar', records: 5680, lastExport: '2024-01-25' },
  { id: 'memberships', name: 'Üyelikler', records: 450, lastExport: '2024-01-20' },
  { id: 'programs', name: 'Programlar', records: 12, lastExport: '2024-01-15' },
  { id: 'finance', name: 'Finans', records: 3200, lastExport: '2024-01-25' },
]

export default function BackupSettingsPage() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleBackup = async () => {
    setIsBackingUp(true)
    setProgress(0)
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 500)

    await new Promise(resolve => setTimeout(resolve, 5500))
    toast.success('Yedekleme başarıyla tamamlandı')
    setIsBackingUp(false)
    setProgress(0)
  }

  const handleExport = async (moduleId: string, format: 'json' | 'excel') => {
    setIsExporting(`${moduleId}-${format}`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success(`${format.toUpperCase()} formatında dışa aktarıldı`)
    setIsExporting(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Veri Yedekleme ve İçe/Dışa Aktarma</h2>
        <p className="text-muted-foreground">
          Verilerinizi yedekleyin ve dışa aktarın
        </p>
      </div>

      {/* Backup Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Otomatik Yedekleme</CardTitle>
                <CardDescription>Günlük otomatik yedekleme aktif</CardDescription>
              </div>
            </div>
            <Badge variant="success">Aktif</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Son Yedekleme</p>
              <p className="text-lg font-semibold">Bugün 08:00</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Yedekleme Boyutu</p>
              <p className="text-lg font-semibold">245 MB</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Bir Sonraki</p>
              <p className="text-lg font-semibold">Yarın 08:00</p>
            </div>
          </div>

          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Yedekleniyor...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleBackup} disabled={isBackingUp}>
              {isBackingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yedekleniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Şimdi Yedekle
                </>
              )}
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Son Yedeği İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Yedekleme Geçmişi</CardTitle>
          <CardDescription>Son 30 günün yedekleri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Boyut</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{backup.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {backup.status === 'success' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Başarılı</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Hata</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Dışa Aktarma</CardTitle>
          <CardDescription>
            Modül bazında veri dışa aktarın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportModules.map((module) => (
              <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{module.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {module.records.toLocaleString('tr-TR')} kayıt
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport(module.id, 'json')}
                    disabled={isExporting === `${module.id}-json`}
                  >
                    {isExporting === `${module.id}-json` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileJson className="h-4 w-4" />
                    )}
                    JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExport(module.id, 'excel')}
                    disabled={isExporting === `${module.id}-excel`}
                  >
                    {isExporting === `${module.id}-excel` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle>Veri İçe Aktarma</CardTitle>
          <CardDescription>
            JSON veya Excel dosyasından veri içe aktarın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Dosya Yükleyin</p>
            <p className="text-sm text-muted-foreground mb-4">
              JSON veya Excel dosyasını sürükleyin veya seçin
            </p>
            <Button variant="outline">
              Dosya Seç
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-600">Tehlikeli Bölge</CardTitle>
              <CardDescription>Dikkatli olun, bu işlemler geri alınamaz</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">Tüm Verileri Sil</p>
              <p className="text-sm text-red-700">Bu işlem tüm verilerinizi kalıcı olarak siler</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Verileri Sil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
