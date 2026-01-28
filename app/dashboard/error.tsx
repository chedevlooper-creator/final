'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-destructive/10 mb-6">
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Bir hata oluştu</h1>
        <p className="mt-3 text-muted-foreground">
          {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground/60 font-mono">Hata Kodu: {error.digest}</p>
        )}
        <div className="flex gap-3 mt-6">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Tekrar Dene
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
