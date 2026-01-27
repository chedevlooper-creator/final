'use client'

import { Button } from '@/components/ui/button'
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
import { useEffect, useState, useCallback } from 'react'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Open command palette with keyboard shortcut
  const openCommandPalette = useCallback(() => {
    // Dispatch a keyboard event to trigger the command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [])

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
      <header className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-header-border bg-header/95 backdrop-blur-md px-4 left-64 shadow-sm animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 h-9 w-64 px-3 rounded-lg border border-header-border bg-header/50 text-sm text-muted-foreground"
            disabled
          >
            <Search className="h-4 w-4" />
            <span>Ara...</span>
          </button>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center justify-between border-b border-header-border bg-header/95 backdrop-blur-md px-4 transition-all duration-300 right-0 shadow-sm',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
      role="banner"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Search Button - Opens Command Palette */}
        <button
          onClick={openCommandPalette}
          className={cn(
            'flex items-center gap-2 h-9 w-64 px-3 rounded-lg border',
            'border-header-border bg-header/50 hover:bg-muted/50',
            'text-sm text-muted-foreground hover:text-foreground',
            'transition-all duration-200 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50'
          )}
          aria-label="Arama ve komut paletini aç (Ctrl+K veya ⌘K)"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Ara...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground" aria-hidden="true">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-primary/5 h-9"
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
              className="flex items-center gap-2 px-2 h-9 hover:bg-primary/5 transition-colors"
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
                  {profile?.role === 'admin' ? 'Yönetici' :
                    profile?.role === 'moderator' ? 'Moderatör' :
                      profile?.role === 'user' ? 'Kullanıcı' :
                        profile?.role === 'viewer' ? 'İzleyici' : 'Kullanıcı'}
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
