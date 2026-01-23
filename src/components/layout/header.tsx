'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUIStore } from '@/stores/ui-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { NotificationDropdown } from '@/components/layout/notification-dropdown'
import { useEffect, useState } from 'react'

export function Header() {
  const { user, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  
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

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  if (!mounted) {
    return (
      <header className="fixed top-0 left-64 right-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4">
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Ara... (⌘K)"
              className="w-64 pl-9 bg-slate-50 border-slate-200 focus:bg-white"
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
        'fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64',
        'right-0'
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Arama */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Ara... (⌘K)"
            className="w-64 pl-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Bildirimler */}
        <NotificationDropdown />

        {/* Kullanıcı menüsü */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-nature text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-slate-700">
                {user?.email?.split('@')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Hesabım
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
