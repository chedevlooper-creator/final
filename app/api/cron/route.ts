import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env['CRON_SECRET']}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const checkInId = Sentry.captureCheckIn({
    monitorSlug: 'daily-cron-job',
    status: 'in_progress',
  })

  try {
    await executeCronJob()

    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: 'daily-cron-job',
      status: 'ok',
    })

    return NextResponse.json({
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: 'daily-cron-job',
      status: 'error',
    })
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

async function executeCronJob(): Promise<void> {
  // Buraya cron job mantığı eklenecek
  // Örnek: Veritabanı temizliği, rapor oluşturma vb.
}
