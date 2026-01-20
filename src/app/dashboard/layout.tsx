'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/ui-store'

const Sidebar = dynamic(() => import('@/components/layout/sidebar').then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
})

const Header = dynamic(() => import('@/components/layout/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
})

function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use store only after mount
  const sidebarCollapsed = mounted ? useUIStore((state) => state.sidebarCollapsed) : false

  // Detay sayfasinda Header'i gizle
  const isDetailPage = pathname?.includes('/needy/') && pathname !== '/needy'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      {!isDetailPage && <Header />}
      <main
        className={cn(
          'min-h-screen transition-all duration-200',
          !isDetailPage && 'pt-16',
          mounted && sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className={cn('container mx-auto', !isDetailPage && 'p-6')}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default dynamic(() => Promise.resolve(DashboardLayoutClient), {
  ssr: false,
})
