import posthog from 'posthog-js'

export function registerPostHog() {
  if (typeof window !== 'undefined' && process.env['NEXT_PUBLIC_POSTHOG_KEY']) {
    posthog.init(process.env['NEXT_PUBLIC_POSTHOG_KEY'], {
      api_host: process.env['NEXT_PUBLIC_POSTHOG_HOST'] || 'https://us.i.posthog.com',
      loaded: (ph) => {
        console.log('✅ PostHog initialized successfully:', ph)
        // Verification event
        ph.capture('posthog_installation_verified', {
          method: 'instrumentation-client',
          framework: 'nextjs',
          version: '16.1.3'
        })
      },
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      persistence: 'localStorage',
      person_profiles: 'identified_only',
      defaults: '2025-11-30'
    })
  }
}

export default posthog
