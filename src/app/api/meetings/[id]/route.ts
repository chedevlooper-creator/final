/**
 * Toplantı Detay API Route
 * /api/meetings/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/meetings/[id] - Toplantı detayını getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Get meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        *,
        creator:auth.users(id, email, raw_user_meta_data->>full_name)
      `)
      .eq('id', id)
      .single();
    
    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Toplantı bulunamadı' }, { status: 404 });
    }
    
    // Get participants
    const { data: participants } = await supabase
      .from('meeting_participants')
      .select(`
        *,
        user:auth.users(id, email, raw_user_meta_data->>full_name, raw_user_meta_data->>avatar_url)
      `)
      .eq('meeting_id', id);
    
    // Get tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:auth.users(id, email, raw_user_meta_data->>full_name)
      `)
      .eq('meeting_id', id)
      .order('priority', { ascending: false });
    
    // TypeScript için type assertion
    const meetingResponse: any = meeting;
    
    return NextResponse.json({
      ...meetingResponse,
      participants: participants || [],
      tasks: tasks || []
    });
  } catch (error) {
    console.error('Meeting GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/meetings/[id] - Toplantıyı güncelle
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('meetings')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Meeting PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/meetings/[id] - Toplantıyı sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Meeting DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
