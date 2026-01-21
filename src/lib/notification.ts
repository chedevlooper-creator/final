/**
 * Bildirim Sistemi (Notification System)
 *
 * Bu sistem, kullanıcıya çeşitli bildirim türleri göstermek için kullanılır.
 * Tüm bildirimler Türkçe dilindedir.
 */

// Bildirim tipleri
export type NotificationType = "success" | "error" | "warning" | "info";

// Bildirim pozisyonları
export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

// Bildirim arayüzü
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration: number; // ms cinsinden, 0 = otomatik kapanma yok
  position: NotificationPosition;
  showClose: boolean;
  showIcon: boolean;
  action?: NotificationAction;
  createdAt: Date;
}

// Action butonu arayüzü
export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

// Bildirim seçenekleri
export interface NotificationOptions {
  duration?: number;
  position?: NotificationPosition;
  showClose?: boolean;
  showIcon?: boolean;
  action?: NotificationAction;
}

// Bildirim yöneticisi
export class NotificationManager {
  private static instance: NotificationManager;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private notifications: Map<string, Notification> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Listener ekle - ilk çağrıda mevcut bildirimleri gönderme
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);

    // Unsubscribe fonksiyonu dön
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Tüm bildirimleri getir
  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  // Tek bir bildirim getir
  get(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  // Bildirim ekle
  add(notification: Omit<Notification, "id" | "createdAt">): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    this.notifications.set(id, newNotification);
    this.notifyListeners();

    // Otomatik kapanma süresi ayarla
    if (notification.duration && notification.duration > 0) {
      const timeout = setTimeout(() => {
        this.remove(id);
      }, notification.duration);

      this.timeouts.set(id, timeout);
    }

    return id;
  }

  // Bildirim güncelle
  update(id: string, updates: Partial<Notification>): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const updated = {
      ...notification,
      ...updates,
      id, // ID'yi koru
    };

    this.notifications.set(id, updated);
    this.notifyListeners();
  }

  // Bildirim sil
  remove(id: string): void {
    // Timeout varsa temizle
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    this.notifications.delete(id);
    this.notifyListeners();
  }

  // Tüm bildirimleri temizle
  clear(): void {
    // Tüm timeoutları temizle
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();

    this.notifications.clear();
    this.notifyListeners();
  }

  // Belirli bir tipteki bildirimleri temizle
  clearByType(type: NotificationType): void {
    for (const [id, notification] of this.notifications) {
      if (notification.type === type) {
        this.remove(id);
      }
    }
  }

  // Listeners'ı bilgilendir
  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach((listener) => listener(notifications));
  }

  // Benzersiz ID oluştur
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper: Success bildirimi
  success(
    title: string,
    message?: string,
    options?: NotificationOptions,
  ): string {
    return this.add({
      type: "success",
      title,
      message,
      duration: options?.duration ?? 5000,
      position: options?.position ?? "top-right",
      showClose: options?.showClose ?? true,
      showIcon: options?.showIcon ?? true,
      action: options?.action,
    });
  }

  // Helper: Error bildirimi
  error(
    title: string,
    message?: string,
    options?: NotificationOptions,
  ): string {
    return this.add({
      type: "error",
      title,
      message,
      duration: options?.duration ?? 7000, // Hata mesajları daha uzun görünür
      position: options?.position ?? "top-right",
      showClose: options?.showClose ?? true,
      showIcon: options?.showIcon ?? true,
      action: options?.action,
    });
  }

  // Helper: Warning bildirimi
  warning(
    title: string,
    message?: string,
    options?: NotificationOptions,
  ): string {
    return this.add({
      type: "warning",
      title,
      message,
      duration: options?.duration ?? 6000,
      position: options?.position ?? "top-right",
      showClose: options?.showClose ?? true,
      showIcon: options?.showIcon ?? true,
      action: options?.action,
    });
  }

  // Helper: Info bildirimi
  info(title: string, message?: string, options?: NotificationOptions): string {
    return this.add({
      type: "info",
      title,
      message,
      duration: options?.duration ?? 5000,
      position: options?.position ?? "top-right",
      showClose: options?.showClose ?? true,
      showIcon: options?.showIcon ?? true,
      action: options?.action,
    });
  }

  // Helper: Kalıcı bildirim
  persistent(
    type: NotificationType,
    title: string,
    message?: string,
    options?: NotificationOptions,
  ): string {
    return this.add({
      type,
      title,
      message,
      duration: 0, // Otomatik kapanma yok
      position: options?.position ?? "top-right",
      showClose: options?.showClose ?? true,
      showIcon: options?.showIcon ?? true,
      action: options?.action,
    });
  }

  // Helper: İşlem bildirimi
  promise<T>(
    promise: Promise<T>,
    loading: { title: string; message?: string },
    success: { title: string; message?: string },
    error: { title: string; message?: string },
    options?: NotificationOptions,
  ): Promise<T> {
    // Loading bildirimi göster
    const loadingId = this.info(loading.title, loading.message, {
      ...options,
      duration: 0, // Kalıcı
    });

    return promise
      .then((result) => {
        // Loading bildirimini kaldır
        this.remove(loadingId);
        // Success bildirimi göster
        this.success(success.title, success.message, options);
        return result;
      })
      .catch((err) => {
        // Loading bildirimini kaldır
        this.remove(loadingId);
        // Error bildirimi göster
        this.error(error.title, error.message || err.message, options);
        throw err;
      });
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Convenience fonksiyonlar
export const notify = {
  success: (title: string, message?: string, options?: NotificationOptions) =>
    notificationManager.success(title, message, options),

  error: (title: string, message?: string, options?: NotificationOptions) =>
    notificationManager.error(title, message, options),

  warning: (title: string, message?: string, options?: NotificationOptions) =>
    notificationManager.warning(title, message, options),

  info: (title: string, message?: string, options?: NotificationOptions) =>
    notificationManager.info(title, message, options),

  clear: () => notificationManager.clear(),

  remove: (id: string) => notificationManager.remove(id),
};

/**
 * Kullanım örnekleri:
 *
 * // Basit bildirim
 * notify.success('İşlem başarılı!', 'Veriler kaydedildi.')
 *
 * // Hata bildirimi
 * notify.error('Hata oluştu', 'Lütfen daha sonra tekrar deneyin.')
 *
 * // Uyarı bildirimi
 * notify.warning('Dikkat', 'Bu işlem geri alınamaz.')
 *
 * // Bilgi bildirimi
 * notify.info('Bilgi', 'Yeni bir güncelleme mevcut.')
 *
 * // Action butonu ile
 * notify.success('Kaydedildi', 'Değişiklikler kaydedildi', {
 *   action: {
 *     label: 'Geri Al',
 *     onClick: () => console.log('Geri alındı'),
 *     variant: 'secondary'
 *   }
 * })
 *
 * // Kalıcı bildirim
 * notificationManager.persistent('info', 'İşlem devam ediyor', 'Lütfen bekleyin...')
 *
 * // Promise bildirimi
 * notify.promise(
 *   fetchData(),
 *   { title: 'Yükleniyor...', message: 'Veriler getiriliyor' },
 *   { title: 'Başarılı!', message: 'Veriler yüklendi' },
 *   { title: 'Hata!', message: 'Veriler yüklenemedi' }
 * )
 */
