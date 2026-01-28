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
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [mounted, setMounted] = useState(false)
  
  // Initialize state from localStorage using lazy initialization
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedGroups = localStorage.getItem('sidebar_open_groups')
      if (savedGroups) {
        try {
          return JSON.parse(savedGroups)
        } catch {
          // Fallback to defaults if parse fails
          return ['Başlangıç', 'Yardım Yönetimi']
        }
      }
    }
    return ['Başlangıç', 'Yardım Yönetimi']
  })

  // Client-side hydration
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)
    }, 0)

    return () => clearTimeout(timeout)
  }, [])

  // Save open groups to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      localStorage.setItem('sidebar_open_groups', JSON.stringify(openGroups))
    }
  }, [openGroups, mounted])

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const newGroups = prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
      return newGroups
    })
  }

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card shadow-soft" aria-label="Ana navigasyon">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-primary">
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
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card/95 backdrop-blur-sm transition-all duration-300 ease-out shadow-soft',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Ana navigasyon"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-transparent px-3">
          {!sidebarCollapsed ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity animate-slide-in-right"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-primary hover:shadow-lg transition-all duration-200">
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
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-primary hover:shadow-lg transition-all duration-200"
                  aria-label="Yardım Paneli - Ana sayfaya dön"
                >
                  <Home className="h-5 w-5" />
                </Link>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right" align="center">
                Yardım Paneli - Ana sayfa
              </TooltipContent>
            </Tooltip>
          )}

          {/* Toggle Button */}
          <Tooltip>
            <TooltipPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  'text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200',
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
            <TooltipContent side="right" align="center">
              {sidebarCollapsed ? 'Sidebar\'ı genişlet' : 'Sidebar\'ı daralt'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Menu */}
        <ScrollArea className="h-[calc(100vh-8rem)] scrollbar-thin">
          <nav className="space-y-1 p-2" role="navigation" aria-label="Ana menü">
            {sidebarCollapsed ? (
              // Collapsed mode - flat list with tooltips
              <div className="space-y-1">
                {menuItems.flatMap((group) => group.items).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Tooltip key={item.href}>
                      <TooltipPrimitive.Trigger asChild>
                        <Link
                          href={item.href}
                          prefetch={true}
                          className={cn(
                            'group flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-card',
                            'hover:bg-muted cursor-pointer mx-auto w-10 h-10',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon className={cn(
                            'shrink-0 transition-all duration-200',
                            isActive ? 'h-5 w-5 text-primary' : 'h-5 w-5'
                          )} />
                          {isActive && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </TooltipPrimitive.Trigger>
                      <TooltipContent side="right" align="center">
                        <span>{item.title}</span>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ) : (
              // Expanded mode - grouped collapsible menu
              menuItems.map((group, groupIndex) => (
                <Collapsible
                  key={group.title}
                  open={openGroups.includes(group.title)}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-card',
                        'text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer',
                      )}
                      style={{ animationDelay: `${groupIndex * 50}ms` }}
                      aria-expanded={openGroups.includes(group.title)}
                      aria-controls={`menu-${group.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 p-2 transition-all duration-200 w-8 h-8">
                        <group.icon className="shrink-0 h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground',
                          openGroups.includes(group.title) && 'rotate-180'
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 pl-2" id={`menu-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {group.items.map((item, itemIndex) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          className={cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-card',
                            'hover:bg-muted cursor-pointer',
                            isActive
                              ? 'bg-primary/10 text-primary font-medium'
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
                          {isActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-transparent p-2">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mx-auto h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
                  aria-label="Ayarlar"
                  asChild
                >
                  <Link href="/dashboard/settings/definitions">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right" align="center">
                Ayarlar
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-3 py-2.5"
              aria-label="Ayarlar"
              asChild
            >
              <Link href="/dashboard/settings/definitions">
                <div className="flex items-center justify-center rounded-lg bg-muted p-2 w-8 h-8">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Ayarlar</span>
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
