'use client'

import React, { useMemo } from 'react'
import { StatCard } from '@/components/common/stat-card'
import { PageHeader } from '@/components/common/page-header'
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
  Plus,
  LucideIcon,
} from 'lucide-react'
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

// Bento Card Component
function BentoCard({ 
  children, 
  className,
  colSpan = 1,
  rowSpan = 1 
}: { 
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2
}) {
  return (
    <div 
      className={cn(
        'card-bento overflow-hidden',
        colSpan === 2 && 'col-span-2',
        colSpan === 3 && 'col-span-3',
        colSpan === 4 && 'col-span-4',
        rowSpan === 2 && 'row-span-2',
        className
      )}
    >
      {children}
    </div>
  )
}

// Section Header
function SectionHeader({ 
  title, 
  icon: Icon, 
  action 
}: { 
  title: string
  icon?: LucideIcon
  action?: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: needyData } = useNeedyList({ limit: 5 })
  const { data: applicationsData } = useApplicationsList({ limit: 5 })
  const { data: donationStats } = useDonationStats()

  const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats()
  const { data: monthlyTrend, isLoading: isTrendLoading } = useMonthlyDonationTrend(6)
  const { data: applicationTypes, isLoading: isTypesLoading } = useApplicationTypeDistribution()
  const { data: cityDistribution, isLoading: isCityLoading } = useCityDistribution()
  const { data: applicationStatus, isLoading: isStatusLoading } = useApplicationStatusDistribution()

  const stats = useMemo(() => [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: isStatsLoading ? <Skeleton className="h-8 w-20" /> : (needyData?.count || 0),
      icon: Users,
      description: 'Sistemdeki toplam kayıt',
      trend: '+12%',
      trendUp: true,
      variant: 'primary' as const,
    },
    {
      title: 'Bekleyen Başvuru',
      value: isStatsLoading ? <Skeleton className="h-8 w-16" /> : (applicationsData?.data?.filter((app: Application) => app.status === 'new').length || 0),
      icon: Clock,
      description: 'İşlem bekliyor',
      trend: '+3',
      trendUp: true,
      variant: 'warning' as const,
    },
    {
      title: 'Bugünkü Bağış',
      value: isStatsLoading ? <Skeleton className="h-8 w-28" /> : `₺${(donationStats?.today || 0).toLocaleString('tr-TR')}`,
      icon: DollarSign,
      description: 'Bugün toplanan',
      trend: '+23%',
      trendUp: true,
      variant: 'success' as const,
    },
    {
      title: 'Aylık Bağış',
      value: isStatsLoading ? <Skeleton className="h-8 w-28" /> : `₺${(donationStats?.thisMonth || 0).toLocaleString('tr-TR')}`,
      icon: TrendingUp,
      description: 'Bu ay toplanan',
      trend: '+8%',
      trendUp: true,
      variant: 'accent' as const,
    },
  ], [needyData?.count, applicationsData?.data, donationStats, isStatsLoading])

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

  const recentApplications = useMemo(() => {
    return applicationsData?.data?.slice(0, 5) || []
  }, [applicationsData?.data])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Yardım yönetim sistemine hoş geldiniz"
        icon={Home}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/needy">
              <Button variant="secondary" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">İhtiyaç Sahipleri</span>
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button className="btn-primary gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Yeni Başvuru</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Applications */}
        <BentoCard colSpan={2}>
          <SectionHeader 
            title="Son Başvurular" 
            icon={FileText}
            action={
              <Link href="/dashboard/applications">
                <Button variant="ghost" size="sm" className="gap-1">
                  Tümünü Gör
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app: Application, index: number) => {
                const statusBadge = getStatusBadge(app.status)
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {app.needy_person?.first_name} {app.needy_person?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{app.application_type}</p>
                      </div>
                    </div>
                    <Badge variant={statusBadge.variant} className="text-xs font-semibold">
                      {statusBadge.label}
                    </Badge>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Henüz başvuru bulunmuyor</p>
                <Link href="/dashboard/applications">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Plus className="h-4 w-4" />
                    İlk Başvuruyu Oluştur
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Quick Actions */}
        <BentoCard>
          <SectionHeader title="Hızlı İşlemler" icon={Calendar} />
          <div className="grid grid-cols-1 gap-3">
            <Link href="/dashboard/needy">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">İhtiyaç Sahibi Ekle</p>
                  <p className="text-xs text-muted-foreground">Yeni kayıt oluştur</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Yardım Başvurusu</p>
                  <p className="text-xs text-muted-foreground">Yeni başvuru al</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/donations">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Bağış Kaydet</p>
                  <p className="text-xs text-muted-foreground">Yeni bağış gir</p>
                </div>
              </Button>
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Donation Trend */}
        <BentoCard>
          <SectionHeader 
            title="Aylık Bağış Trendi" 
            icon={TrendingUp}
          />
          <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-lg">
            {isTrendLoading ? (
              <Skeleton className="h-full w-full" />
            ) : monthlyTrend && monthlyTrend.length > 0 ? (
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Grafik burada görüntülenecek</p>
              </div>
            ) : (
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Veri bulunmuyor</p>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Application Status */}
        <BentoCard>
          <SectionHeader 
            title="Başvuru Durumları" 
            icon={CheckCircle}
          />
          <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-lg">
            {isStatusLoading ? (
              <Skeleton className="h-full w-full" />
            ) : applicationStatus && applicationStatus.length > 0 ? (
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Grafik burada görüntülenecek</p>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Veri bulunmuyor</p>
              </div>
            )}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}
