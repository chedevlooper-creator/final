/**
 * Görev Atama Modal Component'i
 * TaskAssignmentModal
 */

'use client';

import { useState } from 'react';
import { useCreateTask } from '@/hooks/queries/use-meetings';
import { TaskPriority } from '@/types/meeting.types';
import { TaskPriorityLabels } from '@/types/meeting.types';
import { validateTaskData } from '@/lib/meeting-utils';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  availableUsers: Array<{ id: string; email: string; full_name?: string }>;
}

export function TaskAssignmentModal({
  isOpen,
  onClose,
  meetingId,
  availableUsers
}: TaskAssignmentModalProps) {
  const createTask = useCreateTask();

  const [formData, setFormData] = useState({
    assigned_to: '',
    title: '',
    description: '',
    category: '',
    priority: TaskPriority.MEDIUM,
    due_date: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const validation = validateTaskData({
      title: formData.title,
      assigned_to: formData.assigned_to,
      meeting_id: meetingId
    });

    if (!validation.valid) {
      setErrors({ general: validation.error || 'Bir hata oluştu' });
      return;
    }

    setIsSubmitting(true);

    try {
      await createTask.mutateAsync({
        meeting_id: meetingId,
        assigned_to: formData.assigned_to,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined
      });

      // Reset form
      setFormData({
        assigned_to: '',
        title: '',
        description: '',
        category: '',
        priority: TaskPriority.MEDIUM,
        due_date: ''
      });

      onClose();
      
      // Show success message
      alert('Görev başarıyla atandı!');
    } catch (error: any) {
      setErrors({ general: error.message || 'Görev atanırken bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Yeni Görev Ata</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Assignee */}
          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
              Personel <span className="text-red-500">*</span>
            </label>
            <select
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Personel seçin...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Görev Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Örn: Toplantı notlarını hazırla"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Görev Açıklaması
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Görev detayları..."
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Kategori seçin...</option>
              <option value="yönetim">Yönetim</option>
              <option value="lojistik">Lojistik</option>
              <option value="finans">Finans</option>
              <option value="iletişim">İletişim</option>
              <option value="raporlama">Raporlama</option>
              <option value="diğer">Diğer</option>
            </select>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Öncelik
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={TaskPriority.LOW}>{TaskPriorityLabels[TaskPriority.LOW]}</option>
                <option value={TaskPriority.MEDIUM}>{TaskPriorityLabels[TaskPriority.MEDIUM]}</option>
                <option value={TaskPriority.HIGH}>{TaskPriorityLabels[TaskPriority.HIGH]}</option>
                <option value={TaskPriority.URGENT}>{TaskPriorityLabels[TaskPriority.URGENT]}</option>
              </select>
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                Son Teslim Tarihi
              </label>
              <input
                type="date"
                id="due_date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Atanıyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Görev Ata
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
