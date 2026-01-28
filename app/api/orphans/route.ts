/**
 * Orphans API Route
 * POST /api/orphans - Create new orphan record
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()

    const {
      type,
      first_name,
      last_name,
      gender,
      date_of_birth,
      guardian_name,
      guardian_phone,
      address,
      notes,
    } = body

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert orphan record
    const { data, error } = await supabase
      .from('orphans')
      .insert({
        type,
        first_name,
        last_name,
        gender,
        date_of_birth: date_of_birth || null,
        guardian_name: guardian_name || null,
        guardian_phone: guardian_phone || null,
        address: address || null,
        notes: notes || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating orphan:', error)
      return NextResponse.json({ error: 'Failed to create orphan record' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Orphan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const pageParam = Number.parseInt(searchParams.get('page') || '0', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '20', 10)
    
    // Validate pagination parameters
    const page = Number.isNaN(pageParam) || pageParam < 0 ? 0 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 100)
    
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('orphans')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)

    if (error) throw error

    return NextResponse.json({ data: data || [], count: count || 0, page, limit })
  } catch (error) {
    console.error('Orphan list API error:', error)
    return NextResponse.json({ error: 'Failed to fetch orphans' }, { status: 500 })
  }
}
