'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ClipboardList, 
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  Target,
  MapPin
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

const programTypes = [
  { value: 'ongoing', label: 'Sürekli Program' },
  { value: 'project', label: 'Proje' },
  { value: 'campaign', label: 'Kampanya' },
  { value: 'emergency', label: 'Acil Yardım' },
]

const categories = [
  { value: 'education', label: 'Eğitim' },
  { value: 'health', label: 'Sağlık' },
  { value: 'food', label: 'Gıda' },
  { value: 'housing', label: 'Barınma' },
  { value: 'clothing', label: 'Giyim' },
  { value: 'financial_aid', label: 'Maddi Yardım' },
  { value: 'orphan_care', label: 'Yetim Bakımı' },
  { value: 'religious', label: 'Dini' },
  { value: 'cultural', label: 'Kültürel' },
  { value: 'other', label: 'Diğer' },
]

export default function NewProgramPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'project',
    category: '',
    start_date: '',
    end_date: '',
    budget_allocated: '',
    target_beneficiaries: '',
    target_amount: '',
    location_description: '',
  })

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Program oluşturulamadı')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('Program oluşturuldu')
      router.push(`/dashboard/programs/${data.data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Program oluşturulurken hata oluştu')
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const values = {
      ...formData,
      budget_allocated: formData.budget_allocated ? parseFloat(formData.budget_allocated) : 0,
      target_beneficiaries: formData.target_beneficiaries ? parseInt(formData.target_beneficiaries) : null,
      target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
    }

    createMutation.mutate(values)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Yeni Program Oluştur"
        description="Yeni bir yardım programı veya proje başlatın"
        icon={ClipboardList}
        actions={
          <Button variant="outline" onClick={() => router.push('/dashboard/programs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            İptal
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Temel Bilgiler */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Program Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Örn: 2024 Yaz Eğitim Kampanyası"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Program Tipi *</Label>
                  <Select value={formData.type} onValueChange={val => handleChange('type', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tip seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {programTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.category} onValueChange={val => handleChange('category', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Programın amacı, hedefleri ve kapsamı..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tarihler */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Tarihler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={e => handleChange('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Bitiş Tarihi</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={e => handleChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Bütçe ve Hedefler */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Bütçe ve Hedefler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget_allocated">Bütçe (₺)</Label>
                  <Input
                    id="budget_allocated"
                    type="number"
                    value={formData.budget_allocated}
                    onChange={e => handleChange('budget_allocated', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="target_beneficiaries">Hedef Faydalanıcı</Label>
                  <Input
                    id="target_beneficiaries"
                    type="number"
                    value={formData.target_beneficiaries}
                    onChange={e => handleChange('target_beneficiaries', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="target_amount">Hedef Bağış (₺)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={e => handleChange('target_amount', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Lokasyon */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lokasyon
              </h3>
              <div>
                <Label htmlFor="location_description">Lokasyon Açıklaması</Label>
                <Textarea
                  id="location_description"
                  value={formData.location_description}
                  onChange={e => handleChange('location_description', e.target.value)}
                  placeholder="Programın uygulanacağı bölge, adres veya lokasyon bilgisi..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/programs')}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Program Oluştur
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
