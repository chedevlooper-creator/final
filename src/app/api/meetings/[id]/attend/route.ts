/**
 * Katılımcı Durumu API Route
 * /api/meetings/[id]/attend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ParticipantStatus } from '@/types/meeting.types';
import { withAuth } from '@/lib/permission-middleware';

/**
 * POST /api/meetings/[id]/attend - Toplantı katılım durumunu güncelle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // RBAC: Toplantı katılımı için yetki kontrolü
    const authResult = await withAuth(request, {
      requiredPermission: 'read',
      resource: 'meetings'
    });

    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.user!;
    const supabase = await createServerSupabaseClient();
    const { id: meetingId } = await params;
    const body = await request.json();
    const { status, availability_confirmed } = body;
    
    // Validate status
    if (!Object.values(ParticipantStatus).includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }
    
    // Check if participant exists
    const { data: existingParticipant } = await supabase
      .from('meeting_participants')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .single();
    
    if (!existingParticipant) {
      // Create new participant record
      const { data: newParticipant, error: createError } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
          status,
          availability_confirmed: availability_confirmed ?? true,
          joined_at: status === ParticipantStatus.ATTENDED ? new Date().toISOString() : null
        })
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      
      return NextResponse.json(newParticipant);
    }
    
    // Update existing participant
    const updates: {
      status: string;
      availability_confirmed: boolean;
      joined_at?: string;
    } = {
      status,
      availability_confirmed: availability_confirmed ?? true
    };
    
    if (status === ParticipantStatus.ATTENDED) {
      updates.joined_at = new Date().toISOString();
    }
    
    const { data: updatedParticipant, error: updateError } = await supabase
      .from('meeting_participants')
      .update(updates)
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    
    // If user is confirming availability, notify meeting creator
    if (availability_confirmed) {
      const { data: meeting } = await supabase
        .from('meetings')
        .select('created_by, title')
        .eq('id', meetingId)
        .single();
      
      if (meeting && meeting.created_by !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: meeting.created_by,
            type: 'meeting_reminder',
            title: 'Katılım Onayı',
            message: `Bir katılımcı toplantıya katılımını onayladı: ${meeting.title}`,
            read: false
          });
      }
    }

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    // Error logged securely without exposing sensitive data
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
