'use client'

import type { ReactNode } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { memo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SkipToContent } from '@/components/layout/skip-to-content'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { MobileMenu } from '@/components/layout/mobile-menu'

function DashboardLayoutClient({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDetailPage = pathname?.includes('/needy/') && pathname !== '/dashboard/needy'

  // Default to expanded for SSR to match sidebar's default
  const isCollapsed = mounted ? sidebarCollapsed : false

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <SkipToContent />
      <aside role="navigation" aria-label="Ana navigasyon">
        <Sidebar />
      </aside>
      {!isDetailPage && <Header />}
      <MobileMenu />
      <main
        id="main-content"
        role="main"
        aria-label="Ana içerik"
        className={cn(
          'min-h-screen transition-all duration-300 ease-out',
          !isDetailPage && 'pt-16',
          'pl-0 md:pl-64',
          isCollapsed && 'md:pl-20',
          'pb-16 md:pb-0'
        )}
      >
        <div className={cn(
          'h-full',
          isDetailPage ? 'p-0' : 'p-4 md:p-6'
        )}>
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
      <nav role="navigation" aria-label="Mobil navigasyon">
        <MobileBottomNav />
      </nav>
    </div>
  )
}

export default memo(DashboardLayoutClient)
