/**
 * Bulk Operations System - Core Library
 * Toplu işlemler için merkezi yönetim sistemi
 * 
 * @version 1.0.0
 * @author Aid Management Panel Team
 */

// Toplu işlem hataları için özel sınıflar
export class BulkOperationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BulkOperationError';
  }
}

export class BulkValidationError extends BulkOperationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'BulkValidationError';
  }
}

export class BulkExecutionError extends BulkOperationError {
  constructor(message: string, public itemErrors?: Array<{ index: number; error: string }>) {
    super(message, 'EXECUTION_ERROR');
    this.name = 'BulkExecutionError';
  }
}

// İşlem tipleri
export enum BulkOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  CUSTOM = 'custom'
}

// İşlem durumları
export enum BulkOperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// İşlem öncelikleri
export enum BulkOperationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Toplu işlem seçenekleri
export interface BulkOperationOptions<T = any> {
  items: T[];
  operation: BulkOperationType;
  onProgress?: (progress: BulkOperationProgress) => void;
  onComplete?: (result: BulkOperationResult<T>) => void;
  onError?: (error: Error) => void;
  batchSize?: number;
  delayBetweenBatches?: number; // ms
  continueOnError?: boolean;
  maxConcurrent?: number;
  priority?: BulkOperationPriority;
  metadata?: Record<string, any>;
}

// İşlem ilerleme durumu
export interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
  currentBatch?: number;
  totalBatches?: number;
  estimatedTimeRemaining?: number; // ms
}

// İşlem sonucu
export interface BulkOperationResult<T = any> {
  success: boolean;
  status: BulkOperationStatus;
  totalItems: number;
  successfulItems: T[];
  failedItems: Array<{
    item: T;
    error: string;
    index: number;
  }>;
  statistics: {
    startTime: Date;
    endTime: Date;
    duration: number; // ms
    averageTimePerItem: number; // ms
    successRate: number; // percentage
  };
  metadata?: Record<string, unknown>;
}

// İşlem öğesi
export interface BulkOperationItem<T = unknown> {
  id: string;
  item: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

// Toplu işlem sınıfı
export class BulkOperation<T = unknown> {
  private id: string;
  private options: BulkOperationOptions<T>;
  private status: BulkOperationStatus;
  private items: BulkOperationItem<T>[];
  private progress: BulkOperationProgress;
  private startTime?: Date;
  private endTime?: Date;
  private abortController: AbortController;
  private static activeOperations: Map<string, BulkOperation> = new Map();

  constructor(options: BulkOperationOptions<T>) {
    this.id = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.options = {
      batchSize: 100,
      delayBetweenBatches: 0,
      continueOnError: true,
      maxConcurrent: 5,
      priority: BulkOperationPriority.NORMAL,
      ...options
    };
    this.status = BulkOperationStatus.PENDING;
    
    // Öğeleri hazırla
    this.items = this.options.items.map((item, index) => ({
      id: `${this.id}_item_${index}`,
      item,
      status: 'pending' as const,
      index
    }));
    
    this.progress = {
      total: this.items.length,
      completed: 0,
      failed: 0,
      percentage: 0
    };
    
    this.abortController = new AbortController();
    
    // Aktif işlemlere ekle
    BulkOperation.activeOperations.set(this.id, this as BulkOperation<unknown>);
  }

  /**
   * İşlem ID'sini al
   */
  getId(): string {
    return this.id;
  }

  /**
   * İşlem durumunu al
   */
  getStatus(): BulkOperationStatus {
    return this.status;
  }

  /**
   * İlerleme durumunu al
   */
  getProgress(): BulkOperationProgress {
    return { ...this.progress };
  }

  /**
   * İşlemi iptal et
   */
  cancel(): void {
    if (this.status === BulkOperationStatus.RUNNING) {
      this.abortController.abort();
      this.status = BulkOperationStatus.CANCELLED;
      this.endTime = new Date();
      BulkOperation.activeOperations.delete(this.id);
    }
  }

  /**
   * İşlemi çalıştır
   */
  async execute(operationFn: (item: T, signal: AbortSignal) => Promise<any>): Promise<BulkOperationResult<T>> {
    if (this.status !== BulkOperationStatus.PENDING) {
      throw new BulkOperationError(`İşlem zaten çalışıyor veya tamamlandı. Durum: ${this.status}`);
    }

    this.status = BulkOperationStatus.RUNNING;
    this.startTime = new Date();

    try {
      const batchSize = this.options.batchSize || 100;
      const totalBatches = Math.ceil(this.items.length / batchSize);
      
      this.progress.totalBatches = totalBatches;
      this.progress.currentBatch = 0;

      // Batch'lere böl
      for (let i = 0; i < this.items.length; i += batchSize) {
        if (this.abortController.signal.aborted) {
          throw new BulkOperationError('İşlem iptal edildi');
        }

        const batch = this.items.slice(i, i + batchSize);
        this.progress.currentBatch = Math.floor(i / batchSize) + 1;

        // Batch'i paralel çalıştır
        await Promise.all(
          batch.map(async (itemObj) => {
            if (this.abortController.signal.aborted) return;

            itemObj.status = 'processing';
            itemObj.startTime = new Date();

            try {
              const result = await operationFn(itemObj.item, this.abortController.signal);
              
              itemObj.status = 'completed';
              itemObj.result = result;
              itemObj.endTime = new Date();
              
              this.progress.completed++;
              
            } catch (error: unknown) {
              itemObj.status = 'failed';
              itemObj.error = error instanceof Error ? error.message : 'Bilinmeyen hata';
              itemObj.endTime = new Date();
              
              this.progress.failed++;
              
              if (!this.options.continueOnError) {
                throw error;
              }
            }

            // İlerleme güncelle
            this.progress.percentage = Math.round(
              ((this.progress.completed + this.progress.failed) / this.progress.total) * 100
            );

            // Tahmini kalan süre
            if (this.progress.completed > 0) {
              const elapsed = Date.now() - this.startTime!.getTime();
              const avgTime = elapsed / this.progress.completed;
              const remaining = this.progress.total - this.progress.completed - this.progress.failed;
              this.progress.estimatedTimeRemaining = avgTime * remaining;
            }

            // Progress callback
            if (this.options.onProgress) {
              this.options.onProgress(this.getProgress());
            }
          })
        );

        // Batch arası gecikme
        if (this.options.delayBetweenBatches && i + batchSize < this.items.length) {
          await new Promise(resolve => setTimeout(resolve, this.options.delayBetweenBatches));
        }
      }

      this.endTime = new Date();
      this.status = this.determineFinalStatus();
      
      const result = this.buildResult();
      
      // Complete callback
      if (this.options.onComplete) {
        this.options.onComplete(result);
      }
      
      // Aktif işlemlerden sil
      BulkOperation.activeOperations.delete(this.id);

      return result;

    } catch (error: unknown) {
      this.endTime = new Date();
      this.status = BulkOperationStatus.FAILED;
      
      BulkOperation.activeOperations.delete(this.id);

      if (this.options.onError) {
        this.options.onError(error instanceof Error ? error : new Error(String(error)));
      }

      throw new BulkExecutionError(
        error instanceof Error ? error.message : 'Toplu işlem başarısız',
        this.items
          .filter(item => item.status === 'failed')
          .map(item => ({ index: this.items.indexOf(item), error: item.error || 'Unknown error' }))
      );
    }
  }

  /**
   * Son durumunu belirle
   */
  private determineFinalStatus(): BulkOperationStatus {
    if (this.progress.failed === 0) {
      return BulkOperationStatus.COMPLETED;
    } else if (this.progress.completed > 0) {
      return BulkOperationStatus.PARTIALLY_COMPLETED;
    } else {
      return BulkOperationStatus.FAILED;
    }
  }

  /**
   * Sonuç nesnesi oluştur
   */
  private buildResult(): BulkOperationResult<T> {
    const successfulItems = this.items
      .filter(item => item.status === 'completed')
      .map(item => item.item);

    const failedItems = this.items
      .filter(item => item.status === 'failed')
      .map(item => ({
        item: item.item,
        error: item.error || 'Unknown error',
        index: this.items.indexOf(item)
      }));

    const duration = this.endTime!.getTime() - this.startTime!.getTime();
    const averageTimePerItem = duration / this.items.length;

    return {
      success: this.progress.failed === 0,
      status: this.status,
      totalItems: this.items.length,
      successfulItems,
      failedItems,
      statistics: {
        startTime: this.startTime!,
        endTime: this.endTime!,
        duration,
        averageTimePerItem,
        successRate: this.progress.percentage
      },
      metadata: this.options.metadata
    };
  }

  /**
   * Aktif işlemleri al
   */
  static getActiveOperations(): BulkOperation[] {
    return Array.from(BulkOperation.activeOperations.values());
  }

  /**
   * İşlemi ID ile al
   */
  static getOperationById(id: string): BulkOperation | undefined {
    return BulkOperation.activeOperations.get(id);
  }

  /**
   * Tüm aktif işlemleri iptal et
   */
  static cancelAllOperations(): void {
    BulkOperation.activeOperations.forEach(operation => operation.cancel());
    BulkOperation.activeOperations.clear();
  }
}

// Yardımcı fonksiyonlar
export const bulk = {
  /**
   * Toplu oluştur işlemi
   */
  create: async <T>(
    items: T[],
    createFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.CREATE,
      ...options
    });

    return operation.execute(createFn);
  },

  /**
   * Toplu güncelleme işlemi
   */
  update: async <T>(
    items: T[],
    updateFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.UPDATE,
      ...options
    });

    return operation.execute(updateFn);
  },

  /**
   * Toplu silme işlemi
   */
  delete: async <T>(
    items: T[],
    deleteFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.DELETE,
      ...options
    });

    return operation.execute(deleteFn);
  },

  /**
   * Toplu onaylama işlemi
   */
  approve: async <T>(
    items: T[],
    approveFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.APPROVE,
      ...options
    });

    return operation.execute(approveFn);
  },

  /**
   * Toplu reddetme işlemi
   */
  reject: async <T>(
    items: T[],
    rejectFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.REJECT,
      ...options
    });

    return operation.execute(rejectFn);
  },

  /**
   * Toplu dışa aktarma işlemi
   */
  export: async <T>(
    items: T[],
    exportFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.EXPORT,
      ...options
    });

    return operation.execute(exportFn);
  },

  /**
   * Toplu içe aktarma işlemi
   */
  import: async <T>(
    items: T[],
    importFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.IMPORT,
      ...options
    });

    return operation.execute(importFn);
  },

  /**
   * Özel toplu işlem
   */
  custom: async <T>(
    items: T[],
    customFn: (item: T) => Promise<any>,
    options?: Partial<BulkOperationOptions<T>>
  ): Promise<BulkOperationResult<T>> => {
    const operation = new BulkOperation<T>({
      items,
      operation: BulkOperationType.CUSTOM,
      ...options
    });

    return operation.execute(customFn);
  },

  /**
   * Aktif işlemleri al
   */
  getActiveOperations: (): BulkOperation[] => {
    return BulkOperation.getActiveOperations();
  },

  /**
   * İşlemi ID ile al
   */
  getOperation: (id: string): BulkOperation | undefined => {
    return BulkOperation.getOperationById(id);
  },

  /**
   * Tüm işlemleri iptal et
   */
  cancelAll: (): void => {
    BulkOperation.cancelAllOperations();
  }
};
