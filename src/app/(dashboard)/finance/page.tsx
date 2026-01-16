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
  Plus,
} from 'lucide-react'
import Link from 'next/link'

export default function FinancePage() {
  const stats = [
    { title: 'Toplam Gelir (Ay)', value: '₺125.450', change: '+12%', trend: 'up', icon: TrendingUp },
    { title: 'Toplam Gider (Ay)', value: '₺98.320', change: '+8%', trend: 'up', icon: TrendingDown },
    { title: 'Kasa Bakiyesi', value: '₺45.230', icon: Wallet },
    { title: 'Banka Bakiyesi', value: '₺892.150', icon: CreditCard },
  ]

  const quickActions = [
    { title: 'Kasa İşlemleri', href: '/finance/cash', icon: Wallet, color: 'bg-blue-500' },
    { title: 'Banka İşlemleri', href: '/finance/bank', icon: CreditCard, color: 'bg-green-500' },
    { title: 'Raporlar', href: '/finance/reports', icon: TrendingUp, color: 'bg-purple-500' },
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
              <ArrowDownLeft className="mr-2 h-4 w-4 text-green-600" />
              Gelir Ekle
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
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
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.trend === 'up' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Icon className={`h-6 w-6 ${stat.trend === 'up' ? 'text-green-600' : 'text-blue-600'}`} />
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
                      <p className="text-sm text-slate-500">Detayları görüntüle</p>
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
            {[
              { type: 'in', desc: 'Bağış - Mehmet Yılmaz', amount: 5000, date: '15.01.2026' },
              { type: 'out', desc: 'Nakdi Yardım - Ahmet Kaya', amount: 2500, date: '15.01.2026' },
              { type: 'in', desc: 'Zekat - Anonim', amount: 10000, date: '14.01.2026' },
              { type: 'out', desc: 'Gıda Alımı', amount: 8500, date: '14.01.2026' },
            ].map((t, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.type === 'in' ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{t.desc}</p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                  </div>
                </div>
                <p className={`font-medium ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'in' ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
