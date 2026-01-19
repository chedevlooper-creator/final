/**
 * Toplantı API Route
 * /api/meetings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MeetingStatus } from '@/types/meeting.types';

/**
 * GET /api/meetings - Toplantı listesini getir
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let query = supabase
      .from('meetings')
      .select('*', { count: 'exact' })
      .order('meeting_date', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (upcoming === 'true') {
      query = query.gte('meeting_date', new Date().toISOString());
    }
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Meetings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/meetings - Yeni toplantı oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, meeting_date, location, participant_ids } = body;
    
    // Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Toplantı başlığı en az 3 karakter olmalıdır' }, { status: 400 });
    }
    
    if (!meeting_date) {
      return NextResponse.json({ error: 'Toplantı tarihi gerekli' }, { status: 400 });
    }
    
    const meetingDate = new Date(meeting_date);
    if (isNaN(meetingDate.getTime())) {
      return NextResponse.json({ error: 'Geçersiz tarih' }, { status: 400 });
    }
    
    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title: title.trim(),
        description: description?.trim(),
        meeting_date: meetingDate.toISOString(),
        location: location?.trim(),
        created_by: user.id,
        status: MeetingStatus.SCHEDULED
      })
      .select()
      .single();
    
    if (meetingError) {
      return NextResponse.json({ error: meetingError.message }, { status: 400 });
    }
    
    // Add participants if provided
    if (participant_ids && Array.isArray(participant_ids) && participant_ids.length > 0) {
      const participants = participant_ids.map((userId: string) => ({
        meeting_id: meeting.id,
        user_id: userId,
        status: 'invited'
      }));
      
      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .insert(participants);
      
      if (participantsError) {
        console.error('Error adding participants:', participantsError);
      }
    }
    
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Meetings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
