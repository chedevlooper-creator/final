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
      { title: 'Ana Sayfa', href: '/', icon: Home },
      { title: 'Hesabım', href: '/account', icon: Users },
    ]
  },
  {
    title: 'Yardım Yönetimi',
    icon: Heart,
    items: [
      { title: 'İhtiyaç Sahipleri', href: '/needy', icon: Users },
      { title: 'Yardım Başvuruları', href: '/applications', icon: FileText },
      { title: 'Tüm Yardımlar', href: '/aids', icon: HandHeart },
      { title: 'Nakdi Yardım Veznesi', href: '/aids/cashdesk', icon: Banknote },
      { title: 'Banka Ödeme Emirleri', href: '/aids/transfer', icon: CreditCard },
      { title: 'Nakdi Yardım İşlemleri', href: '/aids/cash', icon: DollarSign },
      { title: 'Ayni Yardım İşlemleri', href: '/aids/logistics', icon: Gift },
      { title: 'Hizmet Sevk', href: '/aids/service', icon: UserCheck },
      { title: 'Raporlar', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Bağış Yönetimi',
    icon: DollarSign,
    items: [
      { title: 'Tüm Bağışlar', href: '/donations', icon: DollarSign },
      { title: 'Nakit Bağışlar', href: '/donations/cash', icon: Banknote },
      { title: 'Kurban', href: '/donations/sacrifice', icon: Gift },
    ]
  },
  {
    title: 'Burs Yönetimi',
    icon: GraduationCap,
    items: [
      { title: 'Yetimler & Öğrenciler', href: '/orphans', icon: GraduationCap },
    ]
  },
  {
    title: 'Finans',
    icon: CreditCard,
    items: [
      { title: 'Kasa İşlemleri', href: '/finance/cash', icon: Banknote },
      { title: 'Banka İşlemleri', href: '/finance/bank', icon: CreditCard },
      { title: 'Raporlar', href: '/finance/reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Gönüllü Yönetimi',
    icon: UserCheck,
    items: [
      { title: 'Gönüllüler', href: '/volunteers', icon: UserCheck },
      { title: 'Görevlendirmeler', href: '/volunteers/missions', icon: Calendar },
    ]
  },
  {
    title: 'Mesaj Yönetimi',
    icon: MessageSquare,
    items: [
      { title: 'Toplu Mesaj', href: '/messages/bulk', icon: MessageSquare },
      { title: 'SMS', href: '/messages/sms', icon: MessageSquare },
    ]
  },
  {
    title: 'Satın Alma',
    icon: ShoppingCart,
    items: [
      { title: 'Satın Alma Talepleri', href: '/purchase', icon: ShoppingCart },
      { title: 'Cari Hesaplar', href: '/purchase/merchants', icon: Users },
    ]
  },
  {
    title: 'İş Yönetimi',
    icon: Calendar,
    items: [
      { title: 'Takvim', href: '/calendar', icon: Calendar },
      { title: 'Etkinlikler', href: '/events', icon: Calendar },
    ]
  },
  {
    title: 'Sistem',
    icon: Settings,
    items: [
      { title: 'Tanımlamalar', href: '/settings/definitions', icon: Settings },
      { title: 'Kullanıcılar', href: '/settings/users', icon: Users },
    ]
  },
]
