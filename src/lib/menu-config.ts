import {
  Home,
  Heart,
  DollarSign,
  GraduationCap,
  MessageSquare,
  Users,
  Calendar,
  HandHeart,
  ShoppingCart,
  CreditCard,
  Settings,
  FileText,
  BarChart3,
  UserCheck,
  Banknote,
  Gift,
  LucideIcon,
} from 'lucide-react'

export interface MenuItem {
  title: string
  href: string
  icon: LucideIcon
}

export interface MenuGroup {
  title: string
  icon: LucideIcon
  items: MenuItem[]
}

export const menuItems: MenuGroup[] = [
  {
    title: 'Başlangıç',
    icon: Home,
    items: [
      { title: 'Ana Sayfa', href: '/dashboard', icon: Home },
      { title: 'Hesabım', href: '/dashboard/account', icon: Users },
    ]
  },
  {
    title: 'Yardım Yönetimi',
    icon: Heart,
    items: [
      { title: 'İhtiyaç Sahipleri', href: '/dashboard/needy', icon: Users },
      { title: 'Yardım Başvuruları', href: '/dashboard/applications', icon: FileText },
      { title: 'Tüm Yardımlar', href: '/dashboard/aids', icon: HandHeart },
      { title: 'Nakdi Yardım Veznesi', href: '/dashboard/aids/cashdesk', icon: Banknote },
      { title: 'Banka Ödeme Emirleri', href: '/dashboard/aids/transfer', icon: CreditCard },
      { title: 'Nakdi Yardım İşlemleri', href: '/dashboard/aids/cash', icon: DollarSign },
      { title: 'Ayni Yardım İşlemleri', href: '/dashboard/aids/logistics', icon: Gift },
      { title: 'Hizmet Sevk', href: '/dashboard/aids/service', icon: UserCheck },
      { title: 'Raporlar', href: '/dashboard/reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Bağış Yönetimi',
    icon: DollarSign,
    items: [
      { title: 'Tüm Bağışlar', href: '/dashboard/donations', icon: DollarSign },
      { title: 'Nakit Bağışlar', href: '/dashboard/donations/cash', icon: Banknote },
      { title: 'Kurban', href: '/dashboard/donations/sacrifice', icon: Gift },
    ]
  },
  {
    title: 'Burs Yönetimi',
    icon: GraduationCap,
    items: [
      { title: 'Yetimler & Öğrenciler', href: '/dashboard/orphans', icon: GraduationCap },
    ]
  },
  {
    title: 'Finans',
    icon: CreditCard,
    items: [
      { title: 'Kasa İşlemleri', href: '/dashboard/finance/cash', icon: Banknote },
      { title: 'Banka İşlemleri', href: '/dashboard/finance/bank', icon: CreditCard },
      { title: 'Raporlar', href: '/dashboard/finance/reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Gönüllü Yönetimi',
    icon: UserCheck,
    items: [
      { title: 'Gönüllüler', href: '/dashboard/volunteers', icon: UserCheck },
      { title: 'Görevlendirmeler', href: '/dashboard/volunteers/missions', icon: Calendar },
    ]
  },
  {
    title: 'Mesaj Yönetimi',
    icon: MessageSquare,
    items: [
      { title: 'Toplu Mesaj', href: '/dashboard/messages/bulk', icon: MessageSquare },
      { title: 'SMS', href: '/dashboard/messages/sms', icon: MessageSquare },
    ]
  },
  {
    title: 'Satın Alma',
    icon: ShoppingCart,
    items: [
      { title: 'Satın Alma Taleplerleri', href: '/dashboard/purchase', icon: ShoppingCart },
      { title: 'Cari Hesaplar', href: '/dashboard/purchase/merchants', icon: Users },
    ]
  },
  {
    title: 'İş Yönetimi',
    icon: Calendar,
    items: [
      { title: 'Takvim', href: '/dashboard/calendar', icon: Calendar },
      { title: 'Etkinlikler', href: '/dashboard/events', icon: Calendar },
    ]
  },
  {
    title: 'Sistem',
    icon: Settings,
    items: [
      { title: 'Tanımlamalar', href: '/dashboard/settings/definitions', icon: Settings },
      { title: 'Kullanıcılar', href: '/dashboard/settings/users', icon: Users },
    ]
  },
]
