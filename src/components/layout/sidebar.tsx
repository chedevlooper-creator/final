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
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    sidebarOpen: state.sidebarOpen,
    setSidebarOpen: state.setSidebarOpen,
    toggleSidebar: state.toggleSidebar,
  }))
  const [mounted, setMounted] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['Başlangıç', 'Yardım Yönetimi'])
  
  // Client-side hydration
  useEffect(() => {
    setMounted(true)
    
    // Mobile: Close sidebar on navigation
    if (window.innerWidth < 768) {
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
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white hidden md:block">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <h1 className="text-lg font-bold text-gradient-nature">
            Yardım Paneli
          </h1>
        </div>
      </aside>
    )
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-slate-200 bg-white transition-all duration-300 shadow-xl md:shadow-none md:z-40',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 bg-white">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-bold text-gradient-nature">
              Yardım Paneli
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-slate-500 hover:text-primary hover:bg-slate-100 hidden md:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          {/* Mobile Close Button */}
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-500 hover:text-red-500 md:hidden ml-auto"
          >
            <ChevronLeft className="h-4 w-4" />
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
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    'text-slate-600 hover:bg-slate-100 hover:text-primary',
                    sidebarCollapsed && 'justify-center'
                  )}
                >
                  <group.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform text-slate-400',
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
                          ? 'bg-gradient-nature-light text-primary font-medium border-l-2 border-primary'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
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
    </>
  )
}
