/**
 * Optimized Image Component
 * 
 * This component wraps Next.js Image with additional optimizations
 * including lazy loading, blur placeholder, and proper sizing
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 ${className}`}
        style={{ width, height }}
      >
        <span className="text-slate-400 text-sm">Yüklenemedi</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${isLoading ? 'animate-pulse bg-slate-100' : ''} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Profile Picture Component
 * Optimized for user avatars with circular crop
 */
export function ProfilePicture({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      sizes={`${size}px`}
      quality={90}
    />
  )
}

/**
 * Logo Component
 * Optimized for branding images
 */
export function Logo({
  src,
  alt,
  width = 120,
  height = 40,
  className,
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={true} // Logos should load immediately
      quality={95}
    />
  )
}
