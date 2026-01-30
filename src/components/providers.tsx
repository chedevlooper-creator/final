'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { WebVitals, PerformanceMonitor } from '@/components/performance/web-vitals'
import { ViewTransitions, injectViewTransitionStyles } from '@/components/navigation/view-transitions'
import { ProgressBar } from '@/components/navigation/progress-bar'

// Query client oluşturma fonksiyonu - optimization için ayrı
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache süresi - 10 dakika (performans için artırıldı)
        staleTime: 10 * 60 * 1000,

        // Garbage collection time - 30 dakika
        gcTime: 30 * 60 * 1000,

        // Retry ayarları
        retry: (failureCount, error: unknown) => {
          // 404 ve 403 hatalarında retry yapma
          const err = error as { status?: number }
          if (err?.status === 404 || err?.status === 403) {
            return false
          }
          // Maksimum 2 retry
          return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Window focus'ta yeniden fetch etme (performans için)
        refetchOnWindowFocus: false,

        // Reconnect'te refetch et
        refetchOnReconnect: true,

        // Mount'ta refetch ETME (cache'den kullan - performans artışı)
        refetchOnMount: false,
      },
      mutations: {
        // Mutation retry
        retry: 1,
        retryDelay: 1000,
      },
    },
  })
}

// Browser'da singleton pattern
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: her zaman yeni client oluştur
    return makeQueryClient()
  } else {
    // Browser: singleton kullan
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface ProvidersProps {
  children: React.ReactNode
  nonce?: string
}

export function Providers({ children, nonce }: ProvidersProps) {
  const [queryClient] = useState(getQueryClient)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)
      // Inject view transition styles
      injectViewTransitionStyles()
    }, 0)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {mounted && <ProgressBar />}
      {mounted && <ViewTransitions />}
      {mounted && <WebVitals />}
      {mounted && <PerformanceMonitor />}
      {children}
      <Toaster position="top-right" richColors closeButton />
      {process.env['NODE_ENV'] === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
