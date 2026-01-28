import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env['NEXT_PUBLIC_SENTRY_DSN'],

  // Environment
  environment: process.env.NODE_ENV,

  // Tracing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  

  
  // beforeSend - Sensitive data filtering
  beforeSend(event: any, hint: any) {
    // Filter out Sentry example page errors
    if (event.request?.url?.includes('/sentry-example-page')) {
      return null
    }
    
    // Filter out sensitive data
    if (event.request) {
      // Remove passwords from request data
      if (event.request.data) {
        delete event.request.data.password
        delete event.request.data.password_confirmation
      }
      
      // Mask authorization headers
      if (event.request.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
      }
    }
    
    // Filter user data
    if (event.user) {
      // Keep only non-sensitive user info
      event.user = {
        id: event.user.id,
        email: event.user.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      }
    }
    
    return event
  },
  

  
  // Tags
  initialScope: {
    tags: {
      app: 'yardim-yonetim-paneli',
    },
  },
  
  // Before breadcrumb
  beforeBreadcrumb(breadcrumb: any) {
    // Filter out certain breadcrumbs
    if (breadcrumb.category === 'xhr' && breadcrumb.data?.url) {
      const url = breadcrumb.data.url as string
      // Filter health check requests
      if (url.includes('/health') || url.includes('/ping')) {
        return null
      }
    }
    return breadcrumb
  },
  
  // Ignore errors
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    // Facebook flakiness
    'fb_xd_fragment',
    // Network errors that are not actionable
    'Non-Error promise rejection captured',
    // Browser extensions
    'chrome-extension://',
    'moz-extension://',
    // Sentry example/test errors
    'SentryExampleFrontendError',
  ],
  
  // Deny URLs
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
})
