import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env['NEXT_PUBLIC_SENTRY_DSN'],
  
  environment: process.env.NODE_ENV,
  
  // Adjust tracesSampleRate based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  

  
  // beforeSend - Server-side filtering
  beforeSend(event: any, hint: any) {
    // Filter sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
      delete event.request.headers['x-api-key']
    }
    
    // Filter request body
    if (event.request?.data) {
      delete event.request.data.password
      delete event.request.data.password_confirmation
      delete event.request.data.token
      delete event.request.data.api_key
    }
    
    return event
  },
  
  // Filter health check transactions
  tracesSampler(samplingContext: any) {
    const url = samplingContext?.transactionContext?.name || ''
    
    // Skip health checks
    if (url.includes('/health') || url.includes('/ping') || url.includes('/ready')) {
      return 0
    }
    
    // Lower sample rate for static assets
    if (url.includes('/_next/static')) {
      return 0.01
    }
    
    return process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  },
})
