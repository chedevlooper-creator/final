/**
 * Toplantı Yönetim Sistemi - React Query Hooks
 * Meeting Management System - React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Meeting,
  MeetingDetail,
  MeetingParticipant,
  Task,
  MeetingNote,
  MeetingVote,
  VoteResponse,
  VoteResponseValue,
  MeetingFile,
  CreateMeetingInput,
  UpdateMeetingInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateNoteInput,
  CreateVoteInput,
  UploadFileInput,
  MeetingFilters,
  TaskFilters,
  PaginatedResponse
} from '@/types/meeting.types';
import { MeetingStatus, TaskStatus, ParticipantStatus, TaskPriority } from '@/types/meeting.types';

// ============================================================================
// MEETINGS / TOPLANTILAR
// ============================================================================

/**
 * Toplantı listesini getir
 * Fetch meetings list
 */
export function useMeetingsList(filters?: MeetingFilters) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'list', filters],
    queryFn: async () => {
      let query = supabase
        .from('meetings')
        .select('*', { count: 'exact' })
        .order('meeting_date', { ascending: true });
      
      // Status filter
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // Date range filters
      if (filters?.date_from) {
        query = query.gte('meeting_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('meeting_date', filters.date_to);
      }
      
      // Upcoming meetings filter
      if (filters?.upcoming) {
        query = query.gte('meeting_date', new Date().toISOString());
      }
      
      // Search filter
      if (filters?.search) {
        query = query.textSearch('search_vector', filters.search);
      }
      
      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      } as PaginatedResponse<Meeting>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Toplantı detayını getir
 * Fetch meeting detail
 */
export function useMeetingDetail(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'detail', meetingId],
    queryFn: async () => {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          *,
          creator:auth.users(id, email, raw_user_meta_data->>full_name)
        `)
        .eq('id', meetingId)
        .single();
      
      if (meetingError) throw meetingError;
      
      // Get participants
      const { data: participants } = await supabase
        .from('meeting_participants')
        .select(`
          *,
          user:auth.users(id, email, raw_user_meta_data->>full_name, raw_user_meta_data->>avatar_url)
        `)
        .eq('meeting_id', meetingId);
      
      // Get tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:auth.users(id, email, raw_user_meta_data->>full_name)
        `)
        .eq('meeting_id', meetingId)
        .order('priority', { ascending: false });
      
      return {
        ...meeting,
        participants: participants || [],
        tasks: tasks || []
      } as MeetingDetail;
    },
    enabled: !!meetingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Toplantı oluştur
 * Create meeting
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async (input: CreateMeetingInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: input.title,
          description: input.description,
          meeting_date: input.meeting_date,
          location: input.location,
          created_by: user.id
        })
        .select()
        .single();
      
      if (meetingError) throw meetingError;
      
      // Add participants if provided
      if (input.participant_ids && input.participant_ids.length > 0) {
        const participants = input.participant_ids.map(userId => ({
          meeting_id: meeting.id,
          user_id: userId,
          status: 'invited' as ParticipantStatus
        }));
        
        const { error: participantsError } = await supabase
          .from('meeting_participants')
          .insert(participants);
        
        if (participantsError) throw participantsError;
      }
      
      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

/**
 * Toplantı güncelle
 * Update meeting
 */
export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, updates }: { meetingId: string; updates: UpdateMeetingInput }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: Meeting) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', data.id] });
    },
  });
}

/**
 * Toplantı iptal et
 * Cancel meeting
 */
export function useCancelMeeting() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async (meetingId: string) => {
      const { data, error } = await supabase
        .from('meetings')
        .update({ status: MeetingStatus.CANCELLED })
        .eq('id', meetingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: Meeting) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'detail', data.id] });
    },
  });
}

// ============================================================================
// PARTICIPANTS / KATILIMCILAR
// ============================================================================

/**
 * Toplantı katılımcılarını getir
 * Fetch meeting participants
 */
export function useMeetingParticipants(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'participants', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          *,
          user:auth.users(id, email, raw_user_meta_data->>full_name, raw_user_meta_data->>avatar_url)
        `)
        .eq('meeting_id', meetingId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!meetingId,
    staleTime: 1 * 60 * 1000, // 1 minute - real-time updates
  });
}

/**
 * Toplantı katılım durumunu güncelle
 * Update meeting participation status
 */
export function useUpdateParticipantStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({
      meetingId,
      userId,
      status,
      availabilityConfirmed
    }: {
      meetingId: string;
      userId: string;
      status: ParticipantStatus;
      availabilityConfirmed?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({
          status,
          availability_confirmed: availabilityConfirmed ?? true,
          joined_at: status === ParticipantStatus.ATTENDED ? new Date().toISOString() : null
        })
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_data: MeetingParticipant, variables: { meetingId: string; userId: string; status: ParticipantStatus; availabilityConfirmed?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'participants', variables.meetingId] });
    },
  });
}

// ============================================================================
// TASKS / GÖREVLER
// ============================================================================

/**
 * Toplantı görevlerini getir
 * Fetch meeting tasks
 */
export function useMeetingTasks(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'tasks', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:auth.users(id, email, raw_user_meta_data->>full_name)
        `)
        .eq('meeting_id', meetingId)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!meetingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Kullanıcının görevlerini getir
 * Fetch user's tasks
 */
export function useMyTasks(filters?: TaskFilters) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['tasks', 'my', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          meeting:meetings(id, title, meeting_date, status),
          assignee:auth.users(id, email, raw_user_meta_data->>full_name)
        `)
        .eq('assigned_to', user.id);
      
      // Status filter
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // Priority filter
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      // Meeting filter
      if (filters?.meeting_id) {
        query = query.eq('meeting_id', filters.meeting_id);
      }
      
      // Overdue filter
      if (filters?.overdue) {
        query = query.lt('due_date', new Date().toISOString().split('T')[0]);
      }
      
      const { data, error } = await query.order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Görev oluştur
 * Create task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          meeting_id: input.meeting_id,
          assigned_to: input.assigned_to,
          title: input.title,
          description: input.description,
          category: input.category,
          priority: input.priority,
          due_date: input.due_date
        })
        .select(`
          *,
          assignee:auth.users(id, email, raw_user_meta_data->>full_name)
        `)
        .single();
      
      if (error) throw error;
      
      // Create notification for task assignment
      await supabase
        .from('notifications')
        .insert({
          user_id: input.assigned_to,
          type: 'task_assigned',
          title: 'Yeni Görev',
          message: `"${input.title}" göreviniz atanmıştır`,
          read: false
        });
      
      return data;
    },
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'tasks', data.meeting_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
    },
  });
}

/**
 * Görevi güncelle
 * Update task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'tasks', data.meeting_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
    },
  });
}

/**
 * Görev durumunu güncelle (Tamamlandı butonu için)
 * Update task status (for Complete button)
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      // First, get task details for notification
      const { data: task } = await supabase
        .from('tasks')
        .select('*, meeting:meetings(created_by)')
        .eq('id', taskId)
        .single();
      
      if (!task) throw new Error('Task not found');
      
      const updates: { status: TaskStatus; completed_at?: string } = { status };
      if (status === TaskStatus.COMPLETED) {
        updates.completed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification for meeting creator if task is completed
      if (status === TaskStatus.COMPLETED && task.meeting?.created_by) {
        await supabase
          .from('notifications')
          .insert({
            user_id: task.meeting.created_by,
            type: 'task_completed',
            title: 'Görev Tamamlandı',
            message: `"${task.title}" görevi tamamlandı`,
            read: false
          });
      }
      
      return data;
    },
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'tasks', data.meeting_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] });
    },
  });
}

// ============================================================================
// STATISTICS / İSTATİSTİKLER
// ============================================================================

/**
 * Toplantı istatistiklerini getir
 * Fetch meeting statistics
 */
export function useMeetingStatistics(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'stats', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_meeting_stats', { p_meeting_id: meetingId });
      
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// AVAILABLE MEETINGS / MÜSAİT TOPLANTILAR
// ============================================================================

/**
 * Kullanıcının müsait olduğu toplantıları getir
 * Fetch user's available meetings
 */
export function useAvailableMeetings() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'available'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_available_meetings', { p_user_id: user.id });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - frequent updates
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

// ============================================================================
// USERS / KULLANICILAR (Phase 2)
// ============================================================================

/**
 * Tüm kullanıcıları listele (Görev atama için)
 * Fetch all users (for task assignment)
 */
export function useUsersList() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data->>full_name, raw_user_meta_data->>avatar_url')
          .order('email');
        
        if (error) {
          console.warn('Users list query error:', error.message);
          return [];
        }
        
        return (data || []).map((user: { id: string; email: string; full_name?: string; avatar_url?: string }) => ({
          id: user.id,
          email: user.email,
          name: user.full_name || user.email,
          avatar: user.avatar_url
        }));
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - user list doesn't change often
  });
}

// ============================================================================
// TASKS WITH FILTERING (Phase 2)
// ============================================================================

/**
 * Kullanıcının görevlerini gelişmiş filtreleme ile getir
 * Fetch user's tasks with advanced filtering
 */
export function useMyTasksAdvanced(filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  overdue?: boolean;
}) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['tasks', 'my-advanced', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          meeting:meetings(id, title, meeting_date, location, status),
          creator:meetings!inner(created_by)
        `)
        .eq('assigned_to', user.id);
      
      // Status filter
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // Priority filter
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      // Overdue filter
      if (filters?.overdue) {
        query = query.lt('due_date', new Date().toISOString().split('T')[0]);
        query = query.not('status', 'eq', 'completed');
      }
      
      // Search filter
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      const { data, error } = await query.order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// PHASE 3: Premium Features
// ============================================================================

/**
 * Toplantı notlarını getir / Fetch meeting notes
 */
export function useMeetingNotes(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'notes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select(`
          *,
          user:auth.users(id, email, raw_user_meta_data->>full_name, raw_user_meta_data->>avatar_url)
        `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!meetingId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Toplantı notu oluştur / Create meeting note
 */
export function useCreateNote() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('meeting_notes')
        .insert({
          meeting_id: input.meeting_id,
          user_id: user.id,
          note: input.note,
          is_private: input.is_private ?? false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: MeetingNote) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'notes', data.meeting_id] });
    },
  });
}

/**
 * Oylamaları getir / Fetch votes
 */
export function useMeetingVotes(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'votes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_votes')
        .select(`
          *,
          creator:auth.users(id, email, raw_user_meta_data->>full_name),
          responses:vote_responses(
            id,
            user_id,
            response,
            created_at,
            user:auth.users(id, email, raw_user_meta_data->>full_name)
          )
        `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!meetingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Oylama oluştur / Create vote
 */
export function useCreateVote() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async (input: CreateVoteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('meeting_votes')
        .insert({
          meeting_id: input.meeting_id,
          title: input.title,
          description: input.description,
          vote_type: input.vote_type,
          options: input.options || [],
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Notify participants
      const { data: participants } = await supabase
        .from('meeting_participants')
        .select('user_id')
        .eq('meeting_id', input.meeting_id);
      
      if (participants) {
        const notifications = participants
        .filter((p: { user_id: string }) => p.user_id !== user.id)
          .map((p: { user_id: string }) => ({
            user_id: p.user_id,
            type: 'vote_created',
            title: 'Yeni Oylama',
            message: `"${input.title}" başlıklı oylama başlatıldı.`,
            read: false,
          }));
        
        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }
      
      return data;
    },
    onSuccess: (data: MeetingVote) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'votes', data.meeting_id] });
    },
  });
}

/**
 * Oy kullan / Submit vote
 */
export function useSubmitVote() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ voteId, response }: { voteId: string; response: VoteResponseValue }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('vote_responses')
        .insert({
          vote_id: voteId,
          user_id: user.id,
          response,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: VoteResponse) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'votes'] });
    },
  });
}

/**
 * Dosya yükle / Upload file
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, file }: UploadFileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `meetings/${meetingId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('meeting-files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meeting-files')
        .getPublicUrl(filePath);
      
      // Save to database
      const { data, error } = await supabase
        .from('meeting_files')
        .insert({
          meeting_id: meetingId,
          file_name: file.name,
          file_path: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: MeetingFile) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'files', data.meeting_id] });
    },
  });
}

/**
 * Toplantı dosyalarını getir / Fetch meeting files
 */
export function useMeetingFiles(meetingId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['meetings', 'files', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_files')
        .select(`
          *,
          uploader:auth.users(id, email, raw_user_meta_data->>full_name)
        `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
