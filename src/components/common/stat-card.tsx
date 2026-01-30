import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: ReactNode
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: string
    positive?: boolean
  } | string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'accent'
  className?: string
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-green-50/50 border-green-200',
  warning: 'bg-orange-50/50 border-orange-200',
  danger: 'bg-red-50/50 border-red-200',
  info: 'bg-blue-50/50 border-blue-200',
  primary: 'bg-primary/5 border-primary/20',
  accent: 'bg-accent/5 border-accent/20',
}

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-orange-100 text-orange-600',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconVariantStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {trend && (
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              typeof trend === 'string' 
                ? 'bg-muted text-muted-foreground'
                : trend.positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            )}>
              {typeof trend === 'string' ? trend : trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for mobile
export function StatCardCompact({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  className,
}: Omit<StatCardProps, 'trend'>) {
  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconVariantStyles[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
