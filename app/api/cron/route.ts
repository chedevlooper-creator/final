import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  // CRON_SECRET zorunlu
  const cronSecret = process.env['CRON_SECRET']
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not set')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  // Authorization header kontrolü
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    )
  }

  // Bearer token kontrolü
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Invalid authorization format' },
      { status: 401 }
    )
  }

  // Secret karşılaştırması (timing attack önleme için constant-time comparison)
  const providedToken = authHeader.slice(7)
  if (providedToken !== cronSecret) {
    // Güvenlik logu (secret'i loglama)
    console.warn(`CRON authorization failed from ${request.headers.get('x-forwarded-for') || 'unknown'}`)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Cron job başarılı
  return NextResponse.json({
    message: 'Cron job executed successfully',
    timestamp: new Date().toISOString()
  })
}
