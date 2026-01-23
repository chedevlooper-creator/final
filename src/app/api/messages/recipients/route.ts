/**
 * Recipients API Route
 * GET /api/messages/recipients
 *
 * Fetches recipient list based on recipient type for bulk messaging
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Recipient {
  id: string
  phone?: string
  email?: string
  name: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const recipientType = searchParams.get('type') || 'all'

    let recipients: Recipient[] = []

    switch (recipientType) {
      case 'all':
        // Get all needy persons
        const { data: allNeedy, error: allError } = await supabase
          .from('needy_persons')
          .select('id, first_name, last_name, phone, email')
          .not('phone', 'is', null)

        if (allError) throw allError

        recipients = (allNeedy || []).map((person) => ({
          id: person.id,
          phone: person.phone || undefined,
          email: person.email || undefined,
          name: `${person.first_name} ${person.last_name}`,
        }))
        break

      case 'active':
        // Get active needy persons
        const { data: activeNeedy, error: activeError } = await supabase
          .from('needy_persons')
          .select('id, first_name, last_name, phone, email')
          .eq('status', 'active')
          .not('phone', 'is', null)

        if (activeError) throw activeError

        recipients = (activeNeedy || []).map((person) => ({
          id: person.id,
          phone: person.phone || undefined,
          email: person.email || undefined,
          name: `${person.first_name} ${person.last_name}`,
        }))
        break

      case 'volunteers':
        // Get volunteers
        const { data: volunteers, error: volError } = await supabase
          .from('volunteers')
          .select('id, first_name, last_name, phone, email')
          .not('phone', 'is', null)

        if (volError) throw volError

        recipients = (volunteers || []).map((volunteer) => ({
          id: volunteer.id,
          phone: volunteer.phone || undefined,
          email: volunteer.email || undefined,
          name: `${volunteer.first_name} ${volunteer.last_name}`,
        }))
        break

      case 'donors':
        // Get donors
        const { data: donors, error: donorError } = await supabase
          .from('donors')
          .select('id, name, phone, email')
          .not('phone', 'is', null)

        if (donorError) throw donorError

        recipients = (donors || []).map((donor) => ({
          id: donor.id,
          phone: donor.phone || undefined,
          email: donor.email || undefined,
          name: donor.name,
        }))
        break

      default:
        return NextResponse.json(
          { error: 'Invalid recipient type' },
          { status: 400 }
        )
    }

    // Filter recipients with valid contact info
    const validRecipients = recipients.filter(
      (r) => r.phone || r.email
    )

    return NextResponse.json({
      recipients: validRecipients,
      count: validRecipients.length,
      type: recipientType,
    })
  } catch (error) {
    console.error('Recipients fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
      { status: 500 }
    )
  }
}
