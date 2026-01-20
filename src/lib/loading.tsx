/**
 * Loading States System
 *
 * Comprehensive loading state management for Aid Management Panel
 * Provides skeleton loaders, spinner components, and loading utilities
 *
 * @version 1.0.0
 * @since 2026-01-18
 */

'use client'

import React from 'react'

/**
 * Loading Sizes
 */
export enum LoadingSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * Loading Variants
 */
export enum LoadingVariant {
  SPINNER = 'spinner',
  DOTS = 'dots',
  PULSE = 'pulse',
  SKELETON = 'skeleton',
  PROGRESS = 'progress',
}

/**
 * Loading Props
 */
export interface LoadingProps {
  size?: LoadingSize
  variant?: LoadingVariant
  color?: string
  text?: string
  fullScreen?: boolean
  progress?: number // 0-100
}

/**
 * Size mappings
 */
const sizeClasses = {
  [LoadingSize.SMALL]: {
    spinner: 'w-4 h-4',
    dots: 'w-1 h-1',
    pulse: 'w-8 h-8',
  },
  [LoadingSize.MEDIUM]: {
    spinner: 'w-8 h-8',
    dots: 'w-2 h-2',
    pulse: 'w-12 h-12',
  },
  [LoadingSize.LARGE]: {
    spinner: 'w-12 h-12',
    dots: 'w-3 h-3',
    pulse: 'w-16 h-16',
  },
}

/**
 * Spinner Component
 */
export function Spinner({ size = LoadingSize.MEDIUM, color = 'text-blue-600' }: LoadingProps) {
  const sizeClass = sizeClasses[size].spinner

  return (
    <div className={`${sizeClass} ${color} animate-spin`} role="status">
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Dots Component
 */
export function Dots({ size = LoadingSize.MEDIUM, color = 'bg-blue-600' }: LoadingProps) {
  const sizeClass = sizeClasses[size].dots

  return (
    <div className="flex gap-2" role="status">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClass} ${color} rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Pulse Component
 */
export function Pulse({ size = LoadingSize.MEDIUM, color = 'bg-blue-600' }: LoadingProps) {
  const sizeClass = sizeClasses[size].pulse

  return (
    <div className={`${sizeClass} ${color} rounded-full animate-pulse`} role="status">
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Progress Bar Component
 */
export function ProgressBar({ progress = 0, text }: LoadingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full" role="status" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
      {text && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{text}</span>
          <span className="text-sm font-medium text-gray-700">%{Math.round(clampedProgress)}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Main Loading Component
 */
export function Loading({
  size = LoadingSize.MEDIUM,
  variant = LoadingVariant.SPINNER,
  color = 'text-blue-600',
  text,
  fullScreen = false,
  progress,
}: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {variant === LoadingVariant.SPINNER && <Spinner size={size} color={color} />}
      {variant === LoadingVariant.DOTS && <Dots size={size} color={color.replace('text-', 'bg-')} />}
      {variant === LoadingVariant.PULSE && <Pulse size={size} color={color.replace('text-', 'bg-')} />}
      {variant === LoadingVariant.PROGRESS && <ProgressBar progress={progress} text={text} />}
      
      {text && variant !== LoadingVariant.PROGRESS && (
        <p className="text-sm font-medium text-gray-700">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

/**
 * Full Screen Loading Wrapper
 */
export function FullScreenLoading({ ...props }: LoadingProps) {
  return <Loading {...props} fullScreen />
}

/**
 * Skeleton Loading Components
 */

/**
 * Skeleton Text
 */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} role="status">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{
            width: index === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Skeleton Card
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`} role="status">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Skeleton Table
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full" role="status">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-3 bg-gray-100 rounded animate-pulse flex-1"
                style={{
                  animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Skeleton Avatar
 */
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} role="status">
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Skeleton Button
 */
export function SkeletonButton({ width = '100px' }: { width?: string }) {
  return (
    <div className="h-10 bg-gray-200 rounded animate-pulse" style={{ width }} role="status">
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * Skeleton Form
 */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4" role="status">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

/**
 * WithLoading HOC
 */
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loading: boolean,
  LoadingComponent?: React.ComponentType
): React.ComponentType<P> {
  return function LoadingWrapper(props: P) {
    if (loading) {
      return LoadingComponent ? <LoadingComponent /> : <FullScreenLoading />
    }
    return <Component {...props} />
  }
}

/**
 * useLoading Hook
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [progress, setProgress] = React.useState(0)

  const startLoading = React.useCallback(() => {
    setIsLoading(true)
    setProgress(0)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
    setProgress(100)
  }, [])

  const updateProgress = React.useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)))
  }, [])

  return {
    isLoading,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  }
}

/**
 * LoadingProvider for global loading state
 */
interface LoadingContextValue {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const LoadingContext = React.createContext<LoadingContextValue | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
      {isLoading && <FullScreenLoading text="Lütfen bekleyin..." />}
    </LoadingContext.Provider>
  )
}

export function useLoadingContext() {
  const context = React.useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoadingContext must be used within LoadingProvider')
  }
  return context
}
