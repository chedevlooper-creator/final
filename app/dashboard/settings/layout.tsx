'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  Users,
  Bell,
  Shield,
  Puzzle,
  Database,
  Palette,
  FileText,
  ChevronRight,
  Settings,
  Tag,
} from 'lucide-react'

const settingsNav = [
  {
    title: 'Genel',
    items: [
      { title: 'Organizasyon', href: '/dashboard/settings/organization', icon: Building2 },
      { title: 'Kullanıcılar ve Roller', href: '/dashboard/settings/users', icon: Users },
      { title: 'Bildirimler', href: '/dashboard/settings/notifications', icon: Bell },
    ]
  },
  {
    title: 'Güvenlik ve Entegrasyon',
    items: [
      { title: 'Güvenlik', href: '/dashboard/settings/security', icon: Shield },
      { title: 'Entegrasyonlar', href: '/dashboard/settings/integrations', icon: Puzzle },
    ]
  },
  {
    title: 'Veri ve Sistem',
    items: [
      { title: 'Tanımlamalar', href: '/dashboard/settings/definitions', icon: Tag },
      { title: 'Yedekleme', href: '/dashboard/settings/backup', icon: Database },
      { title: 'Loglar ve Denetim', href: '/dashboard/settings/logs', icon: FileText },
      { title: 'Görünüm', href: '/dashboard/settings/appearance', icon: Palette },
    ]
  },

]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
            <p className="text-muted-foreground">
              Uygulama ayarlarınızı ve tercihlerinizi yönetin
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <nav className="flex flex-col gap-6">
                {settingsNav.map((section, idx) => (
                  <div key={section.title}>
                    {idx > 0 && <Separator className="mb-6" />}
                    <h4 className="mb-3 text-sm font-semibold text-muted-foreground px-2">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                            {isActive && (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
