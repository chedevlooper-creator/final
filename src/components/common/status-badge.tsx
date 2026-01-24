'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'

export interface StatusBadgeProps {
  status: string
  label?: string
  mapping?: Record<string, { label: string; variant: BadgeVariant }>
  className?: string
}

const DEFAULT_MAPPING: Record<string, { label: string; variant: BadgeVariant }> = {
  // General
  active: { label: 'Aktif', variant: 'success' },
  inactive: { label: 'Pasif', variant: 'outline' },
  pending: { label: 'Beklemede', variant: 'warning' },
  
  // Applications / Missions
  new: { label: 'Yeni', variant: 'info' },
  approved: { label: 'Onaylandı', variant: 'success' },
  rejected: { label: 'Reddedildi', variant: 'error' },
  completed: { label: 'Tamamlandı', variant: 'success' },
  cancelled: { label: 'İptal Edildi', variant: 'error' },
  
  // Finance
  income: { label: 'Gelir', variant: 'success' },
  expense: { label: 'Gider', variant: 'error' },
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: '',
  success: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  warning: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20',
  error: 'bg-danger/10 text-danger hover:bg-danger/20 border-danger/20',
  info: 'bg-info/10 text-info hover:bg-info/20 border-info/20',
  outline: 'bg-muted text-muted-foreground hover:bg-muted/80 border-border',
}

export function StatusBadge({ status, label, mapping, className }: StatusBadgeProps) {
  const config = (mapping || DEFAULT_MAPPING)[status] || { label: status, variant: 'default' }
  const displayLabel = label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium transition-colors',
        VARIANT_CLASSES[config.variant as BadgeVariant],
        className
      )}
    >
      {displayLabel}
    </Badge>
  )
}
