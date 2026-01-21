/**
 * Bildirim Context ve Provider
 *
 * React uygulamasında bildirimleri kullanmak için Context API ve custom hook.
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  notificationManager,
  Notification,
  NotificationType,
} from "./notification";

// Context arayüzü
interface NotificationContextType {
  notifications: Notification[];
  add: (notification: Omit<Notification, "id" | "createdAt">) => string;
  remove: (id: string) => void;
  clear: () => void;
  clearByType: (type: NotificationType) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

// Context oluştur
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Provider props
interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number; // Maksimum bildirim sayısı
}

// Provider component
export function NotificationProvider({
  children,
  maxNotifications = 5,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Notification manager'a abone ol
    const unsubscribe = notificationManager.subscribe(
      (updatedNotifications) => {
        // Maksimum bildirim sayısını aşma
        const limited = updatedNotifications.slice(0, maxNotifications);
        setNotifications(limited);
      },
    );

    // Cleanup
    return unsubscribe;
  }, [maxNotifications]);

  // Bildirim ekle
  const add = useCallback(
    (notification: Omit<Notification, "id" | "createdAt">) => {
      return notificationManager.add(notification);
    },
    [],
  );

  // Bildirim sil
  const remove = useCallback((id: string) => {
    notificationManager.remove(id);
  }, []);

  // Tüm bildirimleri temizle
  const clear = useCallback(() => {
    notificationManager.clear();
  }, []);

  // Tipteki bildirimleri temizle
  const clearByType = useCallback((type: NotificationType) => {
    notificationManager.clearByType(type);
  }, []);

  // Success bildirimi
  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return notificationManager.success(title, message, { duration });
    },
    [],
  );

  // Error bildirimi
  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return notificationManager.error(title, message, { duration });
    },
    [],
  );

  // Warning bildirimi
  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return notificationManager.warning(title, message, { duration });
    },
    [],
  );

  // Info bildirimi
  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return notificationManager.info(title, message, { duration });
    },
    [],
  );

  const value: NotificationContextType = {
    notifications,
    add,
    remove,
    clear,
    clearByType,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }

  return context;
}

/**
 * Kullanım örnekleri:
 *
 * // Uygulamayı provider ile sar
 * function App() {
 *   return (
 *     <NotificationProvider maxNotifications={5}>
 *       <YourComponent />
 *       <NotificationContainer />
 *     </NotificationProvider>
 *   )
 * }
 *
 * // Component içinde kullan
 * function MyComponent() {
 *   const { success, error, warning, info } = useNotifications()
 *
 *   const handleClick = () => {
 *     success('Başarılı!', 'İşlem tamamlandı')
 *   }
 *
 *   return <button onClick={handleClick}>Bildirim Göster</button>
 * }
 */
