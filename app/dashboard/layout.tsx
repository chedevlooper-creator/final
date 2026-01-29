'use client'

import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { usePathname } from 'next/navigation'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SkipToContent } from '@/components/layout/skip-to-content'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { MobileMenu } from '@/components/layout/mobile-menu'

function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  const isDetailPage = pathname?.includes('/needy/') && pathname !== '/dashboard/needy'

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <SkipToContent />
      <Sidebar />
      {!isDetailPage && <Header />}
      <MobileMenu />
      <main
        id="main-content"
        className={cn(
          'min-h-screen transition-all duration-300 ease-out',
          !isDetailPage && 'pt-16',
          'pl-0 md:pl-20',
          !sidebarCollapsed && 'md:pl-72',
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
      <MobileBottomNav />
    </div>
  )
}

export default memo(DashboardLayoutClient)
