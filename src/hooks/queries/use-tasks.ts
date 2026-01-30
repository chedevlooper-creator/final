import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  Task, 
  TaskFilter, 
  CreateTaskInput, 
  UpdateTaskInput,
  MyTaskAssignment,
  CompleteTaskInput,
  TeamStatsResponse,
  ActivityLog,
  ActivityFilter,
  TeamMemberStats
} from '@/types/task.types'
import { safeJsonParse } from '@/lib/utils'

// Tüm görevleri getir (admin/owner için)
export function useTasks(filters?: TaskFilter) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)

      const response = await fetch(`/api/tasks?${params.toString()}`)
      if (!response.ok) throw new Error('Görevler alınamadı')
      const result = await safeJsonParse<{ data: Task[] }>(response)
      return result.data
    },
  })
}

// Tekil görev getir
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${id}`)
      if (!response.ok) throw new Error('Görev alınamadı')
      const result = await safeJsonParse<{ data: Task }>(response)
      return result.data
    },
    enabled: !!id,
  })
}

// Görev oluştur
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Görev oluşturulamadı')
      }
      const result = await safeJsonParse<{ data: Task }>(response)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Görev güncelle
export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Görev güncellenemedi')
      }
      const result = await safeJsonParse<{ data: Task }>(response)
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
    },
  })
}

// Görev sil
export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Görev silinemedi')
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Benim görevlerim (çalışan için)
export function useMyTasks(status?: string) {
  return useQuery({
    queryKey: ['my-tasks', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)

      const response = await fetch(`/api/my-tasks?${params.toString()}`)
      if (!response.ok) throw new Error('Görevler alınamadı')
      const result = await safeJsonParse<{ data: MyTaskAssignment[] }>(response)
      return result.data
    },
  })
}

// Görev tamamla
export function useCompleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompleteTaskInput }) => {
      const response = await fetch(`/api/my-tasks?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await safeJsonParse<{ error?: string }>(response)
        throw new Error(error.error || 'Görev tamamlanamadı')
      }
      const result = await safeJsonParse<{ data: unknown }>(response)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Takım istatistikleri
export function useTeamStats() {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/team-stats')
      if (!response.ok) throw new Error('Takım istatistikleri alınamadı')
      const result = await safeJsonParse<{ data: TeamStatsResponse }>(response)
      return result.data
    },
  })
}

// Takım üyeleri
export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/team')
      if (!response.ok) throw new Error('Takım üyeleri alınamadı')
      const result = await safeJsonParse<{ data: TeamMemberStats['user'][] }>(response)
      return result.data
    },
  })
}

// Aktivite logları
export function useActivityLogs(filters?: ActivityFilter, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['activity-logs', filters, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('offset', offset.toString())
      
      if (filters?.user_id) params.append('user_id', filters.user_id)
      if (filters?.action) params.append('action', filters.action)
      if (filters?.entity_type) params.append('entity_type', filters.entity_type)
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)

      const response = await fetch(`/api/activities?${params.toString()}`)
      if (!response.ok) throw new Error('Aktivite logları alınamadı')
      return await safeJsonParse<{ data: ActivityLog[]; pagination: { total: number; hasMore: boolean } }>(response)
    },
  })
}
