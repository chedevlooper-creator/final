'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDonationBoxById, useLocationTypes } from '@/hooks/queries/use-donation-boxes'
import { useCreateDonationBox, useUpdateDonationBox } from '@/hooks/mutations/use-donation-box-mutations'
import { donationBoxSchema, type DonationBoxFormValues } from '@/lib/validations/donation-boxes'

interface DonationBoxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boxId: string | null
}

const boxTypes = [
  { value: 'standard', label: 'Standart' },
  { value: 'digital', label: 'Dijital' },
  { value: 'secure', label: 'Güvenli' },
  { value: 'custom', label: 'Özel' },
]

const boxSizes = [
  { value: 'small', label: 'Küçük' },
  { value: 'medium', label: 'Orta' },
  { value: 'large', label: 'Büyük' },
  { value: 'xlarge', label: 'Ekstra Büyük' },
]

export function DonationBoxDialog({ open, onOpenChange, boxId }: DonationBoxDialogProps) {
  const { data: box } = useDonationBoxById(boxId)
  const { data: locationTypes } = useLocationTypes()
  const createMutation = useCreateDonationBox()
  const updateMutation = useUpdateDonationBox()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DonationBoxFormValues>({
    resolver: zodResolver(donationBoxSchema),
    defaultValues: {
      city: 'İstanbul',
      box_type: 'standard',
      box_size: 'medium',
      estimated_monthly_amount: 0,
    },
  })
  
  useEffect(() => {
    if (box) {
      reset({
        code: box.code,
        name: box.name,
        location_type_id: box.location_type_id || undefined,
        location_name: box.location_name,
        address: box.address || '',
        city: box.city || 'İstanbul',
        district: box.district || '',
        neighborhood: box.neighborhood || '',
        latitude: box.latitude || undefined,
        longitude: box.longitude || undefined,
        contact_person: box.contact_person || '',
        contact_phone: box.contact_phone || '',
        contact_email: box.contact_email || '',
        box_type: box.box_type,
        box_size: box.box_size,
        installation_date: box.installation_date || '',
        estimated_monthly_amount: box.estimated_monthly_amount,
        notes: box.notes || '',
      })
    } else {
      reset({
        code: '',
        name: '',
        location_name: '',
        address: '',
        city: 'İstanbul',
        district: '',
        neighborhood: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        box_type: 'standard',
        box_size: 'medium',
        installation_date: '',
        estimated_monthly_amount: 0,
        notes: '',
      })
    }
  }, [box, reset, open])

  const onSubmit = async (values: DonationBoxFormValues) => {
    try {
      if (boxId) {
        await updateMutation.mutateAsync({ id: boxId, values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{boxId ? 'Kumbara Düzenle' : 'Yeni Kumbara'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kod</Label>
              <Input {...register('code')} placeholder="KMB-001" />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Kumbara Adı</Label>
              <Input {...register('name')} placeholder="Fatih Camii Kumbarası" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Lokasyon Tipi</Label>
            <Select onValueChange={(v) => setValue('location_type_id', v)} value={box?.location_type_id || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Tip seçin" />
              </SelectTrigger>
              <SelectContent>
                {locationTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location_name">Lokasyon Adı</Label>
            <Input {...register('location_name')} placeholder="Örn: Fatih Camii" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input {...register('address')} placeholder="Tam adres..." />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <Input {...register('district')} placeholder="Kadıköy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Mahalle</Label>
              <Input {...register('neighborhood')} placeholder="Caferağa" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="box_type">Kumbara Tipi</Label>
              <Select onValueChange={(v) => setValue('box_type', v as any)} defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boxTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="box_size">Boyut</Label>
              <Select onValueChange={(v) => setValue('box_size', v as any)} defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boxSizes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">İletişim Kişisi</Label>
              <Input {...register('contact_person')} placeholder="Ahmet Yılmaz" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefon</Label>
              <Input {...register('contact_phone')} placeholder="0555-000-0000" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email</Label>
            <Input {...register('contact_email')} type="email" placeholder="ornek@email.com" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installation_date">Kurulum Tarihi</Label>
              <Input {...register('installation_date')} type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_monthly_amount">Aylık Hedef (₺)</Label>
              <Input 
                {...register('estimated_monthly_amount', { valueAsNumber: true })} 
                type="number" 
                min="0"
                placeholder="5000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input {...register('notes')} placeholder="Ek bilgiler..." />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {boxId ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
