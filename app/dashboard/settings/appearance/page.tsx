'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor,
  Check,
  Save,
  Loader2,
  Layout,
  Type
} from 'lucide-react'

const themes = [
  { id: 'light', name: 'Açık', icon: Sun, description: 'Klasik açık tema' },
  { id: 'dark', name: 'Koyu', icon: Moon, description: 'Göz yorucu olmayan koyu tema' },
  { id: 'system', name: 'Sistem', icon: Monitor, description: 'Sistem ayarını takip et' },
]

const accentColors = [
  { id: 'blue', name: 'Mavi', class: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'green', name: 'Yeşil', class: 'bg-green-500', hex: '#22c55e' },
  { id: 'purple', name: 'Mor', class: 'bg-purple-500', hex: '#a855f7' },
  { id: 'orange', name: 'Turuncu', class: 'bg-orange-500', hex: '#f97316' },
  { id: 'red', name: 'Kırmızı', class: 'bg-red-500', hex: '#ef4444' },
  { id: 'teal', name: 'Turkuaz', class: 'bg-teal-500', hex: '#14b8a6' },
]

const fontSizes = [
  { id: 'small', name: 'Küçük', size: '14px', label: 'Aa' },
  { id: 'medium', name: 'Orta', size: '16px', label: 'Aa' },
  { id: 'large', name: 'Büyük', size: '18px', label: 'Aa' },
  { id: 'xlarge', name: 'Çok Büyük', size: '20px', label: 'Aa' },
]

export default function AppearanceSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    sidebarCollapsed: false,
    compactMode: false,
    animationsEnabled: true,
    highContrast: false,
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Görünüm ayarları kaydedildi')
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Görünüm ve Tema</h2>
        <p className="text-muted-foreground">
          Uygulamanızın görünümünü ve hissinizi kişiselleştirin
        </p>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Açık veya koyu tema seçin</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSettings({ ...settings, theme: theme.id })}
                className={cn(
                  'relative flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                  settings.theme === theme.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/25'
                )}
              >
                <theme.icon className={cn(
                  'h-8 w-8',
                  settings.theme === theme.id ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div className="text-center">
                  <p className="font-medium">{theme.name}</p>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
                {settings.theme === theme.id && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Vurgu Rengi</CardTitle>
              <CardDescription>Ana renk temasını seçin</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {accentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSettings({ ...settings, accentColor: color.id })}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                  settings.accentColor === color.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-muted'
                )}
              >
                <div className={cn('w-12 h-12 rounded-full', color.class)} />
                <span className="text-sm font-medium">{color.name}</span>
                {settings.accentColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full p-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Type className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Yazı Boyutu</CardTitle>
              <CardDescription>Metin boyutunu ayarlayın</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSettings({ ...settings, fontSize: size.id })}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                  settings.fontSize === size.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/25'
                )}
              >
                <span style={{ fontSize: size.size }} className="font-medium">
                  {size.label}
                </span>
                <span className="text-sm text-muted-foreground">{size.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Düzen Seçenekleri</CardTitle>
              <CardDescription>Arayüz davranışını özelleştirin</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Yan Menü Daraltılmış Başlasın</Label>
              <p className="text-sm text-muted-foreground">Girişte yan menü daraltılmış olarak gösterilir</p>
            </div>
            <Switch
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked: boolean) => setSettings({ ...settings, sidebarCollapsed: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Kompakt Mod</Label>
              <p className="text-sm text-muted-foreground">Daha sıkı düzen ve daha az boşluk</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked: boolean) => setSettings({ ...settings, compactMode: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Animasyonlar</Label>
              <p className="text-sm text-muted-foreground">Arayüz animasyonlarını etkinleştir</p>
            </div>
            <Switch
              checked={settings.animationsEnabled}
              onCheckedChange={(checked: boolean) => setSettings({ ...settings, animationsEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Yüksek Kontrast</Label>
              <p className="text-sm text-muted-foreground">Erişilebilirlik için yüksek kontrast modu</p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked: boolean) => setSettings({ ...settings, highContrast: checked })}
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
              Tema Ayarlarını Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
