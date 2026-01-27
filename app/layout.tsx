import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'https://yardimyonetim.com'),
  title: {
    default: 'Yardım Yönetim Paneli - NGO Management System',
    template: '%s | Yardım Yönetim Paneli',
  },
  description: 'Sivil toplum kuruluşları, dernekler ve vakıflar için kapsamlı yardım ve bağış yönetim sistemi. İhtiyaç sahipleri takibi, bağış yönetimi, gönüllü koordinasyonu ve finansal raporlama tek bir platformda.',
  keywords: [
    'yardım yönetim',
    'ngo yazılımı',
    'dernek yönetim sistemi',
    'bağış takibi',
    'gönüllü yönetimi',
    'vakıf yazılımı',
    'ihtiyaç sahipleri',
    'sosyal yardım',
    'türkçe ngo',
  ],
  authors: [{ name: 'Yardım Yönetim Paneli', url: 'https://yardimyonetim.com' }],
  creator: 'Yardım Yönetim Paneli',
  publisher: 'Yardım Yönetim Paneli',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    url: 'https://yardimyonetim.com',
    title: 'Yardım Yönetim Paneli - NGO Management System',
    description: 'Sivil toplum kuruluşları için kapsamlı yardım yönetim sistemi',
    siteName: 'Yardım Yönetim Paneli',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Yardım Yönetim Paneli',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yardım Yönetim Paneli',
    description: 'Sivil toplum kuruluşları için kapsamlı yardım yönetim sistemi',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  // Preconnect for external resources
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
