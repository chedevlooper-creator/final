/**
 * Toplantı Detay Sayfası (Güncellenmiş - Phase 2)
 * /dashboard/meetings/[id]
 */

'use client';

import { useState } from 'react';
import { useMeetingDetail, useMeetingTasks, useUpdateParticipantStatus, useUsersList } from '@/hooks/queries/use-meetings';
import { useMyTasks } from '@/hooks/queries/use-meetings';
import { useAuth } from '@/hooks/use-auth';
import { TaskStatus, ParticipantStatus } from '@/types/meeting.types';
import { formatMeetingDate, isMeetingActive } from '@/lib/meeting-utils';
import { TaskStatusLabels, TaskPriorityLabels } from '@/types/meeting.types';
import { TaskAssignmentModal } from '@/components/meetings/task-assignment-modal';
import { MeetingNotes } from '@/components/meetings/meeting-notes';
import { FileUpload } from '@/components/meetings/file-upload';
import { Voting } from '@/components/meetings/voting';


export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedTab, setSelectedTab] = useState<'details' | 'tasks' | 'participants'>('details');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const { data: meeting, isLoading: meetingLoading, error: meetingError } = useMeetingDetail((params as any).id);
  const { data: tasks, isLoading: tasksLoading } = useMeetingTasks((params as any).id);
  const { data: myTasks } = useMyTasks({ meeting_id: (params as any).id });
  const { data: users = [], isLoading: usersLoading } = useUsersList();
  const { user } = useAuth();
  const updateParticipantStatus = useUpdateParticipantStatus();

  if (meetingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Toplantı yüklenirken bir hata oluştu
      </div>
    );
  }

  const isCreator = meeting.created_by === user?.id;
  const isActive = isMeetingActive(meeting);

  const handleConfirmAttendance = async () => {
    try {
      await updateParticipantStatus.mutateAsync({
        meetingId: meeting.id,
        userId: user!.id,
        status: ParticipantStatus.CONFIRMED,
        availabilityConfirmed: true
      });
      alert('Katılımınız onaylandı!');
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: TaskStatus.COMPLETED })
      });
      if (response.ok) {
        alert('Görev tamamlandı!');
        window.location.reload();
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              {meeting.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatMeetingDate(meeting.meeting_date)}
            </div>
            {meeting.location && (
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {meeting.location}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isActive && !isCreator && (
            <button
              onClick={handleConfirmAttendance}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Katılıyorum
            </button>
          )}
          {isCreator && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setSelectedTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detaylar
          </button>
          <button
            onClick={() => setSelectedTab('tasks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Görevler ({tasks?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('participants')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'participants'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Katılımcılar ({meeting.participants?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('notes' as any)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              (selectedTab as any) === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notlar
          </button>
          <button
            onClick={() => setSelectedTab('files' as any)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              (selectedTab as any) === 'files'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Dosyalar
          </button>
          <button
            onClick={() => setSelectedTab('votes' as any)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              (selectedTab as any) === 'votes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Oylamalar
          </button>

        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'details' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Toplantı Açıklaması</h2>
          {meeting.description ? (
            <p className="text-gray-700 whitespace-pre-wrap">{meeting.description}</p>
          ) : (
            <p className="text-gray-500">Açıklama yok</p>
          )}
        </div>
      )}

      {selectedTab === 'tasks' && (
        <div className="space-y-4">
          {/* My Tasks Section */}
          {myTasks && myTasks.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Benim Görevlerim</h2>
              <div className="space-y-3">
                {myTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded ${
                          task.priority === 'high' || task.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {TaskPriorityLabels[task.priority as keyof typeof TaskPriorityLabels]}
                        </span>
                        {task.due_date && (
                          <span>Son teslim: {new Date(task.due_date).toLocaleDateString('tr-TR')}</span>
                        )}
                      </div>
                    </div>
                    {task.status !== TaskStatus.COMPLETED && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tamamlandı
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tasks Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tüm Görevler</h2>
              {isCreator && (
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Görev Ekle
                </button>
              )}
            </div>
            
            {tasksLoading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{task.assignee?.email || task.assigned_to}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded ${
                          task.status === TaskStatus.COMPLETED
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {TaskStatusLabels[task.status as keyof typeof TaskStatusLabels]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Henüz görev atanmamış</p>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'participants' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Katılımcılar</h2>
          {meeting.participants && meeting.participants.length > 0 ? (
            <div className="space-y-3">
              {meeting.participants.map((participant: any) => (
                <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                      {participant.user?.email?.[0].toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {participant.user?.full_name || participant.user?.email}
                      </h3>
                      <p className="text-sm text-gray-500">{participant.user?.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    participant.status === ParticipantStatus.CONFIRMED
                      ? 'bg-green-100 text-green-700'
                      : participant.status === ParticipantStatus.ATTENDED
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Henüz katılımcı yok</p>
          )}
        </div>
      )}

      {(selectedTab as any) === 'notes' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Toplantı Notları</h2>
          <MeetingNotes meetingId={meeting.id} isCreator={isCreator} />
        </div>
      )}

      {(selectedTab as any) === 'files' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Dosyalar</h2>
          <FileUpload meetingId={meeting.id} />
        </div>
      )}

      {(selectedTab as any) === 'votes' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Oylamalar</h2>
          <Voting meetingId={meeting.id} isCreator={isCreator} />
        </div>
      )}

      {/* Task Assignment Modal - Real Users */}
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        meetingId={meeting.id}
        availableUsers={users}
      />
    </div>
  );
}
