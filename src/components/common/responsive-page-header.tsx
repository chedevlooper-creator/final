'use client'

import { useDeviceType } from '@/hooks/use-device-type'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface ResponsivePageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  breadcrumb?: ReactNode
  className?: string
}

/**
 * Responsive sayfa başlığı bileşeni
 * Desktop: Başlık ve butonlar yan yana
 * Mobil: Başlık üstte, butonlar altta (tam genişlik)
 */
export function ResponsivePageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
  className,
}: ResponsivePageHeaderProps) {
  const { isMobile } = useDeviceType()

  return (
    <div
      className={cn(
        'flex gap-4 pb-6',
        isMobile ? 'flex-col' : 'flex-row items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow shrink-0">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <div className="text-xs text-muted-foreground mb-0.5">{breadcrumb}</div>
          )}
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className={cn(
          'flex gap-2 shrink-0',
          isMobile && 'w-full flex-col'
        )}>
          {actions}
        </div>
      )}
    </div>
  )
}
