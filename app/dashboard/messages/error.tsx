'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function MessagesError({
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
      title="Mesajlar Modülü Hatası"
      backHref="/dashboard/messages"
      backLabel="Mesajlar"
    />
  )
}
