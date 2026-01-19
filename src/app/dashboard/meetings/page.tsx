/**
 * Toplantılar Sayfası
 * /dashboard/meetings
 */

'use client';

import { useState } from 'react';
import { useMeetingsList } from '@/hooks/queries/use-meetings';
import { MeetingStatus } from '@/types/meeting.types';
import { MeetingStatusLabels } from '@/types/meeting.types';
import { formatMeetingDate } from '@/lib/meeting-utils';
import Link from 'next/link';

export default function MeetingsPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const { data, isLoading, error } = useMeetingsList({
    status: filter === 'all' ? undefined : filter as MeetingStatus,
    upcoming: filter === 'upcoming' ? true : undefined
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Toplantılar yüklenirken bir hata oluştu: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toplantılar</h1>
          <p className="text-gray-600 mt-1">Dernek toplantılarını buradan yönetebilirsiniz</p>
        </div>
        <Link
          href="/dashboard/meetings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Toplantı
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Gelecek
        </button>
        <button
          onClick={() => setFilter(MeetingStatus.SCHEDULED)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === MeetingStatus.SCHEDULED
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Planlandı
        </button>
        <button
          onClick={() => setFilter(MeetingStatus.IN_PROGRESS)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === MeetingStatus.IN_PROGRESS
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Devam Ediyor
        </button>
        <button
          onClick={() => setFilter(MeetingStatus.COMPLETED)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === MeetingStatus.COMPLETED
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tamamlandı
        </button>
      </div>

      {/* Meetings List */}
      {data && data.data.length > 0 ? (
        <div className="grid gap-4">
          {data.data.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/dashboard/meetings/${meeting.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{meeting.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        meeting.status === MeetingStatus.SCHEDULED
                          ? 'bg-blue-100 text-blue-700'
                          : meeting.status === MeetingStatus.IN_PROGRESS
                          ? 'bg-green-100 text-green-700'
                          : meeting.status === MeetingStatus.COMPLETED
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {MeetingStatusLabels[meeting.status]}
                    </span>
                  </div>
                  
                  {meeting.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{meeting.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatMeetingDate(meeting.meeting_date)}
                    </div>
                    
                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {meeting.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Toplantı bulunmuyor</h3>
          <p className="mt-1 text-sm text-gray-500">Henüz hiç toplantı oluşturulmadı.</p>
          <div className="mt-6">
            <Link
              href="/dashboard/meetings/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              İlk Toplantıyı Oluştur
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`px-4 py-2 rounded-lg ${
                page === data.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
