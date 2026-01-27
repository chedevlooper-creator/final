'use client'

/**
 * Standart Error Page Component
 * Tum moduller icin tutarli hata UI'i saglar
 */

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  backHref?: string
  backLabel?: string
}

export function ErrorPage({
  error,
  reset,
  title = 'Bir Hata Oluştu',
  backHref = '/dashboard',
  backLabel = 'Ana Sayfa',
}: ErrorPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            {title}
          </h1>

          {/* Message */}
          <p className="text-center text-muted-foreground mb-6">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </p>

          {/* Error Details (Dev Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 p-3 bg-muted rounded-lg text-sm">
              <summary className="cursor-pointer font-medium text-foreground mb-2">
                Teknik Detaylar
              </summary>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backLabel}
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Code */}
          {error.digest && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Hata Kodu: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
