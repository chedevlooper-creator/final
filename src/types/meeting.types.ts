/**
 * Toplantı Yönetim Sistemi Tip Tanımları
 * Meeting Management System Type Definitions
 */

// ============================================================================
// ENUMS / ENUMERATIONS
// ============================================================================

/**
 * Toplantı durumları / Meeting status
 */
export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Katılımcı durumları / Participant status
 */
export enum ParticipantStatus {
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  ATTENDED = 'attended'
}

/**
 * Görev durumu / Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Görev önceliği / Task priority
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Bildirim tipi / Notification type
 */
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue',
  MEETING_INVITE = 'meeting_invite',
  MEETING_REMINDER = 'meeting_reminder',
  MEETING_CANCELLED = 'meeting_cancelled',
  MEETING_UPDATED = 'meeting_updated'
}

// ============================================================================
// INTERFACES / TYPES
// ============================================================================

/**
 * Toplantı / Meeting
 */
export interface Meeting {
  id: string
  title: string
  description?: string
  meeting_date: string
  location?: string
  status: MeetingStatus
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Toplantı detayları (ilişkilerle) / Meeting with relations
 */
export interface MeetingDetail extends Meeting {
  participants?: MeetingParticipant[]
  tasks?: Task[]
  files?: MeetingFile[]
  participant_count?: number
  completed_task_count?: number
  total_task_count?: number
  creator?: {
    id: string
    email: string
    full_name?: string
  }
}

/**
 * Toplantı katılımcısı / Meeting participant
 */
export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  status: ParticipantStatus
  availability_confirmed: boolean
  joined_at?: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

/**
 * Görev / Task
 */
export interface Task {
  id: string
  meeting_id: string
  assigned_to: string
  title: string
  description?: string
  category?: string
  priority: TaskPriority
  status: TaskStatus
  due_date?: string
  completed_at?: string
  created_at: string
  comments?: TaskComment[]
  assignee?: {
    id: string
    email: string
    full_name?: string
  }
}

/**
 * Görev yorumu / Task comment
 */
export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  comment: string
  created_at: string
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

/**
 * Toplantı dosyası / Meeting file
 */
export interface MeetingFile {
  id: string
  meeting_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
  uploader?: {
    id: string
    email: string
    full_name?: string
  }
}

/**
 * Bildirim / Notification
 */
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  created_at: string
}

// ============================================================================
// INPUT TYPES / CREATE/UPDATE TYPES
// ============================================================================

/**
 * Toplantı oluşturma / Create meeting
 */
export interface CreateMeetingInput {
  title: string
  description?: string
  meeting_date: string
  location?: string
  participant_ids?: string[]
}

/**
 * Toplantı güncelleme / Update meeting
 */
export interface UpdateMeetingInput {
  title?: string
  description?: string
  meeting_date?: string
  location?: string
  status?: MeetingStatus
}

/**
 * Görev oluşturma / Create task
 */
export interface CreateTaskInput {
  meeting_id: string
  assigned_to: string
  title: string
  description?: string
  category?: string
  priority?: TaskPriority
  due_date?: string
}

/**
 * Görev güncelleme / Update task
 */
export interface UpdateTaskInput {
  title?: string
  description?: string
  category?: string
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string
}

/**
 * Katılımcı durumu güncelleme / Update participant status
 */
export interface UpdateParticipantInput {
  status: ParticipantStatus
  availability_confirmed?: boolean
}

/**
 * Görev yorumu oluşturma / Create task comment
 */
export interface CreateTaskCommentInput {
  task_id: string
  comment: string
}

// ============================================================================
// FILTER TYPES / QUERY PARAMS
// ============================================================================

/**
 * Toplantı filtreleri / Meeting filters
 */
export interface MeetingFilters {
  status?: MeetingStatus
  date_from?: string
  date_to?: string
  search?: string
  upcoming?: boolean
  page?: number
  limit?: number
}

/**
 * Görev filtreleri / Task filters
 */
export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: string
  meeting_id?: string
  overdue?: boolean
  page?: number
  limit?: number
}

// ============================================================================
// RESPONSE TYPES / API RESPONSES
// ============================================================================

/**
 * Paginated response / Sayfalı yanıt
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Toplantı istatistikleri / Meeting statistics
 */
export interface MeetingStatistics {
  total_participants: number
  confirmed_participants: number
  attended_participants: number
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  high_priority_tasks: number
  attendance_rate?: number
  task_completion_rate?: number
}

// ============================================================================
// UTILITY TYPES / YARDIMCI TİPLER
// ============================================================================

/**
 * UI için renk eşleşmesi / Color mapping for UI
 */
export const MeetingStatusColors: Record<MeetingStatus, string> = {
  [MeetingStatus.SCHEDULED]: 'blue',
  [MeetingStatus.IN_PROGRESS]: 'green',
  [MeetingStatus.COMPLETED]: 'gray',
  [MeetingStatus.CANCELLED]: 'red'
}

export const ParticipantStatusColors: Record<ParticipantStatus, string> = {
  [ParticipantStatus.INVITED]: 'gray',
  [ParticipantStatus.CONFIRMED]: 'green',
  [ParticipantStatus.DECLINED]: 'red',
  [ParticipantStatus.ATTENDED]: 'blue'
}

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'yellow',
  [TaskStatus.IN_PROGRESS]: 'blue',
  [TaskStatus.COMPLETED]: 'green',
  [TaskStatus.CANCELLED]: 'red'
}

export const TaskPriorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'gray',
  [TaskPriority.MEDIUM]: 'blue',
  [TaskPriority.HIGH]: 'orange',
  [TaskPriority.URGENT]: 'red'
}

/**
 * Türkçe çeviriler / Turkish translations
 */
export const MeetingStatusLabels: Record<MeetingStatus, string> = {
  [MeetingStatus.SCHEDULED]: 'Planlandı',
  [MeetingStatus.IN_PROGRESS]: 'Devam Ediyor',
  [MeetingStatus.COMPLETED]: 'Tamamlandı',
  [MeetingStatus.CANCELLED]: 'İptal Edildi'
}

export const ParticipantStatusLabels: Record<ParticipantStatus, string> = {
  [ParticipantStatus.INVITED]: 'Davet Edildi',
  [ParticipantStatus.CONFIRMED]: 'Onayladı',
  [ParticipantStatus.DECLINED]: 'Reddetti',
  [ParticipantStatus.ATTENDED]: 'Katıldı'
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Beklemede',
  [TaskStatus.IN_PROGRESS]: 'Devam Ediyor',
  [TaskStatus.COMPLETED]: 'Tamamlandı',
  [TaskStatus.CANCELLED]: 'İptal Edildi'
}

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Düşük',
  [TaskPriority.MEDIUM]: 'Orta',
  [TaskPriority.HIGH]: 'Yüksek',
  [TaskPriority.URGENT]: 'Acil'
}

// ============================================================================
// PHASE 3: Premium Features Types
// ============================================================================

/**
 * Toplantı notu / Meeting note
 */
export interface MeetingNote {
  id: string
  meeting_id: string
  user_id: string
  note: string
  is_private: boolean
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

/**
 * Oylama / Vote
 */
export interface MeetingVote {
  id: string
  meeting_id: string
  title: string
  description?: string
  vote_type: VoteType
  options: any
  created_by: string
  status: VoteStatus
  created_at: string
  closed_at?: string
  creator?: {
    id: string
    email: string
    full_name?: string
  }
}

/**
 * Oy yanıtı / Vote response
 */
export interface VoteResponse {
  id: string
  vote_id: string
  user_id: string
  response: any
  created_at: string
  user?: {
    id: string
    email: string
    full_name?: string
  }
}

/**
 * Oylama oluşturma / Create vote
 */
export interface CreateVoteInput {
  meeting_id: string
  title: string
  description?: string
  vote_type: VoteType
  options?: string[]
}

/**
 * Toplantı notu oluşturma / Create meeting note
 */
export interface CreateNoteInput {
  meeting_id: string
  note: string
  is_private?: boolean
}

/**
 * Dosya yükleme / Upload file
 */
export interface UploadFileInput {
  meetingId: string
  file: File
}

/**
 * Oylama tipi / Vote type
 */
export enum VoteType {
  YES_NO = 'yes_no',
  MULTIPLE_CHOICE = 'multiple_choice',
  PRIORITY = 'priority'
}

/**
 * Oylama durumu / Vote status
 */
export enum VoteStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export const VoteTypeLabels: Record<VoteType, string> = {
  [VoteType.YES_NO]: 'Evet / Hayır',
  [VoteType.MULTIPLE_CHOICE]: 'Çoktan Seçmeli',
  [VoteType.PRIORITY]: 'Öncelik Sıralaması'
}

export const VoteStatusLabels: Record<VoteStatus, string> = {
  [VoteStatus.ACTIVE]: 'Aktif',
  [VoteStatus.CLOSED]: 'Kapalı',
  [VoteStatus.CANCELLED]: 'İptal'
}
