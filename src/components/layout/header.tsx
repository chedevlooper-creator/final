'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, LogOut, User, Sparkles, ChevronDown } from 'lucide-react'
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
  const { user, profile, signOut, role } = useAuth()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const [mounted, setMounted] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // İsimden veya email'den initials oluştur
  const getInitials = () => {
    if (profile?.name) {
      const parts = profile.name.trim().split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return profile.name.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const initials = getInitials()

  // Rol badge'i için Türkçe karşılık
  const getRoleLabel = (userRole: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Yönetici',
      moderator: 'Moderatör',
      user: 'Kullanıcı',
      viewer: 'İzleyici',
    }
    return roleLabels[userRole] || userRole
  }

  if (!mounted) {
    return (
      <header className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between bg-card shadow-card border-b border-border px-4 animate-fade-in"
        style={{ left: sidebarCollapsed ? '5rem' : '16rem' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Ara..." className="w-64 pl-9 input-soft" disabled />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className="fixed top-0 z-30 flex h-16 items-center justify-between bg-card shadow-card border-b border-border px-4 transition-all duration-300"
      style={{ left: sidebarCollapsed ? '5rem' : '16rem', right: 0 }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className={cn(
            'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors pointer-events-none',
            searchFocused ? 'text-primary' : 'text-muted-foreground'
          )} />
          <Input
            type="search"
            placeholder="Ara..."
            className="w-64 pl-9 input-soft"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">İpuçları</span>
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-10 hover:bg-muted rounded-lg">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-white text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start mr-1">
                <span className="text-sm font-bold leading-tight">
                  {profile?.name || user?.email?.split('@')[0] || 'Kullanıcı'}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {getRoleLabel(role)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold">
                  {profile?.name || user?.email?.split('@')[0] || 'Kullanıcı'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'Email bulunamadı'}
                </p>
                <span className="text-xs text-primary font-medium">
                  {getRoleLabel(role)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Hesabım</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
