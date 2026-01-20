/**
 * Performance Monitoring System
 * 
 * Web Vitals ve custom metrics tracking
 */

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
}

export interface WebVitals {
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

/**
 * Web Vitals rating thresholds
 */
const RATINGS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
}

/**
 * Get rating for a metric
 */
function getRating(name: keyof typeof RATINGS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = RATINGS[name]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Report performance metric
 */
export function reportMetric(metric: PerformanceMetric) {
  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(0)}ms [${metric.rating}]`)
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service (Vercel, Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: metric.value,
        event_label: metric.rating,
        custom_map: { metric_rating: metric.rating },
      })
    }
  }
}

/**
 * Measure Web Vitals
 */
export function measureWebVitals() {
  if (typeof window === 'undefined') return
  
  // FCP - First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime
            reportMetric({
              name: 'FCP',
              value,
              rating: getRating('FCP', value),
              timestamp: Date.now(),
              url: window.location.href,
            })
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.warn('PerformanceObserver not supported for paint', e)
    }
  }
  
  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          const value = lastEntry.startTime
          reportMetric({
            name: 'LCP',
            value,
            rating: getRating('LCP', value),
            timestamp: Date.now(),
            url: window.location.href,
          })
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP measurement failed', e)
    }
  }
  
  // FID - First Input Delay (using PerformanceEventTiming)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (entry.processingStart && entry.startTime) {
            const value = entry.processingStart - entry.startTime
            reportMetric({
              name: 'FID',
              value,
              rating: getRating('FID', value),
              timestamp: Date.now(),
              url: window.location.href,
            })
          }
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID measurement failed', e)
    }
  }
  
  // CLS - Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            reportMetric({
              name: 'CLS',
              value: clsValue,
              rating: getRating('CLS', clsValue),
              timestamp: Date.now(),
              url: window.location.href,
            })
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS measurement failed', e)
    }
  }
  
  // TTFB - Time to First Byte
  if (performance.getEntriesByType) {
    const navigationEntries = performance.getEntriesByType('navigation') as any[]
    if (navigationEntries.length > 0) {
      const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart
      reportMetric({
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
        timestamp: Date.now(),
        url: window.location.href,
      })
    }
  }
}

/**
 * Track page load time
 */
export function trackPageLoad(pageName: string) {
  if (typeof window === 'undefined') return
  
  const timing = performance.getEntriesByType('navigation')[0] as any
  
  if (!timing) return
  
  const metrics = {
    page: pageName,
    loadTime: timing.loadEventEnd - timing.fetchStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.fetchStart,
    firstPaint: timing.responseStart - timing.fetchStart,
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    ttfb: timing.responseStart - timing.requestStart,
    download: timing.responseEnd - timing.responseStart,
  }
  
  reportMetric({
    name: 'PageLoad',
    value: metrics.loadTime,
    rating: getRating('FCP', metrics.loadTime),
    timestamp: Date.now(),
    url: window.location.href,
  })
  
  return metrics
}

/**
 * Custom performance marker
 */
export function markPerformance(name: string) {
  if (typeof window === 'undefined') return
  performance.mark(name)
}

/**
 * Measure between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window === 'undefined') return
  
  try {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name)[0]
    
    if (measure) {
      reportMetric({
        name,
        value: measure.duration,
        rating: getRating('FCP', measure.duration),
        timestamp: Date.now(),
        url: window.location.href,
      })
    }
    
    return measure?.duration
  } catch (e) {
    console.warn('Performance measure failed', e)
    return null
  }
}

/**
 * API request timing wrapper
 */
export async function timedRequest<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    reportMetric({
      name: `API_${name}`,
      value: duration,
      rating: duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now(),
      url: window.location.href,
    })
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    reportMetric({
      name: `API_${name}_ERROR`,
      value: duration,
      rating: 'poor',
      timestamp: Date.now(),
      url: window.location.href,
    })
    throw error
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  navigation: string
  resource: number
  timing: Record<string, number>
} {
  if (typeof window === 'undefined') {
    return { navigation: '', resource: 0, timing: {} }
  }
  
  const navigation = performance.getEntriesByType('navigation')[0] as any
  const resources = performance.getEntriesByType('resource')
  
  return {
    navigation: navigation?.type || 'unknown',
    resource: resources.length,
    timing: {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      firstPaint: navigation?.responseStart - navigation?.fetchStart || 0,
    },
  }
}

/**
 * Resource timing summary
 */
export function getResourceTiming() {
  if (typeof window === 'undefined') return []
  
  const resources = performance.getEntriesByType('resource') as any[]
  
  return resources.map((r) => ({
    name: r.name,
    type: r.initiatorType,
    duration: r.duration,
    size: r.transferSize,
    decodedBodySize: r.decodedBodySize,
  }))
}
