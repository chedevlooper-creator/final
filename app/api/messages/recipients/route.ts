/**
 * Recipients API Route
 * GET /api/messages/recipients
 *
 * Fetches recipient list based on recipient type for bulk messaging
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Recipient {
  id: string
  phone?: string
  email?: string
  name: string
}

interface PersonData {
  id: string
  first_name: string
  last_name: string
  phone?: string | null
  email?: string | null
}

interface DonorData {
  id: string
  name: string
  phone?: string | null
  email?: string | null
}

// Helper function to map person data to recipient
const mapPersonToRecipient = (person: PersonData): Recipient => ({
  id: person.id,
  phone: person.phone || undefined,
  email: person.email || undefined,
  name: `${person.first_name} ${person.last_name}`,
})

// Helper function to map donor data to recipient
const mapDonorToRecipient = (donor: DonorData): Recipient => ({
  id: donor.id,
  phone: donor.phone || undefined,
  email: donor.email || undefined,
  name: donor.name,
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const recipientType = searchParams.get('type') || 'all'

    let recipients: Recipient[] = []

    switch (recipientType) {
      case 'all': {
        // Get all needy persons with phone or email
        const { data: allNeedy, error: allError } = await supabase
          .from('needy_persons')
          .select('id, first_name, last_name, phone, email')
          .or('phone.not.is.null,email.not.is.null')

        if (allError) throw allError
        recipients = (allNeedy || []).map(mapPersonToRecipient)
        break
      }

      case 'active': {
        // Get active needy persons with phone or email
        const { data: activeNeedy, error: activeError } = await supabase
          .from('needy_persons')
          .select('id, first_name, last_name, phone, email')
          .eq('status', 'active')
          .or('phone.not.is.null,email.not.is.null')

        if (activeError) throw activeError
        recipients = (activeNeedy || []).map(mapPersonToRecipient)
        break
      }

      case 'volunteers': {
        // Get volunteers with phone or email
        const { data: volunteers, error: volError } = await supabase
          .from('volunteers')
          .select('id, first_name, last_name, phone, email')
          .or('phone.not.is.null,email.not.is.null')

        if (volError) throw volError
        recipients = (volunteers || []).map(mapPersonToRecipient)
        break
      }

      case 'donors': {
        // Get donors with phone or email
        const { data: donors, error: donorError } = await supabase
          .from('donors')
          .select('id, name, phone, email')
          .or('phone.not.is.null,email.not.is.null')

        if (donorError) throw donorError
        recipients = (donors || []).map(mapDonorToRecipient)
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid recipient type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      recipients,
      count: recipients.length,
      type: recipientType,
    })
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Recipients fetch error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
      { status: 500 }
    )
  }
}
