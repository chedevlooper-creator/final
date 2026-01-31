'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [organizationId, setOrganizationId] = useState<string>('')
  
  const [organization, setOrganization] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    tax_number: '',
    tax_office: '',
    foundation_date: '',
    registration_number: '',
    is_active: true,
    settings: {
      language: 'tr',
      timezone: 'Europe/Istanbul',
      currency: 'TRY',
      date_format: 'DD.MM.YYYY',
    }
  })

  useEffect(() => {
    loadOrganization()
  }, [])

  const loadOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!member) return

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', member.organization_id)
        .single()

      if (org) {
        setOrganizationId(member.organization_id)
        setOrganization({
          ...organization,
          ...org,
          settings: { ...organization.settings, ...org.settings }
        })
      }
    } catch (error) {
      console.error('Error loading organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          description: organization.description,
          email: organization.email,
          phone: organization.phone,
          website: organization.website,
          address: organization.address,
          city: organization.city,
          tax_number: organization.tax_number,
          tax_office: organization.tax_office,
          foundation_date: organization.foundation_date,
          registration_number: organization.registration_number,
          settings: organization.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId)

      if (error) throw error

      toast.success('Organizasyon bilgileri güncellendi')
    } catch (error) {
      toast.error('Güncelleme sırasında bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName)

      setOrganization({ ...organization, logo_url: publicUrl })
      toast.success('Logo yüklendi')
    } catch (error) {
      toast.error('Logo yüklenirken hata oluştu')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Organizasyon Ayarları</h2>
        <p className="text-muted-foreground">
          Dernek bilgilerinizi ve iletişim detaylarınızı yönetin
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="contact">İletişim</TabsTrigger>
          <TabsTrigger value="legal">Yasal Bilgiler</TabsTrigger>
          <TabsTrigger value="preferences">Tercihler</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizasyon Profili</CardTitle>
              <CardDescription>
                Derneğinizin temel bilgilerini ve logosunu yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={organization.logo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    <Building2 className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="logo" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Logo Yükle
                    </div>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Önerilen boyut: 400x400px, PNG veya JPG
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Organizasyon Adı *</Label>
                  <Input
                    id="name"
                    value={organization.name}
                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                    placeholder="Örn: İstanbul Yardım Derneği"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Kısa Ad (URL)</Label>
                  <Input
                    id="slug"
                    value={organization.slug}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bu alan otomatik oluşturulur ve değiştirilemez
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={organization.description || ''}
                  onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
                  placeholder="Derneğinizin misyonu ve faaliyet alanları..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={organization.is_active}
                  onCheckedChange={(checked) => setOrganization({ ...organization, is_active: checked })}
                />
                <Label>Organizasyon Aktif</Label>
                <Badge variant={organization.is_active ? 'success' : 'destructive'}>
                  {organization.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>
                Derneğinizin iletişim detaylarını güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={organization.email || ''}
                    onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
                    placeholder="info@derneginiz.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    value={organization.phone || ''}
                    onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
                    placeholder="+90 212 555 00 00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Web Sitesi
                </Label>
                <Input
                  id="website"
                  value={organization.website || ''}
                  onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
                  placeholder="https://www.derneginiz.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Adres
                </Label>
                <Textarea
                  id="address"
                  value={organization.address || ''}
                  onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                  placeholder="Tam adres..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Şehir</Label>
                <Input
                  id="city"
                  value={organization.city || ''}
                  onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                  placeholder="İstanbul"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yasal Bilgiler</CardTitle>
              <CardDescription>
                Resmi kayıt ve vergi bilgilerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax_number">Vergi Numarası</Label>
                  <Input
                    id="tax_number"
                    value={organization.tax_number || ''}
                    onChange={(e) => setOrganization({ ...organization, tax_number: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_office">Vergi Dairesi</Label>
                  <Input
                    id="tax_office"
                    value={organization.tax_office || ''}
                    onChange={(e) => setOrganization({ ...organization, tax_office: e.target.value })}
                    placeholder="İstanbul Vergi Dairesi"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Dernek Kayıt No</Label>
                  <Input
                    id="registration_number"
                    value={organization.registration_number || ''}
                    onChange={(e) => setOrganization({ ...organization, registration_number: e.target.value })}
                    placeholder="34-123-456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundation_date">Kuruluş Tarihi</Label>
                  <Input
                    id="foundation_date"
                    type="date"
                    value={organization.foundation_date || ''}
                    onChange={(e) => setOrganization({ ...organization, foundation_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Tercihleri</CardTitle>
              <CardDescription>
                Varsayılan dil, para birimi ve tarih formatı ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Dil</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={organization.settings.language}
                    onChange={(e) => setOrganization({
                      ...organization,
                      settings: { ...organization.settings, language: e.target.value }
                    })}
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Para Birimi</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={organization.settings.currency}
                    onChange={(e) => setOrganization({
                      ...organization,
                      settings: { ...organization.settings, currency: e.target.value }
                    })}
                  >
                    <option value="TRY">Türk Lirası (₺)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Zaman Dilimi</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={organization.settings.timezone}
                    onChange={(e) => setOrganization({
                      ...organization,
                      settings: { ...organization.settings, timezone: e.target.value }
                    })}
                  >
                    <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                    <option value="Europe/London">London (UTC+0)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="Asia/Dubai">Dubai (UTC+4)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
