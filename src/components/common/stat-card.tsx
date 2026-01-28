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
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning'
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  className,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border/50',
    primary: 'bg-primary/5 border-primary/20',
    accent: 'bg-accent/5 border-accent/20',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-warning/5 border-warning/20',
  }

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  }

  return (
    <div
      className={cn(
        'card-bento flex items-start gap-4',
        variantStyles[variant],
        className
      )}
    >
      <div className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
        iconStyles[variant]
      )}>
        <Icon className="h-6 w-6" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground truncate">
            {title}
          </h3>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold',
                trendUp 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
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
        
        <div className="mt-1 text-2xl font-bold tracking-tight truncate">
          {value}
        </div>
        
        {description && (
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  )
})
