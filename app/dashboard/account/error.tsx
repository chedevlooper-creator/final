'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function AccountError({
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
      title="Hesap Modülü Hatası"
      backHref="/dashboard/account"
      backLabel="Hesabım"
    />
  )
}
