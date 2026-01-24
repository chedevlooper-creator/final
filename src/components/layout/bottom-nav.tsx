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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border/50"
      role="navigation"
      aria-label="Ana mobil navigasyon"
    >
      <div className="flex items-center justify-around h-16 safe-area-bottom" role="list">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex flex-col items-center justify-center w-full h-full',
                'transition-all duration-200',
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              role="listitem"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <span className="absolute inset-x-2 top-2 bottom-2 bg-primary/10 rounded-xl animate-scale-in" aria-hidden="true" />
              )}

              {/* Icon Container */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className={cn(
                  'flex items-center justify-center rounded-xl p-1.5 transition-all duration-200',
                  isActive
                    ? 'text-primary shadow-primary'
                    : 'text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50'
                )}>
                  <Icon className="w-5 h-5 transition-transform duration-200 group-active:scale-90" aria-hidden="true" />
                </div>

                {/* Active Dot */}
                {isActive && (
                  <span className="mt-1 h-1 w-1 rounded-full bg-primary shadow-primary animate-scale-in" aria-hidden="true" />
                )}
              </div>

              {/* Label - Screen Reader Only */}
              <span className="sr-only">{item.label}</span>

              {/* Optional: Visible label on active */}
              {isActive && (
                <span className="absolute -bottom-0.5 text-[10px] font-medium text-primary animate-slide-up" aria-hidden="true">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Safe Area for iOS */}
      <style jsx>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </nav>
  )
}
