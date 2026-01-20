'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  DollarSign, 
  Settings,
  Trash2,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks/use-notifications'
import type { Notification, NotificationType } from '@/lib/notifications/types'
import { NOTIFICATION_TYPE_COLORS } from '@/lib/notifications/types'

const ICON_MAP: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  application: FileText,
  donation: DollarSign,
  system: Settings,
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const Icon = ICON_MAP[notification.type] || Info
  const colorClasses = NOTIFICATION_TYPE_COLORS[notification.type] || NOTIFICATION_TYPE_COLORS.info
  const isUnread = !notification.read_at

  const handleClick = () => {
    if (isUnread) {
      onRead(notification.id)
    }
  }

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isUnread ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
      )}
      onClick={handleClick}
    >
      <div className={cn('p-2 rounded-full flex-shrink-0', colorClasses)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-medium truncate', isUnread && 'text-slate-900')}>
            {notification.title}
          </p>
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        {notification.message && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { 
            addSuffix: true, 
            locale: tr 
          })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(notification.id)
        }}
        className="p-1 rounded hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3 w-3 text-slate-400" />
      </button>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block group">
        {content}
      </Link>
    )
  }

  return <div className="group">{content}</div>
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  
  const { data: notificationsData, isLoading } = useNotifications({ limit: 10 })
  const { data: unreadCount } = useUnreadNotificationCount()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()

  const notifications = notificationsData?.data || []
  const hasUnread = (unreadCount || 0) > 0

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id)
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                {unreadCount && unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Tümünü Okundu İşaretle
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Bildirim bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Tüm Bildirimleri Görüntüle
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
