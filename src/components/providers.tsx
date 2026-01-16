'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'

// Query client oluşturma fonksiyonu - optimization için ayrı
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache süresi - 5 dakika (veri güncelliği için optimal)
        staleTime: 5 * 60 * 1000,

        // Garbage collection time - 30 dakika
        gcTime: 30 * 60 * 1000,

        // Retry ayarları
        retry: (failureCount, error: any) => {
          // 404 ve 403 hatalarında retry yapma
          if (error?.status === 404 || error?.status === 403) {
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

        // Mount'ta refetch etme (zaten fresh ise)
        refetchOnMount: true,
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

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
