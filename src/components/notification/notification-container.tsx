/**
 * Bildirim Container Component
 * 
 * Tüm bildirimleri gösteren container. Pozisyonlara göre gruplandırır.
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/lib/notification.context'
import { NotificationItem } from './notification-item'
import { NotificationPosition } from '@/lib/notification'

interface NotificationContainerProps {
  position?: NotificationPosition
  className?: string
}

// Pozisyon CSS sınıfları
const positionClasses: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export function NotificationContainer({ 
  position = 'top-right', 
  className = '' 
}: NotificationContainerProps) {
  const { notifications } = useNotifications()

  // Pozisyona göre bildirimleri filtrele
  const filteredNotifications = notifications.filter(n => n.position === position)

  return (
    <div className={`fixed z-50 flex flex-col gap-2 max-w-md w-full ${positionClasses[position]} ${className}`}>
      <AnimatePresence mode="popLayout">
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Kullanım:
 * 
 * function App() {
 *   return (
 *     <NotificationProvider>
 *       <YourApp />
 *       <NotificationContainer position="top-right" />
 *       <NotificationContainer position="bottom-right" />
 *     </NotificationProvider>
 *   )
 * }
 */
