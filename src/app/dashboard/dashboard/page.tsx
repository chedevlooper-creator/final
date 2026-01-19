'use client'

export const dynamic = 'force-dynamic'

import { useMemo } from 'react'
import { StatCard } from '@/components/common/stat-card'
import { PageHeader } from '@/components/common/page-header'
import { SimpleBarChart, SimplePieChart, TrendChart } from '@/components/common/charts'
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useNeedyList } from '@/hooks/queries/use-needy'
import { useApplicationsList } from '@/hooks/queries/use-applications'
import { useDonationStats } from '@/hooks/queries/use-donations'
import {
  useDashboardStats,
  useMonthlyDonationTrend,
  useApplicationTypeDistribution,
  useCityDistribution,
  useApplicationStatusDistribution,
} from '@/hooks/queries/use-dashboard-stats'
import type { Application } from '@/types/common'

export default function DashboardPage() {
  const { data: needyData } = useNeedyList({ limit: 5 })
  const { data: applicationsData } = useApplicationsList({ limit: 5 })
  const { data: donationStats } = useDonationStats()
  
  // Dashboard charts data
  const { data: dashboardStats } = useDashboardStats()
  const { data: monthlyTrend } = useMonthlyDonationTrend(6)
  const { data: applicationTypes } = useApplicationTypeDistribution()
  const { data: cityDistribution } = useCityDistribution()
  const { data: applicationStatus } = useApplicationStatusDistribution()

  // Memoize stats array to prevent unnecessary recalculations
  const stats = useMemo(() => [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: needyData?.count || 0,
      icon: Users,
      iconColor: 'text-blue-500',
      description: 'Sistemdeki toplam kayıt',
    },
    {
      title: 'Bekleyen Başvuru',
      value: applicationsData?.data?.filter((app: Application) => app.status === 'new').length || 0,
      icon: Clock,
      iconColor: 'text-orange-500',
      description: 'İşlem bekliyor',
    },
    {
      title: 'Bugünkü Bağış',
      value: `₺${(donationStats?.today || 0).toLocaleString('tr-TR')}`,
      icon: DollarSign,
      iconColor: 'text-emerald-500',
      description: 'Bugün toplanan',
    },
    {
      title: 'Aylık Bağış',
      value: `₺${(donationStats?.thisMonth || 0).toLocaleString('tr-TR')}`,
      icon: TrendingUp,
      iconColor: 'text-purple-500',
      description: 'Bu ay toplanan',
    },
    {
      title: 'Tamamlanan Yardım',
      value: applicationsData?.data?.filter((app: Application) => app.status === 'completed').length || 0,
      icon: CheckCircle,
      iconColor: 'text-cyan-500',
      description: 'Bu ay tamamlanan',
    },
    {
      title: 'Toplam Bağış',
      value: donationStats?.count || 0,
      icon: FileText,
      iconColor: 'text-red-500',
      description: 'Tüm zamanlar',
    },
  ], [needyData?.count, applicationsData?.data, donationStats])

  // Memoize filtered applications to prevent recalculation on every render
  const recentApplications = useMemo(() => {
    return applicationsData?.data?.slice(0, 5) || []
  }, [applicationsData?.data])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Yardım yönetim sistemine hoş geldiniz"
        icon={Home}
        actions={
          <div className="flex gap-2">
            <Link href="/needy">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                İhtiyaç Sahipleri
              </Button>
            </Link>
            <Link href="/applications">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                <FileText className="mr-2 h-4 w-4" />
                Yeni Başvuru
              </Button>
            </Link>
          </div>
        }
      />

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Ana İçerik */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son Başvurular */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Son Başvurular</CardTitle>
            <Link href="/applications">
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.map((app: Application) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {app.needy_person?.first_name} {app.needy_person?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{app.application_type}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        app.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : app.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status === 'new' ? 'Yeni' : app.status === 'approved' ? 'Onaylandı' : app.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">
                  Henüz başvuru bulunmuyor
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hızlı İşlemler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/needy">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-2 p-4 hover:bg-slate-50 hover:border-emerald-300"
                >
                  <Users className="h-6 w-6 text-emerald-500" />
                  <div className="text-left">
                    <p className="font-medium">İhtiyaç Sahibi Ekle</p>
                    <p className="text-xs text-slate-500">Yeni kayıt oluştur</p>
                  </div>
                </Button>
              </Link>
              <Link href="/applications">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-2 p-4 hover:bg-slate-50 hover:border-blue-300"
                >
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Yardım Başvurusu</p>
                    <p className="text-xs text-slate-500">Yeni başvuru al</p>
                  </div>
                </Button>
              </Link>
              <Link href="/donations">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-2 p-4 hover:bg-slate-50 hover:border-purple-300"
                >
                  <DollarSign className="h-6 w-6 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium">Bağış Kaydet</p>
                    <p className="text-xs text-slate-500">Yeni bağış gir</p>
                  </div>
                </Button>
              </Link>
              <Link href="/calendar">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-2 p-4 hover:bg-slate-50 hover:border-orange-300"
                >
                  <Calendar className="h-6 w-6 text-orange-500" />
                  <div className="text-left">
                    <p className="font-medium">Takvim</p>
                    <p className="text-xs text-slate-500">Etkinlikleri görüntüle</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafik Bölümü */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aylık Bağış Trendi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Aylık Bağış Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend && monthlyTrend.length > 0 ? (
              <TrendChart
                data={monthlyTrend}
                labelKey="label"
                valueKey="value"
                height={250}
                color="#10b981"
                showArea={true}
                formatValue={(v) => `₺${v.toLocaleString('tr-TR')}`}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-slate-400">
                Veri yükleniyor...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Başvuru Durumları */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Başvuru Durumları
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationStatus && applicationStatus.length > 0 ? (
              <SimplePieChart
                data={applicationStatus}
                labelKey="label"
                valueKey="value"
                height={250}
                showLegend={true}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-slate-400">
                Veri yükleniyor...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Yardım Türü Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              Yardım Türü Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationTypes && applicationTypes.length > 0 ? (
              <SimplePieChart
                data={applicationTypes}
                labelKey="label"
                valueKey="value"
                height={250}
                showLegend={true}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-slate-400">
                Veri yükleniyor...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Şehir Bazlı İhtiyaç Sahipleri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              Şehir Bazlı İhtiyaç Sahipleri (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityDistribution && cityDistribution.length > 0 ? (
              <SimpleBarChart
                data={cityDistribution}
                labelKey="label"
                valueKey="value"
                height={250}
                color="#06b6d4"
                horizontal={true}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-slate-400">
                Veri yükleniyor...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
