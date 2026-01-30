'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mobileNavItems } from '@/lib/config/mobile-nav-config'

import { useState, useEffect } from 'react'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200',
                'hover:bg-muted/50',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-all duration-200',
                isActive ? 'scale-110' : 'scale-100'
              )} />
              <span className="text-[10px] font-medium leading-tight">
                {item.title}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
