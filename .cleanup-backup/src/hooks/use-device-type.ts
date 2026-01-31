'use client'

import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface UseDeviceTypeReturn {
  deviceType: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

const BREAKPOINTS = {
  mobile: 768,   // md breakpoint
  tablet: 1024,  // lg breakpoint
}

/**
 * Cihaz türünü algılayan hook
 * SSR güvenli - hydration hatası oluşturmaz
 */
export function useDeviceType(): UseDeviceTypeReturn {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(768)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setWidth(w)
      setHeight(h)
      
      if (w < BREAKPOINTS.mobile) {
        setDeviceType('mobile')
      } else if (w < BREAKPOINTS.tablet) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // SSR için varsayılan değerler
  if (!mounted) {
    return {
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1024,
      height: 768,
    }
  }

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    width,
    height,
  }
}
