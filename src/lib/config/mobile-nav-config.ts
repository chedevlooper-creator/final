import {
  Home,
  Users,
  FileText,
  DollarSign,
  Settings,
  LucideIcon,
} from 'lucide-react'

export interface MobileNavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
}

export const mobileNavItems: MobileNavItem[] = [
  { title: 'Ana Sayfa', href: '/dashboard', icon: Home },
  { title: 'İhtiyaç', href: '/dashboard/needy', icon: Users },
  { title: 'Başvuru', href: '/dashboard/applications', icon: FileText },
  { title: 'Bağış', href: '/dashboard/donations', icon: DollarSign },
  { title: 'Ayarlar', href: '/dashboard/settings/definitions', icon: Settings },
]
