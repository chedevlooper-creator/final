'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function OrphansError({
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
      title="Yetim Modülü Hatası"
      backHref="/dashboard/orphans"
      backLabel="Yetimler"
    />
  )
}
