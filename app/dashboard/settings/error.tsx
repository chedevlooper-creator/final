'use client'

import { ErrorPage } from '@/components/common/error-page'

export default function SettingsError({
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
      title="Ayarlar Modülü Hatası"
      backHref="/dashboard/settings"
      backLabel="Ayarlar"
    />
  )
}
