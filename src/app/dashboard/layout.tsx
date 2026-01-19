'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useUIStore } from '@/stores/ui-store'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useUIStore()
  const pathname = usePathname()

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
