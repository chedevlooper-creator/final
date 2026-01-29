'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { menuItems } from '@/lib/menu-config'
import { useUIStore } from '@/stores/ui-store'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

export function MobileMenu() {
  const pathname = usePathname()
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const filteredMenuItems = menuItems.filter(group => {
    if (!searchQuery) return true
    
    const matchesTitle = group.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesItems = group.items.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return matchesTitle || matchesItems
  })

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => {
      const isOpen = prev.includes(title)
      if (isOpen) {
        return prev.filter(t => t !== title)
      } else {
        return [...prev, title]
      }
    })
  }

  return (
    <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <DialogContent className="fixed left-0 top-0 bottom-0 w-full max-w-sm h-full rounded-none border-r p-0 data-[state=open]:translate-x-0 z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
                <span className="text-lg font-bold text-white">Y</span>
              </div>
              <span className="text-lg font-bold text-foreground">Yardım Paneli</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="h-9 w-9 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Menü ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {filteredMenuItems.map((group) => {
                const groupOpen = openGroups.includes(group.title) || !!searchQuery
                
                return (
                  <Collapsible
                    key={group.title}
                    open={groupOpen}
                    onOpenChange={() => toggleGroup(group.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <group.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 text-left">{group.title}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            groupOpen && 'rotate-180'
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-0.5 pl-2 mt-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
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
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
