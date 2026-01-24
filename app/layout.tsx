import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Yardım Yönetim Paneli',
  description: 'Sivil toplum kuruluşları için kapsamlı yardım yönetim sistemi',
  // Preconnect for external resources (Google Fonts)
  other: {
    'x-dns-prefetch-control': 'on',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

// Partial Prerendering için
// MIGRATED: Removed export const revalidate = 3600 (incompatible with Cache Components) // 1 saat

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
