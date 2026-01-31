'use client'

import { useState } from 'react'
import { useDeviceType } from '@/hooks/use-device-type'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { ReactNode } from 'react'
import { Sidebar } from './sidebar'

interface ResponsiveSidebarProps {
  children?: ReactNode
}

/**
 * Responsive Sidebar bileşeni
 * Desktop: Sabit sidebar (Sidebar bileşenini kullanır)
 * Mobil: Sheet/Drawer olarak açılır
 */
export function ResponsiveSidebar({ children }: ResponsiveSidebarProps) {
  const { isDesktop } = useDeviceType()
  const [open, setOpen] = useState(false)

  // Desktop: Mevcut Sidebar bileşenini kullan
  if (isDesktop) {
    return <Sidebar />
  }

  // Mobil: Hamburger menü + Sheet
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="h-full overflow-y-auto">
            {children || <Sidebar />}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
