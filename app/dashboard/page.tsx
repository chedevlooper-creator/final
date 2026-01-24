'use client'

import React, { useMemo } from 'react'
import { StatCard } from '@/components/common/stat-card'
import { PageHeader } from '@/components/common/page-header'
import { SimpleBarChart, SimplePieChart, TrendChart } from '@/components/common/charts'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { cn } from '@/lib/utils'

// Page transition wrapper component
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in animate-slide-up" style={{ animationDuration: '0.3s' }}>
      {children}
    </div>
  )
}

// Stats grid with stagger animation
function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="animate-fade-in animate-slide-up"
          style={{ animationDelay: `${index * 50}ms`, animationDuration: '0.3s' }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Card with stagger animation
function StaggerCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Card
      className={cn(
        'shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationDuration: '0.3s' }}
    >
      {children}
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: needyData } = useNeedyList({ limit: 5 })
  const { data: applicationsData } = useApplicationsList({ limit: 5 })
  const { data: donationStats } = useDonationStats()

  // Dashboard charts data
  const { data: dashboardStats, isLoading: isStatsLoading, error: statsError } = useDashboardStats()
  const { data: monthlyTrend, isLoading: isTrendLoading, error: trendError } = useMonthlyDonationTrend(6)
  const { data: applicationTypes, isLoading: isTypesLoading } = useApplicationTypeDistribution()
  const { data: cityDistribution, isLoading: isCityLoading } = useCityDistribution()
  const { data: applicationStatus, isLoading: isStatusLoading } = useApplicationStatusDistribution()

  // Memoize stats array to prevent unnecessary recalculations
  const stats = useMemo(() => [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: isStatsLoading ? <Skeleton className="h-7 w-16" /> : (needyData?.count || 0),
      icon: Users,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      description: 'Sistemdeki toplam kayıt',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Bekleyen Başvuru',
      value: isStatsLoading ? <Skeleton className="h-7 w-16" /> : (applicationsData?.data?.filter((app: Application) => app.status === 'new').length || 0),
      icon: Clock,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
      description: 'İşlem bekliyor',
      trend: '+3',
      trendUp: true,
    },
    {
      title: 'Bugünkü Bağış',
      value: isStatsLoading ? <Skeleton className="h-7 w-24" /> : `₺${(donationStats?.today || 0).toLocaleString('tr-TR')}`,
      icon: DollarSign,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
      description: 'Bugün toplanan',
      trend: '+23%',
      trendUp: true,
    },
    {
      title: 'Aylık Bağış',
      value: isStatsLoading ? <Skeleton className="h-7 w-24" /> : `₺${(donationStats?.thisMonth || 0).toLocaleString('tr-TR')}`,
      icon: TrendingUp,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
      description: 'Bu ay toplanan',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Tamamlanan Yardım',
      value: isStatsLoading ? <Skeleton className="h-7 w-16" /> : (applicationsData?.data?.filter((app: Application) => app.status === 'completed').length || 0),
      icon: CheckCircle,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      description: 'Bu ay tamamlanan',
      trend: '+5',
      trendUp: true,
    },
    {
      title: 'Toplam Bağış',
      value: isStatsLoading ? <Skeleton className="h-7 w-16" /> : (donationStats?.count || 0),
      icon: FileText,
      iconColor: 'text-destructive',
      iconBg: 'bg-destructive/10',
      description: 'Tüm zamanlar',
    },
  ], [needyData?.count, applicationsData?.data, donationStats, isStatsLoading])

  // Memoize filtered applications to prevent recalculation on every render
  const recentApplications = useMemo(() => {
    return applicationsData?.data?.slice(0, 5) || []
  }, [applicationsData?.data])

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary' }> = {
      new: { label: 'Yeni', variant: 'info' },
      approved: { label: 'Onaylandı', variant: 'success' },
      completed: { label: 'Tamamlandı', variant: 'secondary' },
      rejected: { label: 'Reddedildi', variant: 'destructive' },
      pending: { label: 'Bekliyor', variant: 'warning' },
    }
    return config[status] || { label: status, variant: 'secondary' }
  }

  const handleApplicationClick = (appId: string) => {
    router.push(`/dashboard/applications/${appId}`)
  }

  // Error display component
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-10 w-10 text-warning mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          description="Yardım yönetim sistemine hoş geldiniz"
          icon={Home}
          actions={
            <div className="flex gap-2">
              <Link href="/dashboard/needy">
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  İhtiyaç Sahipleri
                </Button>
              </Link>
              <Link href="/dashboard/applications">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <FileText className="mr-2 h-4 w-4" />
                  Yeni Başvuru
                </Button>
              </Link>
            </div>
          }
        />

        {/* Stats Cards */}
        <StatsGrid>
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </StatsGrid>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <StaggerCard delay={300}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Son Başvurular</CardTitle>
              <Link href="/dashboard/applications">
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  Tümünü Gör
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app: Application, index: number) => {
                    const statusBadge = getStatusBadge(app.status)
                    return (
                      <div
                        key={app.id}
                        className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:border-primary/50 hover:bg-accent/5 transition-all duration-200 cursor-pointer hover:shadow-sm"
                        style={{ animationDelay: `${(index + 6) * 50}ms` }}
                        onClick={() => handleApplicationClick(app.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplicationClick(app.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Başvuru detayını görüntüle: ${app.needy_person?.first_name} ${app.needy_person?.last_name}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {app.needy_person?.first_name} {app.needy_person?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{app.application_type}</p>
                          </div>
                        </div>
                        <Badge variant={statusBadge.variant} className="text-xs">
                          {statusBadge.label}
                        </Badge>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Henüz başvuru bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </StaggerCard>

          {/* Quick Actions */}
          <StaggerCard delay={350}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard/needy" className="group">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-2 p-4 hover:border-primary hover:bg-accent/5 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">İhtiyaç Sahibi Ekle</p>
                      <p className="text-xs text-muted-foreground">Yeni kayıt oluştur</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/applications" className="group">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-2 p-4 hover:border-info hover:bg-info/5 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                        <FileText className="h-5 w-5 text-info" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Yardım Başvurusu</p>
                      <p className="text-xs text-muted-foreground">Yeni başvuru al</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/donations" className="group">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-2 p-4 hover:border-success hover:bg-success/5 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                        <DollarSign className="h-5 w-5 text-success" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Bağış Kaydet</p>
                      <p className="text-xs text-muted-foreground">Yeni bağış gir</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/dashboard/calendar" className="group">
                  <Button
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-2 p-4 hover:border-warning hover:bg-warning/5 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                        <Calendar className="h-5 w-5 text-warning" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Takvim</p>
                      <p className="text-xs text-muted-foreground">Etkinlikleri görüntüle</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </StaggerCard>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Donation Trend */}
          <StaggerCard delay={400}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Aylık Bağış Trendi
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Diğer seçenekler">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              {isTrendLoading ? (
                <div className="space-y-2 h-[250px]">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : trendError ? (
                <ErrorDisplay message="Veri yüklenirken hata oluştu" />
              ) : monthlyTrend && monthlyTrend.length > 0 ? (
                <TrendChart
                  data={monthlyTrend}
                  labelKey="label"
                  valueKey="value"
                  height={250}
                  color="hsl(174, 73%, 42%)"
                  showArea={true}
                  formatValue={(v) => `₺${v.toLocaleString('tr-TR')}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Veri bulunamadı</p>
                </div>
              )}
            </CardContent>
          </StaggerCard>

          {/* Application Status */}
          <StaggerCard delay={450}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                  <FileText className="h-4 w-4 text-info" />
                </div>
                Başvuru Durumları
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Diğer seçenekler">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              {isStatusLoading ? (
                <div className="flex items-center gap-6 h-[250px]">
                  <Skeleton className="h-40 w-40 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ) : applicationStatus && applicationStatus.length > 0 ? (
                <SimplePieChart
                  data={applicationStatus}
                  labelKey="label"
                  valueKey="value"
                  height={250}
                  showLegend={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Veri bulunamadı</p>
                </div>
              )}
            </CardContent>
          </StaggerCard>

          {/* Aid Type Distribution */}
          <StaggerCard delay={500}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                Yardım Türü Dağılımı
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Diğer seçenekler">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              {isTypesLoading ? (
                <div className="flex items-center gap-6 h-[250px]">
                  <Skeleton className="h-40 w-40 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ) : applicationTypes && applicationTypes.length > 0 ? (
                <SimplePieChart
                  data={applicationTypes}
                  labelKey="label"
                  valueKey="value"
                  height={250}
                  showLegend={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Veri bulunamadı</p>
                </div>
              )}
            </CardContent>
          </StaggerCard>

          {/* City Distribution */}
          <StaggerCard delay={550}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                Şehir Bazlı Dağılım (Top 10)
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Diğer seçenekler">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              {isCityLoading ? (
                <div className="space-y-4 h-[250px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : cityDistribution && cityDistribution.length > 0 ? (
                <SimpleBarChart
                  data={cityDistribution}
                  labelKey="label"
                  valueKey="value"
                  height={250}
                  color="hsl(174, 73%, 42%)"
                  horizontal={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Veri bulunamadı</p>
                </div>
              )}
            </CardContent>
          </StaggerCard>
        </div>
      </div>
    </PageTransition>
  )
}
