/**
 * Bağış İşleme API
 * 
 * POST /api/workflows/process-donation
 */

import { start } from 'workflow/api'
import { handleDonationProcessing } from '@/workflows/donation-processing'
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/permission-middleware'

export async function POST(request: Request) {
  // Auth kontrolü
  const auth = await withAuth(undefined, {
    requiredPermission: 'create'
  })
  
  if (!auth.success) {
    return auth.response!
  }
  
  try {
    const body = await request.json()
    
    const { 
      donationId, 
      donorName, 
      donorEmail, 
      donorPhone, 
      amount, 
      currency = 'TRY',
      donationType,
      category 
    } = body
    
    if (!donationId || !donorName || !amount || !donationType || !category) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar eksik: donationId, donorName, amount, donationType, category' },
        { status: 400 }
      )
    }
    
    // Workflow'u başlat
    await start(handleDonationProcessing, [{
      id: donationId,
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency,
      donationType,
      category,
      createdBy: auth.user!.id
    }])
    
    return NextResponse.json({
      success: true,
      message: 'Bağış işleme süreci başlatıldı',
      donationId
    })
  } catch (error) {
    console.error('Donation processing error:', error)
    return NextResponse.json(
      { error: 'Bağış işlenemedi' },
      { status: 500 }
    )
  }
}
