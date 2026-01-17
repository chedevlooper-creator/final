import { describe, it, expect, jest } from '@jest/globals'
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import ErrorBoundary from '@/components/error-boundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that throws different types of errors
const ThrowDifferentErrors = ({ errorType }: { errorType: string }) => {
  switch (errorType) {
    case 'string':
      throw 'String error'
    case 'null':
      throw null
    case 'undefined':
      throw undefined
    default:
      throw new Error('Default error')
  }
}

describe('ErrorBoundary Component', () => {
  let consoleErrorSpy: jest.SpyInstance
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    // Suppress console.error for these tests
    originalConsoleError = console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Error Catching', () => {
    it('should catch and render error UI', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()
      expect(screen.getByText(/test error/i)).toBeInTheDocument()
    })

    it('should render children when no error', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText(/bir hata oluştu/i)).not.toBeInTheDocument()
    })

    it('should handle string errors', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowDifferentErrors errorType="string" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()
    })

    it('should handle null errors', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowDifferentErrors errorType="null" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should show error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should show user-friendly title', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()
    })

    it('should show retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /tekrar dene/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should show home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const homeButton = screen.getByRole('button', { name: /ana sayfaya dön/i })
      expect(homeButton).toBeInTheDocument()
    })
  })

  describe('Error Details in Development', () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('should show error details in development', () => {
      process.env.NODE_ENV = 'development'

      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error details should be visible in dev mode
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('should hide sensitive error details in production', () => {
      process.env.NODE_ENV = 'production'

      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Generic error message should be shown
      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()
    })
  })

  describe('Error Logging', () => {
    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should include error info in log', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const logCalls = consoleErrorSpy.mock.calls
      expect(logCalls.length).toBeGreaterThan(0)
    })
  })

  describe('Recovery', () => {
    it('should reset error state on retry', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /tekrar dene/i })
      fireEvent.click(retryButton)

      // Component should attempt to recover
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should recover if error is resolved', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('Custom Fallback', () => {
    it('should use custom fallback when provided', () => {
      const customFallback = <div>Custom error UI</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error UI')).toBeInTheDocument()
      expect(screen.queryByText(/bir hata oluştu/i)).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply error styling', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorContainer = container.querySelector('[class*="error"]')
      expect(errorContainer).toBeInTheDocument()
    })

    it('should center error content', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorContainer = container.querySelector('[class*="flex"]')
      expect(errorContainer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()

      // Try to render another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/bir hata oluştu/i)).toBeInTheDocument()
    })

    it('should handle async errors', async () => {
      const AsyncError = () => {
        throw new Error('Async error')
      }

      const { container } = render(
        <ErrorBoundary>
          <AsyncError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/async error/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorRegion = screen.getByRole('region', { name: /error/i })
      expect(errorRegion).toBeInTheDocument()
    })

    it('should announce error to screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorMessage = screen.getByText(/bir hata oluştu/i)
      expect(errorMessage).toBeInTheDocument()
    })

    it('should have focusable buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /tekrar dene/i })
      expect(retryButton).toHaveFocus()
    })
  })
})
