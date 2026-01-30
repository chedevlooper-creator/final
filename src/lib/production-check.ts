/**
 * Production Environment Validation
 * 
 * This module validates that all required configurations are present
 * before the application starts in production mode.
 */

import { env } from './env'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates production environment configuration
 */
export function validateProductionEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }

  // Validate Supabase URL format
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL)
      if (!url.hostname.includes('supabase.co')) {
        warnings.push('Supabase URL does not appear to be a valid Supabase URL')
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    }
  }

  // Validate JWT format (basic check)
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const parts = env.NEXT_PUBLIC_SUPABASE_ANON_KEY.split('.')
    if (parts.length !== 3) {
      warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Checks if running in production
 */
export function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production'
}

/**
 * Asserts that the environment is valid for production
 * Throws an error if validation fails
 */
export function assertValidProductionEnvironment(): void {
  if (!isProduction()) {
    return
  }

  const result = validateProductionEnvironment()
  
  if (!result.valid) {
    console.error('[PRODUCTION ERROR] Environment validation failed:')
    result.errors.forEach(error => console.error(`  - ${error}`))
    throw new Error(`Production environment validation failed: ${result.errors.join(', ')}`)
  }

  if (result.warnings.length > 0) {
    console.warn('[PRODUCTION WARNING] Environment validation warnings:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
}
