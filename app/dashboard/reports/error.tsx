'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function ReportsError({
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
      title="Raporlar Modülü Hatası"
      backHref="/dashboard/reports"
      backLabel="Raporlar"
    />
  )
}
