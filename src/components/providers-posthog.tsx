'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize PostHog on mount
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    const posthogKey = process.env['NEXT_PUBLIC_POSTHOG_KEY']

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: process.env['NEXT_PUBLIC_POSTHOG_HOST'] || 'https://us.i.posthog.com',
        loaded: (ph) => {
          console.log('PostHog initialized:', ph)
        },
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage',
        person_profiles: 'identified_only'
      })
    }
  }

  // Track page views
  if (typeof window !== 'undefined') {
    const url = pathname + searchParams.toString()
    posthog.capture('$pageview', { $current_url: url })
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
