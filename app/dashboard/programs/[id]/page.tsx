'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  ClipboardList, 
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  Target,
  TrendingUp,
  MapPin,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Plus,
  FileText,
  BarChart3
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planlama', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  active: { label: 'Aktif', color: 'text-green-600', bgColor: 'bg-green-50' },
  paused: { label: 'Duraklatıldı', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  completed: { label: 'Tamamlandı', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  cancelled: { label: 'İptal', color: 'text-red-600', bgColor: 'bg-red-50' },
}

const typeLabels: Record<string, string> = {
  ongoing: 'Sürekli Program',
  project: 'Proje',
  campaign: 'Kampanya',
  emergency: 'Acil Yardım',
}

const categoryLabels: Record<string, string> = {
  education: 'Eğitim',
  health: 'Sağlık',
  food: 'Gıda',
  housing: 'Barınma',
  clothing: 'Giyim',
  financial_aid: 'Maddi Yardım',
  orphan_care: 'Yetim Bakımı',
  religious: 'Dini',
  cultural: 'Kültürel',
  other: 'Diğer',
}

export default function ProgramDetailPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params['id'] as string
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('overview')

  // Program detayı
  const { data: program, isLoading } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          manager:profiles!programs_program_manager_id_fkey(id, name, email),
          coordinator:profiles!programs_coordinator_id_fkey(id, name, email),
          city:cities(id, name),
          district:districts(id, name)
        `)
        .eq('id', programId)
        .single()
      
      if (error) throw error
      return data
    },
  })

  // Program istatistikleri
  const { data: stats } = useQuery({
    queryKey: ['program-stats', programId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_program_stats', { p_program_id: programId })
      if (error) throw error
      return data
    },
  })

  // Son aktiviteler
  const { data: activities } = useQuery({
    queryKey: ['program-activities', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_activities')
        .select('*')
        .eq('program_id', programId)
        .order('planned_date', { ascending: false })
        .limit(5)
      
      if (error) throw error
      return data
    },
  })

  // Faydalanıcılar
  const { data: beneficiaries } = useQuery({
    queryKey: ['program-beneficiaries', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_beneficiaries')
        .select(`
          *,
          needy_person:needy_persons(id, first_name, last_name, phone)
        `)
        .eq('program_id', programId)
        .order('enrollment_date', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    },
  })

  // Bütçe kalemleri
  const { data: budgetItems } = useQuery({
    queryKey: ['program-budget', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_budget_items')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Program bulunamadı</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/programs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Programlara Dön
        </Button>
      </div>
    )
  }

  const statusConfig_item = statusConfig[program.status] || statusConfig['planning']
  const budgetUtilization = program.budget_allocated > 0 
    ? Math.round((program.budget_spent / program.budget_allocated) * 100) 
    : 0
  const beneficiaryProgress = program.target_beneficiaries > 0
    ? Math.round(((program.actual_beneficiaries || 0) / program.target_beneficiaries) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/programs')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{program.name}</h1>
              <Badge className={`${statusConfig_item.bgColor} ${statusConfig_item.color} border-0`}>
                {statusConfig_item.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {program.code} • {typeLabels[program.type]} • {categoryLabels[program.category] || 'Kategorisiz'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/programs/${programId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${programId}/activities/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Aktivite Ekle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/programs/${programId}/beneficiaries/add`)}>
                <Users className="h-4 w-4 mr-2" />
                Faydalanıcı Ekle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bütçe Kullanımı</p>
              <p className="text-2xl font-bold">{budgetUtilization}%</p>
              <p className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('tr-TR').format(program.budget_spent || 0)} / 
                {new Intl.NumberFormat('tr-TR').format(program.budget_allocated || 0)} ₺
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
          <Progress value={budgetUtilization} className="mt-3 h-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Faydalanıcı</p>
              <p className="text-2xl font-bold">{program.actual_beneficiaries || 0}</p>
              <p className="text-xs text-muted-foreground">
                Hedef: {program.target_beneficiaries || '-'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <Users className="h-6 w-6 text-success" />
            </div>
          </div>
          <Progress value={beneficiaryProgress} className="mt-3 h-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aktiviteler</p>
              <p className="text-2xl font-bold">{stats?.completed_activities || 0}</p>
              <p className="text-xs text-muted-foreground">
                {stats?.total_activities || 0} toplam
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <Activity className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Süre</p>
              <p className="text-2xl font-bold">
                {stats?.days_elapsed || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.days_remaining ? `${stats.days_remaining} gün kaldı` : 'Süresiz'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-info/10">
              <Clock className="h-6 w-6 text-info" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
          <TabsTrigger value="beneficiaries">Faydalanıcılar</TabsTrigger>
          <TabsTrigger value="budget">Bütçe</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sol Kolon - Program Bilgileri */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Program Açıklaması</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {program.description || 'Açıklama eklenmemiş'}
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
                {activities && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.status === 'completed' ? 'bg-success/10' : 
                            activity.status === 'in_progress' ? 'bg-warning/10' : 'bg-muted'
                          }`}>
                            <Activity className={`h-4 w-4 ${
                              activity.status === 'completed' ? 'text-success' : 
                              activity.status === 'in_progress' ? 'text-warning' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.planned_date && new Date(activity.planned_date).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          activity.status === 'completed' ? 'success' :
                          activity.status === 'in_progress' ? 'warning' : 'default'
                        }>
                          {activity.status === 'completed' ? 'Tamamlandı' :
                           activity.status === 'in_progress' ? 'Devam Ediyor' : 'Planlandı'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Henüz aktivite bulunmuyor</p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setActiveTab('activities')}
                >
                  Tüm Aktiviteleri Gör
                </Button>
              </Card>
            </div>

            {/* Sağ Kolon - Yan Bilgiler */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Program Yöneticileri</h3>
                <div className="space-y-4">
                  {program.manager && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {program.manager.name?.charAt(0) || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{program.manager.name}</p>
                        <p className="text-sm text-muted-foreground">Program Müdürü</p>
                      </div>
                    </div>
                  )}
                  {program.coordinator && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-accent/10 text-accent">
                          {program.coordinator.name?.charAt(0) || 'K'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{program.coordinator.name}</p>
                        <p className="text-sm text-muted-foreground">Koordinatör</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Lokasyon</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{program.city?.name || 'Belirtilmemiş'}</span>
                  </div>
                  {program.district?.name && (
                    <p className="text-sm text-muted-foreground pl-6">{program.district.name}</p>
                  )}
                  {program.location_description && (
                    <p className="text-sm mt-2">{program.location_description}</p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tarihler</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Başlangıç</span>
                    <span className="font-medium">
                      {program.start_date ? new Date(program.start_date).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bitiş</span>
                    <span className="font-medium">
                      {program.end_date ? new Date(program.end_date).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gerçek Başlangıç</span>
                    <span className="font-medium">
                      {program.actual_start_date ? new Date(program.actual_start_date).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Program Aktiviteleri</h3>
              <Button onClick={() => router.push(`/dashboard/programs/${programId}/activities/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Aktivite
              </Button>
            </div>
            {activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        activity.status === 'completed' ? 'bg-success/10' : 
                        activity.status === 'in_progress' ? 'bg-warning/10' : 'bg-muted'
                      }`}>
                        <Activity className={`h-5 w-5 ${
                          activity.status === 'completed' ? 'text-success' : 
                          activity.status === 'in_progress' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {activity.planned_date && new Date(activity.planned_date).toLocaleDateString('tr-TR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.location || 'Lokasyon belirtilmemiş'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        activity.status === 'completed' ? 'success' :
                        activity.status === 'in_progress' ? 'warning' : 'default'
                      }>
                        {activity.status === 'completed' ? 'Tamamlandı' :
                         activity.status === 'in_progress' ? 'Devam Ediyor' : 'Planlandı'}
                      </Badge>
                    </div>
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
                  onClick={() => router.push(`/dashboard/programs/${programId}/activities/new`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Aktiviteyi Ekle
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Faydalanıcılar</h3>
              <Button onClick={() => router.push(`/dashboard/programs/${programId}/beneficiaries/add`)}>
                <Plus className="h-4 w-4 mr-2" />
                Faydalanıcı Ekle
              </Button>
            </div>
            {beneficiaries && beneficiaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiaries.map((beneficiary: any) => (
                  <div key={beneficiary.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {beneficiary.needy_person?.first_name?.charAt(0)}
                        {beneficiary.needy_person?.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {beneficiary.needy_person?.first_name} {beneficiary.needy_person?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{beneficiary.needy_person?.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          beneficiary.status === 'active' ? 'success' :
                          beneficiary.status === 'completed' ? 'default' : 'warning'
                        }>
                          {beneficiary.status === 'active' ? 'Aktif' :
                           beneficiary.status === 'completed' ? 'Tamamlandı' : 'Kayıtlı'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Kayıt: {new Date(beneficiary.enrollment_date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz faydalanıcı bulunmuyor</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Bütçe Kalemleri</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Kalem Ekle
              </Button>
            </div>
            {budgetItems && budgetItems.length > 0 ? (
              <div className="space-y-3">
                {budgetItems.map((item: any) => {
                  const utilization = item.planned_amount > 0 
                    ? Math.round((item.actual_amount / item.planned_amount) * 100) 
                    : 0
                  return (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Intl.NumberFormat('tr-TR').format(item.actual_amount)} / 
                            {new Intl.NumberFormat('tr-TR').format(item.planned_amount)} ₺
                          </p>
                          <p className="text-sm text-muted-foreground">%{utilization}</p>
                        </div>
                      </div>
                      <Progress value={utilization} className="h-2" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz bütçe kalemi bulunmuyor</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
