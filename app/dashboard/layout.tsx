'use client'

import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { usePathname } from 'next/navigation'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SkipToContent } from '@/components/layout/skip-to-content'

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
      <main
        id="main-content"
        className={cn(
          'min-h-screen transition-all duration-300 ease-out',
          !isDetailPage && 'pt-16',
          sidebarCollapsed ? 'pl-20' : 'pl-72'
        )}
      >
        <div className={cn(
          'h-full',
          isDetailPage ? 'p-0' : 'p-6'
        )}>
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default memo(DashboardLayoutClient)
