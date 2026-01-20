/**
 * Bulk Operations System - React Hooks
 * Toplu işlemler için React hook'ları
 * 
 * @version 1.0.0
 * @author Aid Management Panel Team
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  BulkOperation,
  BulkOperationType,
  BulkOperationStatus,
  BulkOperationPriority,
  BulkOperationOptions,
  BulkOperationResult,
  BulkOperationProgress,
  bulk
} from './bulk';

// Toplu işlem hook'u için dönen değer
export interface UseBulkOperationReturn<T = any> {
  execute: (operationFn: (item: T, signal: AbortSignal) => Promise<any>) => Promise<BulkOperationResult<T>>;
  cancel: () => void;
  progress: BulkOperationProgress;
  status: BulkOperationStatus;
  result: BulkOperationResult<T> | null;
  error: Error | null;
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  reset: () => void;
}

// Aktif işlemler hook'u için dönen değer
export interface UseActiveOperationsReturn {
  operations: BulkOperation[];
  count: number;
  cancelAll: () => void;
  cancelOperation: (id: string) => void;
  getOperation: (id: string) => BulkOperation | undefined;
  refresh: () => void;
}

/**
 * Toplu işlem hook'u
 */
export function useBulkOperation<T = any>(
  items: T[],
  operationType: BulkOperationType,
  options?: Partial<BulkOperationOptions<T>>
): UseBulkOperationReturn<T> {
  const [operation, setOperation] = useState<BulkOperation<T> | null>(null);
  const [progress, setProgress] = useState<BulkOperationProgress>({
    total: items.length,
    completed: 0,
    failed: 0,
    percentage: 0
  });
  const [status, setStatus] = useState<BulkOperationStatus>(BulkOperationStatus.PENDING);
  const [result, setResult] = useState<BulkOperationResult<T> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const operationRef = useRef<BulkOperation<T> | null>(null);

  const execute = useCallback(async (operationFn: (item: T, signal: AbortSignal) => Promise<any>) => {
    // Önceki işlemi temizle
    if (operationRef.current) {
      operationRef.current.cancel();
    }

    const newOperation = new BulkOperation<T>({
      items,
      operation: operationType,
      onProgress: (progress) => {
        setProgress(progress);
      },
      onComplete: (result) => {
        setResult(result);
        setStatus(result.status);
      },
      onError: (error) => {
        setError(error);
      },
      ...options
    });

    operationRef.current = newOperation;
    setOperation(newOperation);
    setStatus(BulkOperationStatus.RUNNING);
    setError(null);
    setResult(null);

    try {
      const result = await newOperation.execute(operationFn);
      return result;
    } catch (err: any) {
      setError(err);
      setStatus(BulkOperationStatus.FAILED);
      throw err;
    }
  }, [items, operationType, options]);

  const cancel = useCallback(() => {
    if (operationRef.current) {
      operationRef.current.cancel();
      setStatus(BulkOperationStatus.CANCELLED);
    }
  }, []);

  const reset = useCallback(() => {
    if (operationRef.current) {
      operationRef.current.cancel();
    }
    operationRef.current = null;
    setOperation(null);
    setProgress({
      total: items.length,
      completed: 0,
      failed: 0,
      percentage: 0
    });
    setStatus(BulkOperationStatus.PENDING);
    setResult(null);
    setError(null);
  }, [items.length]);

  const isRunning = status === BulkOperationStatus.RUNNING;
  const isCompleted = status === BulkOperationStatus.COMPLETED || status === BulkOperationStatus.PARTIALLY_COMPLETED;
  const isFailed = status === BulkOperationStatus.FAILED;
  const isCancelled = status === BulkOperationStatus.CANCELLED;

  return {
    execute,
    cancel,
    progress,
    status,
    result,
    error,
    isRunning,
    isCompleted,
    isFailed,
    isCancelled,
    reset
  };
}

/**
 * Toplu oluşturma hook'u
 */
export function useBulkCreate<T = any>(
  items: T[],
  createFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.CREATE, options);
  const operationRef = useRef<BulkOperation<T> | null>(null);

  const executeCreate = useCallback(async () => {
    return hook.execute(createFn);
  }, [hook, createFn]);

  return {
    ...hook,
    execute: executeCreate
  };
}

/**
 * Toplu güncelleme hook'u
 */
export function useBulkUpdate<T = any>(
  items: T[],
  updateFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.UPDATE, options);

  const executeUpdate = useCallback(async () => {
    return hook.execute(updateFn);
  }, [hook, updateFn]);

  return {
    ...hook,
    execute: executeUpdate
  };
}

/**
 * Toplu silme hook'u
 */
export function useBulkDelete<T = any>(
  items: T[],
  deleteFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.DELETE, options);

  const executeDelete = useCallback(async () => {
    return hook.execute(deleteFn);
  }, [hook, deleteFn]);

  return {
    ...hook,
    execute: executeDelete
  };
}

/**
 * Toplu onaylama hook'u
 */
export function useBulkApprove<T = any>(
  items: T[],
  approveFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.APPROVE, options);

  const executeApprove = useCallback(async () => {
    return hook.execute(approveFn);
  }, [hook, approveFn]);

  return {
    ...hook,
    execute: executeApprove
  };
}

/**
 * Toplu reddetme hook'u
 */
export function useBulkReject<T = any>(
  items: T[],
  rejectFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.REJECT, options);

  const executeReject = useCallback(async () => {
    return hook.execute(rejectFn);
  }, [hook, rejectFn]);

  return {
    ...hook,
    execute: executeReject
  };
}

/**
 * Toplu dışa aktarma hook'u
 */
export function useBulkExport<T = any>(
  items: T[],
  exportFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.EXPORT, options);

  const executeExport = useCallback(async () => {
    return hook.execute(exportFn);
  }, [hook, exportFn]);

  return {
    ...hook,
    execute: executeExport
  };
}

/**
 * Toplu içe aktarma hook'u
 */
export function useBulkImport<T = any>(
  items: T[],
  importFn: (item: T) => Promise<any>,
  options?: Partial<BulkOperationOptions<T>>
) {
  const hook = useBulkOperation(items, BulkOperationType.IMPORT, options);

  const executeImport = useCallback(async () => {
    return hook.execute(importFn);
  }, [hook, importFn]);

  return {
    ...hook,
    execute: executeImport
  };
}

/**
 * Aktif işlemler hook'u
 */
export function useActiveOperations(refreshInterval: number = 5000): UseActiveOperationsReturn {
  const [operations, setOperations] = useState<BulkOperation[]>([]);

  const refresh = useCallback(() => {
    const activeOps = bulk.getActiveOperations();
    setOperations(activeOps);
  }, []);

  const cancelAll = useCallback(() => {
    bulk.cancelAll();
    refresh();
  }, [refresh]);

  const cancelOperation = useCallback((id: string) => {
    const operation = bulk.getOperation(id);
    if (operation) {
      operation.cancel();
      refresh();
    }
  }, [refresh]);

  const getOperation = useCallback((id: string) => {
    return bulk.getOperation(id);
  }, []);

  // Otomatik yenileme
  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    operations,
    count: operations.length,
    cancelAll,
    cancelOperation,
    getOperation,
    refresh
  };
}

/**
 * İşlem ilerleme çubuğu hook'u
 */
export function useBulkProgressBar<T = any>(
  operation: BulkOperation<T> | null
) {
  const [progress, setProgress] = useState<BulkOperationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0
  });

  useEffect(() => {
    if (operation) {
      const interval = setInterval(() => {
        setProgress(operation.getProgress());
      }, 100);

      return () => clearInterval(interval);
    }
  }, [operation]);

  return progress;
}

/**
 * İşlem istatistikleri hook'u
 */
export function useBulkStatistics<T = any>(
  result: BulkOperationResult<T> | null
) {
  const [statistics, setStatistics] = useState<{
    totalItems: number;
    successfulItems: number;
    failedItems: number;
    successRate: number;
    duration: number;
    averageTimePerItem: number;
  }>({
    totalItems: 0,
    successfulItems: 0,
    failedItems: 0,
    successRate: 0,
    duration: 0,
    averageTimePerItem: 0
  });

  useEffect(() => {
    if (result) {
      setStatistics({
        totalItems: result.totalItems,
        successfulItems: result.successfulItems.length,
        failedItems: result.failedItems.length,
        successRate: result.statistics.successRate,
        duration: result.statistics.duration,
        averageTimePerItem: result.statistics.averageTimePerItem
      });
    }
  }, [result]);

  return statistics;
}

/**
 * Toplu işlem form doğrulama hook'u
 */
export function useBulkValidation<T = any>() {
  const [errors, setErrors] = useState<Map<number, string>>(new Map());
  const [isValid, setIsValid] = useState<boolean>(true);

  const validateItem = useCallback((item: T, index: number, validationFn: (item: T) => boolean | string): boolean => {
    try {
      const result = validationFn(item);
      
      if (result === true) {
        // Validasyon başarılı, hatayı kaldır
        setErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.delete(index);
          return newErrors;
        });
        return true;
      } else {
        // Validasyon başarısız
        const errorMessage = typeof result === 'string' ? result : 'Geçersiz';
        setErrors(prev => new Map(prev).set(index, errorMessage));
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Validasyon hatası';
      setErrors(prev => new Map(prev).set(index, errorMessage));
      return false;
    }
  }, []);

  const validateItems = useCallback((items: T[], validationFn: (item: T) => boolean | string): boolean => {
    let allValid = true;
    const newErrors = new Map<number, string>();

    items.forEach((item, index) => {
      try {
        const result = validationFn(item);
        if (result !== true) {
          allValid = false;
          const errorMessage = typeof result === 'string' ? result : 'Geçersiz';
          newErrors.set(index, errorMessage);
        }
      } catch (error: any) {
        allValid = false;
        const errorMessage = error.message || 'Validasyon hatası';
        newErrors.set(index, errorMessage);
      }
    });

    setErrors(newErrors);
    setIsValid(allValid);
    return allValid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors(new Map());
    setIsValid(true);
  }, []);

  const getErrorCount = useCallback(() => {
    return errors.size;
  }, [errors.size]);

  return {
    errors,
    isValid,
    errorCount: errors.size,
    validateItem,
    validateItems,
    clearErrors,
    getErrorCount
  };
}

/**
 * Toplu işlem seçimi hook'u
 */
export function useBulkSelection<T = any>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<T>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  const toggleItem = useCallback((item: T) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedItems(prev => {
      if (prev.size === items.length) {
        return new Set();
      } else {
        return new Set(items);
      }
    });
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectItems = useCallback((itemsToSelect: T[]) => {
    setSelectedItems(new Set(itemsToSelect));
  }, []);

  // Tümü seçili mi kontrol et
  useEffect(() => {
    setIsAllSelected(selectedItems.size === items.length && items.length > 0);
  }, [selectedItems.size, items.length]);

  return {
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    isAllSelected,
    isPartialSelected: selectedItems.size > 0 && !isAllSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    selectItems,
    isSelected: (item: T) => selectedItems.has(item)
  };
}

/**
 * Toplu dosya içe aktarma hook'u
 */
export function useBulkFileImport<T = any>() {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedItems, setParsedItems] = useState<T[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<Error | null>(null);

  const parseFiles = useCallback(async (
    parseFn: (file: File) => Promise<T[]>
  ) => {
    setIsParsing(true);
    setParseError(null);

    try {
      const allItems: T[] = [];

      for (const file of files) {
        const items = await parseFn(file);
        allItems.push(...items);
      }

      setParsedItems(allItems);
      return allItems;
    } catch (error: any) {
      setParseError(error);
      throw error;
    } finally {
      setIsParsing(false);
    }
  }, [files]);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setParsedItems([]);
    setParseError(null);
  }, []);

  return {
    files,
    parsedItems,
    isParsing,
    parseError,
    addFiles,
    removeFile,
    clearFiles,
    parseFiles
  };
}

/**
 * Toplu CSV dışa aktarma hook'u
 */
export function useBulkCsvExport<T = any>() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  const exportToCsv = useCallback(async (
    items: T[],
    filename: string,
    transformFn: (item: T) => Record<string, any>
  ) => {
    setIsExporting(true);
    setExportError(null);

    try {
      if (items.length === 0) {
        throw new Error('Dışa aktarılacak öğe yok');
      }

      // Başlıkları al
      const headers = Object.keys(transformFn(items[0]));

      // CSV içeriğini oluştur
      const csvContent = [
        headers.join(','),
        ...items.map(item => {
          const transformed = transformFn(item);
          return headers.map(header => {
            const value = transformed[header];
            // Değerleri virgülden koru
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',');
        })
      ].join('\n');

      // Blob oluştur
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // İndir
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error: any) {
      setExportError(error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportToCsv,
    isExporting,
    exportError
  };
}
