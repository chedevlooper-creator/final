'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, LogOut, User, Sparkles, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUIStore } from '@/stores/ui-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { NotificationDropdown } from '@/components/layout/notification-dropdown'
import { useEffect, useState } from 'react'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Client-side hydration
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)
      const store = useUIStore.getState()
      setSidebarCollapsed(store.sidebarCollapsed)
    }, 0)

    // Subscribe to store changes
    const unsubscribe = useUIStore.subscribe((state) => {
      setSidebarCollapsed(state.sidebarCollapsed)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  if (!mounted) {
    return (
      <header className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 left-64 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ara... (⌘K)"
              className="w-64 pl-9 bg-muted/50 border-border focus:bg-background"
              disabled
            />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 transition-all duration-300 right-0 shadow-soft',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
      role="banner"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <label htmlFor="global-search" className="sr-only">Ara</label>
          <Search className={cn(
            'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors pointer-events-none',
            searchFocused ? 'text-primary' : 'text-muted-foreground'
          )} />
          <Input
            id="global-search"
            type="search"
            placeholder="Ara... (⌘K)"
            className={cn(
              'w-64 pl-9 bg-muted/50 border-border transition-all duration-200',
              'focus:w-80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {/* Search Shortcut Badge */}
          {!searchFocused && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-60" aria-hidden="true">
              <span>⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            İpuçları
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" aria-hidden="true" />

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 h-9 hover:bg-muted/50 transition-colors"
              aria-label="Kullanıcı menüsünü aç"
            >
              <Avatar className="h-8 w-8 border-2 border-border/50">
                <AvatarFallback className="bg-gradient-primary text-white text-sm font-medium shadow-primary" aria-hidden="true">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start mr-1">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {profile?.name || user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-muted-foreground leading-tight capitalize">
                  {profile?.role || 'user'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-scale-in">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {profile?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer group">
                <User className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                <span>Hesabım</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer group">
                <Sparkles className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="text-danger hover:bg-danger/10 hover:text-danger cursor-pointer group"
            >
              <LogOut className="mr-2 h-4 w-4 transition-colors" aria-hidden="true" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
