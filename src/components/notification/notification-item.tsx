/**
 * Tekil Bildirim Item Component
 *
 * Tek bir bildirimi gösteren component.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Notification, NotificationType } from "@/lib/notification";
import { useNotifications } from "@/lib/notification.context";

// Bildirim tipi renkleri ve ikonları
const notificationStyles: Record<
  NotificationType,
  { bg: string; border: string; icon: React.ReactNode; iconBg: string }
> = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    iconBg: "bg-green-100 dark:bg-green-800",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    iconBg: "bg-red-100 dark:bg-red-800",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    iconBg: "bg-yellow-100 dark:bg-yellow-800",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    iconBg: "bg-blue-100 dark:bg-blue-800",
  },
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { remove } = useNotifications();
  const style = notificationStyles[notification.type];

  // Progress bar için süre sayacı
  const [progress, setProgress] = React.useState(100);
  const duration = notification.duration || 0;

  React.useEffect(() => {
    if (duration === 0) return; // Kalıcı bildirim

    const interval = 50; // 50ms aralıklarla güncelle
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: notification.position?.includes("right") ? 100 : -100,
        scale: 0.95,
      }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: notification.position?.includes("right") ? 100 : -100,
        scale: 0.95,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`${style.bg} ${style.border} border rounded-lg shadow-lg overflow-hidden`}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* İkon */}
          {notification.showIcon !== false && (
            <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-2`}>
              <div className="text-current dark:text-inherit">{style.icon}</div>
            </div>
          )}

          {/* İçerik */}
          <div className="flex-1 min-w-0">
            {/* Başlık */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {notification.title}
            </h4>

            {/* Mesaj */}
            {notification.message && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {notification.message}
              </p>
            )}

            {/* Action Butonu */}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className={`mt-2 text-sm font-medium ${
                  notification.action.variant === "danger"
                    ? "text-red-600 hover:text-red-700 dark:text-red-400"
                    : notification.action.variant === "secondary"
                      ? "text-gray-600 hover:text-gray-700 dark:text-gray-400"
                      : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
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
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Bildirimi kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                notification.type === "success"
                  ? "bg-green-500"
                  : notification.type === "error"
                    ? "bg-red-500"
                    : notification.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
              }`}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
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
