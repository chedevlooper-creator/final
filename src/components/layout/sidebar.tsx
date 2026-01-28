'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { menuItems } from '@/lib/menu-config'
import {
  ChevronLeft,
  ChevronDown,
  Heart,
  Home,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useUIStore } from '@/stores/ui-store'

export function Sidebar() {
  const pathname = usePathname()
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
          return ['Başlangıç', 'Yardım Yönetimi']
        }
      }
    }
    return ['Başlangıç', 'Yardım Yönetimi']
  })

  useEffect(() => {
    setMounted(true)
  }, [])

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
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card shadow-card border-r border-border">
        <div className="flex h-16 items-center px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Yardım Paneli</span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card shadow-card border-r border-border transition-all duration-300 ease-out',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md transition-transform hover:scale-105">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Yardım Paneli
              </span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Link
                  href="/dashboard"
                  className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md"
                >
                  <Home className="h-5 w-5 text-white" />
                </Link>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right">
                Ana Sayfa
              </TooltipContent>
            </Tooltip>
          )}

          {!sidebarCollapsed && (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-9 w-9 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right">
                Daralt
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Menu */}
        <ScrollArea className="h-[calc(100vh-8rem)] scrollbar-soft">
          <nav className="p-3 space-y-1">
            {sidebarCollapsed ? (
              // Collapsed mode
              <div className="space-y-1">
                {menuItems.flatMap((group) => group.items).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Tooltip key={item.href}>
                      <TooltipPrimitive.Trigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center justify-center rounded-lg p-2.5 transition-all duration-200',
                            'hover:bg-muted',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground',
                            'w-12 h-12 mx-auto'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {isActive && (
                            <span className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </Link>
                      </TooltipPrimitive.Trigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ) : (
              // Expanded mode
              menuItems.map((group) => (
                <Collapsible
                  key={group.title}
                  open={openGroups.includes(group.title)}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <group.icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          openGroups.includes(group.title) && 'rotate-180'
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 pl-2">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                            'hover:bg-muted',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <item.icon className={cn(
                            'h-4 w-4',
                            isActive ? 'text-primary' : ''
                          )} />
                          <span>{item.title}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-muted/50 p-3">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Button variant="ghost" size="icon" className="mx-auto w-12 h-12 rounded-lg" asChild>
                  <Link href="/dashboard/settings/definitions">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right">
                Ayarlar
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg" asChild>
              <Link href="/dashboard/settings/definitions">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-semibold">Ayarlar</span>
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
