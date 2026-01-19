'use client';

/**
 * Görevlerim Sayfası
 * My Tasks Page
 * 
 * Kullanıcının atanmış tüm görevlerini gösterir
 * Shows all tasks assigned to the user
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Flag,
  Filter,
  Search,
  User,
  MapPin
} from 'lucide-react';
import { useMyTasksAdvanced, useUpdateTaskStatus } from '@/hooks/queries/use-meetings';
import { TaskStatus, TaskPriority } from '@/types/meeting.types';
import { formatMeetingDate } from '@/lib/meeting-utils';

export default function MyTasksPage() {
  // Filtre state'leri
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showOverdue, setShowOverdue] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hook'lar
  const { data: tasks, isLoading, error } = useMyTasksAdvanced({
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    search: searchQuery || undefined,
    overdue: showOverdue || undefined,
  });

  const updateTaskStatus = useUpdateTaskStatus();

  // Görev durumunu güncelle
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus.mutateAsync({ taskId, status: newStatus });
  };

  // Görev öncelik renkleri
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'text-red-600 bg-red-50 border-red-200';
      case TaskPriority.HIGH:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TaskPriority.LOW:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Görev durum ikonları
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case TaskStatus.IN_PROGRESS:
        return <Circle className="w-5 h-5 text-blue-600 fill-current" />;
      case TaskStatus.PENDING:
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Tarihi formatla
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date < today) {
        return `Gecikmiş: ${format(date, 'd MMM', { locale: tr })}`;
      } else if (date.toDateString() === today.toDateString()) {
        return 'Bugün';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Yarın';
      } else {
        return format(date, 'd MMM yyyy', { locale: tr });
      }
    } catch {
      return dateStr;
    }
  };

  // Gecikmiş görev kontrolü
  const isOverdue = (task: any) => {
    if (task.status === TaskStatus.COMPLETED) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Görevlerim</h1>
                <p className="text-sm text-gray-500">
                  {tasks?.length || 0} görev
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Görev ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Durum Filtresi */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value={TaskStatus.PENDING}>Bekliyor</option>
                <option value={TaskStatus.IN_PROGRESS}>Devam Ediyor</option>
                <option value={TaskStatus.COMPLETED}>Tamamlandı</option>
              </select>
            </div>

            {/* Öncelik Filtresi */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value={TaskPriority.URGENT}>Acil</option>
                <option value={TaskPriority.HIGH}>Yüksek</option>
                <option value={TaskPriority.MEDIUM}>Orta</option>
                <option value={TaskPriority.LOW}>Düşük</option>
              </select>
            </div>

            {/* Gecikmiş Görevler */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOverdue(!showOverdue)}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  showOverdue
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Gecikmiş</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Hata</h3>
                <p className="text-sm text-red-700">
                  Görevler yüklenirken bir hata oluştu.
                </p>
              </div>
            </div>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Görev Bulunamadı</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || showOverdue
                ? 'Seçtiğiniz filtrelerle eşleşen görev yok.'
                : 'Henüz size atanmış bir görev yok.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                  isOverdue(task) ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left: Task Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority === 'critical' && '⚠️ '}
                          {task.priority === 'high' && '🔴 '}
                          {task.priority === 'medium' && '🟡 '}
                          {task.priority === 'low' && '🟢 '}
                          {task.priority.toUpperCase()}
                        </span>
                        {isOverdue(task) && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                            ⚠️ GEÇİKMIŞ
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Task Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Son Tarih: {formatDate(task.due_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            Toplantı:{' '}
                            <a
                              href={`/dashboard/meetings/${task.meeting.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {task.meeting.title}
                            </a>
                          </span>
                        </div>
                        {task.category && (
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4" />
                            <span>{task.category}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {task.status !== TaskStatus.COMPLETED && (
                        <button
                          onClick={() => handleStatusChange(task.id, TaskStatus.COMPLETED)}
                          disabled={updateTaskStatus.isPending}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Tamamlandı</span>
                        </button>
                      )}
                      {task.status === TaskStatus.PENDING && (
                        <button
                          onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                          disabled={updateTaskStatus.isPending}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Başla</span>
                        </button>
                      )}
                      {task.status === TaskStatus.COMPLETED && (
                        <button
                          onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                          disabled={updateTaskStatus.isPending}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Circle className="w-4 h-4" />
                          <span>Yeniden Aç</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
