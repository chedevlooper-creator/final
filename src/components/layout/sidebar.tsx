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
  const [openGroups, setOpenGroups] = useState<string[]>(['Başlangıç', 'Yardım Yönetimi'])

  // Client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-slate-900" aria-label="Ana navigasyon">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-primary">
              <Heart className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold text-white">Yardım Paneli</h1>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border/10 bg-slate-900 transition-all duration-300 ease-out shadow-xl',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Ana navigasyon"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900 px-3">
          {!sidebarCollapsed ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity animate-slide-in-right"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-primary hover:shadow-lg transition-all duration-200">
                <Heart className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-white">
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
                  'text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200',
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
                            'group flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-900',
                            'hover:bg-white/5 cursor-pointer mx-auto w-10 h-10',
                            isActive
                              ? 'bg-white/10 text-white'
                              : 'text-gray-400 hover:text-white',
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon className={cn(
                            'shrink-0 transition-all duration-200',
                            isActive ? 'h-5 w-5 text-white' : 'h-5 w-5'
                          )} />
                          {isActive && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-white/50" />
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
                        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-900',
                        'text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer',
                      )}
                      style={{ animationDelay: `${groupIndex * 50}ms` }}
                      aria-expanded={openGroups.includes(group.title)}
                      aria-controls={`menu-${group.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 p-2 transition-all duration-200 w-8 h-8">
                        <group.icon className="shrink-0 h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 text-gray-500',
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
                            'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 outline-none focus-visible focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-900',
                            'hover:bg-white/5 cursor-pointer',
                            isActive
                              ? 'bg-white/10 text-white font-medium'
                              : 'text-gray-400 hover:text-white',
                          )}
                          style={{ animationDelay: `${(groupIndex * 50) + (itemIndex * 25)}ms` }}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon className={cn(
                            'shrink-0 transition-all duration-200',
                            isActive ? 'h-4 w-4 text-white' : 'h-4 w-4 text-gray-400 group-hover:text-white'
                          )} />
                          <span>{item.title}</span>
                          {isActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-white/50" />
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
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900 p-2">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mx-auto h-10 w-10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
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
              className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2.5"
              aria-label="Ayarlar"
              asChild
            >
              <Link href="/dashboard/settings/definitions">
                <div className="flex items-center justify-center rounded-lg bg-white/5 p-2 w-8 h-8">
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
