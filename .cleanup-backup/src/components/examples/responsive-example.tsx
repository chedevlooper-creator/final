'use client'

import { useDeviceType } from '@/hooks/use-device-type'
import { ResponsivePageHeader } from '@/components/common/responsive-page-header'
import { ResponsiveDataTable } from '@/components/common/responsive-data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Download, Users, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

// Örnek veri
interface NeedyPerson {
  id: string
  name: string
  phone: string
  address: string
  status: 'active' | 'inactive'
  createdAt: string
}

const sampleData: NeedyPerson[] = [
  { id: '1', name: 'Ahmet Yılmaz', phone: '555 123 4567', address: 'İstanbul, Kadıköy', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Ayşe Demir', phone: '555 234 5678', address: 'İstanbul, Üsküdar', status: 'active', createdAt: '2024-01-14' },
  { id: '3', name: 'Mehmet Kaya', phone: '555 345 6789', address: 'Ankara, Çankaya', status: 'inactive', createdAt: '2024-01-13' },
]

/**
 * Responsive Design Kullanım Örneği
 * 
 * Bu bileşen, cihaz türüne göre otomatik uyum sağlayan tüm özellikleri gösterir:
 * - useDeviceType hook'u
 * - ResponsivePageHeader
 * - ResponsiveDataTable
 * - Responsive grid layout
 */
export function ResponsiveExample() {
  const { isMobile, isDesktop, deviceType } = useDeviceType()

  const columns = [
    { 
      key: 'name' as const, 
      header: 'İsim', 
      cell: (item: NeedyPerson) => <span className="font-medium">{item.name}</span>,
      mobileVisible: true 
    },
    { 
      key: 'phone' as const, 
      header: 'Telefon', 
      cell: (item: NeedyPerson) => item.phone,
      mobileVisible: true 
    },
    { 
      key: 'address' as const, 
      header: 'Adres', 
      cell: (item: NeedyPerson) => <span className="truncate max-w-[150px] block">{item.address}</span>,
      mobileVisible: false // Mobilde gizli
    },
    { 
      key: 'status' as const, 
      header: 'Durum', 
      cell: (item: NeedyPerson) => (
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          item.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        )}>
          {item.status === 'active' ? 'Aktif' : 'Pasif'}
        </span>
      ),
      mobileVisible: true 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Responsive Sayfa Başlığı */}
      <ResponsivePageHeader
        title="Responsive Örnek Sayfa"
        description="Cihaz türüne göre otomatik uyum sağlayan arayüz bileşenleri"
        icon={Users}
        breadcrumb="Dashboard / Örnekler"
        actions={
          <>
            <Button variant="outline" size={isMobile ? 'default' : 'sm'} className={cn(isMobile && 'w-full')}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline" size={isMobile ? 'default' : 'sm'} className={cn(isMobile && 'w-full')}>
              <Download className="h-4 w-4 mr-2" />
              İndir
            </Button>
            <Button size={isMobile ? 'default' : 'sm'} className={cn(isMobile && 'w-full')}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ekle
            </Button>
          </>
        }
      />

      {/* Cihaz Bilgisi Kartı */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Algılanan Cihaz</p>
              <p className="text-2xl font-bold text-primary capitalize">{deviceType}</p>
              <p className="text-xs text-muted-foreground">
                {isMobile ? 'Mobil görünüm aktif' : isDesktop ? 'Desktop görünüm aktif' : 'Tablet görünüm aktif'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Grid - İstatistik Kartları */}
      <div className={cn(
        'grid gap-4',
        isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'
      )}>
        <StatCard title="Toplam" value="1,234" trend="+12%" />
        <StatCard title="Aktif" value="987" trend="+5%" />
        <StatCard title="Bekleyen" value="156" trend="-3%" />
        <StatCard title="Tamamlanan" value="91" trend="+8%" />
      </div>

      {/* Responsive DataTable */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Kayıtlar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveDataTable
            data={sampleData}
            columns={columns}
            keyExtractor={(item) => item.id}
            emptyMessage="Henüz kayıt bulunmuyor"
          />
        </CardContent>
      </Card>

      {/* Cihaz Özel İçerik */}
      {isMobile && (
        <Card className="bg-blue-50 border-blue-200 md:hidden">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Mobil Görünüm:</strong> Bu içerik sadece mobil cihazlarda görünür.
              Daha kompakt bir arayüz ve dokunmatik optimizasyonu aktiftir.
            </p>
          </CardContent>
        </Card>
      )}

      {isDesktop && (
        <Card className="bg-green-50 border-green-200 hidden md:block">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">
              <strong>Desktop Görünüm:</strong> Bu içerik sadece desktop cihazlarda görünür.
              Tam tablo görünümü ve geniş ekran optimizasyonu aktiftir.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// İstatistik kartı bileşeni
function StatCard({ 
  title, 
  value, 
  trend 
}: { 
  title: string
  value: string
  trend: string 
}) {
  const isPositive = trend.startsWith('+')
  
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-2xl md:text-3xl font-bold">{value}</p>
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          )}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
