'use client'

import { useState, useEffect } from 'react'

/**
 * MediaQuery hook - CSS media query'lerini React component'lerinde kullanma
 * SSR güvenli ve hydration mismatch önleyici
 */
export function useMediaQuery(query: string): boolean {
  const [isMounted, setIsMounted] = useState(false)
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  if (!isMounted) return false
  return matches
}

/**
 * Mobil tespiti (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Tablet tespiti (768px - 1024px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

/**
 * Desktop tespiti (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * Breakpoint tipi döndürür
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useBreakpoint(): Breakpoint {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}

/**
 * Portrait/Landscape tespiti
 */
export function useOrientation(): 'portrait' | 'landscape' {
  return useMediaQuery('(orientation: portrait)') ? 'portrait' : 'landscape'
}

/**
 * Touch device tespiti
 */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}
