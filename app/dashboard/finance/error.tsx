'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function FinanceError({
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
      title="Finans Modülü Hatası"
      backHref="/dashboard/finance"
      backLabel="Finans"
    />
  )
}
