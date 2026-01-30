'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Shield, 
  Key, 
  Smartphone, 
  History, 
  Lock,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react'

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: 30,
    password_min_length: 8,
    password_require_special: true,
    password_require_number: true,
    password_require_uppercase: true,
    login_notifications: true,
    ip_restriction: false,
    allowed_ips: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const handleSaveSecurity = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Güvenlik ayarları kaydedildi')
    setIsLoading(false)
  }

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalı')
      return
    }
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Şifre başarıyla değiştirildi')
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Güvenlik ve Yetkilendirme</h2>
        <p className="text-muted-foreground">
          Hesap güvenliğinizi ve erişim kontrollerini yönetin
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Two Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>İki Faktörlü Doğrulama (2FA)</CardTitle>
                <CardDescription>Hesabınıza ekstra güvenlik katmanı ekleyin</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>2FA Durumu</Label>
                <p className="text-sm text-muted-foreground">
                  {securitySettings.two_factor_enabled ? 'Aktif' : 'Pasif'}
                </p>
              </div>
              <Switch 
                checked={securitySettings.two_factor_enabled}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, two_factor_enabled: checked})}
              />
            </div>
            {securitySettings.two_factor_enabled && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">2FA aktif - Hesabınız güvende</span>
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full">
              <Fingerprint className="mr-2 h-4 w-4" />
              {securitySettings.two_factor_enabled ? '2FA Yönet' : '2FA Etkinleştir'}
            </Button>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Oturum Yönetimi</CardTitle>
                <CardDescription>Oturum zaman aşımı ve güvenlik ayarları</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Oturum Zaman Aşımı (dakika)</Label>
              <Input 
                type="number" 
                value={securitySettings.session_timeout}
                onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)})}
              />
              <p className="text-xs text-muted-foreground">
                Belirtilen süre boyunca işlem yapılmazsa oturum sonlanır
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Giriş Bildirimleri</Label>
              <Switch 
                checked={securitySettings.login_notifications}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, login_notifications: checked})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Lock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Şifre Politikası</CardTitle>
              <CardDescription>Kurumsal şifre güvenlik gereksinimleri</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Şifre Uzunluğu</Label>
              <Input 
                type="number" 
                value={securitySettings.password_min_length}
                onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Özel Karakter Gereksinimi</Label>
                <p className="text-sm text-muted-foreground">!, @, #, $ vb. karakterler zorunlu</p>
              </div>
              <Switch 
                checked={securitySettings.password_require_special}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, password_require_special: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Sayı Gereksinimi</Label>
                <p className="text-sm text-muted-foreground">En az bir rakam zorunlu</p>
              </div>
              <Switch 
                checked={securitySettings.password_require_number}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, password_require_number: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Büyük Harf Gereksinimi</Label>
                <p className="text-sm text-muted-foreground">En az bir büyük harf zorunlu</p>
              </div>
              <Switch 
                checked={securitySettings.password_require_uppercase}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, password_require_uppercase: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Restriction */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle>IP Kısıtlaması</CardTitle>
              <CardDescription>Sadece belirli IP adreslerinden erişime izin ver</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>IP Kısıtlaması</Label>
              <p className="text-sm text-muted-foreground">Belirli IP'ler dışında erişimi engelle</p>
            </div>
            <Switch 
              checked={securitySettings.ip_restriction}
              onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ip_restriction: checked})}
            />
          </div>
          {securitySettings.ip_restriction && (
            <div className="space-y-2">
              <Label>İzin Verilen IP Adresleri</Label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                placeholder="Her satıra bir IP adresi&#10;Örn:&#10;192.168.1.1&#10;10.0.0.0/24"
                value={securitySettings.allowed_ips}
                onChange={(e) => setSecuritySettings({...securitySettings, allowed_ips: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                CIDR notation desteklenir (örn: 192.168.1.0/24)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Key className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>Hesap şifrenizi güncelleyin</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mevcut Şifre</Label>
            <div className="relative">
              <Input 
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Yeni Şifre</Label>
              <Input 
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Yeni Şifre (Tekrar)</Label>
              <Input 
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Değiştiriliyor...
              </>
            ) : (
              'Şifreyi Değiştir'
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSecurity} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Güvenlik Ayarlarını Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
