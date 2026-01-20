'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect } from 'react'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Console'da göster
    console.log('[Web Vitals]', metric)
    
    // Analytics servisine gönder
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      })
    }
    
    // Sentry'ye gönder
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.addBreadcrumb({
        category: 'web-vitals',
        message: `${metric.name}: ${metric.value}`,
        level: 'info',
      })
    }
  })
  
  return null
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Sayfa yüklenme süresini izle
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (perfData) {
      const metrics = {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      }
      
      console.log('[Performance Metrics]', metrics)
      
      // Yavaş yükleme uyarısı
      if (metrics.totalTime > 3000) {
        console.warn('[Performance] Slow page load detected:', metrics.totalTime)
      }
    }
    
    // Memory usage izleme
    if ('memory' in performance) {
      const mem = (performance as any).memory
      console.log('[Memory Usage]', {
        usedJSHeapSize: Math.round(mem.usedJSHeapSize / 1048576) + ' MB',
        totalJSHeapSize: Math.round(mem.totalJSHeapSize / 1048576) + ' MB',
        jsHeapSizeLimit: Math.round(mem.jsHeapSizeLimit / 1048576) + ' MB',
      })
    }
  }, [])
  
  return null
}
