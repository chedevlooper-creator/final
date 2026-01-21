/**
 * Lazy loading utility for heavy components
 * Helps reduce initial bundle size and improve load times
 */

import { lazy, ComponentType, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading component for lazy loaded components
export function LoadingFallback({
  message = "Yükleniyor...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Wrapper for lazy loading with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackMessage?: string,
) {
  const LazyComponent = lazy(importFn);

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Heavy components that should be lazy loaded
export const LazyDonationChart = createLazyComponent(
  () =>
    import("@/components/charts").then((m) => ({ default: m.DonationChart })),
  "Bağış grafiği yükleniyor...",
);

export const LazyCategoryChart = createLazyComponent(
  () =>
    import("@/components/charts").then((m) => ({ default: m.CategoryChart })),
  "Kategori grafiği yükleniyor...",
);

export const LazyAidDistributionChart = createLazyComponent(
  () =>
    import("@/components/charts").then((m) => ({
      default: m.AidDistributionChart,
    })),
  "Yardım dağılımı yükleniyor...",
);

export const LazyStatsCards = createLazyComponent(
  () => import("@/components/charts").then((m) => ({ default: m.StatsCards })),
  "İstatistik kartları yükleniyor...",
);
