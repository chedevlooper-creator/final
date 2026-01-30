'use client'

import { useState } from 'react'
import { useTasks, useCreateTask, useDeleteTask, useTeamMembers } from '@/hooks/queries/use-tasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Plus, Trash2, Users, Calendar, Loader2, CheckCircle2, Clock } from 'lucide-react'
import type { Task, TaskPriority, TaskCategory, TaskStatus, CreateTaskInput } from '@/types/task.types'
import Link from 'next/link'

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

function TaskList({ tasks, onDelete }: { tasks: Task[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id}>
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
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status === 'completed' ? 'Tamamlandı' : 'Aktif'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
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

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Bitiş: {format(new Date(task.due_date), 'd MMMM yyyy', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Atanan: {task.assignments?.length || 0} kişi</span>
                </div>
              </div>
              
              {task.assignments && task.assignments.some(a => a.status === 'completed') && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">
                    {task.assignments.filter(a => a.status === 'completed').length}/{task.assignments.length} tamamlandı
                  </span>
                </div>
              )}
            </div>

            {/* Atanan Kişiler */}
            {task.assignments && task.assignments.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Atananlar:</p>
                <div className="flex flex-wrap gap-2">
                  {task.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span>{assignment.assigned_to_user?.name || assignment.assigned_to_user?.email}</span>
                      {assignment.status === 'completed' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CreateTaskDialog({ onCreated }: { onCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateTaskInput>>({
    priority: 'medium',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const { data: teamMembers } = useTeamMembers()
  const createTask = useCreateTask()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || selectedAssignees.length === 0) {
      toast.error('Başlık ve en az bir atanan gerekli')
      return
    }

    createTask.mutate(
      {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as TaskPriority,
        category: formData.category as TaskCategory,
        tags,
        due_date: formData.due_date!,
        assignees: selectedAssignees,
      },
      {
        onSuccess: () => {
          toast.success('Görev başarıyla oluşturuldu!')
          setIsOpen(false)
          setFormData({
            priority: 'medium',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          })
          setSelectedAssignees([])
          setTags([])
          onCreated()
        },
        onError: (error) => {
          toast.error(error.message || 'Görev oluşturulurken hata oluştu')
        },
      }
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          Yeni Görev
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Görev Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Görev Başlığı *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Görev başlığını girin"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Görev açıklaması..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Öncelik</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field_work">Saha Çalışması</SelectItem>
                  <SelectItem value="office_work">Ofis İşi</SelectItem>
                  <SelectItem value="meeting">Toplantı</SelectItem>
                  <SelectItem value="call">Telefon Görüşmesi</SelectItem>
                  <SelectItem value="research">Araştırma</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="due_date">Bitiş Tarihi *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Etiketler</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Etiket ekle..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Ekle
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  #{tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Atananlar *</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {teamMembers?.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={selectedAssignees.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignees([...selectedAssignees, member.id])
                      } else {
                        setSelectedAssignees(selectedAssignees.filter(id => id !== member.id))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{member.name || member.email}</span>
                    <span className="text-sm text-muted-foreground ml-2">({member.email})</span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedAssignees.length} kişi seçildi
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createTask.isPending}
          >
            {createTask.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Görev Oluştur
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TasksPage() {
  const { data: tasks, isLoading, refetch } = useTasks()
  const deleteTask = useDeleteTask()

  const handleDelete = (id: string) => {
    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      deleteTask.mutate(id, {
        onSuccess: () => {
          toast.success('Görev silindi')
        },
        onError: (error) => {
          toast.error(error.message || 'Görev silinirken hata oluştu')
        },
      })
    }
  }

  const activeTasks = tasks?.filter(t => t.status === 'active') || []
  const completedTasks = tasks?.filter(t => t.status === 'completed') || []

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Görev Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Takımınıza görev atayın ve ilerlemeyi takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/team-activity">
              <Users className="w-4 h-4 mr-1" />
              Takım Aktivitesi
            </Link>
          </Button>
          <CreateTaskDialog onCreated={refetch} />
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Aktif Görevler ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Tamamlananlar ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : activeTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aktif görev bulunmuyor</p>
                <CreateTaskDialog onCreated={refetch} />
              </CardContent>
            </Card>
          ) : (
            <TaskList tasks={activeTasks} onDelete={handleDelete} />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : completedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz tamamlanan görev yok</p>
              </CardContent>
            </Card>
          ) : (
            <TaskList tasks={completedTasks} onDelete={handleDelete} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
