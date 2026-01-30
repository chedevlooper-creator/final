'use client'

import { useState } from 'react'
import { useMyTasks, useCompleteTask } from '@/hooks/queries/use-tasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Loader2, Calendar, User, CheckCircle2, Clock } from 'lucide-react'
import type { MyTaskAssignment, TaskPriority, TaskCategory, TaskAssignmentStatus } from '@/types/task.types'

const priorityLabels: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Orta', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Acil', color: 'bg-red-100 text-red-800' },
}

const categoryLabels: Record<TaskCategory, string> = {
  field_work: 'Saha Çalışması',
  office_work: 'Ofis İşi',
  meeting: 'Toplantı',
  call: 'Telefon Görüşmesi',
  research: 'Araştırma',
  other: 'Diğer',
}

const statusLabels: Record<TaskAssignmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Bekliyor', color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4" /> },
  in_progress: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4" /> },
  overdue: { label: 'Gecikti', color: 'bg-red-100 text-red-800', icon: <Clock className="w-4 h-4" /> },
  rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: <Clock className="w-4 h-4" /> },
}

function TaskCard({ assignment, onComplete }: { assignment: MyTaskAssignment; onComplete: (id: string, notes: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isChecked, setIsChecked] = useState(false)

  const { task, status, assigned_at, completed_at } = assignment
  const isCompleted = status === 'completed'
  const isOverdue = new Date(task.due_date) < new Date() && !isCompleted

  const handleComplete = () => {
    if (!isChecked) {
      toast.error('Lütfen tamamlandı onay kutusunu işaretleyin')
      return
    }
    onComplete(assignment.id, notes)
    setIsOpen(false)
  }

  return (
    <Card className={isCompleted ? 'opacity-75' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityLabels[task.priority].color}>
                {priorityLabels[task.priority].label}
              </Badge>
              {task.category && (
                <Badge variant="outline">{categoryLabels[task.category]}</Badge>
              )}
              <Badge className={statusLabels[status].color}>
                <span className="flex items-center gap-1">
                  {statusLabels[status].icon}
                  {statusLabels[status].label}
                </span>
              </Badge>
            </div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          {!isCompleted && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Tamamla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Görevi Tamamla</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>{task.title}</strong> görevini tamamlamak üzeresiniz.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirm"
                      checked={isChecked}
                      onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                    />
                    <label htmlFor="confirm" className="text-sm font-medium">
                      Bu görevi tamamladım
                    </label>
                  </div>
                  <Textarea
                    placeholder="Tamamlama notları (isteğe bağlı)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button onClick={handleComplete} className="w-full">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Tamamlandı Olarak İşaretle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {isOverdue ? 'Gecikti: ' : 'Bitiş: '}
              {format(new Date(task.due_date), 'd MMMM yyyy', { locale: tr })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>Atayan: {task.created_by?.name || task.created_by?.email}</span>
          </div>
        </div>

        {completed_at && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              <strong>Tamamlandı:</strong>{' '}
              {format(new Date(completed_at), 'd MMMM yyyy HH:mm', { locale: tr })}
            </p>
            {assignment.completion_notes && (
              <p className="text-sm text-green-700 mt-1">
                <strong>Not:</strong> {assignment.completion_notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MyTasksPage() {
  const [filter, setFilter] = useState<string>('all')
  const { data: tasks, isLoading } = useMyTasks(filter === 'all' ? undefined : filter)
  const completeTask = useCompleteTask()

  const handleComplete = (id: string, notes: string) => {
    completeTask.mutate(
      { id, data: { completion_notes: notes } },
      {
        onSuccess: () => {
          toast.success('Görev başarıyla tamamlandı!')
        },
        onError: (error) => {
          toast.error(error.message || 'Görev tamamlanırken hata oluştu')
        },
      }
    )
  }

  const filteredTasks = tasks?.filter((task) => {
    if (filter === 'all') return true
    if (filter === 'pending') return task.status === 'pending' || task.status === 'in_progress'
    if (filter === 'completed') return task.status === 'completed'
    return true
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Görevlerim</h1>
        <p className="text-muted-foreground mt-1">
          Size atanan görevleri görüntüleyin ve tamamlayın
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Tümü
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Bekleyenler
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Tamamlananlar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredTasks?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === 'completed'
                ? 'Henüz tamamlanan görev yok'
                : filter === 'pending'
                ? 'Bekleyen göreviniz yok'
                : 'Henüz size atanmış görev yok'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks?.map((assignment) => (
            <TaskCard
              key={assignment.id}
              assignment={assignment}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
