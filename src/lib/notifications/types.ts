/**
 * Notification System Types
 * Bildirim sistemi için tip tanımlamaları
 */

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "application"
  | "donation"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  link: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationCreateInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  data?: Record<string, unknown>;
  link?: string | null;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: "Bilgi",
  success: "Başarı",
  warning: "Uyarı",
  error: "Hata",
  application: "Başvuru",
  donation: "Bağış",
  system: "Sistem",
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  info: "Info",
  success: "CheckCircle",
  warning: "AlertTriangle",
  error: "XCircle",
  application: "FileText",
  donation: "DollarSign",
  system: "Settings",
};

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  info: "text-blue-500 bg-blue-50",
  success: "text-green-500 bg-green-50",
  warning: "text-yellow-500 bg-yellow-50",
  error: "text-red-500 bg-red-50",
  application: "text-purple-500 bg-purple-50",
  donation: "text-emerald-500 bg-emerald-50",
  system: "text-slate-500 bg-slate-50",
};
