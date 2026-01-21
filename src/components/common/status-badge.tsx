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
  success: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
  error: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
  info: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
  outline: 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200',
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
