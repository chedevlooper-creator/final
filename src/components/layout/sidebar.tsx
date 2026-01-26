'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { menuItems } from '@/lib/menu-config'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

export function Sidebar() {
  const pathname = usePathname()

  // Zustand store selectors
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [mounted, setMounted] = useState(false)

  // Client-side hydration
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r shadow-xl bg-sidebar border-sidebar-border" aria-label="Ana navigasyon">
        <div className="flex h-16 items-center border-b px-6 border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">YARDIM PANELİ</span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
<aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 ease-in-out shadow-xl flex flex-col bg-sidebar border-sidebar-border',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Ana navigasyon"
      >
        {/* Header Section */}
        <div className="flex h-16 items-center justify-between border-b px-4 shrink-0 relative z-10 bg-sidebar border-sidebar-border">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 px-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="text-xs font-bold tracking-widest text-white uppercase">
                YARDIM PANELİ
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200">
              <Heart className="h-5 w-5 fill-current" />
            </Link>
          )}
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-sidebar-foreground/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="p-4 flex justify-center shrink-0 border-b relative z-10 bg-sidebar border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-sidebar-foreground/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}

{/* Navigation Area */}
        <ScrollArea className="flex-1 px-3 py-4 overflow-hidden">
          <nav className="space-y-6" role="navigation">
            {menuItems.map((group) => (
              <div key={group.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40 mb-3">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipPrimitive.Trigger asChild>
                            <Link
                              href={item.href}
                              aria-label={item.title}
                              aria-current={isActive ? 'page' : undefined}
                              className={cn(
                                'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 outline-none mx-auto',
                                isActive
                                  ? 'bg-primary text-white shadow-lg shadow-primary/40'
                                  : 'text-sidebar-foreground hover:text-white hover:bg-white/5',
                              )}
                            >
                              <item.icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110')} />
                            </Link>
                          </TooltipPrimitive.Trigger>
                          <TooltipContent side="right" className="bg-sidebar text-white border-sidebar-border font-medium">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 outline-none',
                          isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/40 font-medium'
                            : 'text-sidebar-foreground hover:text-white hover:bg-white/5',
                        )}
                      >
                        <item.icon className={cn(
                          'shrink-0 transition-all duration-200 h-4 w-4',
                          isActive ? 'text-white' : 'group-hover:scale-110'
                        )} />
                        <span className="flex-1">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

{/* Footer Settings */}
        <div className="p-3 border-t shrink-0 relative z-10 bg-sidebar border-sidebar-border">
          <Link
            href="/dashboard/settings/definitions"
            aria-label="Ayarlar"
            aria-current={pathname.includes('/settings') ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 outline-none',
              pathname.includes('/settings')
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-sidebar-foreground hover:text-white hover:bg-white/5',
              sidebarCollapsed && 'justify-center px-0 h-11 w-11 mx-auto'
            )}
          >
            <Settings className={cn('shrink-0 h-4 w-4 transition-transform duration-200 group-hover:rotate-45')} />
            {!sidebarCollapsed && <span className="flex-1 font-medium text-sm">Ayarlar</span>}
          </Link>
        </div>
      </aside>
    </TooltipProvider>
  )
}
