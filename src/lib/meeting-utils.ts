/**
 * Toplantı Yönetim Sistemi - Yardımcı Fonksiyonlar
 * Meeting Management System - Utility Functions
 */

import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import type {
  Meeting,
  MeetingStatus,
  MeetingParticipant,
  Task,
  TaskStatus,
  TaskPriority,
  MeetingStatistics
} from '@/types/meeting.types';

// ============================================================================
// PERMISSON CHECKS / İZİN KONTROLLERİ
// ============================================================================

/**
 * Kullanıcının toplantıyı yönetip yönetemeyeceğini kontrol et
 * Check if user can manage the meeting
 */
export function canManageMeeting(meeting: Meeting, userId: string): boolean {
  return meeting.created_by === userId;
}

/**
 * Kullanıcının görevi güncelleyip güncelleyemeyeceğini kontrol et
 * Check if user can update the task
 */
export function canUpdateTask(task: Task, userId: string): boolean {
  return task.assigned_to === userId;
}

/**
 * Kullanıcının görevin durumunu güncelleyip güncelleyemeyeceğini kontrol et
 * Check if user can update task status
 */
export function canUpdateTaskStatus(task: Task, userId: string): boolean {
  return task.assigned_to === userId;
}

// ============================================================================
// STATUS CHECKS / DURUM KONTROLLERİ
// ============================================================================

/**
 * Toplantı aktif mi?
 * Is meeting active?
 */
export function isMeetingActive(meeting: Meeting): boolean {
  const meetingDate = new Date(meeting.meeting_date);
  const now = new Date();
  const twoHoursBefore = new Date(meetingDate.getTime() - 2 * 60 * 60 * 1000);
  const twoHoursAfter = new Date(meetingDate.getTime() + 2 * 60 * 60 * 1000);
  
  return now >= twoHoursBefore && now <= twoHoursAfter && meeting.status === 'scheduled';
}

/**
 * Toplantı gelecekte mi?
 * Is meeting in the future?
 */
export function isMeetingUpcoming(meeting: Meeting): boolean {
  return new Date(meeting.meeting_date) > new Date() && meeting.status === 'scheduled';
}

/**
 * Toplantı geçmişte mi?
 * Is meeting in the past?
 */
export function isMeetingPast(meeting: Meeting): boolean {
  return isPast(new Date(meeting.meeting_date));
}

/**
 * Görev zamanında mı tamamlanmış?
 * Is task completed on time?
 */
export function isTaskCompletedOnTime(task: Task): boolean {
  if (!task.completed_at || !task.due_date) return true;
  return new Date(task.completed_at) <= new Date(task.due_date + 'T23:59:59');
}

/**
 * Görev gecikmiş mi?
 * Is task overdue?
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'completed') return false;
  return isPast(new Date(task.due_date));
}

// ============================================================================
// UI HELPERS / ARAYÜZ YARDIMCILARI
// ============================================================================

/**
 * Toplantı durum rengini al
 * Get meeting status color
 */
export function getMeetingStatusColor(status: MeetingStatus): string {
  const colors: Record<MeetingStatus, string> = {
    scheduled: 'blue',
    in_progress: 'green',
    completed: 'gray',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
}

/**
 * Görev durum rengini al
 * Get task status color
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    pending: 'yellow',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
}

/**
 * Görev öncelik rengini al
 * Get task priority color
 */
export function getTaskPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };
  return colors[priority] || 'gray';
}

/**
 * Toplantı tarihini formatla
 * Format meeting date
 */
export function formatMeetingDate(meetingDate: string | Date): string {
  const date = typeof meetingDate === 'string' ? new Date(meetingDate) : meetingDate;
  
  if (isToday(date)) {
    return `Bugün, ${format(date, 'HH:mm', { locale: tr })}`;
  }
  
  if (isTomorrow(date)) {
    return `Yarın, ${format(date, 'HH:mm', { locale: tr })}`;
  }
  
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return format(date, 'EEEE, HH:mm', { locale: tr });
  }
  
  return format(date, 'd MMMM yyyy HH:mm', { locale: tr });
}

/**
 * Görev son teslim tarihini formatla
 * Format task due date
 */
export function formatDueDate(dueDate: string | Date): string {
  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  if (isToday(date)) {
    return 'Bugün';
  }
  
  if (isTomorrow(date)) {
    return 'Yarın';
  }
  
  return format(date, 'd MMMM', { locale: tr });
}

/**
 * Zamanı şimdiden uzaklık olarak formatla
 * Format time as distance to now
 */
export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

/**
 * Görev tamamlanma yüzdesini hesapla
 * Calculate task completion percentage
 */
export function calculateTaskCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

// ============================================================================
// STATISTICS / İSTATİSTİKLER
// ============================================================================

/**
 * Toplantı istatistiklerini hesapla
 * Calculate meeting statistics
 */
export function calculateMeetingStatistics(
  participants: MeetingParticipant[],
  tasks: Task[]
): Omit<MeetingStatistics, 'total_participants' | 'total_tasks' | 'completed_tasks' | 'pending_tasks' | 'high_priority_tasks'> {
  const confirmedParticipants = participants.filter(p => p.status === 'confirmed').length;
  const attendedParticipants = participants.filter(p => p.status === 'attended').length;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
  
  const attendanceRate = participants.length > 0 
    ? Math.round((attendedParticipants / participants.length) * 100)
    : 0;
  
  const taskCompletionRate = tasks.length > 0
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  
  return {
    confirmed_participants: confirmedParticipants,
    attended_participants: attendedParticipants,
    completed_tasks: completedTasks,
    pending_tasks: pendingTasks,
    high_priority_tasks: highPriorityTasks,
    attendance_rate: attendanceRate,
    task_completion_rate: taskCompletionRate
  };
}

/**
 * Katılım oranını hesapla
 * Calculate attendance rate
 */
export function calculateAttendanceRate(participants: MeetingParticipant[]): number {
  if (participants.length === 0) return 0;
  const attended = participants.filter(p => p.status === 'attended').length;
  return Math.round((attended / participants.length) * 100);
}

/**
 * Görev tamamlama oranını hesapla
 * Calculate task completion rate
 */
export function calculateTaskCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

// ============================================================================
// SORTING / SIRALAMA
// ============================================================================

/**
 * Toplantıları tarihe göre sırala
 * Sort meetings by date
 */
export function sortMeetingsByDate(meetings: Meeting[], ascending = false): Meeting[] {
  return [...meetings].sort((a, b) => {
    const dateA = new Date(a.meeting_date).getTime();
    const dateB = new Date(b.meeting_date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Görevleri önceliğe göre sırala
 * Sort tasks by priority
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Görevleri son teslim tarihine göre sırala
 * Sort tasks by due date
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}

// ============================================================================
// EXPORT FUNCTIONS / DIŞA AKTARMA
// ============================================================================

/**
 * Görevleri PDF olarak dışa aktar (placeholder)
 * Export tasks as PDF
 */
export async function exportTasksToPDF(meetingId: string): Promise<void> {
  // TODO: Implement PDF export using jsPDF or similar
  console.log('Exporting tasks to PDF for meeting:', meetingId);
}

/**
 * Toplantı raporunu Excel olarak dışa aktar (placeholder)
 * Export meeting report as Excel
 */
export async function exportMeetingReportToExcel(meetingId: string): Promise<void> {
  // TODO: Implement Excel export using xlsx library
  console.log('Exporting meeting report to Excel:', meetingId);
}

// ============================================================================
// VALIDATION / DOĞRULAMA
// ============================================================================

/**
 * Toplantı verilerini doğrula
 * Validate meeting data
 */
export function validateMeetingData(data: {
  title: string;
  meeting_date: string;
}): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length < 3) {
    return { valid: false, error: 'Toplantı başlığı en az 3 karakter olmalıdır' };
  }
  
  const meetingDate = new Date(data.meeting_date);
  if (isNaN(meetingDate.getTime())) {
    return { valid: false, error: 'Geçersiz tarih' };
  }
  
  if (meetingDate < new Date()) {
    return { valid: false, error: 'Toplantı tarihi geçmişte olamaz' };
  }
  
  return { valid: true };
}

/**
 * Görev verilerini doğrula
 * Validate task data
 */
export function validateTaskData(data: {
  title: string;
  assigned_to: string;
  meeting_id: string;
}): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length < 3) {
    return { valid: false, error: 'Görev başlığı en az 3 karakter olmalıdır' };
  }
  
  if (!data.assigned_to) {
    return { valid: false, error: 'Görev atanmış bir personel seçmelisiniz' };
  }
  
  if (!data.meeting_id) {
    return { valid: false, error: 'Geçersiz toplantı' };
  }
  
  return { valid: true };
}

// ============================================================================
// NOTIFICATION HELPERS / BİLDİRİM YARDIMCILARI
// ============================================================================

/**
 * Görev atama bildirim mesajı oluştur
 * Create task assignment notification message
 */
export function createTaskAssignedMessage(task: Task, assigneeName: string): string {
  return `${assigneeName}'e yeni bir görev atandı: ${task.title}`;
}

/**
 * Görev tamamlama bildirim mesajı oluştur
 * Create task completion notification message
 */
export function createTaskCompletedMessage(task: Task, assigneeName: string): string {
  return `${assigneeName} görevi tamamladı: ${task.title}`;
}

/**
 * Toplantı hatırlatma bildirim mesajı oluştur
 * Create meeting reminder notification message
 */
export function createMeetingReminderMessage(meeting: Meeting): string {
  const meetingTime = formatMeetingDate(meeting.meeting_date);
  return `"${meeting.title}" toplantısı ${meetingTime} başlıyor`;
}
