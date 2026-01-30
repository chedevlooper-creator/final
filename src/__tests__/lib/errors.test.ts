/**
 * Tests for error handling system
 * src/lib/errors.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  AppError,
  AuthError,
  AuthorizationError,
  ValidationError,
  NetworkError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ErrorSeverity,
  ErrorType,
  ErrorHandler,
  ErrorLogger,
  sanitizeError,
  handleValidationError,
} from '@/lib/errors'

// ============================================
// Error Classes - Constructor Tests
// ============================================

describe('AppError', () => {
  it('should construct with required parameters', () => {
    const error = new AppError('test error', 'TEST_CODE')
    expect(error.message).toBe('test error')
    expect(error.code).toBe('TEST_CODE')
    expect(error.statusCode).toBe(500)
    expect(error.severity).toBe(ErrorSeverity.MEDIUM)
    expect(error.errorType).toBe(ErrorType.UNKNOWN)
    expect(error.name).toBe('AppError')
  })

  it('should accept all optional parameters', () => {
    const error = new AppError(
      'msg',
      'CODE',
      422,
      { key: 'val' },
      ErrorSeverity.CRITICAL,
      [],
      ErrorType.VALIDATION
    )
    expect(error.statusCode).toBe(422)
    expect(error.details).toEqual({ key: 'val' })
    expect(error.severity).toBe(ErrorSeverity.CRITICAL)
    expect(error.errorType).toBe(ErrorType.VALIDATION)
  })

  it('should be an instance of Error', () => {
    const error = new AppError('test', 'CODE')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })

  it('should have getErrorType method', () => {
    const error = new AppError('test', 'CODE', 500, undefined, undefined, undefined, ErrorType.DATABASE)
    expect(error.getErrorType()).toBe(ErrorType.DATABASE)
  })
})

describe('AuthError', () => {
  it('should construct with defaults', () => {
    const error = new AuthError()
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('AUTH_FAILED')
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.errorType).toBe(ErrorType.AUTHENTICATION)
    expect(error.name).toBe('AuthError')
  })

  it('should accept custom message and code', () => {
    const error = new AuthError('Token expired', 'TOKEN_EXPIRED')
    expect(error.message).toBe('Token expired')
    expect(error.authCode).toBe('TOKEN_EXPIRED')
  })

  it('should have recovery actions', () => {
    const error = new AuthError()
    const actions = error.getRecoveryActions()
    expect(actions.length).toBeGreaterThan(0)
  })

  it('should be an instance of AppError', () => {
    expect(new AuthError()).toBeInstanceOf(AppError)
  })
})

describe('AuthorizationError', () => {
  it('should construct with defaults', () => {
    const error = new AuthorizationError()
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.errorType).toBe(ErrorType.PERMISSION)
    expect(error.name).toBe('AuthorizationError')
  })

  it('should accept custom message', () => {
    const error = new AuthorizationError('Cannot delete this resource')
    expect(error.message).toBe('Cannot delete this resource')
  })
})

describe('ValidationError', () => {
  it('should construct with required parameters', () => {
    const error = new ValidationError('Invalid email', 'email', 'bad@')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.severity).toBe(ErrorSeverity.LOW)
    expect(error.errorType).toBe(ErrorType.VALIDATION)
    expect(error.name).toBe('ValidationError')
    expect(error.field).toBe('email')
    expect(error.value).toBe('bad@')
  })

  it('should include field and value in details', () => {
    const error = new ValidationError('Bad', 'name', 'x')
    expect(error.details).toEqual({ field: 'name', value: 'x' })
  })
})

describe('NetworkError', () => {
  it('should construct with defaults', () => {
    const error = new NetworkError()
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.errorType).toBe(ErrorType.NETWORK)
    expect(error.name).toBe('NetworkError')
  })

  it('should use provided HTTP status code', () => {
    const error = new NetworkError('Timeout', 504)
    expect(error.statusCode).toBe(504)
    expect(error.httpStatusCode).toBe(504)
  })
})

describe('NotFoundError', () => {
  it('should construct with default resource', () => {
    const error = new NotFoundError()
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Resource not found')
    expect(error.errorType).toBe(ErrorType.NOT_FOUND)
    expect(error.name).toBe('NotFoundError')
  })

  it('should include resource name in message', () => {
    const error = new NotFoundError('User')
    expect(error.message).toBe('User not found')
  })

  it('should include identifier in message', () => {
    const error = new NotFoundError('User', '123')
    expect(error.message).toBe("User with identifier '123' not found")
  })

  it('should include resource and identifier in details', () => {
    const error = new NotFoundError('User', '123')
    expect(error.details?.resource).toBe('User')
    expect(error.details?.identifier).toBe('123')
  })
})

describe('ConflictError', () => {
  it('should construct correctly', () => {
    const error = new ConflictError('Duplicate entry')
    expect(error.statusCode).toBe(409)
    expect(error.code).toBe('CONFLICT')
    expect(error.errorType).toBe(ErrorType.CONFLICT)
    expect(error.name).toBe('ConflictError')
  })
})

describe('RateLimitError', () => {
  it('should construct with defaults', () => {
    const error = new RateLimitError()
    expect(error.statusCode).toBe(429)
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(error.errorType).toBe(ErrorType.RATE_LIMIT)
    expect(error.name).toBe('RateLimitError')
  })

  it('should include retryAfter in details', () => {
    const error = new RateLimitError('Too many requests', 60)
    expect(error.retryAfter).toBe(60)
    expect(error.details?.retryAfter).toBe(60)
  })
})

describe('DatabaseError', () => {
  it('should construct with defaults', () => {
    const error = new DatabaseError()
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.errorType).toBe(ErrorType.DATABASE)
    expect(error.name).toBe('DatabaseError')
  })

  it('should accept custom message', () => {
    const error = new DatabaseError('Connection lost')
    expect(error.message).toBe('Connection lost')
  })
})

// ============================================
// ErrorHandler
// ============================================

describe('ErrorHandler.getUserMessage', () => {
  it('should return Turkish message for AuthError', () => {
    const msg = ErrorHandler.getUserMessage(new AuthError())
    expect(msg).toBe('Geçersiz kullanıcı adı veya şifre')
  })

  it('should return Turkish message for AuthorizationError', () => {
    const msg = ErrorHandler.getUserMessage(new AuthorizationError())
    expect(msg).toBe('Bu işlem için yetkiniz yok')
  })

  it('should return Turkish message for ValidationError', () => {
    const msg = ErrorHandler.getUserMessage(new ValidationError('bad', 'f', 'v'))
    expect(msg).toBe('Lütfen girdiğiniz bilgileri kontrol edin')
  })

  it('should return Turkish message for NetworkError', () => {
    const msg = ErrorHandler.getUserMessage(new NetworkError())
    expect(msg).toBe('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin')
  })

  it('should return Turkish message for NotFoundError', () => {
    const msg = ErrorHandler.getUserMessage(new NotFoundError())
    expect(msg).toBe('Sayfa veya kayıt bulunamadı')
  })

  it('should return Turkish message for RateLimitError', () => {
    const msg = ErrorHandler.getUserMessage(new RateLimitError())
    expect(msg).toBe('Çok fazla deneme yaptınız. Lütfen bir süre bekleyin')
  })

  it('should return Turkish message for DatabaseError', () => {
    const msg = ErrorHandler.getUserMessage(new DatabaseError())
    expect(msg).toBe('Veritabanı hatası. Lütfen daha sonra tekrar deneyin')
  })

  it('should return Turkish message for ConflictError', () => {
    const msg = ErrorHandler.getUserMessage(new ConflictError('dup'))
    expect(msg).toBe('Bu kayıt zaten mevcut')
  })

  it('should return unknown error message for plain Error in production', () => {
    const origEnv = process.env['NODE_ENV']
    process.env['NODE_ENV'] = 'production'
    const msg = ErrorHandler.getUserMessage(new Error('internal'))
    expect(msg).toBe('Beklenmeyen bir hata oluştu')
    process.env['NODE_ENV'] = origEnv
  })

  it('should return original message for plain Error in development', () => {
    const origEnv = process.env['NODE_ENV']
    process.env['NODE_ENV'] = 'development'
    const msg = ErrorHandler.getUserMessage(new Error('debug info'))
    expect(msg).toBe('debug info')
    process.env['NODE_ENV'] = origEnv
  })

  it('should return unknown error message for non-Error values', () => {
    const msg = ErrorHandler.getUserMessage('string error')
    expect(msg).toBe('Beklenmeyen bir hata oluştu')
  })
})

describe('ErrorHandler.fromSupabaseError', () => {
  it('should map PGRST116 to NotFoundError', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'not found', code: 'PGRST116' })
    expect(result).toBeInstanceOf(NotFoundError)
    expect(result.statusCode).toBe(404)
  })

  it('should map PGRST301 to NotFoundError', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'not found', code: 'PGRST301' })
    expect(result).toBeInstanceOf(NotFoundError)
  })

  it('should map 23505 to ConflictError', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'duplicate', code: '23505' })
    expect(result).toBeInstanceOf(ConflictError)
    expect(result.statusCode).toBe(409)
  })

  it('should map 23503 to ValidationError', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'fk violation', code: '23503' })
    expect(result).toBeInstanceOf(ValidationError)
    expect(result.statusCode).toBe(400)
  })

  it('should map 42501 to AuthorizationError', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'insufficient', code: '42501' })
    expect(result).toBeInstanceOf(AuthorizationError)
    expect(result.statusCode).toBe(403)
  })

  it('should return generic AppError for unknown codes', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'unknown', code: '99999' })
    expect(result).toBeInstanceOf(AppError)
    expect(result.code).toBe('99999')
  })

  it('should handle missing code', () => {
    const result = ErrorHandler.fromSupabaseError({ message: 'something' })
    expect(result).toBeInstanceOf(AppError)
    expect(result.code).toBe('UNKNOWN_ERROR')
  })
})

describe('ErrorHandler.createError', () => {
  it('should create NetworkError', () => {
    const error = ErrorHandler.createError(ErrorType.NETWORK, 'timeout')
    expect(error).toBeInstanceOf(NetworkError)
  })

  it('should create ValidationError', () => {
    const error = ErrorHandler.createError(ErrorType.VALIDATION, 'bad', { field: 'name', value: 'x' })
    expect(error).toBeInstanceOf(ValidationError)
  })

  it('should create NotFoundError', () => {
    const error = ErrorHandler.createError(ErrorType.NOT_FOUND, 'gone', { resource: 'User', identifier: '1' })
    expect(error).toBeInstanceOf(NotFoundError)
  })

  it('should create AuthorizationError for PERMISSION type', () => {
    const error = ErrorHandler.createError(ErrorType.PERMISSION, 'denied')
    expect(error).toBeInstanceOf(AuthorizationError)
  })

  it('should create AuthError for AUTHENTICATION type', () => {
    const error = ErrorHandler.createError(ErrorType.AUTHENTICATION, 'expired')
    expect(error).toBeInstanceOf(AuthError)
  })

  it('should create DatabaseError', () => {
    const error = ErrorHandler.createError(ErrorType.DATABASE, 'connection lost')
    expect(error).toBeInstanceOf(DatabaseError)
  })

  it('should create ConflictError', () => {
    const error = ErrorHandler.createError(ErrorType.CONFLICT, 'duplicate')
    expect(error).toBeInstanceOf(ConflictError)
  })

  it('should create RateLimitError', () => {
    const error = ErrorHandler.createError(ErrorType.RATE_LIMIT, 'too many', { retryAfter: 30 })
    expect(error).toBeInstanceOf(RateLimitError)
  })

  it('should create generic AppError for UNKNOWN type', () => {
    const error = ErrorHandler.createError(ErrorType.UNKNOWN, 'mystery')
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('UNKNOWN_ERROR')
  })

  it('should create generic AppError for SERVER type', () => {
    const error = ErrorHandler.createError(ErrorType.SERVER, 'crash')
    expect(error).toBeInstanceOf(AppError)
  })
})

describe('ErrorHandler.getErrorType', () => {
  it('should return NETWORK for NetworkError', () => {
    expect(ErrorHandler.getErrorType(new NetworkError())).toBe(ErrorType.NETWORK)
  })

  it('should return VALIDATION for ValidationError', () => {
    expect(ErrorHandler.getErrorType(new ValidationError('x', 'f', 'v'))).toBe(ErrorType.VALIDATION)
  })

  it('should return NOT_FOUND for NotFoundError', () => {
    expect(ErrorHandler.getErrorType(new NotFoundError())).toBe(ErrorType.NOT_FOUND)
  })

  it('should return PERMISSION for AuthorizationError', () => {
    expect(ErrorHandler.getErrorType(new AuthorizationError())).toBe(ErrorType.PERMISSION)
  })

  it('should return AUTHENTICATION for AuthError', () => {
    expect(ErrorHandler.getErrorType(new AuthError())).toBe(ErrorType.AUTHENTICATION)
  })

  it('should return DATABASE for DatabaseError', () => {
    expect(ErrorHandler.getErrorType(new DatabaseError())).toBe(ErrorType.DATABASE)
  })

  it('should return CONFLICT for ConflictError', () => {
    expect(ErrorHandler.getErrorType(new ConflictError('x'))).toBe(ErrorType.CONFLICT)
  })

  it('should return RATE_LIMIT for RateLimitError', () => {
    expect(ErrorHandler.getErrorType(new RateLimitError())).toBe(ErrorType.RATE_LIMIT)
  })

  it('should return UNKNOWN for plain Error', () => {
    expect(ErrorHandler.getErrorType(new Error('x'))).toBe(ErrorType.UNKNOWN)
  })

  it('should return UNKNOWN for non-Error', () => {
    expect(ErrorHandler.getErrorType('string')).toBe(ErrorType.UNKNOWN)
  })
})

describe('ErrorHandler.getSeverity', () => {
  it('should return severity from AppError', () => {
    expect(ErrorHandler.getSeverity(new AuthError())).toBe(ErrorSeverity.HIGH)
    expect(ErrorHandler.getSeverity(new ValidationError('x', 'f', 'v'))).toBe(ErrorSeverity.LOW)
    expect(ErrorHandler.getSeverity(new DatabaseError())).toBe(ErrorSeverity.HIGH)
    expect(ErrorHandler.getSeverity(new NetworkError())).toBe(ErrorSeverity.MEDIUM)
  })

  it('should return MEDIUM for non-AppError', () => {
    expect(ErrorHandler.getSeverity(new Error('x'))).toBe(ErrorSeverity.MEDIUM)
    expect(ErrorHandler.getSeverity('string')).toBe(ErrorSeverity.MEDIUM)
  })
})

describe('ErrorHandler.getDefaultRecoveryActions', () => {
  it('should return reload action for NetworkError', () => {
    const actions = ErrorHandler.getDefaultRecoveryActions(new NetworkError())
    expect(actions.length).toBeGreaterThan(0)
    expect(actions[0].label).toBe('Tekrar Dene')
  })

  it('should return back/home actions for NotFoundError', () => {
    const actions = ErrorHandler.getDefaultRecoveryActions(new NotFoundError())
    expect(actions.length).toBe(2)
    expect(actions[0].label).toBe('Geri Dön')
    expect(actions[1].label).toBe('Ana Sayfaya Dön')
  })

  it('should return login action for AuthError', () => {
    const actions = ErrorHandler.getDefaultRecoveryActions(new AuthError())
    expect(actions.length).toBeGreaterThan(0)
    expect(actions[0].label).toBe('Tekrar Giriş Yap')
  })

  it('should return home action as fallback', () => {
    const actions = ErrorHandler.getDefaultRecoveryActions(new Error('generic'))
    expect(actions.length).toBe(1)
    expect(actions[0].label).toBe('Ana Sayfaya Dön')
  })
})

// ============================================
// sanitizeError
// ============================================

describe('sanitizeError', () => {
  it('should expose ValidationError message and code', () => {
    const error = new ValidationError('Email geçersiz', 'email', 'bad@')
    const result = sanitizeError(error)
    expect(result.error).toBe('Email geçersiz')
    expect(result.code).toBe('VALIDATION_ERROR')
  })

  it('should expose ValidationError details in development', () => {
    const origEnv = process.env['NODE_ENV']
    process.env['NODE_ENV'] = 'development'
    const error = new ValidationError('Bad', 'field', 'value')
    const result = sanitizeError(error)
    expect(result.details).toBeDefined()
    process.env['NODE_ENV'] = origEnv
  })

  it('should hide ValidationError details in production', () => {
    const origEnv = process.env['NODE_ENV']
    process.env['NODE_ENV'] = 'production'
    const error = new ValidationError('Bad', 'field', 'value')
    const result = sanitizeError(error)
    expect(result.details).toBeUndefined()
    process.env['NODE_ENV'] = origEnv
  })

  it('should return Turkish user message for AppError', () => {
    const error = new AuthError()
    const result = sanitizeError(error)
    expect(result.error).toBe('Geçersiz kullanıcı adı veya şifre')
    expect(result.code).toBe('AUTH_FAILED')
  })

  it('should handle ZodError-like errors', () => {
    const zodLike = new Error('validation failed')
    zodLike.name = 'ZodError'
    const result = sanitizeError(zodLike)
    expect(result.error).toBe('Geçersiz veri formatı')
    expect(result.code).toBe('VALIDATION_ERROR')
  })

  it('should return generic message for unknown errors', () => {
    const result = sanitizeError('some string error')
    expect(result.error).toBe('İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
    expect(result.code).toBe('INTERNAL_ERROR')
  })

  it('should not expose stack traces for generic errors', () => {
    const error = new Error('secret internal detail')
    const result = sanitizeError(error)
    expect(result.error).not.toContain('secret')
    expect(result.code).toBe('INTERNAL_ERROR')
  })
})

// ============================================
// handleValidationError
// ============================================

describe('handleValidationError', () => {
  it('should return 400 response with error message', async () => {
    const response = handleValidationError('Ad gerekli')
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Ad gerekli')
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('should include fields when provided', async () => {
    const response = handleValidationError('Eksik alanlar', ['first_name', 'last_name'])
    const body = await response.json()
    expect(body.fields).toEqual(['first_name', 'last_name'])
  })

  it('should not include fields when not provided', async () => {
    const response = handleValidationError('Hata')
    const body = await response.json()
    expect(body.fields).toBeUndefined()
  })
})

// ============================================
// ErrorLogger
// ============================================

describe('ErrorLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should suppress AbortError', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const abortError = new Error('signal is aborted')
    abortError.name = 'AbortError'
    ErrorLogger.error(abortError)
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('should suppress errors with abort message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ErrorLogger.error(new Error('The signal is aborted without reason'))
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('should log non-abort errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ErrorLogger.error(new Error('real error'))
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should log warnings', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    ErrorLogger.warn('test warning')
    expect(consoleSpy).toHaveBeenCalled()
  })
})
