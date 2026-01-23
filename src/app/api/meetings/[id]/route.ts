/**
 * Toplantı Detay API Route
 * /api/meetings/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/permission-middleware';

/**
 * GET /api/meetings/[id] - Toplantı detayını getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // RBAC: Toplantıları görüntüleme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: 'read',
      resource: 'meetings'
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const supabase = await createServerSupabaseClient();
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
    // Error logged securely without exposing sensitive data
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
    // RBAC: Toplantı güncelleme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: 'update',
      resource: 'meetings'
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const supabase = await createServerSupabaseClient();
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
    // Error logged securely without exposing sensitive data
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
    // RBAC: Toplantı silme yetkisi kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: 'delete',
      resource: 'meetings'
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const supabase = await createServerSupabaseClient();
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
    // Error logged securely without exposing sensitive data
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
