/**
 * Breakpoint sabitleri ve yardımcı fonksiyonlar
 * Tailwind config ile senkronize tutulmalı
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export const DEVICE_TYPES = {
  mobile: { max: BREAKPOINTS.md - 1 },
  tablet: { min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 },
  desktop: { min: BREAKPOINTS.lg },
} as const

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Ekran genişliğine göre cihaz tipini döndürür
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile'
  if (width < BREAKPOINTS.lg) return 'tablet'
  return 'desktop'
}

/**
 * Belirli bir breakpoint'i kontrol eder
 */
export function isBreakpoint(
  width: number, 
  breakpoint: Breakpoint, 
  direction: 'min' | 'max' = 'min'
): boolean {
  const value = BREAKPOINTS[breakpoint]
  return direction === 'min' ? width >= value : width < value
}

/**
 * Media query string'i oluşturur
 */
export function getMediaQuery(breakpoint: Breakpoint, direction: 'min' | 'max' = 'min'): string {
  const value = BREAKPOINTS[breakpoint]
  return `(${direction}-width: ${value}px)`
}

/**
 * Responsive design token'ları
 */
export const responsiveTokens = {
  container: {
    maxWidth: '1400px',
    padding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
  },
  
  sidebar: {
    width: {
      desktop: '280px',
      collapsed: '72px',
    },
  },
  
  touch: {
    minSize: 44,
    spacing: 8,
  },
  
  grid: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4,
    },
    gap: {
      mobile: '16px',
      tablet: '20px',
      desktop: '24px',
    },
  },
} as const
