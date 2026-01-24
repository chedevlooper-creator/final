'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { menuItems } from '@/lib/menu-config'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Home,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

export function Sidebar() {
  const pathname = usePathname()

  // Zustand store selectors
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [mounted, setMounted] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['Başlangıç', 'Yardım Yönetimi'])

  // Client-side hydration
  useEffect(() => {
    setMounted(true)

    // Mobile: Close sidebar on navigation
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [pathname, setSidebarOpen])

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card md:block" aria-label="Ana navigasyon">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-primary">
              <Heart className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Yardım Paneli</h1>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-border bg-card transition-all duration-300 ease-out shadow-xl md:shadow-none md:z-40',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        aria-label="Ana navigasyon"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-3">
          {!sidebarCollapsed ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity animate-slide-in-right"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-primary hover:shadow-lg transition-all duration-200">
                <Heart className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-foreground">
                Yardım Paneli
              </h1>
            </Link>
          ) : (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Link
                  href="/dashboard"
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-primary hover:shadow-lg transition-all duration-200"
                  aria-label="Yardım Paneli - Ana sayfaya dön"
                >
                  <Home className="h-5 w-5" />
                </Link>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right" align="center" className="hidden md:block">
                Yardım Paneli - Ana sayfa
              </TooltipContent>
            </Tooltip>
          )}

          {/* Desktop Toggle Button */}
          <Tooltip>
            <TooltipPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  'hidden md:flex text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200',
                  sidebarCollapsed && 'mx-auto'
                )}
                aria-label={sidebarCollapsed ? 'Sidebar\'ı genişlet' : 'Sidebar\'ı daralt'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
                )}
              </Button>
            </TooltipPrimitive.Trigger>
            <TooltipContent side="right" align="center" className="hidden md:block">
              {sidebarCollapsed ? 'Sidebar\'ı genişlet' : 'Sidebar\'ı daralt'}
            </TooltipContent>
          </Tooltip>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-danger md:hidden ml-auto"
            aria-label="Sidebar'ı kapat"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu */}
        <ScrollArea className="h-[calc(100vh-8rem)] scrollbar-thin">
          <nav className="space-y-1 p-2" role="navigation" aria-label="Ana menü">
            {menuItems.map((group, groupIndex) => (
              <Collapsible
                key={group.title}
                open={!sidebarCollapsed && openGroups.includes(group.title)}
                onOpenChange={() => !sidebarCollapsed && toggleGroup(group.title)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      'text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer',
                      sidebarCollapsed && 'justify-center px-0',
                    )}
                    style={{ animationDelay: `${groupIndex * 50}ms` }}
                    aria-expanded={!sidebarCollapsed && openGroups.includes(group.title)}
                    aria-controls={`menu-${group.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className={cn(
                      'flex items-center justify-center rounded-lg p-2 transition-all duration-200',
                      'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary',
                      sidebarCollapsed ? 'w-10 h-10' : 'w-8 h-8'
                    )}>
                      <group.icon className={cn('shrink-0', sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{group.title}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground',
                            openGroups.includes(group.title) && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5 pl-2" id={`menu-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {group.items.map((item, itemIndex) => {
                    const isActive = pathname === item.href
                    return (
                      <Tooltip key={item.href}>
                        <TooltipPrimitive.Trigger asChild>
                          <Link
                            href={item.href}
                            prefetch={true}
                            className={cn(
                              'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-ring focus:ring-offset-2',
                              'hover:bg-muted/50 cursor-pointer',
                              isActive
                                ? 'bg-primary/10 text-primary font-medium shadow-inner-soft'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                            style={{ animationDelay: `${(groupIndex * 50) + (itemIndex * 25)}ms` }}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <item.icon className={cn(
                              'shrink-0 transition-all duration-200',
                              isActive ? 'h-4 w-4 text-primary' : 'h-4 w-4 text-muted-foreground group-hover:text-foreground'
                            )} />
                            <span>{item.title}</span>
                            {isActive && !sidebarCollapsed && (
                              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-primary animate-pulse-subtle" />
                            )}
                          </Link>
                        </TooltipPrimitive.Trigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right" align="start" className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-primary" />
                            <span>{item.title}</span>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/50 backdrop-blur-sm p-2">
          {!sidebarCollapsed ? (
            <div className="text-center text-xs text-muted-foreground">
              Yardım Yönetim Paneli v1.0
            </div>
          ) : (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mx-auto h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                  aria-label="Ayarlar"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right">
                Ayarlar
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
