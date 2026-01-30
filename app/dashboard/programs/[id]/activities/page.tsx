'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Activity, 
  Plus, 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const activityTypes = [
  { value: 'distribution', label: 'Dağıtım' },
  { value: 'visit', label: 'Ziyaret' },
  { value: 'meeting', label: 'Toplantı' },
  { value: 'training', label: 'Eğitim' },
  { value: 'event', label: 'Etkinlik' },
  { value: 'assessment', label: 'Değerlendirme' },
  { value: 'procurement', label: 'Tedarik' },
  { value: 'other', label: 'Diğer' },
]

const statusOptions = [
  { value: 'planned', label: 'Planlandı', color: 'default' },
  { value: 'in_progress', label: 'Devam Ediyor', color: 'warning' },
  { value: 'completed', label: 'Tamamlandı', color: 'success' },
  { value: 'cancelled', label: 'İptal', color: 'destructive' },
]

export default function ProgramActivitiesPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params.id as string
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: '',
    planned_date: '',
    planned_time: '',
    location: '',
    expected_participants: '',
    cost: '',
  })

  // Program bilgisi
  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('name')
        .eq('id', programId)
        .single()
      if (error) throw error
      return data
    },
  })

  // Aktiviteler
  const { data: activities, isLoading } = useQuery({
    queryKey: ['program-activities', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_activities')
        .select('*')
        .eq('program_id', programId)
        .order('planned_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  // Yeni aktivite ekleme
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch(`/api/programs/${programId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Aktivite eklenemedi')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Aktivite eklendi')
      queryClient.invalidateQueries({ queryKey: ['program-activities', programId] })
      setIsDialogOpen(false)
      resetForm()
    },
    onError: () => toast.error('Aktivite eklenirken hata oluştu'),
  })

  // Aktivite güncelleme
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const res = await fetch(`/api/programs/${programId}/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Aktivite güncellenemedi')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Aktivite güncellendi')
      queryClient.invalidateQueries({ queryKey: ['program-activities', programId] })
      setIsDialogOpen(false)
      setEditingActivity(null)
      resetForm()
    },
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      activity_type: '',
      planned_date: '',
      planned_time: '',
      location: '',
      expected_participants: '',
      cost: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const values = {
      ...formData,
      expected_participants: formData.expected_participants ? parseInt(formData.expected_participants) : null,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
    }
    
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (activity: any) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type,
      planned_date: activity.planned_date,
      planned_time: activity.planned_time || '',
      location: activity.location || '',
      expected_participants: activity.expected_participants?.toString() || '',
      cost: activity.cost?.toString() || '',
    })
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(o => o.value === status)
    return <Badge variant={option?.color as any}>{option?.label || status}</Badge>
  }

  const getActivityTypeLabel = (type: string) => {
    return activityTypes.find(t => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${program?.name || 'Program'} - Aktiviteler`}
        description="Program aktivitelerini yönetin"
        icon={Activity}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/programs/${programId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Programa Dön
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingActivity(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Aktivite
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingActivity ? 'Aktivite Düzenle' : 'Yeni Aktivite'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Aktivite Adı</Label>
                    <Input 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Örn: Gıda Dağıtımı"
                      required
                    />
                  </div>
                  <div>
                    <Label>Aktivite Tipi</Label>
                    <Select 
                      value={formData.activity_type} 
                      onValueChange={val => setFormData({...formData, activity_type: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tip seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tarih</Label>
                      <Input 
                        type="date"
                        value={formData.planned_date}
                        onChange={e => setFormData({...formData, planned_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Saat</Label>
                      <Input 
                        type="time"
                        value={formData.planned_time}
                        onChange={e => setFormData({...formData, planned_time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Lokasyon</Label>
                    <Input 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="Aktivite lokasyonu"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Beklenen Katılımcı</Label>
                      <Input 
                        type="number"
                        value={formData.expected_participants}
                        onChange={e => setFormData({...formData, expected_participants: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Tahmini Maliyet (₺)</Label>
                      <Input 
                        type="number"
                        value={formData.cost}
                        onChange={e => setFormData({...formData, cost: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <Textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Aktivite detayları..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingActivity ? 'Güncelle' : 'Ekle'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-success/10' : 
                    activity.status === 'in_progress' ? 'bg-warning/10' : 
                    activity.status === 'cancelled' ? 'bg-destructive/10' : 'bg-muted'
                  }`}>
                    <Activity className={`h-5 w-5 ${
                      activity.status === 'completed' ? 'text-success' : 
                      activity.status === 'in_progress' ? 'text-warning' : 
                      activity.status === 'cancelled' ? 'text-destructive' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(activity.planned_date).toLocaleDateString('tr-TR')}
                        {activity.planned_time && ` ${activity.planned_time}`}
                      </span>
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {activity.location}
                        </span>
                      )}
                      {activity.expected_participants && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {activity.expected_participants} katılımcı
                        </span>
                      )}
                      {activity.cost > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Intl.NumberFormat('tr-TR').format(activity.cost)} ₺
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {getActivityTypeLabel(activity.activity_type)}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(activity)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </DropdownMenuItem>
                    {activity.status !== 'completed' && (
                      <DropdownMenuItem onClick={() => updateMutation.mutate({
                        id: activity.id,
                        values: { status: 'completed', actual_date: new Date().toISOString().split('T')[0] }
                      })}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Tamamlandı İşaretle
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Henüz aktivite bulunmuyor</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Aktiviteyi Ekle
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
