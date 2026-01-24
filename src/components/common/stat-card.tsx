import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number | React.ReactNode
  icon: LucideIcon
  description?: string
  trend?: string
  trendUp?: boolean
  className?: string
  iconColor?: string
  iconBg?: string
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  className,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-medium hover:border-primary/20 transition-all duration-200 cursor-default',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                  trendUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )}
              >
                {trendUp ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200', iconBg)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  )
})
