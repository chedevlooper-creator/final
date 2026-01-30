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
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card shadow-card border-r border-border hidden md:flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">Yardım Paneli</span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out hidden md:flex flex-col',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-border bg-card transition-all duration-300 shrink-0",
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          {!sidebarCollapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform min-w-0 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                Yardım Paneli
              </span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <div 
                  onClick={toggleSidebar}
                  className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 active:scale-95 transition-transform"
                >
                  <Home className="h-5 w-5" />
                </div>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right">Genişlet</TooltipContent>
            </Tooltip>
          )}

          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 ml-1 transition-colors"
              aria-label="Sidebar'ı daralt"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
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

        {/* Footer Settings */}
        <div className="mt-auto border-t border-border p-3 bg-muted/30">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipPrimitive.Trigger asChild>
                <Link 
                  href="/dashboard/settings/definitions"
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all mx-auto"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </TooltipPrimitive.Trigger>
              <TooltipContent side="right">Ayarlar</TooltipContent>
            </Tooltip>
          ) : (
            <Link 
              href="/dashboard/settings/definitions"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <Settings className="h-4 w-4" />
              </div>
              <span>Ayarlar</span>
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
