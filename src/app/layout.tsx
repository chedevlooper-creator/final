import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Yardım Yönetim Paneli',
  description: 'Sivil toplum kuruluşları için kapsamlı yardım yönetim sistemi',
  // Preconnect for external resources
  other: {
    'x-dns-prefetch-control': 'on',
  },
}

// Partial Prerendering için
export const revalidate = 3600 // 1 saat

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
