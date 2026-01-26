'use client'

import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import Link from 'next/link'
import { useFinanceSummary, useFinanceTransactions } from '@/hooks/queries/use-finance'
import { Skeleton } from '@/components/ui/skeleton'

export default function FinancePage() {
  const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary()
  const { data: transactions, isLoading: isTransLoading } = useFinanceTransactions({ limit: 5 })

  const stats = [
    { 
      title: 'Toplam Gelir (Ay)', 
      value: isSummaryLoading ? <Skeleton className="h-8 w-24" /> : `₺${(summary?.monthlyIncome || 0).toLocaleString('tr-TR')}`, 
      icon: TrendingUp,
      trend: 'up'
    },
    { 
      title: 'Toplam Gider (Ay)', 
      value: isSummaryLoading ? <Skeleton className="h-8 w-24" /> : `₺${(summary?.monthlyExpense || 0).toLocaleString('tr-TR')}`, 
      icon: TrendingDown,
      trend: 'down'
    },
    { 
      title: 'Kasa Bakiyesi', 
      value: isSummaryLoading ? <Skeleton className="h-8 w-24" /> : `₺${(summary?.cashBalance || 0).toLocaleString('tr-TR')}`, 
      icon: Wallet,
      trend: 'up'
    },
    { 
      title: 'Banka Bakiyesi', 
      value: isSummaryLoading ? <Skeleton className="h-8 w-24" /> : `₺${(summary?.bankBalance || 0).toLocaleString('tr-TR')}`, 
      icon: CreditCard,
      trend: 'up'
    },
  ]

  const quickActions = [
    { title: 'Kasa İşlemleri', href: '/dashboard/finance/cash', icon: Wallet, color: 'bg-info' },
    { title: 'Banka İşlemleri', href: '/dashboard/finance/bank', icon: CreditCard, color: 'bg-success' },
    { title: 'Raporlar', href: '/dashboard/finance/reports', icon: TrendingUp, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finans"
        description="Finansal işlemler ve raporlar"
        icon={CreditCard}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <ArrowDownLeft className="mr-2 h-4 w-4 text-success" />
              Gelir Ekle
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Gider Ekle
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.trend === 'up' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <Icon className={`h-6 w-6 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Link key={idx} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">Detayları görüntüle</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isTransLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))
            ) : transactions?.data?.length ? (
              transactions.data.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      {t.type === 'income' ? (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{t.description || t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-medium ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'income' ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">İşlem bulunamadı</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
