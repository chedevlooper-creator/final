/**
 * Delete Orphan Relation API Route
 * DELETE /api/needy/[needyPersonId]/orphan-relations/[id] - Delete orphan relation
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ needyPersonId: string; id: string }> }
) {
  try {
    const { needyPersonId, id } = await params
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify relation belongs to this needy person
    const { data: relation, error: relationError } = await supabase
      .from('needy_orphan_relations')
      .select('id, needy_person_id')
      .eq('id', id)
      .eq('needy_person_id', needyPersonId)
      .single()

    if (relationError || !relation) {
      return NextResponse.json({ error: 'Relation not found' }, { status: 404 })
    }

    // Soft delete (deactivate)
    const { error } = await supabase
      .from('needy_orphan_relations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting orphan relation:', error)
      return NextResponse.json({ error: 'Failed to delete relation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete orphan relation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
