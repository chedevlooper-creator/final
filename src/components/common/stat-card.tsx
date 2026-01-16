import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconColor?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconColor = 'text-emerald-500',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-slate-400">geçen aya göre</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
            iconColor === 'text-emerald-500' && 'from-emerald-50 to-emerald-100',
            iconColor === 'text-blue-500' && 'from-blue-50 to-blue-100',
            iconColor === 'text-purple-500' && 'from-purple-50 to-purple-100',
            iconColor === 'text-orange-500' && 'from-orange-50 to-orange-100',
            iconColor === 'text-red-500' && 'from-red-50 to-red-100',
            iconColor === 'text-cyan-500' && 'from-cyan-50 to-cyan-100'
          )}
        >
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  )
}
