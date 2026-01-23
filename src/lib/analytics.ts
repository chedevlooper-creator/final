import posthog from 'posthog-js'

/**
 * PostHog Analytics Helper Functions
 * Use these functions to track events throughout your application
 */

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return

  try {
    posthog.capture(eventName, properties)
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Event tracked: ${eventName}`, properties)
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('PostHog tracking error:', error)
    }
  }
}

export function trackPageView(
  page: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return

  posthog.capture('$pageview', {
    $current_url: page,
    ...properties
  })
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return

  posthog.identify(userId, properties)
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`👤 User identified: ${userId}`, properties)
  }
}

export function resetUser() {
  if (typeof window === 'undefined') return

  posthog.reset()
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 User reset')
  }
}

export function trackButtonClick(
  buttonName: string,
  properties?: Record<string, unknown>
) {
  trackEvent('button_clicked', {
    button_name: buttonName,
    ...properties
  })
}

export function trackFormSubmit(
  formName: string,
  properties?: Record<string, unknown>
) {
  trackEvent('form_submitted', {
    form_name: formName,
    ...properties
  })
}

export function trackApiCall(
  apiName: string,
  properties?: Record<string, unknown>
) {
  trackEvent('api_called', {
    api_name: apiName,
    ...properties
  })
}

export function trackNavigation(
  from: string,
  to: string
) {
  trackEvent('navigation', {
    from,
    to,
    timestamp: new Date().toISOString()
  })
}

export function trackError(
  errorName: string,
  errorDetails: Record<string, unknown>
) {
  trackEvent('error_occurred', {
    error_name: errorName,
    ...errorDetails
  })
}

export function trackUserAction(
  action: string,
  properties?: Record<string, unknown>
) {
  trackEvent('user_action', {
    action,
    ...properties
  })
}
