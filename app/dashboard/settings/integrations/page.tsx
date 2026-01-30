'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Puzzle, 
  Mail, 
  MessageSquare, 
  CreditCard,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

const integrations = [
  {
    id: 'mernis',
    name: 'MERNIS Kimlik Doğrulama',
    description: 'TC Kimlik numarası doğrulama ve kimlik bilgisi sorgulama',
    icon: CheckCircle,
    category: 'Kimlik Doğrulama',
    isConnected: true,
    lastSync: '2 saat önce',
    fields: [
      { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
      { key: 'password', label: 'Şifre', type: 'password' },
      { key: 'endpoint', label: 'Endpoint URL', type: 'text' },
    ]
  },
  {
    id: 'sms',
    name: 'SMS Entegrasyonu',
    description: 'Toplu SMS gönderimi ve otomatik SMS bildirimleri',
    icon: MessageSquare,
    category: 'İletişim',
    isConnected: false,
    providers: [
      { id: 'twilio', name: 'Twilio' },
      { id: 'netgsm', name: 'NetGSM' },
      { id: 'iletimerkezi', name: 'İleti Merkezi' },
    ],
    fields: [
      { key: 'provider', label: 'Sağlayıcı', type: 'select' },
      { key: 'api_key', label: 'API Key', type: 'text' },
      { key: 'api_secret', label: 'API Secret', type: 'password' },
      { key: 'sender_id', label: 'Gönderici Adı', type: 'text' },
    ]
  },
  {
    id: 'email',
    name: 'E-posta Servisi',
    description: 'Toplu e-posta gönderimi ve şablon yönetimi',
    icon: Mail,
    category: 'İletişim',
    isConnected: true,
    providers: [
      { id: 'smtp', name: 'SMTP' },
      { id: 'sendgrid', name: 'SendGrid' },
      { id: 'mailgun', name: 'Mailgun' },
    ],
    fields: [
      { key: 'provider', label: 'Sağlayıcı', type: 'select' },
      { key: 'smtp_host', label: 'SMTP Host', type: 'text' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'text' },
      { key: 'smtp_user', label: 'SMTP Kullanıcı', type: 'text' },
      { key: 'smtp_pass', label: 'SMTP Şifre', type: 'password' },
      { key: 'from_email', label: 'Gönderici E-posta', type: 'email' },
      { key: 'from_name', label: 'Gönderici Adı', type: 'text' },
    ]
  },
  {
    id: 'payment',
    name: 'Ödeme Sistemi',
    description: 'Online bağış ve ödeme işlemleri entegrasyonu',
    icon: CreditCard,
    category: 'Finans',
    isConnected: false,
    providers: [
      { id: 'iyzico', name: 'iyzico' },
      { id: 'stripe', name: 'Stripe' },
      { id: 'paytr', name: 'PayTR' },
    ],
    fields: [
      { key: 'provider', label: 'Sağlayıcı', type: 'select' },
      { key: 'api_key', label: 'API Key', type: 'text' },
      { key: 'secret_key', label: 'Secret Key', type: 'password' },
      { key: 'merchant_id', label: 'Merchant ID', type: 'text' },
      { key: 'sandbox', label: 'Test Modu', type: 'boolean' },
    ]
  },
]

export default function IntegrationsSettingsPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [integrationData, setIntegrationData] = useState<Record<string, any>>({
    mernis: { username: '', password: '', endpoint: '' },
    sms: { provider: '', api_key: '', api_secret: '', sender_id: '' },
    email: { provider: 'smtp', smtp_host: '', smtp_port: '587', smtp_user: '', smtp_pass: '', from_email: '', from_name: '' },
    payment: { provider: '', api_key: '', secret_key: '', merchant_id: '', sandbox: true },
  })

  const handleConnect = async (integrationId: string) => {
    setIsLoading(integrationId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success(`${integrationId.toUpperCase()} entegrasyonu bağlandı`)
    setIsLoading(null)
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Bu entegrasyonu kaldırmak istediğinize emin misiniz?')) return
    setIsLoading(integrationId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Entegrasyon kaldırıldı')
    setIsLoading(null)
  }

  const handleTest = async (integrationId: string) => {
    setIsLoading(`${integrationId}-test`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Bağlantı testi başarılı')
    setIsLoading(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Entegrasyonlar</h2>
        <p className="text-muted-foreground">
          Üçüncü parti servislerle entegrasyonları yönetin
        </p>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${integration.isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <integration.icon className={`h-6 w-6 ${integration.isConnected ? 'text-green-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{integration.name}</CardTitle>
                      <Badge variant={integration.isConnected ? 'success' : 'secondary'}>
                        {integration.isConnected ? 'Bağlı' : 'Bağlı Değil'}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">{integration.category}</p>
                  </div>
                </div>
                {integration.isConnected && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <RefreshCw className="h-3 w-3" />
                      Son senkronizasyon: {integration.lastSync}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {integration.isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">Entegrasyon aktif ve çalışıyor</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleTest(integration.id)}
                      disabled={isLoading === `${integration.id}-test`}
                    >
                      {isLoading === `${integration.id}-test` ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Bağlantıyı Test Et
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDisconnect(integration.id)}
                      disabled={isLoading === integration.id}
                    >
                      {isLoading === integration.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Bağlantıyı Kes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {integration.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label>{field.label}</Label>
                        {field.type === 'select' ? (
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={integrationData[integration.id]?.[field.key] || ''}
                            onChange={(e) => setIntegrationData({
                              ...integrationData,
                              [integration.id]: { ...integrationData[integration.id], [field.key]: e.target.value }
                            })}
                          >
                            <option value="">Seçin</option>
                            {integration.providers?.map((provider: any) => (
                              <option key={provider.id} value={provider.id}>{provider.name}</option>
                            ))}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <Switch
                            checked={integrationData[integration.id]?.[field.key] || false}
                            onCheckedChange={(checked) => setIntegrationData({
                              ...integrationData,
                              [integration.id]: { ...integrationData[integration.id], [field.key]: checked }
                            })}
                          />
                        ) : (
                          <Input
                            type={field.type}
                            value={integrationData[integration.id]?.[field.key] || ''}
                            onChange={(e) => setIntegrationData({
                              ...integrationData,
                              [integration.id]: { ...integrationData[integration.id], [field.key]: e.target.value }
                            })}
                            placeholder={field.label}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleConnect(integration.id)}
                      disabled={isLoading === integration.id}
                    >
                      {isLoading === integration.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Bağlanıyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Bağlan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle>API Erişimi</CardTitle>
          <CardDescription>
            Kendi uygulamalarınızdan erişim için API anahtarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API Key</p>
                <p className="text-sm text-muted-foreground">Son kullanılan: 2 gün önce</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yenile
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Dökümantasyon
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
