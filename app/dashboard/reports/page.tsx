'use client'

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)

import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporlar"
        description="Yardım yönetimi raporlarını görüntüleyin ve indirin"
        icon={BarChart3}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* İhtiyaç Sahipleri Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              İhtiyaç Sahipleri
            </CardTitle>
            <CardDescription>İhtiyaç sahipleri listesi ve detayları</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Yardım Başvuruları Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Yardım Başvuruları
            </CardTitle>
            <CardDescription>Yardım başvuruları ve durumları</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Yapılan Yardımlar Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              Yapılan Yardımlar
            </CardTitle>
            <CardDescription>Yapılan yardımların detaylı listesi</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Aylık Özet Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Aylık Özet
            </CardTitle>
            <CardDescription>Aylık yardım ve başvuru özeti</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Kategori Bazlı Rapor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Kategori Bazlı
            </CardTitle>
            <CardDescription>Kategori bazında yardım dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Tarih Aralığı Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-500" />
              Tarih Aralığı
            </CardTitle>
            <CardDescription>Belirli tarih aralığı raporu</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
