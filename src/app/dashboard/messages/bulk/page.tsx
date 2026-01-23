'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useSendBulkSMS, useSendBulkEmail, useRecipients } from '@/hooks/queries/use-messages'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Send, Users, FileText } from 'lucide-react'

export default function BulkMessagesPage() {
  const [messageType, setMessageType] = useState<string>('sms')
  const [recipientType, setRecipientType] = useState<string>('all')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  
  const sendBulkSMS = useSendBulkSMS()
  const sendBulkEmail = useSendBulkEmail()
  const { data: recipientsData } = useRecipients(recipientType)

  const handleSend = async () => {
    // Get recipients based on recipientType and messageType
    const recipients: string[] = (recipientsData?.recipients || [])
      .map(r => {
        if (messageType === 'email') {
          return r.email
        } else if (messageType === 'sms') {
          return r.phone
        }
        return undefined
      })
      .filter((contact): contact is string => !!contact)
    
    if (recipients.length === 0) {
      return // Don't send if no valid recipients
    }
    
    if (messageType === 'sms') {
      await sendBulkSMS.mutateAsync({
        recipients,
        message,
        message_type: 'sms',
      })
    } else if (messageType === 'email') {
      await sendBulkEmail.mutateAsync({
        recipients,
        subject,
        message,
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Toplu Mesaj"
        description="Toplu mesaj gönderimi yapın"
        icon={MessageSquare}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mesaj Formu */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mesaj Oluştur</CardTitle>
            <CardDescription>Göndermek istediğiniz mesajı oluşturun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-type">Mesaj Türü</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger id="message-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">E-posta</SelectItem>
                  <SelectItem value="push">Push Bildirimi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-type">Alıcı Grubu</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger id="recipient-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm İhtiyaç Sahipleri</SelectItem>
                  <SelectItem value="active">Aktif İhtiyaç Sahipleri</SelectItem>
                  <SelectItem value="volunteers">Gönüllüler</SelectItem>
                  <SelectItem value="donors">Bağışçılar</SelectItem>
                  <SelectItem value="custom">Özel Liste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {messageType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  placeholder="E-posta konusu..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Mesaj İçeriği</Label>
              <Textarea
                id="message"
                placeholder="Mesajınızı buraya yazın..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                maxLength={messageType === 'sms' ? 160 : 1000}
              />
              <p className="text-xs text-slate-500 text-right">
                {message.length} / {messageType === 'sms' ? 160 : 1000} karakter
              </p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              onClick={handleSend}
              disabled={sendBulkSMS.isPending || sendBulkEmail.isPending || !message}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendBulkSMS.isPending || sendBulkEmail.isPending ? 'Gönderiliyor...' : 'Mesajı Gönder'}
            </Button>
          </CardContent>
        </Card>

        {/* Bilgi Paneli */}
        <Card>
          <CardHeader>
            <CardTitle>Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-900">Alıcı Sayısı</p>
                <p className="text-2xl font-bold text-blue-600">{recipientsData?.count || 0}</p>
                <p className="text-xs text-blue-700 mt-1">Tahmini alıcı sayısı</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <FileText className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-emerald-900">Mesaj Uzunluğu</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {messageType === 'sms' ? Math.ceil(message.length / 160) : 1}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {messageType === 'sms' ? 'SMS sayısı' : 'Mesaj sayısı'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-600">
                <strong>Not:</strong> Toplu mesaj gönderimi öncesi mesaj içeriğini kontrol edin.
                SMS gönderimi için kredi gereklidir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
