'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { menuItems } from '@/lib/menu-config'
import {
  Search,
  ArrowRight,
  Plus,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  FileText,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Quick actions for the command palette
const quickActions = [
  {
    title: 'Yeni İhtiyaç Sahibi Ekle',
    href: '/dashboard/needy?action=new',
    icon: Users,
    shortcut: 'N',
  },
  {
    title: 'Yeni Başvuru Oluştur',
    href: '/dashboard/applications?action=new',
    icon: FileText,
    shortcut: 'B',
  },
  {
    title: 'Bağış Kaydet',
    href: '/dashboard/donations?action=new',
    icon: DollarSign,
    shortcut: 'D',
  },
  {
    title: 'Takvime Git',
    href: '/dashboard/calendar',
    icon: Calendar,
    shortcut: 'T',
  },
]

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const router = useRouter()
  const { signOut } = useAuth()

  // Use controlled or uncontrolled state
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Keyboard shortcut handler
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, setIsOpen])

  const runCommand = React.useCallback((command: () => void) => {
    setIsOpen(false)
    command()
  }, [setIsOpen])

  const navigateTo = React.useCallback((href: string) => {
    runCommand(() => router.push(href))
  }, [router, runCommand])

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Sayfa ara, işlem yap..." 
          className="h-12"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Sonuç bulunamadı</p>
              <p className="text-xs text-muted-foreground/70">
                Farklı anahtar kelimeler deneyin
              </p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Hızlı İşlemler">
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                onSelect={() => navigateTo(action.href)}
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{action.title}</span>
                </div>
                <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation Groups */}
          {menuItems.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => navigateTo(item.href)}
                  className="flex items-center gap-3 py-2.5 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                  <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground/50" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          <CommandSeparator />

          {/* Settings & Account */}
          <CommandGroup heading="Hesap">
            <CommandItem
              onSelect={() => navigateTo('/dashboard/account')}
              className="flex items-center gap-3 py-2.5 cursor-pointer"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Hesabım</span>
            </CommandItem>
            <CommandItem
              onSelect={() => navigateTo('/dashboard/settings/definitions')}
              className="flex items-center gap-3 py-2.5 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Ayarlar</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(signOut)}
              className="flex items-center gap-3 py-2.5 cursor-pointer text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">↑↓</span>
            </kbd>
            <span>gezin</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ↵
            </kbd>
            <span>seç</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              esc
            </kbd>
            <span>kapat</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  )
}

// Hook for using command palette
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return {
    open,
    setOpen,
    toggle,
  }
}
