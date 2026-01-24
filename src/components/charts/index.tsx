'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from 'recharts'

// CSS değişkenlerinden renk değerlerini al
const getCSSColor = (varName: string): string => {
  if (typeof window === 'undefined') return '#10b981' // SSR fallback
  const root = document.documentElement
  const hsl = getComputedStyle(root).getPropertyValue(varName).trim()
  if (!hsl) return '#10b981'
  return `hsl(${hsl})`
}

// Chart renkleri - CSS değişkenlerini kullanır
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
]

interface PieLabelProps {
  category: string
  percent: number
}

const CustomPieLabel = ({ category, percent }: PieLabelProps) => {
  return `${category}: ${(percent * 100).toFixed(0)}%`
}

interface DonationChartProps {
  data: Array<{ date: string; amount: number }>
}

/**
 * Aylık Bağış Grafiği
 */
export function DonationChart({ data }: DonationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          formatter={(value?: number) => value !== undefined ? `${value.toLocaleString('tr-TR')} TL` : ''}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="hsl(var(--success))" 
          strokeWidth={2}
          name="Bağış Tutarı"
          dot={{ fill: 'hsl(var(--success))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface CategoryChartProps {
  data: Array<{ category: string; amount: number }>
}

/**
 * Kategori Bazlı Bağış Dağılımı
 */
export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percent }: any) => `${category}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="hsl(var(--chart-1))"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value?: number) => value !== undefined ? `${value.toLocaleString('tr-TR')} TL` : ''} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: Array<{ name: string; value: number }>
}

/**
 * Yardım Dağılımı Bar Chart
 */
export function AidDistributionChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value?: number) => value !== undefined ? `${value.toLocaleString('tr-TR')} TL` : ''} />
        <Legend />
        <Bar dataKey="value" fill="hsl(var(--info))" name="Yardım Tutarı" />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface StatsCardsProps {
  stats: {
    totalDonations: number
    totalAids: number
    activeNeedy: number
    monthlyGrowth: number
  }
}

/**
 * İstatistik Kartları
 */
export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Toplam Bağış',
      value: `${stats.totalDonations.toLocaleString('tr-TR')} TL`,
      icon: '💰',
      color: 'bg-success',
    },
    {
      title: 'Dağıtılan Yardım',
      value: `${stats.totalAids.toLocaleString('tr-TR')} TL`,
      icon: '🤝',
      color: 'bg-info',
    },
    {
      title: 'Aktif İhtiyaç Sahibi',
      value: stats.activeNeedy.toLocaleString('tr-TR'),
      icon: '👥',
      color: 'bg-accent',
    },
    {
      title: 'Aylık Büyüme',
      value: `%${stats.monthlyGrowth}`,
      icon: '📈',
      color: stats.monthlyGrowth >= 0 ? 'bg-success' : 'bg-danger',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-card rounded-lg shadow p-6 border-l-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color} text-white text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default {
  DonationChart,
  CategoryChart,
  AidDistributionChart,
  StatsCards
}

