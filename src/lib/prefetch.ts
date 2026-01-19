/**
 * Parallel Query Prefetching for Instant Page Transitions
 * Prefetch data for potential next pages during idle time
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Prefetch dashboard data in background
 */
export async function prefetchDashboardData(queryClient: QueryClient) {
  // Prefetch in parallel for faster page loads
  Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['donations'],
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: ['needy-persons'],
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['aids'],
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['volunteers'],
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['orphans'],
      staleTime: 5 * 60 * 1000,
    }),
  ]).catch(console.error)
}

/**
 * Prefetch specific page data
 */
export async function prefetchPageData(
  queryClient: QueryClient,
  page: string
) {
  const prefetchMap: Record<string, string[]> = {
    '/dashboard/donations': ['donations'],
    '/dashboard/needy': ['needy-persons'],
    '/dashboard/aids': ['aids'],
    '/dashboard/volunteers': ['volunteers'],
    '/dashboard/orphans': ['orphans'],
    '/dashboard/reports': ['donations', 'aids', 'needy-persons'],
    '/dashboard/dashboard': ['donations', 'aids', 'needy-persons', 'volunteers'],
  }

  const queries = prefetchMap[page] || []
  
  await Promise.all(
    queries.map(queryKey =>
      queryClient.prefetchQuery({
        queryKey,
        staleTime: 5 * 60 * 1000,
      })
    )
  ).catch(console.error)
}

/**
 * Trigger prefetch on user idle
 */
export function setupIdlePrefetch(queryClient: QueryClient) {
  if (typeof window === 'undefined') return

  let timeoutId: NodeJS.Timeout

  const resetIdleTimer = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      // User has been idle for 2 seconds, prefetch data
      prefetchDashboardData(queryClient)
    }, 2000)
  }

  // Reset on user activity
  window.addEventListener('mousemove', resetIdleTimer)
  window.addEventListener('keydown', resetIdleTimer)
  window.addEventListener('scroll', resetIdleTimer)

  // Initial check
  resetIdleTimer()

  return () => {
    clearTimeout(timeoutId)
    window.removeEventListener('mousemove', resetIdleTimer)
    window.removeEventListener('keydown', resetIdleTimer)
    window.removeEventListener('scroll', resetIdleTimer)
  }
}

/**
 * Intersection Observer for viewport-based prefetch
 */
export function setupViewportPrefetch(queryClient: QueryClient) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement
          const href = link.getAttribute('href')
          if (href) {
            prefetchPageData(queryClient, href)
          }
          observer.unobserve(link)
        }
      })
    },
    { rootMargin: '100px' } // Start prefetching 100px before viewport
  )

  // Observe all navigation links
  document.querySelectorAll('a[href^="/dashboard"]').forEach((link) => {
    observer.observe(link)
  })

  return () => observer.disconnect()
}
