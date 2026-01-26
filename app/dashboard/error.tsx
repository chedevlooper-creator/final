'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Dashboard Hatası"
      backHref="/dashboard"
      backLabel="Ana Sayfa"
    />
  )
}
