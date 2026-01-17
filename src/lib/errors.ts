/**
 * Custom Error Classes
 * 
 * These error classes provide structured error handling throughout
 * the application with specific error types and logging.
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
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
    super(message, authCode, 401, details)
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
    super(message, 'FORBIDDEN', 403, details)
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
    super(message, 'VALIDATION_ERROR', 400, {
      field,
      value,
      ...details,
    })
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
    super(message, 'NETWORK_ERROR', httpStatusCode || 500, details)
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
    
    super(message, 'NOT_FOUND', 404, { resource, identifier, ...details })
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
    super(message, 'CONFLICT', 409, details)
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
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter, ...details })
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
    super(message, 'DATABASE_ERROR', 500, details)
    this.name = 'DatabaseError'
  }
}

/**
 * Error Logger
 * Logs errors with appropriate severity levels
 */
export class ErrorLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

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
    if (error instanceof AuthError) {
      return 'Geçersiz kullanıcı adı veya şifre'
    } else if (error instanceof AuthorizationError) {
      return 'Bu işlem için yetkiniz yok'
    } else if (error instanceof ValidationError) {
      return error.message
    } else if (error instanceof NetworkError) {
      return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin'
    } else if (error instanceof NotFoundError) {
      return error.message
    } else if (error instanceof RateLimitError) {
      return 'Ç fazla deneme yaptınız. Lütfen bir süre bekleyin'
    } else if (error instanceof DatabaseError) {
      return 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin'
    } else if (error instanceof Error) {
      return this.isDevelopment() ? error.message : 'Beklenmeyen bir hata oluştu'
    } else {
      return 'Beklenmeyen bir hata oluştu'
    }
  }

  /**
   * Check if running in development
   */
  private static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
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
}
