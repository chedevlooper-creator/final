/**
 * Custom Error Classes
 *
 * These error classes provide structured error handling throughout
 * the application with specific error types, recovery actions, and Turkish messages.
 *
 * @version 2.0.0 - Enhanced Error Handling System
 * @since 2026-01-18
 */

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error Types
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit'
}

/**
 * Recovery Actions
 */
export interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  icon?: string;
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public recoveryActions?: RecoveryAction[],
    public errorType: ErrorType = ErrorType.UNKNOWN
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Get user-friendly Turkish message
   */
  getUserMessage(): string {
    return ErrorHandler.getUserMessage(this)
  }

  /**
   * Get recovery actions
   */
  getRecoveryActions(): RecoveryAction[] {
    return this.recoveryActions || ErrorHandler.getDefaultRecoveryActions(this)
  }

  /**
   * Get error type
   */
  getErrorType(): ErrorType {
    return this.errorType
  }
}

/**
 * Authentication Error
 * Thrown when authentication fails (invalid credentials, token expired, etc.)
 */
export class AuthError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    public authCode: string = 'AUTH_FAILED',
    details?: Record<string, unknown>
  ) {
    super(
      message,
      authCode,
      401,
      details,
      ErrorSeverity.HIGH,
      [
        { label: 'Tekrar Giriş Yap', action: () => { window.location.href = '/login'; }, icon: '🔐' },
        { label: 'Ana Sayfaya Dön', action: () => { window.location.href = '/'; }, icon: '🏠' }
      ],
      ErrorType.AUTHENTICATION
    )
    this.name = 'AuthError'
  }
}

/**
 * Authorization Error
 * Thrown when user doesn't have permission to perform an action
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'You do not have permission to perform this action',
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'FORBIDDEN',
      403,
      details,
      ErrorSeverity.MEDIUM,
      [
        { label: 'Geri Dön', action: () => window.history.back(), icon: '↩️' },
        { label: 'Ana Sayfaya Dön', action: () => window.location.href = '/', icon: '🏠' }
      ],
      ErrorType.PERMISSION
    )
    this.name = 'AuthorizationError'
  }
}

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      {
        field,
        value,
        ...details,
      },
      ErrorSeverity.LOW,
      [
        { label: 'Formu Düzenle', action: () => {}, icon: '✏️' }
      ],
      ErrorType.VALIDATION
    )
    this.name = 'ValidationError'
  }
}

/**
 * Network Error
 * Thrown when network request fails
 */
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network request failed',
    public httpStatusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'NETWORK_ERROR',
      httpStatusCode || 500,
      details,
      ErrorSeverity.MEDIUM,
      [
        { label: 'Tekrar Dene', action: () => window.location.reload(), icon: '🔄' }
      ],
      ErrorType.NETWORK
    )
    this.name = 'NetworkError'
  }
}

/**
 * Not Found Error
 * Thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = 'Resource',
    identifier?: string,
    details?: Record<string, unknown>
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`

    super(
      message,
      'NOT_FOUND',
      404,
      { resource, identifier, ...details },
      ErrorSeverity.LOW,
      [
        { label: 'Geri Dön', action: () => window.history.back(), icon: '↩️' },
        { label: 'Ana Sayfaya Dön', action: () => window.location.href = '/', icon: '🏠' }
      ],
      ErrorType.NOT_FOUND
    )
    this.name = 'NotFoundError'
  }
}

/**
 * Conflict Error
 * Thrown when there's a conflict with existing data
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'CONFLICT',
      409,
      details,
      ErrorSeverity.MEDIUM,
      [
        { label: 'Verileri Kontrol Et', action: () => {}, icon: '🔍' }
      ],
      ErrorType.CONFLICT
    )
    this.name = 'ConflictError'
  }
}

/**
 * Rate Limit Error
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'RATE_LIMIT_EXCEEDED',
      429,
      { retryAfter, ...details },
      ErrorSeverity.MEDIUM,
      [
        { label: `${retryAfter || 60} saniye bekleyin`, action: () => {}, icon: '⏳' }
      ],
      ErrorType.RATE_LIMIT
    )
    this.name = 'RateLimitError'
  }
}

/**
 * Database Error
 * Thrown when database operation fails
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    details?: Record<string, unknown>
  ) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      details,
      ErrorSeverity.HIGH,
      [
        { label: 'Tekrar Dene', action: () => window.location.reload(), icon: '🔄' },
        { label: 'Destek ile İletişime Geç', action: () => window.location.href = '/support', icon: '📞' }
      ],
      ErrorType.DATABASE
    )
    this.name = 'DatabaseError'
  }
}

/**
 * Error Logger
 * Logs errors with appropriate severity levels
 */
export class ErrorLogger {
  private static isDevelopment = process.env['NODE_ENV'] === 'development'

  /**
   * Log error with context
   */
  static error(error: Error | AppError, context?: Record<string, unknown>): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        severity: error.severity,
        errorType: error.errorType,
      }),
      context,
      timestamp: new Date().toISOString(),
    }

    if (this.isDevelopment) {
      console.error('❌ Error:', errorInfo)
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // Sentry.captureException(error, { extra: context })
      console.error('Error:', errorInfo.name, errorInfo.message)
    }
  }

  /**
   * Log warning
   */
  static warn(message: string, context?: Record<string, unknown>): void {
    const warnInfo = {
      message,
      context,
      timestamp: new Date().toISOString(),
    }

    if (this.isDevelopment) {
      console.warn('⚠️ Warning:', warnInfo)
    } else {
      console.warn('Warning:', message)
    }
  }

  /**
   * Log info
   */
  static info(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.info('ℹ️ Info:', message, context)
    }
  }
}

/**
 * Error Handler Utility
 * Provides consistent error handling across the application
 */
export class ErrorHandler {
  /**
   * Turkish error messages mapping
   */
  private static turkishMessages: Record<string, string> = {
    'AUTH_FAILED': 'Geçersiz kullanıcı adı veya şifre',
    'FORBIDDEN': 'Bu işlem için yetkiniz yok',
    'VALIDATION_ERROR': 'Lütfen girdiğiniz bilgileri kontrol edin',
    'NETWORK_ERROR': 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin',
    'NOT_FOUND': 'Sayfa veya kayıt bulunamadı',
    'CONFLICT': 'Bu kayıt zaten mevcut',
    'RATE_LIMIT_EXCEEDED': 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyin',
    'DATABASE_ERROR': 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin',
    'UNKNOWN_ERROR': 'Beklenmeyen bir hata oluştu',
  }

  /**
   * Handle error and return user-friendly message
   */
  static handle(error: unknown, context?: Record<string, unknown>): string {
    // Log the error
    if (error instanceof Error) {
      ErrorLogger.error(error, context)
    } else {
      ErrorLogger.error(new Error(String(error)), context)
    }

    // Return user-friendly message
    return this.getUserMessage(error)
  }

  /**
   * Get user-friendly Turkish message
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof AuthError) {
      return this.turkishMessages['AUTH_FAILED']
    } else if (error instanceof AuthorizationError) {
      return this.turkishMessages['FORBIDDEN']
    } else if (error instanceof ValidationError) {
      return this.turkishMessages['VALIDATION_ERROR']
    } else if (error instanceof NetworkError) {
      return this.turkishMessages['NETWORK_ERROR']
    } else if (error instanceof NotFoundError) {
      return this.turkishMessages['NOT_FOUND']
    } else if (error instanceof RateLimitError) {
      return this.turkishMessages['RATE_LIMIT_EXCEEDED']
    } else if (error instanceof DatabaseError) {
      return this.turkishMessages['DATABASE_ERROR']
    } else if (error instanceof ConflictError) {
      return this.turkishMessages['CONFLICT']
    } else if (error instanceof Error) {
      return this.isDevelopment() ? error.message : this.turkishMessages['UNKNOWN_ERROR']
    } else {
      return this.turkishMessages['UNKNOWN_ERROR']
    }
  }

  /**
   * Get default recovery actions for error type
   */
  static getDefaultRecoveryActions(error: unknown): RecoveryAction[] {
    if (error instanceof NetworkError) {
      return [
        { label: 'Tekrar Dene', action: () => window.location.reload(), icon: '🔄' }
      ]
    } else if (error instanceof NotFoundError) {
      return [
        { label: 'Geri Dön', action: () => window.history.back(), icon: '↩️' },
        { label: 'Ana Sayfaya Dön', action: () => window.location.href = '/', icon: '🏠' }
      ]
    } else if (error instanceof AuthError) {
      return [
        { label: 'Tekrar Giriş Yap', action: () => { window.location.href = '/login'; }, icon: '🔐' }
      ]
    }

    return [
      { label: 'Ana Sayfaya Dön', action: () => { window.location.href = '/'; }, icon: '🏠' }
    ]
  }

  /**
   * Check if running in development
   */
  private static isDevelopment(): boolean {
    return process.env['NODE_ENV'] === 'development'
  }

  /**
   * Parse Supabase error and convert to appropriate AppError
   */
  static fromSupabaseError(error: { message: string; code?: string; details?: unknown }): AppError {
    const message = error.message || 'Bir hata oluştu'

    switch (error.code) {
      case 'PGRST116':
      case 'PGRST301':
        return new NotFoundError('Resource')
      case '23505':
        return new ConflictError('Bu kayıt zaten mevcut')
      case '23503':
        return new ValidationError('İlişkili kayıt bulunamadı', 'foreign_key', null)
      case '42501':
        return new AuthorizationError('Bu işlem için yetkiniz yok')
      default:
        return new AppError(message, error.code || 'UNKNOWN_ERROR', 500, {
          details: error.details,
        })
    }
  }

  /**
   * Create error from error type
   */
  static createError(type: ErrorType, message: string, context?: Record<string, unknown>): AppError {
    switch (type) {
      case ErrorType.NETWORK:
        return new NetworkError(message)
      case ErrorType.VALIDATION:
        return new ValidationError(message, context?.['field'] as string || 'unknown', context?.['value'])
      case ErrorType.NOT_FOUND:
        return new NotFoundError(context?.['resource'] as string || 'Resource', context?.['identifier'] as string)
      case ErrorType.PERMISSION:
        return new AuthorizationError(message)
      case ErrorType.AUTHENTICATION:
        return new AuthError(message)
      case ErrorType.DATABASE:
        return new DatabaseError(message)
      case ErrorType.CONFLICT:
        return new ConflictError(message)
      case ErrorType.RATE_LIMIT:
        return new RateLimitError(message, context?.['retryAfter'] as number)
      default:
        return new AppError(message, 'UNKNOWN_ERROR', 500, context)
    }
  }

  /**
   * Get error type from error
   */
  static getErrorType(error: unknown): ErrorType {
    if (error instanceof NetworkError) return ErrorType.NETWORK
    if (error instanceof ValidationError) return ErrorType.VALIDATION
    if (error instanceof NotFoundError) return ErrorType.NOT_FOUND
    if (error instanceof AuthorizationError) return ErrorType.PERMISSION
    if (error instanceof AuthError) return ErrorType.AUTHENTICATION
    if (error instanceof DatabaseError) return ErrorType.DATABASE
    if (error instanceof ConflictError) return ErrorType.CONFLICT
    if (error instanceof RateLimitError) return ErrorType.RATE_LIMIT
    return ErrorType.UNKNOWN
  }

  /**
   * Get severity level for error
   */
  static getSeverity(error: unknown): ErrorSeverity {
    if (error instanceof AppError) {
      return error.severity
    }
    return ErrorSeverity.MEDIUM
  }
}
