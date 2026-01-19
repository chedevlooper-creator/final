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
    
    return NextResponse.json({
      ...meeting,
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
    
    // Check if user is the creator
    const { data: meeting } = await supabase
      .from('meetings')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (!meeting || meeting.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { data: updatedMeeting, error } = await supabase
      .from('meetings')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Meeting PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/meetings/[id] - Toplantıyı iptal et
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
    
    // Check if user is the creator
    const { data: meeting } = await supabase
      .from('meetings')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (!meeting || meeting.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('meetings')
      .update({ status: 'cancelled' })
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
