'use client'

import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { usePathname } from 'next/navigation'

// Import components directly to avoid dynamic import issues with Zustand
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SkipToContent } from '@/components/layout/skip-to-content'

function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // Use a selector function that returns a stable value
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  // Detay sayfasinda Header'i gizle
  const isDetailPage = pathname?.includes('/needy/') && pathname !== '/needy'

  return (
    <div className="min-h-screen bg-gradient-surface" suppressHydrationWarning>
      <SkipToContent />
      <Sidebar />
      {!isDetailPage && <Header />}
      <main
        id="main-content"
        className={cn(
          'min-h-screen transition-all duration-300 ease-out',
          !isDetailPage && 'pt-16',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className={cn('container mx-auto px-6 py-6', !isDetailPage && 'p-6')}>
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

// Memo the layout to prevent unnecessary re-renders
export default memo(DashboardLayoutClient)
