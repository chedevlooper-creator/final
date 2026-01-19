'use client';

/**
 * Toplantı Notları Bileşeni
 * Meeting Notes Component
 * 
 * Kullanıcıların toplantı sırasında not almasını sağlar
 * Allows users to take notes during meetings
 */

import { useState } from 'react';
import { useMeetingNotes, useCreateNote } from '@/hooks/queries/use-meetings';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FileText, Plus, Lock, Eye, Trash2, Edit3 } from 'lucide-react';

interface MeetingNotesProps {
  meetingId: string;
  isCreator: boolean;
}

export function MeetingNotes({ meetingId, isCreator }: MeetingNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: notes, isLoading } = useMeetingNotes(meetingId);
  const createNote = useCreateNote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await createNote.mutateAsync({
      meeting_id: meetingId,
      note: newNote,
      is_private: isPrivate,
    });

    setNewNote('');
    setIsPrivate(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Not Ekle</span>
        </button>
      )}

      {/* Add Note Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Notunuzu buraya yazın..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            autoFocus
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Özel Not</span>
            </label>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewNote('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!newNote.trim() || createNote.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createNote.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      ) : !notes || notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Henüz not eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note: any) => (
            <div
              key={note.id}
              className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                note.is_private ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
              }`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {note.user?.full_name?.[0] || note.user?.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {note.user?.full_name || note.user?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(note.created_at), 'd MMM yyyy, HH:mm', { locale: tr })}
                    </p>
                  </div>
                </div>
                {note.is_private && (
                  <div className="flex items-center space-x-1 text-purple-600" title="Özel Not">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-medium">Özel</span>
                  </div>
                )}
              </div>

              {/* Note Content */}
              <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
