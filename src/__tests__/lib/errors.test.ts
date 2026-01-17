import { describe, it, expect } from '@jest/globals'
import {
  AuthError,
  ValidationError,
  NetworkError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  PermissionError,
  ErrorLogger,
  ErrorHandler,
} from '@/lib/errors'

describe('Error Classes', () => {
  describe('AuthError', () => {
    it('should create auth error with message', () => {
      const error = new AuthError('Invalid credentials')
      expect(error.message).toBe('Invalid credentials')
      expect(error.name).toBe('AuthError')
      expect(error.statusCode).toBe(401)
    })

    it('should create auth error with code', () => {
      const error = new AuthError('Session expired', 'SESSION_EXPIRED')
      expect(error.code).toBe('SESSION_EXPIRED')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid email')
      expect(error.message).toBe('Invalid email')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ValidationError')
    })

    it('should handle field validation errors', () => {
      const fields = { email: 'Invalid format', age: 'Must be number' }
      const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', fields)
      expect(error.fields).toEqual(fields)
    })
  })

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Connection failed')
      expect(error.message).toBe('Connection failed')
      expect(error.statusCode).toBe(503)
      expect(error.retryable).toBe(true)
    })
  })

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('Query failed')
      expect(error.message).toBe('Query failed')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('DatabaseError')
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('User not found')
      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
      expect(error.name).toBe('NotFoundError')
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Email already exists')
      expect(error.message).toBe('Email already exists')
      expect(error.statusCode).toBe(409)
    })
  })

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError('Too many requests', 100, 60)
      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
      expect(error.retryAfter).toBe(60)
      expect(error.limit).toBe(100)
    })
  })

  describe('PermissionError', () => {
    it('should create permission error', () => {
      const error = new PermissionError('Access denied')
      expect(error.message).toBe('Access denied')
      expect(error.statusCode).toBe(403)
    })
  })
})

describe('ErrorLogger', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should log error to console', () => {
    const error = new AuthError('Test error')
    ErrorLogger.log(error)

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should mask sensitive data in logs', () => {
    const error = new AuthError('Invalid credentials')
    error.context = {
      email: 'user@example.com',
      password: 'secret123',
      token: 'abc123xyz',
    }

    ErrorLogger.log(error)

    const loggedData = consoleSpy.mock.calls[0][1]
    expect(loggedData.password).toBe('[MASKED]')
    expect(loggedData.token).toBe('[MASKED]')
    expect(loggedData.email).toBe('user@example.com')
  })

  it('should create structured log entry', () => {
    const error = new ValidationError('Invalid input')
    const logEntry = ErrorLogger.createLogEntry(error)

    expect(logEntry).toHaveProperty('timestamp')
    expect(logEntry).toHaveProperty('level', 'ERROR')
    expect(logEntry).toHaveProperty('message', 'Invalid input')
    expect(logEntry).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('ErrorHandler', () => {
  it('should handle AuthError correctly', () => {
    const error = new AuthError('Unauthorized')
    const handled = ErrorHandler.handle(error)

    expect(handled.userMessage).toBe('Oturum açmanız gerekiyor')
    expect(handled.statusCode).toBe(401)
  })

  it('should handle ValidationError correctly', () => {
    const error = new ValidationError('Invalid input')
    const handled = ErrorHandler.handle(error)

    expect(handled.userMessage).toBe('Girdiğiniz bilgiler geçersiz')
    expect(handled.statusCode).toBe(400)
  })

  it('should handle NetworkError correctly', () => {
    const error = new NetworkError('Connection failed')
    const handled = ErrorHandler.handle(error)

    expect(handled.userMessage).toBe('İnternet bağlantınızı kontrol edin')
    expect(handled.statusCode).toBe(503)
    expect(handled.retryable).toBe(true)
  })

  it('should handle generic Error', () => {
    const error = new Error('Unknown error')
    const handled = ErrorHandler.handle(error)

    expect(handled.userMessage).toBe('Bir hata oluştu')
    expect(handled.statusCode).toBe(500)
  })

  it('should handle errors with context', () => {
    const error = new ValidationError('Invalid email')
    error.context = { field: 'email', value: 'invalid' }
    const handled = ErrorHandler.handle(error)

    expect(handled.context).toEqual({ field: 'email', value: 'invalid' })
  })

  it('should detect retryable errors', () => {
    const networkError = new NetworkError('Timeout')
    const handledNetwork = ErrorHandler.handle(networkError)

    expect(handledNetwork.retryable).toBe(true)

    const authError = new AuthError('Invalid token')
    const handledAuth = ErrorHandler.handle(authError)

    expect(handledAuth.retryable).toBe(false)
  })

  it('should provide user-friendly messages for specific errors', () => {
    const notFoundError = new NotFoundError('Person not found')
    const handled = ErrorHandler.handle(notFoundError)

    expect(handled.userMessage).toBe('Kayıt bulunamadı')
  })

  it('should include error code in response', () => {
    const error = new RateLimitError('Too many requests', 100, 60)
    const handled = ErrorHandler.handle(error)

    expect(handled.code).toBe('RATE_LIMIT_ERROR')
    expect(handled.retryAfter).toBe(60)
  })
})
