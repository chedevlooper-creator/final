'use client';

/**
 * Toplantı İstatistikleri Sayfası
 * Meeting Statistics Dashboard
 * 
 * Toplantı ve görev performans metriklerini gösterir
 * Shows meeting and task performance metrics
 */

import { useMemo } from 'react';
import { useMeetingsList, useMeetingStatistics } from '@/hooks/queries/use-meetings';
import { useMyTasks } from '@/hooks/queries/use-meetings';
import { MeetingStatus, TaskStatus, TaskPriority } from '@/types/meeting.types';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Target,
  AlertCircle
} from 'lucide-react';

export default function MeetingStatisticsPage() {
  // Toplantı verileri
  const { data: meetingsData, isLoading: meetingsLoading } = useMeetingsList({
    limit: 100
  });

  // Benim görevlerim
  const { data: myTasks, isLoading: tasksLoading } = useMyTasks();

  // İstatistik hesaplamaları
  const stats = useMemo(() => {
    if (!meetingsData?.data) return null;

    const meetings = meetingsData.data;
    
    // Toplantı durumu dağılımı
    const statusDistribution = {
      scheduled: meetings.filter(m => m.status === MeetingStatus.SCHEDULED).length,
      in_progress: meetings.filter(m => m.status === MeetingStatus.IN_PROGRESS).length,
      completed: meetings.filter(m => m.status === MeetingStatus.COMPLETED).length,
      cancelled: meetings.filter(m => m.status === MeetingStatus.CANCELLED).length,
    };

    // Toplam toplantı sayısı
    const totalMeetings = meetings.length;
    const completedMeetings = statusDistribution.completed;
    const completionRate = totalMeetings > 0 
      ? Math.round((completedMeetings / totalMeetings) * 100) 
      : 0;

    // Görev istatistikleri
    const taskStats = {
      total: myTasks?.length || 0,
      completed: myTasks?.filter((t: any) => t.status === TaskStatus.COMPLETED).length || 0,
      inProgress: myTasks?.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length || 0,
      pending: myTasks?.filter((t: any) => t.status === TaskStatus.PENDING).length || 0,
    };

    const taskCompletionRate = taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

    // Öncelik bazlı görev dağılımı
    const priorityDistribution = {
      urgent: myTasks?.filter((t: any) => t.priority === TaskPriority.URGENT).length || 0,
      high: myTasks?.filter((t: any) => t.priority === TaskPriority.HIGH).length || 0,
      medium: myTasks?.filter((t: any) => t.priority === TaskPriority.MEDIUM).length || 0,
      low: myTasks?.filter((t: any) => t.priority === TaskPriority.LOW).length || 0,
    };

    // Bu haftaki toplantılar
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const thisWeekMeetings = meetings.filter(m => {
      const meetingDate = new Date(m.meeting_date);
      return meetingDate >= startOfWeek;
    }).length;

    return {
      totalMeetings,
      completedMeetings,
      completionRate,
      statusDistribution,
      taskStats,
      taskCompletionRate,
      priorityDistribution,
      thisWeekMeetings,
    };
  }, [meetingsData, myTasks]);

  if (meetingsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        İstatistikler yüklenemedi
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">İstatistikler</h1>
              <p className="text-sm text-gray-500">Toplantı ve görev performans metrikleri</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toplam Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Toplam Toplantılar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalMeetings}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Toplam Toplantı</h3>
            <p className="text-xs text-gray-500 mt-1">Bu hafta: {stats.thisWeekMeetings}</p>
          </div>

          {/* Tamamlanan Toplantılar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.completedMeetings}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Tamamlanan</h3>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs font-semibold text-green-600">{stats.completionRate}%</span>
            </div>
          </div>

          {/* Toplam Görevler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.taskStats.total}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Toplam Görev</h3>
            <div className="flex items-center mt-1">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs font-semibold text-green-600">{stats.taskStats.completed} tamamlandı</span>
            </div>
          </div>

          {/* Bekleyen Görevler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.taskStats.pending + stats.taskStats.inProgress}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Bekleyen Görev</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats.taskStats.inProgress} devam ediyor
            </p>
          </div>
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Toplantı Durum Dağılımı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Toplantı Durum Dağılımı
            </h3>
            <div className="h-64">
              <div className="space-y-4">
                {Object.entries(stats.statusDistribution).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          status === 'completed' ? 'bg-green-600' :
                          status === 'scheduled' ? 'bg-blue-600' :
                          status === 'in_progress' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${stats.totalMeetings > 0 ? (count / stats.totalMeetings) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Görev Durum Dağılımı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Görev Durum Dağılımı
            </h3>
            <div className="h-64">
              <div className="space-y-4">
                {[
                  { label: 'Tamamlandı', count: stats.taskStats.completed, color: 'bg-green-600', icon: CheckCircle2 },
                  { label: 'Devam Ediyor', count: stats.taskStats.inProgress, color: 'bg-blue-600', icon: Clock },
                  { label: 'Bekliyor', count: stats.taskStats.pending, color: 'bg-gray-400', icon: AlertCircle },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${item.color}`}
                        style={{ width: `${stats.taskStats.total > 0 ? (item.count / stats.taskStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Görev Öncelik Dağılımı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Görev Öncelik Dağılımı
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Kritik', count: stats.priorityDistribution.critical, color: 'bg-red-100 text-red-700 border-red-200' },
                { label: 'Yüksek', count: stats.priorityDistribution.high, color: 'bg-orange-100 text-orange-700 border-orange-200' },
                { label: 'Orta', count: stats.priorityDistribution.medium, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { label: 'Düşük', count: stats.priorityDistribution.low, color: 'bg-green-100 text-green-700 border-green-200' },
              ].map((item) => (
                <div key={item.label} className={`border-2 rounded-lg p-4 ${item.color}`}>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{item.count}</div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performans Özeti */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Genel Performans</h3>
              <p className="text-blue-100 text-sm">
                Toplantı tamamlama: %{stats.completionRate} • Görev tamamlama: %{stats.taskCompletionRate}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {Math.round((stats.completionRate + stats.taskCompletionRate) / 2)}%
              </div>
              <div className="text-sm text-blue-100">Ortalama</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
