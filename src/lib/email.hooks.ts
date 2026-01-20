/**
 * Email Notification System - React Hooks
 * Email işlemleri için React hook'ları
 * 
 * @version 1.0.0
 * @author Aid Management Panel Team
 */

import { useState, useCallback, useEffect } from 'react';
import {
  EmailOptions,
  EmailResult,
  EmailStatistics,
  QueuedEmail,
  EmailTemplate,
  email,
  EmailSender
} from './email';

// Email gönderme hook'u için dönen değer
export interface UseEmailReturn {
  sendEmail: (options: EmailOptions) => Promise<EmailResult>;
  isLoading: boolean;
  error: string | null;
  lastResult: EmailResult | null;
  clearError: () => void;
}

// Email istatistik hook'u için dönen değer
export interface UseEmailStatsReturn {
  statistics: EmailStatistics;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  reset: () => void;
}

// Email kuyruk hook'u için dönen değer
export interface UseEmailQueueReturn {
  queuedEmails: QueuedEmail[];
  isLoading: boolean;
  error: string | null;
  enqueue: (options: EmailOptions, scheduledAt?: Date) => string;
  cancel: (id: string) => boolean;
  refresh: () => Promise<void>;
}

// Email template hook'u için dönen değer
export interface UseEmailTemplateReturn {
  sendWelcome: (to: string, data: { name: string; loginUrl: string }) => Promise<EmailResult>;
  sendPasswordReset: (to: string, data: { name: string; resetUrl: string }) => Promise<EmailResult>;
  sendDonationReceipt: (to: string, data: {
    donorName: string;
    amount: string;
    donationId: string;
    date: string;
    category: string;
  }) => Promise<EmailResult>;
  sendVolunteerAssignment: (to: string, data: {
    volunteerName: string;
    taskName: string;
    startDate: string;
    location: string;
    description: string;
    taskUrl: string;
  }) => Promise<EmailResult>;
  sendInventoryAlert: (to: string, data: {
    itemName: string;
    currentStock: number;
    minStock: number;
    warehouse: string;
    inventoryUrl: string;
  }) => Promise<EmailResult>;
  sendWeeklyReport: (to: string, data: {
    weekStartDate: string;
    weekEndDate: string;
    totalDonations: string;
    totalVolunteers: number;
    totalHelped: number;
    reportUrl: string;
  }) => Promise<EmailResult>;
  sendMonthlyReport: (to: string, data: {
    month: string;
    year: number;
    totalDonations: string;
    activeVolunteers: number;
    newNeedyPersons: number;
    reportUrl: string;
  }) => Promise<EmailResult>;
  sendSystemNotification: (to: string, data: {
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
  }) => Promise<EmailResult>;
  isLoading: boolean;
  error: string | null;
  lastResult: EmailResult | null;
  clearError: () => void;
}

/**
 * Email gönderme hook'u
 */
export function useEmail(): UseEmailReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<EmailResult | null>(null);

  const sendEmail = useCallback(async (options: EmailOptions): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.send(options);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendEmail,
    isLoading,
    error,
    lastResult,
    clearError
  };
}

/**
 * Email istatistik hook'u
 */
export function useEmailStats(refreshInterval: number = 30000): UseEmailStatsReturn {
  const [statistics, setStatistics] = useState<EmailStatistics>({
    totalSent: 0,
    totalFailed: 0,
    totalQueued: 0,
    avgDeliveryTime: 0,
    successRate: 0,
    providerStats: {
      smtp: { sent: 0, failed: 0 },
      sendgrid: { sent: 0, failed: 0 },
      aws_ses: { sent: 0, failed: 0 },
      mailgun: { sent: 0, failed: 0 },
      postmark: { sent: 0, failed: 0 }
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = email.getStatistics();
      setStatistics(stats);
    } catch (err: any) {
      setError(err.message || 'İstatistikler alınamadı');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    EmailSender.getInstance().resetStatistics();
    refresh();
  }, [refresh]);

  // Otomatik yenileme
  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    statistics,
    isLoading,
    error,
    refresh,
    reset
  };
}

/**
 * Email kuyruk hook'u
 */
export function useEmailQueue(refreshInterval: number = 10000): UseEmailQueueReturn {
  const [queuedEmails, setQueuedEmails] = useState<QueuedEmail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const emails = email.getQueuedEmails();
      setQueuedEmails(emails);
    } catch (err: any) {
      setError(err.message || 'Kuyruk alınamadı');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enqueue = useCallback((options: EmailOptions, scheduledAt?: Date): string => {
    try {
      const id = email.enqueue(options, scheduledAt);
      refresh(); // Kuyruğu yenile
      return id;
    } catch (err: any) {
      setError(err.message || 'Email kuyruğa eklenemedi');
      throw err;
    }
  }, [refresh]);

  const cancel = useCallback((id: string): boolean => {
    try {
      const success = email.cancelQueued(id);
      if (success) {
        refresh(); // Kuyruğu yenile
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Email iptal edilemedi');
      return false;
    }
  }, [refresh]);

  // Otomatik yenileme
  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    queuedEmails,
    isLoading,
    error,
    enqueue,
    cancel,
    refresh
  };
}

/**
 * Email template hook'u
 * Tüm hazır template'leri kolayca kullanmak için
 */
export function useEmailTemplate(): UseEmailTemplateReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<EmailResult | null>(null);

  const sendWelcome = useCallback(async (to: string, data: { name: string; loginUrl: string }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendWelcome(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPasswordReset = useCallback(async (to: string, data: { name: string; resetUrl: string }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendPasswordReset(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendDonationReceipt = useCallback(async (to: string, data: {
    donorName: string;
    amount: string;
    donationId: string;
    date: string;
    category: string;
  }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendDonationReceipt(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendVolunteerAssignment = useCallback(async (to: string, data: {
    volunteerName: string;
    taskName: string;
    startDate: string;
    location: string;
    description: string;
    taskUrl: string;
  }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendVolunteerAssignment(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendInventoryAlert = useCallback(async (to: string, data: {
    itemName: string;
    currentStock: number;
    minStock: number;
    warehouse: string;
    inventoryUrl: string;
  }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendInventoryAlert(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendWeeklyReport = useCallback(async (to: string, data: {
    weekStartDate: string;
    weekEndDate: string;
    totalDonations: string;
    totalVolunteers: number;
    totalHelped: number;
    reportUrl: string;
  }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendWeeklyReport(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMonthlyReport = useCallback(async (to: string, data: {
    month: string;
    year: number;
    totalDonations: string;
    activeVolunteers: number;
    newNeedyPersons: number;
    reportUrl: string;
  }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendMonthlyReport(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendSystemNotification = useCallback(async (to: string, data: {
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<EmailResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await email.sendSystemNotification(to, data);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Email gönderilemedi');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendWelcome,
    sendPasswordReset,
    sendDonationReceipt,
    sendVolunteerAssignment,
    sendInventoryAlert,
    sendWeeklyReport,
    sendMonthlyReport,
    sendSystemNotification,
    isLoading,
    error,
    lastResult,
    clearError
  };
}

/**
 * Toplu email gönderme hook'u
 */
export function useBulkEmail() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EmailResult[]>([]);

  const sendBulk = useCallback(async (optionsList: EmailOptions[]): Promise<EmailResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await email.sendBulk(optionsList);
      setResults(results);

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        setError(`${failed.length}/${results.length} email gönderilemedi`);
      }

      return results;
    } catch (err: any) {
      const errorMessage = err.message || 'Toplu email gönderimi sırasında hata oluştu';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendBulk,
    isLoading,
    error,
    results,
    clearError
  };
}

/**
 * Email gönderim ilerleme durumu hook'u
 */
export function useEmailProgress() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [sentCount, setSentCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const updateProgress = useCallback((pending: number, sent: number, failed: number) => {
    setPendingCount(pending);
    setSentCount(sent);
    setFailedCount(failed);

    const total = pending + sent + failed;
    if (total > 0) {
      setProgress((sent + failed) / total * 100);
    } else {
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setPendingCount(0);
    setSentCount(0);
    setFailedCount(0);
    setProgress(0);
  }, []);

  return {
    pendingCount,
    sentCount,
    failedCount,
    progress,
    updateProgress,
    reset
  };
}

/**
 * Email form doğrulama hook'u
 */
export function useEmailValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateEmailList = useCallback((emails: string | string[]): boolean => {
    const emailList = Array.isArray(emails) ? emails : [emails];
    return emailList.every(email => validateEmail(email));
  }, [validateEmail]);

  const validateOptions = useCallback((options: Partial<EmailOptions>): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Alıcı doğrulama
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      newErrors.to = 'En az bir alıcı gerekli';
    } else if (!validateEmailList(options.to)) {
      newErrors.to = 'Geçersiz email adresi';
    }

    // Konu doğrulama
    if (!options.subject || options.subject.trim().length === 0) {
      newErrors.subject = 'Konu gerekli';
    }

    // İçerik doğrulama
    if (!options.template && !options.html && !options.text) {
      newErrors.content = 'İçerik veya template seçilmelidir';
    }

    setErrors(newErrors);
    return newErrors;
  }, [validateEmailList]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateEmail,
    validateEmailList,
    validateOptions,
    clearErrors
  };
}
