'use client'


import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, FileText } from 'lucide-react'

export default function FinanceReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finans Raporları"
        description="Finans raporlarını görüntüleyin ve indirin"
        icon={BarChart3}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Kasa Özet Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-info" />
              Kasa Özet
            </CardTitle>
            <CardDescription>Kasa işlem özeti ve detayları</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Banka Özet Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              Banka Özet
            </CardTitle>
            <CardDescription>Banka işlem özeti ve detayları</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Gelir-Gider Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Gelir-Gider
            </CardTitle>
            <CardDescription>Gelir ve gider karşılaştırması</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Aylık Finans Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Aylık Özet
            </CardTitle>
            <CardDescription>Aylık finans özeti</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        {/* Döviz Raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Döviz Raporu
            </CardTitle>
            <CardDescription>Döviz bazlı işlem özeti</CardDescription>
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
              <BarChart3 className="h-5 w-5 text-destructive" />
              Tarih Aralığı
            </CardTitle>
            <CardDescription>Belirli tarih aralığı finans raporu</CardDescription>
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
