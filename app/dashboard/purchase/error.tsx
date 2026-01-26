'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function PurchaseError({
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
      title="Satın Alma Modülü Hatası"
      backHref="/dashboard/purchase"
      backLabel="Satın Alma"
    />
  )
}
