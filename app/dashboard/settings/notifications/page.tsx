'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

const notificationCategories = [
  {
    id: 'donations',
    title: 'Bağış Bildirimleri',
    description: 'Yeni bağışlar ve bağış güncellemeleri',
    icon: CheckCircle,
    notifications: [
      { id: 'new_donation', label: 'Yeni bağış yapıldığında', email: true, push: true, sms: false },
      { id: 'large_donation', label: 'Büyük bağış alındığında (1000₺+)', email: true, push: true, sms: true },
      { id: 'recurring_failed', label: 'Düzenli bağış başarısız olduğunda', email: true, push: true, sms: false },
    ]
  },
  {
    id: 'applications',
    title: 'Başvuru Bildirimleri',
    description: 'Yardım başvuruları ve durum güncellemeleri',
    icon: Info,
    notifications: [
      { id: 'new_application', label: 'Yeni başvuru geldiğinde', email: true, push: true, sms: false },
      { id: 'application_urgent', label: 'Acil başvuru yapıldığında', email: true, push: true, sms: true },
      { id: 'application_status', label: 'Başvuru durumu değiştiğinde', email: true, push: false, sms: false },
    ]
  },
  {
    id: 'tasks',
    title: 'Görev Bildirimleri',
    description: 'Atanan görevler ve son tarih hatırlatmaları',
    icon: Bell,
    notifications: [
      { id: 'task_assigned', label: 'Yeni görev atandığında', email: true, push: true, sms: false },
      { id: 'task_due', label: 'Görev son tarihi yaklaştığında', email: true, push: true, sms: false },
      { id: 'task_overdue', label: 'Görev geciktiğinde', email: true, push: true, sms: true },
    ]
  },
  {
    id: 'system',
    title: 'Sistem Bildirimleri',
    description: 'Sistem güncellemeleri ve güvenlik uyarıları',
    icon: AlertTriangle,
    notifications: [
      { id: 'login_alert', label: 'Yeni cihazdan giriş yapıldığında', email: true, push: true, sms: false },
      { id: 'password_change', label: 'Şifre değişikliği yapıldığında', email: true, push: true, sms: true },
      { id: 'system_maintenance', label: 'Sistem bakım bildirimleri', email: true, push: false, sms: false },
    ]
  },
]

export default function NotificationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    daily_digest: true,
    weekly_report: true,
  })

  const handleSave = async () => {
    setIsSaving(true)
    // API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Bildirim ayarları kaydedildi')
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bildirim Ayarları</h2>
        <p className="text-muted-foreground">
          Hangi olaylar hakkında nasıl bildirim almak istediğinizi yapılandırın
        </p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Kanalları</CardTitle>
          <CardDescription>
            Kullanmak istediğiniz bildirim kanallarını etkinleştirin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="font-medium">E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Tüm bildirimler e-posta ile gönderilsin</p>
              </div>
            </div>
            <Switch 
              checked={settings.email_enabled}
              onCheckedChange={(checked) => setSettings({...settings, email_enabled: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <Label className="font-medium">Anlık Bildirimler</Label>
                <p className="text-sm text-muted-foreground">Tarayıcı anlık bildirimleri</p>
              </div>
            </div>
            <Switch 
              checked={settings.push_enabled}
              onCheckedChange={(checked) => setSettings({...settings, push_enabled: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <Label className="font-medium">SMS Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">Acil durumlar için SMS bildirimleri</p>
              </div>
            </div>
            <Switch 
              checked={settings.sms_enabled}
              onCheckedChange={(checked) => setSettings({...settings, sms_enabled: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Settings */}
      <div className="space-y-4">
        {notificationCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between py-2">
                    <span className="text-sm">{notification.label}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Switch 
                          checked={notification.email} 
                          disabled={!settings.email_enabled}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Switch 
                          checked={notification.push} 
                          disabled={!settings.push_enabled}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Switch 
                          checked={notification.sms} 
                          disabled={!settings.sms_enabled}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Özet Raporlar</CardTitle>
          <CardDescription>
            Düzenli özet raporları e-posta ile alın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Günlük Özet</Label>
              <p className="text-sm text-muted-foreground">Her gün saat 09:00'da özet rapor</p>
            </div>
            <Switch 
              checked={settings.daily_digest}
              onCheckedChange={(checked) => setSettings({...settings, daily_digest: checked})}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Haftalık Rapor</Label>
              <p className="text-sm text-muted-foreground">Her pazartesi haftalık performans raporu</p>
            </div>
            <Switch 
              checked={settings.weekly_report}
              onCheckedChange={(checked) => setSettings({...settings, weekly_report: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Ayarları Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
