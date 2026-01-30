'use client'

import { useState } from 'react'
import { useTeamStats, useActivityLogs } from '@/hooks/queries/use-tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Users, CheckCircle2, Clock, AlertCircle, Activity, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { ActivityAction, TeamMemberStats } from '@/types/task.types'

const actionLabels: Record<ActivityAction, { label: string; color: string }> = {
  create: { label: 'Oluşturma', color: 'bg-green-100 text-green-800' },
  update: { label: 'Güncelleme', color: 'bg-blue-100 text-blue-800' },
  delete: { label: 'Silme', color: 'bg-red-100 text-red-800' },
  view: { label: 'Görüntüleme', color: 'bg-gray-100 text-gray-800' },
  list: { label: 'Listeleme', color: 'bg-gray-100 text-gray-800' },
  login: { label: 'Giriş', color: 'bg-purple-100 text-purple-800' },
  logout: { label: 'Çıkış', color: 'bg-purple-100 text-purple-800' },
  export: { label: 'Dışa Aktarma', color: 'bg-yellow-100 text-yellow-800' },
  import: { label: 'İçe Aktarma', color: 'bg-yellow-100 text-yellow-800' },
  assign: { label: 'Atama', color: 'bg-indigo-100 text-indigo-800' },
  complete: { label: 'Tamamlama', color: 'bg-green-100 text-green-800' },
  approve: { label: 'Onaylama', color: 'bg-green-100 text-green-800' },
  reject: { label: 'Reddetme', color: 'bg-red-100 text-red-800' },
  cancel: { label: 'İptal', color: 'bg-orange-100 text-orange-800' },
}

function TeamMemberCard({ member }: { member: TeamMemberStats }) {
  const { user, role, stats, last_activity } = member
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase()

  const roleLabels: Record<string, string> = {
    owner: 'Sahip',
    admin: 'Yönetici',
    moderator: 'Moderatör',
    user: 'Kullanıcı',
    viewer: 'Görüntüleyici',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{user.name || user.email}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{roleLabels[role] || role}</Badge>
                {last_activity && (
                  <span className="text-xs text-muted-foreground">
                    Son aktivite: {format(new Date(last_activity.created_at), 'd MMM HH:mm', { locale: tr })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.total_assigned}</p>
            <p className="text-xs text-muted-foreground">Toplam Görev</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Tamamlanan</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
            <p className="text-xs text-muted-foreground">Devam Eden</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Bekleyen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-muted-foreground">Geciken</p>
          </div>
        </div>

        {/* Tamamlama Oranı */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Tamamlama Oranı</span>
            <span className="font-medium">%{stats.completion_rate}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                stats.completion_rate >= 80
                  ? 'bg-green-500'
                  : stats.completion_rate >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${stats.completion_rate}%` }}
            />
          </div>
        </div>

        {/* Son Aktivite */}
        {last_activity && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Son İşlem:</p>
            <div className="flex items-center gap-2">
              <Badge className={actionLabels[last_activity.action]?.color || 'bg-gray-100'}>
                {actionLabels[last_activity.action]?.label || last_activity.action}
              </Badge>
              <span className="text-sm text-muted-foreground truncate">
                {last_activity.description}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityLogList({ userId }: { userId?: string }) {
  const [action, setAction] = useState<ActivityAction | 'all'>('all')
  
  const { data, isLoading } = useActivityLogs(
    userId || action !== 'all' ? { user_id: userId, action: action !== 'all' ? action : undefined } : undefined,
    50
  )

  const activities = data?.data || []

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={action} onValueChange={(v) => setAction(v as ActivityAction | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="İşlem türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İşlemler</SelectItem>
            {Object.entries(actionLabels).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="mt-0.5">
              <Badge className={actionLabels[activity.action]?.color || 'bg-gray-100'}>
                {actionLabels[activity.action]?.label || activity.action}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{activity.user_name}</span>
                <span>•</span>
                <span>{activity.entity_type}</span>
                <span>•</span>
                <span>{format(new Date(activity.created_at), 'd MMM yyyy HH:mm', { locale: tr })}</span>
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz aktivite kaydı bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function TeamActivityPage() {
  const { data: stats, isLoading } = useTeamStats()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Takım Aktivitesi</h1>
        <p className="text-muted-foreground mt-1">
          Takımınızın görev performansını ve aktivitelerini takip edin
        </p>
      </div>

      {/* Organizasyon Özeti */}
      {stats?.organization_stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Toplam Görev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.organization_stats.total_tasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktif Görev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.organization_stats.active_tasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tamamlanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.organization_stats.completed_tasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bu Hafta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats.organization_stats.this_week_tasks}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tamamlama Oranı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                %{stats.organization_stats.completion_rate}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-1" />
            Takım Üyeleri
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="w-4 h-4 mr-1" />
            Aktivite Logları
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.team_members.map((member) => (
                <TeamMemberCard key={member.user.id} member={member} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <ActivityLogList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
