/**
 * Audit Log System - React Hooks
 * Sürüm: 1.0.0
 * Tanım: Denetim sistemi için React hook'ları
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditLogger } from './audit';
import type {
  AuditLog,
  LogLevel,
  AuditEventType,
  EntityType,
  EventPriority,
  LogFilterOptions,
  LogPaginationOptions,
  LogQueryResult,
  AuditStatistics,
  SecurityAnalytics,
  SecurityAlert,
  LogExportOptions,
  RetentionPolicy,
  AuditReport,
  EventContext,
  LoggingOptions,
  AuditChanges,
  LogSearchResult
} from './audit.types';

/**
 * Ana audit log hook'u
 * Log kayıtlarını listeler ve filtreler
 */
export function useAuditLogs(
  filters?: LogFilterOptions,
  pagination?: LogPaginationOptions
) {
  const queryClient = useQueryClient();

  const {
    data: queryResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-logs', filters, pagination],
    queryFn: () => auditLogger.queryLogs(filters, pagination),
    staleTime: 30000, // 30 saniye
    gcTime: 300000 // 5 dakika
  });

  // İptal etme fonksiyonu
  const cancelQuery = useCallback(() => {
    queryClient.cancelQueries({ queryKey: ['audit-logs'] });
  }, [queryClient]);

  return {
    logs: queryResult?.logs || [],
    total: queryResult?.total || 0,
    page: queryResult?.page || 1,
    limit: queryResult?.limit || 50,
    totalPages: queryResult?.totalPages || 0,
    searchTime: queryResult?.searchTime || 0,
    isLoading,
    error: error as Error,
    refetch,
    cancelQuery
  };
}

/**
 * Log kaydetme hook'u
 */
export function useAuditLog() {
  const queryClient = useQueryClient();
  const [isLogging, setIsLogging] = useState(false);
  const [lastLog, setLastLog] = useState<AuditLog | null>(null);

  const logMutation = useMutation({
    mutationFn: (options: LoggingOptions) => auditLogger.log(options),
    onSuccess: (log) => {
      setLastLog(log);
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    },
    onError: (error) => {
      console.error('Log kaydetme hatası:', error);
    },
    onSettled: () => {
      setIsLogging(false);
    }
  });

  const log = useCallback((options: LoggingOptions) => {
    setIsLogging(true);
    logMutation.mutate(options);
  }, [logMutation]);

  // Convenience functions
  const logInfo = useCallback((action: string, entityType: EntityType, options?: Partial<LoggingOptions>) => {
    log({
      ...options,
      level: LogLevel.INFO,
      eventType: AuditEventType.CUSTOM,
      action,
      entityType
    });
  }, [log]);

  const logError = useCallback((action: string, entityType: EntityType, errorMessage: string, options?: Partial<LoggingOptions>) => {
    log({
      ...options,
      level: LogLevel.ERROR,
      eventType: AuditEventType.SYSTEM_ERROR,
      action,
      entityType,
      errorMessage,
      status: 'failure' as any
    });
  }, [log]);

  const logSecurity = useCallback((action: string, entityType: EntityType, options?: Partial<LoggingOptions>) => {
    log({
      ...options,
      level: LogLevel.SECURITY,
      eventType: AuditEventType.SECURITY_ALERT,
      action,
      entityType,
      priority: EventPriority.HIGH
    });
  }, [log]);

  const logUserLogin = useCallback((userId: string, userEmail: string, ipAddress?: string) => {
    log({
      level: LogLevel.INFO,
      eventType: AuditEventType.USER_LOGIN,
      action: 'Kullanıcı girişi',
      entityType: EntityType.USER,
      userId,
      userEmail,
      ipAddress
    });
  }, [log]);

  const logUserLogout = useCallback((userId: string, userEmail: string) => {
    log({
      level: LogLevel.INFO,
      eventType: AuditEventType.USER_LOGOUT,
      action: 'Kullanıcı çıkışı',
      entityType: EntityType.USER,
      userId,
      userEmail
    });
  }, [log]);

  const logCRUD = useCallback((
    action: 'create' | 'read' | 'update' | 'delete',
    entityType: EntityType,
    entityId: string,
    entityName?: string,
    changes?: AuditChanges
  ) => {
    log({
      level: LogLevel.INFO,
      eventType: {
        create: AuditEventType.CREATE_RECORD,
        read: AuditEventType.READ_RECORD,
        update: AuditEventType.UPDATE_RECORD,
        delete: AuditEventType.DELETE_RECORD
      }[action],
      action: `${entityType} ${action}`,
      entityType,
      entityId,
      entityName,
      changes
    });
  }, [log]);

  return {
    log,
    logInfo,
    logError,
    logSecurity,
    logUserLogin,
    logUserLogout,
    logCRUD,
    isLogging,
    lastLog,
    error: logMutation.error as Error
  };
}

/**
 * İstatistik hook'u
 */
export function useAuditStatistics(filters?: LogFilterOptions, refetchInterval?: number) {
  const {
    data: statistics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-statistics', filters],
    queryFn: () => auditLogger.getStatistics(filters),
    staleTime: 60000, // 1 dakika
    gcTime: 600000, // 10 dakika
    refetchInterval
  });

  // Hesaplanmış metrikler
  const metrics = useMemo(() => {
    if (!statistics) return null;

    return {
      totalLogs: statistics.totalLogs,
      errorRate: statistics.errorRate,
      averageDuration: statistics.averageDuration,
      last24Hours: statistics.last24Hours,
      lastHour: statistics.lastHour,
      failedLogins: statistics.failedLogins,
      suspiciousActivities: statistics.suspiciousActivities,
      
      // En aktif kullanıcılar
      topUsers: statistics.logsByUser.slice(0, 5),
      
      // En çok log seviyeleri
      topLevels: Object.entries(statistics.logsByLevel)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3),
      
      // En çok olay türleri
      topEventTypes: Object.entries(statistics.logsByEventType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    };
  }, [statistics]);

  return {
    statistics,
    metrics,
    isLoading,
    error: error as Error,
    refetch
  };
}

/**
 * Güvenlik analitiği hook'u
 */
export function useSecurityAnalytics(refetchInterval?: number) {
  const {
    data: analytics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['security-analytics'],
    queryFn: () => auditLogger.getSecurityAnalytics(),
    staleTime: 60000, // 1 dakika
    gcTime: 600000, // 10 dakika
    refetchInterval
  });

  // Kritik güvenlik metrikleri
  const criticalMetrics = useMemo(() => {
    if (!analytics) return null;

    return {
      hasCriticalAlerts: analytics.criticalAlerts > 0,
      hasHighPriorityAlerts: analytics.highPriorityAlerts > 0,
      totalUnresolved: analytics.pendingAlerts,
      resolutionRate: analytics.totalAlerts > 0
        ? (analytics.resolvedAlerts / analytics.totalAlerts) * 100
        : 0,
      
      // Son 7 günlük trend
      recentTrend: analytics.alertsTrend.slice(-7),
      
      // En şüpheli IP'ler
      topSuspiciousIPs: analytics.suspiciousIPs.slice(0, 5),
      
      // En çok başarısız giriş denemeleri
      topFailedLogins: analytics.failedLoginAttempts.slice(0, 5)
    };
  }, [analytics]);

  return {
    analytics,
    criticalMetrics,
    isLoading,
    error: error as Error,
    refetch
  };
}

/**
 * Arama hook'u
 */
export function useAuditSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<LogFilterOptions | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LogSearchResult | null>(null);

  const search = useCallback(async (searchQuery: string, searchFilters?: LogFilterOptions) => {
    setIsSearching(true);
    setQuery(searchQuery);
    setFilters(searchFilters);

    try {
      const results = await auditLogger.searchLogs(searchQuery, searchFilters);
      setSearchResults(results);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters(undefined);
    setSearchResults(null);
  }, []);

  return {
    query,
    filters,
    searchResults,
    isSearching,
    search,
    clearSearch,
    hasResults: (searchResults?.totalMatches || 0) > 0
  };
}

/**
 * Dışa aktarma hook'u
 */
export function useAuditExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const exportLogs = useCallback(async (options: LogExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportUrl(null);

    try {
      const result = await auditLogger.exportLogs(options);
      setExportProgress(100);

      // Blob ise URL oluştur
      if (typeof result === 'string') {
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        setExportUrl(url);
      }

      return result;
    } catch (error) {
      console.error('Dışa aktarma hatası:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const downloadExport = useCallback((filename: string) => {
    if (!exportUrl) return;

    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [exportUrl]);

  const clearExport = useCallback(() => {
    if (exportUrl) {
      URL.revokeObjectURL(exportUrl);
    }
    setExportUrl(null);
    setExportProgress(0);
  }, [exportUrl]);

  return {
    exportLogs,
    downloadExport,
    clearExport,
    isExporting,
    exportProgress,
    exportUrl
  };
}

/**
 * Rapor oluşturma hook'u
 */
export function useAuditReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);

  const generateReport = useCallback(async (
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    filters?: LogFilterOptions,
    format: 'pdf' | 'excel' | 'json' = 'json'
  ) => {
    setIsGenerating(true);

    try {
      const generatedReport = await auditLogger.generateAuditReport(
        title,
        description,
        startDate,
        endDate,
        filters,
        format
      );

      setReport(generatedReport);
      return generatedReport;
    } catch (error) {
      console.error('Rapor oluşturma hatası:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
  }, []);

  return {
    generateReport,
    clearReport,
    report,
    isGenerating
  };
}

/**
 * Saklama politikası hook'u
 */
export function useRetentionPolicy() {
  const [policy, setPolicyState] = useState<RetentionPolicy>(auditLogger.getRetentionPolicy());

  const updatePolicy = useCallback((newPolicy: Partial<RetentionPolicy>) => {
    auditLogger.setRetentionPolicy(newPolicy);
    setPolicyState(auditLogger.getRetentionPolicy());
  }, []);

  return {
    policy,
    updatePolicy
  };
}

/**
 * Log temizleme hook'u
 */
export function useAuditCleanup() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedCount, setCleanedCount] = useState(0);
  const queryClient = useQueryClient();

  const cleanupMutation = useMutation({
    mutationFn: () => auditLogger.cleanupOldLogs(),
    onSuccess: (count) => {
      setCleanedCount(count);
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    },
    onSettled: () => {
      setIsCleaning(false);
    }
  });

  const cleanup = useCallback(() => {
    setIsCleaning(true);
    cleanupMutation.mutate();
  }, [cleanupMutation]);

  return {
    cleanup,
    isCleaning,
    cleanedCount,
    error: cleanupMutation.error as Error
  };
}

/**
 * Tekil log silme hook'u
 */
export function useDeleteAuditLog() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (logId: string) => auditLogger.deleteLog(logId),
    onSuccess: () => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    }
  });

  const deleteLog = useCallback((logId: string) => {
    deleteMutation.mutate(logId);
  }, [deleteMutation]);

  return {
    deleteLog,
    isDeleting: deleteMutation.isPending,
    error: deleteMutation.error as Error
  };
}

/**
 * Kullanıcı loglarını silme hook'u
 */
export function useDeleteUserLogs() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => auditLogger.deleteUserLogs(userId),
    onSuccess: () => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    }
  });

  const deleteUserLogs = useCallback((userId: string) => {
    deleteMutation.mutate(userId);
  }, [deleteMutation]);

  return {
    deleteUserLogs,
    isDeleting: deleteMutation.isPending,
    deletedCount: deleteMutation.data,
    error: deleteMutation.error as Error
  };
}

/**
 * Olay bağlamı hook'u
 */
export function useAuditContext() {
  const [context, setContextState] = useState<EventContext>({});

  const setContext = useCallback((newContext: Partial<EventContext>) => {
    auditLogger.setContext(newContext);
    setContextState(prev => ({ ...prev, ...newContext }));
  }, []);

  const clearContext = useCallback(() => {
    auditLogger.clearContext();
    setContextState({});
  }, []);

  return {
    context,
    setContext,
    clearContext
  };
}

/**
 * Canlı log izleme hook'u
 * Belirli aralıklarla yeni logları çeker
 */
export function useLiveAuditLogs(
  filters?: LogFilterOptions,
  interval: number = 5000 // 5 saniye
) {
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const intervalId = setInterval(async () => {
      try {
        const result = await auditLogger.queryLogs(filters, {
          limit: 10,
          sortBy: 'timestamp',
          sortOrder: 'desc'
        });

        setLiveLogs(result.logs);
      } catch (error) {
        console.error('Canlı log hatası:', error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [filters, interval, isLive]);

  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev);
  }, []);

  return {
    liveLogs,
    isLive,
    toggleLive
  };
}

/**
 * Güvenlik uyarıları hook'u
 */
export function useSecurityAlerts() {
  const queryClient = useQueryClient();

  const {
    data: alerts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async () => {
      // Supabase'den güvenlik uyarılarını çek
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
        resolvedAt: alert.resolved_at ? new Date(alert.resolved_at) : undefined
      })) as SecurityAlert[];
    },
    staleTime: 30000, // 30 saniye
    gcTime: 300000 // 5 dakika
  });

  // Uyarı çözme mutation'ı
  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error } = await supabase
        .from('security_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: context => context?.userEmail || 'System'
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-analytics'] });
    }
  });

  const resolveAlert = useCallback((alertId: string) => {
    resolveMutation.mutate(alertId);
  }, [resolveMutation]);

  // Çözülmüş ve çözülmemiş uyarılar
  const resolvedAlerts = useMemo(() => 
    alerts?.filter(a => a.resolved) || []
  , [alerts]);

  const unresolvedAlerts = useMemo(() => 
    alerts?.filter(a => !a.resolved) || []
  , [alerts]);

  // Kritik uyarılar
  const criticalAlerts = useMemo(() => 
    alerts?.filter(a => !a.resolved && a.severity === EventPriority.CRITICAL) || []
  , [alerts]);

  return {
    alerts,
    resolvedAlerts,
    unresolvedAlerts,
    criticalAlerts,
    isLoading,
    error: error as Error,
    refetch,
    resolveAlert,
    isResolving: resolveMutation.isPending
  };
}

/**
 * Log detayı hook'u
 */
export function useAuditLogDetail(logId: string) {
  const queryClient = useQueryClient();

  const {
    data: log,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-log', logId],
    queryFn: async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;

      return {
        ...data,
        timestamp: new Date(data.timestamp)
      } as AuditLog;
    },
    enabled: !!logId
  });

  return {
    log,
    isLoading,
    error: error as Error,
    refetch
  };
}

/**
 * Filtre hatırlama hook'u
 * Kullanıcının son filtrelerini localStorage'da saklar
 */
export function usePersistedAuditFilters(key: string = 'audit-filters') {
  const [filters, setFiltersState] = useState<LogFilterOptions>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const setFilters = useCallback((newFilters: LogFilterOptions | ((prev: LogFilterOptions) => LogFilterOptions)) => {
    const updatedFilters = typeof newFilters === 'function'
      ? newFilters(filters)
      : newFilters;

    setFiltersState(updatedFilters);

    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(updatedFilters));
    }
  }, [key, filters]);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }, [key]);

  return {
    filters,
    setFilters,
    clearFilters
  };
}
