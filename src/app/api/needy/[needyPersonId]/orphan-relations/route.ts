/**
 * Orphan Relations API Route
 * POST /api/needy/[needyPersonId]/orphan-relations - Create orphan relation
 * GET /api/needy/[needyPersonId]/orphan-relations - List orphan relations
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ needyPersonId: string }> }
) {
  try {
    const { needyPersonId } = await params
    const supabase = createClient()
    const body = await request.json()

    const { orphan_id, relation_type, relation_description, start_date, is_primary_guardian } = body

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if orphan exists
    const { data: orphan, error: orphanError } = await supabase
      .from('orphans')
      .select('id')
      .eq('id', orphan_id)
      .single()

    if (orphanError || !orphan) {
      return NextResponse.json({ error: 'Orphan not found' }, { status: 404 })
    }

    // Check if relation already exists
    const { data: existing } = await supabase
      .from('needy_orphan_relations')
      .select('id')
      .eq('needy_person_id', needyPersonId)
      .eq('orphan_id', orphan_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Relation already exists' }, { status: 400 })
    }

    // If this is primary guardian, deactivate existing primary guardians
    if (is_primary_guardian) {
      await supabase
        .from('needy_orphan_relations')
        .update({ is_primary_guardian: false })
        .eq('needy_person_id', needyPersonId)
    }

    // Create relation
    const { data, error } = await supabase
      .from('needy_orphan_relations')
      .insert({
        needy_person_id: needyPersonId,
        orphan_id,
        relation_type,
        relation_description: relation_description || null,
        start_date: start_date || null,
        is_primary_guardian: is_primary_guardian || false,
        is_active: true,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        orphan:orphans(id, first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Error creating orphan relation:', error)
      return NextResponse.json({ error: 'Failed to create relation' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Orphan relation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ needyPersonId: string }> }
) {
  try {
    const { needyPersonId } = await params
    const supabase = createClient()

    const { data, error } = await supabase
      .from('needy_orphan_relations')
      .select(`
        *,
        orphan:orphans(id, first_name, last_name)
      `)
      .eq('needy_person_id', needyPersonId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Orphan relations list API error:', error)
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 })
  }
}
