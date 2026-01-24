/**
 * Notification System Types
 * Bildirim sistemi için tip tanımlamaları
 */

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'application' 
  | 'donation' 
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  data: Record<string, unknown>
  link: string | null
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationCreateInput {
  user_id: string
  type: NotificationType
  title: string
  message?: string | null
  data?: Record<string, unknown>
  link?: string | null
}

export interface NotificationFilters {
  unreadOnly?: boolean
  type?: NotificationType
  limit?: number
  offset?: number
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Bilgi',
  success: 'Başarı',
  warning: 'Uyarı',
  error: 'Hata',
  application: 'Başvuru',
  donation: 'Bağış',
  system: 'Sistem',
}

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  info: 'Info',
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  error: 'XCircle',
  application: 'FileText',
  donation: 'DollarSign',
  system: 'Settings',
}

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  info: 'text-info bg-info/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  error: 'text-danger bg-danger/10',
  application: 'text-primary bg-primary/10',
  donation: 'text-accent bg-accent/10',
  system: 'text-muted-foreground bg-muted',
}
