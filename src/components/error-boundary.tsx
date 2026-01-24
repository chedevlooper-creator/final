'use client'

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs them, and displays a fallback UI instead of the crashed component tree.
 *
 * @version 2.0.0 - Enhanced Error Handling
 * @since 2026-01-18
 */

import React from 'react'
import { AppError, ErrorHandler, ErrorSeverity } from '@/lib/errors'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const appError = error instanceof AppError ? error : null
  const userMessage = appError?.getUserMessage() || ErrorHandler.handle(error)
  const recoveryActions = appError?.getRecoveryActions() || []
  const severity = appError?.severity || ErrorSeverity.MEDIUM

  // Severity colors - Using design system semantic colors
  const severityColors = {
    [ErrorSeverity.LOW]: 'bg-warning/10 border-warning/20 text-warning',
    [ErrorSeverity.MEDIUM]: 'bg-warning/20 border-warning/30 text-warning',
    [ErrorSeverity.HIGH]: 'bg-danger/10 border-danger/20 text-danger',
    [ErrorSeverity.CRITICAL]: 'bg-danger/20 border-danger/30 text-danger',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className={`max-w-lg w-full rounded-lg border-2 p-6 ${severityColors[severity]}`}>
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-current"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-bold text-center mb-2">
          Bir Hata Oluştu
        </h2>
        <p className="text-center mb-6">{userMessage}</p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mb-4 p-3 bg-white bg-opacity-50 rounded border border-current border-opacity-20">
            <summary className="cursor-pointer font-semibold mb-2">
              Teknik Detaylar
            </summary>
            <div className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </div>
          </details>
        )}

        {/* Recovery Actions */}
        <div className="space-y-2">
          {recoveryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="w-full px-4 py-2 bg-white bg-opacity-50 hover:bg-opacity-75 border border-current border-opacity-30 rounded font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {action.icon && <span className="text-lg">{action.icon}</span>}
              {action.label}
            </button>
          ))}

          {/* Default reset action */}
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-current text-white hover:opacity-90 rounded font-semibold transition-opacity"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Error Boundary Class Component
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    ErrorHandler.handle(error, {
      componentStack: errorInfo.componentStack,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null })
  }

  override render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

/**
 * Hook for programmatically handling errors
 */
export function useErrorHandler(): (error: Error) => void {
  return React.useCallback((error: Error) => {
    throw error
  }, [])
}

/**
 * withErrorBoundary HOC
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
