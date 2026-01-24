/**
 * Tekil Bildirim Item Component
 * 
 * Tek bir bildirimi gösteren component.
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Notification, NotificationType } from '@/lib/notification'
import { useNotifications } from '@/lib/notification.context'

// Bildirim tipi renkleri ve ikonları
const notificationStyles: Record<
  NotificationType,
  { bg: string; border: string; icon: React.ReactNode; iconBg: string; textColor: string }
> = {
  success: {
    bg: 'bg-success/5',
    border: 'border-success/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    iconBg: 'bg-success/10 text-success',
    textColor: 'text-success',
  },
  error: {
    bg: 'bg-danger/5',
    border: 'border-danger/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    iconBg: 'bg-danger/10 text-danger',
    textColor: 'text-danger',
  },
  warning: {
    bg: 'bg-warning/5',
    border: 'border-warning/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg: 'bg-warning/10 text-warning',
    textColor: 'text-warning',
  },
  info: {
    bg: 'bg-info/5',
    border: 'border-info/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-info/10 text-info',
    textColor: 'text-info',
  },
}

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { remove } = useNotifications()
  const style = notificationStyles[notification.type]

  // Progress bar için süre sayacı
  const [progress, setProgress] = React.useState(100)
  const duration = notification.duration || 0

  React.useEffect(() => {
    if (duration === 0) return // Kalıcı bildirim

    const interval = 50 // 50ms aralıklarla güncelle
    const step = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [duration])

  return (
    <motion.div
      initial={{ opacity: 0, x: notification.position?.includes('right') ? 100 : -100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: notification.position?.includes('right') ? 100 : -100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`${style.bg} ${style.border} border rounded-lg shadow-lg overflow-hidden`}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* İkon */}
          {notification.showIcon !== false && (
            <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-2`}>
              <div className="text-current">
                {style.icon}
              </div>
            </div>
          )}

          {/* İçerik */}
          <div className="flex-1 min-w-0">
            {/* Başlık */}
            <h4 className="text-sm font-semibold text-foreground">
              {notification.title}
            </h4>

            {/* Mesaj */}
            {notification.message && (
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.message}
              </p>
            )}

            {/* Action Butonu */}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className={`mt-2 text-sm font-medium ${
                  notification.action.variant === 'danger'
                    ? 'text-danger hover:text-danger/80'
                    : notification.action.variant === 'secondary'
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-primary hover:text-primary/80'
                }`}
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* Kapatma Butonu */}
          {notification.showClose !== false && (
            <button
              onClick={() => remove(notification.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Bildirimi kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                notification.type === 'success'
                  ? 'bg-success'
                  : notification.type === 'error'
                  ? 'bg-danger'
                  : notification.type === 'warning'
                  ? 'bg-warning'
                  : 'bg-info'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Kullanım:
 * 
 * <NotificationItem
 *   notification={{
 *     id: '123',
 *     type: 'success',
 *     title: 'Başarılı!',
 *     message: 'İşlem tamamlandı.',
 *     duration: 5000,
 *     position: 'top-right',
 *     showClose: true,
 *     showIcon: true,
 *     createdAt: new Date()
 *   }}
 * />
 */
