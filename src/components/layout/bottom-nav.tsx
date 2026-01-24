'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  HandHeart,
  Calendar,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Ana Sayfa' },
  { href: '/dashboard/needy', icon: Users, label: 'İhtiyaç Sahipleri' },
  { href: '/dashboard/donations', icon: HandHeart, label: 'Bağışlar' },
  { href: '/dashboard/meetings', icon: Calendar, label: 'Toplantılar' },
  { href: '/dashboard/settings', icon: Settings, label: 'Ayarlar' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                'text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
