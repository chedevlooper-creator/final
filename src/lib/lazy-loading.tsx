/**
 * Lazy loading utility for heavy components
 * Helps reduce initial bundle size and improve load times
 */

import { lazy, ComponentType, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading component for lazy loaded components
export function LoadingFallback({ message = 'Yükleniyor...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// Wrapper for lazy loading with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackMessage?: string
) {
  const LazyComponent = lazy(importFn)
  
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Heavy components that should be lazy loaded
export const LazyCharts = createLazyComponent(
  () => import('@/components/charts'),
  'Grafikler yükleniyor...'
)

export const LazyReports = createLazyComponent(
  () => import('@/components/reports'),
  'Raporlar yükleniyor...'
)

export const LazyCalendar = createLazyComponent(
  () => import('@/components/calendar'),
  'Takvim yükleniyor...'
)

export const LazyMap = createLazyComponent(
  () => import('@/components/map'),
  'Harita yükleniyor...'
)

export const LazyDataGrid = createLazyComponent(
  () => import('@/components/ui/data-grid'),
  'Tablo yükleniyor...'
)
