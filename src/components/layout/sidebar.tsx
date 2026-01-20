'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { menuItems } from '@/lib/menu-config'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function Sidebar() {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['Başlangıç', 'Yardım Yönetimi'])
  
  // Client-side hydration
  useEffect(() => {
    setMounted(true)
    const store = useUIStore.getState()
    setSidebarCollapsed(store.sidebarCollapsed)
    
    // Subscribe to store changes
    const unsubscribe = useUIStore.subscribe((state) => {
      setSidebarCollapsed(state.sidebarCollapsed)
    })
    
    return unsubscribe
  }, [])
  
  const toggleSidebar = () => {
    useUIStore.getState().toggleSidebar()
  }

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Yardım Paneli
          </h1>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Yardım Paneli
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="space-y-1 p-2">
          {menuItems.map((group) => (
            <Collapsible
              key={group.title}
              open={!sidebarCollapsed && openGroups.includes(group.title)}
              onOpenChange={() => !sidebarCollapsed && toggleGroup(group.title)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                    'text-slate-400 hover:bg-slate-700/50 hover:text-white',
                    sidebarCollapsed && 'justify-center'
                  )}
                >
                  <group.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          openGroups.includes(group.title) && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-4">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-l-2 border-emerald-400'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
