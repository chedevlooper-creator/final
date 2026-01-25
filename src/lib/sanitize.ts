/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize and validate user input to prevent
 * injection attacks and ensure data integrity
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * while preserving valid content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags except for allowed ones
 */
export function sanitizeHTML(input: string, allowedTags: string[] = []): string {
  if (typeof input !== 'string') {
    return ''
  }

  // If no tags are allowed, strip all HTML
  if (allowedTags.length === 0) {
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
  }

  // Basic tag filtering (for production, use a library like DOMPurify)
  const tagRegex = new RegExp(`<(?!\/?(${allowedTags.join('|')})\\s*\/?>)[^>]+>`, 'gi')
  return input.replace(tagRegex, '')
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  const sanitized = sanitizeString(email).toLowerCase()
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(sanitized)) {
    return null
  }
  
  return sanitized
}

/**
 * Validate and sanitize phone number (Turkish format)
 */
export function sanitizePhone(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Turkish phone numbers: 10 digits starting with 5
  // Or 11 digits starting with 0
  if (digits.length === 10 && digits.startsWith('5')) {
    return digits
  }
  
  if (digits.length === 11 && digits.startsWith('05')) {
    return digits.substring(1) // Remove leading 0
  }
  
  return null
}

/**
 * Sanitize Turkish ID number (TC Kimlik No)
 */
export function sanitizeTCKN(tckn: string): string | null {
  const digits = tckn.replace(/\D/g, '')
  
  // TC Kimlik must be exactly 11 digits
  if (digits.length !== 11) {
    return null
  }
  
  // First digit cannot be 0
  if (digits[0] === '0') {
    return null
  }
  
  return digits
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number,
  options: { min?: number; max?: number; decimals?: number } = {}
): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input
  
  if (isNaN(num) || !isFinite(num)) {
    return null
  }
  
  // Apply min/max constraints
  let result = num
  if (options.min !== undefined && result < options.min) {
    result = options.min
  }
  if (options.max !== undefined && result > options.max) {
    result = options.max
  }
  
  // Apply decimal precision
  if (options.decimals !== undefined) {
    result = parseFloat(result.toFixed(options.decimals))
  }
  
  return result
}

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export function sanitizeURL(url: string, allowedDomains: string[] = []): string | null {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    // Check allowed domains if specified
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      )
      
      if (!isAllowed) {
        return null
      }
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[] // MIME types
    allowedExtensions?: string[]
  } = {}
): { valid: boolean; error?: string } {
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`
    }
  }
  
  // Check MIME type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    }
  }
  
  // Check extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`
      }
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(obj: T): T {
  const dangerous = ['__proto__', 'constructor', 'prototype']
  
  const sanitized = {} as T
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !dangerous.includes(key)) {
      sanitized[key] = obj[key]
    }
  }
  
  return sanitized
}

/**
 * Escape special characters for SQL LIKE queries
 */
export function escapeSQLLike(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeString(query)
    .replace(/[<>'"]/g, '') // Remove quotes and brackets
    .substring(0, 100) // Limit length
}
