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
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  // Client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detay sayfasinda Header'i gizle
  const isDetailPage = pathname?.includes('/needy/') && pathname !== '/needy'

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      {!isDetailPage && <Header />}
      <main
        className={cn(
          'min-h-screen transition-all duration-200',
          !isDetailPage && 'pt-16',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
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
