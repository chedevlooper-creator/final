import posthog from 'posthog-js'

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return

  posthog.capture(eventName, properties)
}

export function trackPageView(page: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  posthog.capture('$pageview', {
    $current_url: page,
    ...properties
  })
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  posthog.identify(userId, properties)
}

export function resetUser() {
  if (typeof window === 'undefined') return

  posthog.reset()
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
