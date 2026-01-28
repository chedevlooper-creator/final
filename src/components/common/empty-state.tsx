'use client'

import { LucideIcon, FileX, Search, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: LucideIcon
  onAction?: () => void
  actionHref?: string
  secondaryLabel?: string
  onSecondaryAction?: () => void
  className?: string
  variant?: 'default' | 'search' | 'error'
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onAction,
  actionHref,
  secondaryLabel,
  onSecondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const variantStyles = {
    default: 'bg-muted/30',
    search: 'bg-info/5',
    error: 'bg-destructive/5',
  }

  const iconStyles = {
    default: 'text-muted-foreground',
    search: 'text-info',
    error: 'text-destructive',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className={cn('p-4 rounded-full mb-4', variantStyles[variant])}>
        <Icon className={cn('h-10 w-10', iconStyles[variant])} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
          {description}
        </p>
      )}
      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-3 mt-6">
          {actionLabel && (
            actionHref ? (
              <Button asChild>
                <a href={actionHref}>
                  <ActionIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  {actionLabel}
                </a>
              </Button>
            ) : (
              <Button onClick={onAction}>
                <ActionIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                {actionLabel}
              </Button>
            )
          )}
          {secondaryLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Preset variants
export function SearchEmptyState({ 
  searchTerm,
  onClear,
}: { 
  searchTerm?: string
  onClear?: () => void 
}) {
  return (
    <EmptyState
      icon={Search}
      variant="search"
      title="Sonuç bulunamadı"
      description={searchTerm 
        ? `"${searchTerm}" için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
        : 'Arama kriterlerinize uygun kayıt bulunamadı.'
      }
      actionLabel={onClear ? 'Aramayı Temizle' : undefined}
      actionIcon={RefreshCw}
      onAction={onClear}
    />
  )
}

export function NoDataEmptyState({
  entity,
  actionLabel,
  actionHref,
  onAction,
}: {
  entity: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}) {
  return (
    <EmptyState
      title={`Henüz ${entity} yok`}
      description={`Sisteme ${entity} eklediğinizde burada görünecektir.`}
      actionLabel={actionLabel || `${entity} Ekle`}
      actionHref={actionHref}
      onAction={onAction}
    />
  )
}

export function ErrorEmptyState({
  onRetry,
}: {
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={RefreshCw}
      variant="error"
      title="Veriler yüklenemedi"
      description="Bir hata oluştu. Lütfen tekrar deneyin."
      actionLabel="Tekrar Dene"
      actionIcon={RefreshCw}
      onAction={onRetry}
    />
  )
}
