'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Basit kayıt için minimal schema
const addNeedySchema = z.object({
  category_id: z.string().min(1, 'Kategori seçilmeli'),
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  nationality_id: z.string().optional(),
  date_of_birth: z.string().optional(),
  identity_number: z.string().optional(),
  check_mernis: z.boolean().optional().default(false),
  fund_region: z.string().optional(),
  partner_type: z.string().optional(),
  partner_id: z.string().optional(),
  file_number: z.string().optional(),
})

type AddNeedyFormValues = z.input<typeof addNeedySchema>

// Kategori seçenekleri
const CATEGORIES = [
  { value: 'yetim_ailesi', label: 'Yetim Ailesi' },
  { value: 'multeci_aile', label: 'Mülteci Aile' },
  { value: 'ihtiyac_sahibi_aile', label: 'İhtiyaç Sahibi Aile' },
  { value: 'ogrenci_yabanci', label: 'Öğrenci (Yabancı)' },
  { value: 'ogrenci_tc', label: 'Öğrenci (TC)' },
  { value: 'vakif_dernek', label: 'Vakıf & Dernek' },
  { value: 'devlet_okulu', label: 'Devlet Okulu' },
  { value: 'kamu_kurumu', label: 'Kamu Kurumu' },
  { value: 'ozel_egitim_kurumu', label: 'Özel Eğitim Kurumu' },
]

const FUND_REGIONS = [
  { value: '', label: '(Boş)' },
  { value: 'europe', label: 'Avrupa' },
  { value: 'free', label: 'Serbest' },
]

const PARTNER_TYPES = [
  { value: 'partner', label: 'Partner Kurum' },
  { value: 'field', label: 'Çalışma Sahası' },
]

interface AddNeedyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddNeedyModal({ open, onOpenChange }: AddNeedyModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AddNeedyFormValues>({
    resolver: zodResolver(addNeedySchema),
    defaultValues: {
      category_id: 'yetim_ailesi', // Varsayılan: Yetim Ailesi
      first_name: '',
      last_name: '',
      nationality_id: '',
      date_of_birth: '',
      identity_number: '',
      check_mernis: false,
      fund_region: '',
      partner_type: 'partner',
      partner_id: '',
      file_number: '',
    },
  })

  const onSubmit = async (values: AddNeedyFormValues) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Mernis kontrolü yapılacaksa
      if (values.check_mernis && values.identity_number) {
        // TODO: Mernis API çağrısı
        console.log('Mernis kontrolü yapılıyor:', values.identity_number)
      }

      // Kayıt oluştur
      const { data, error } = await supabase
        .from('needy_persons')
        .insert({
          category_id: values.category_id,
          first_name: values.first_name,
          last_name: values.last_name,
          nationality_id: values.nationality_id || null,
          date_of_birth: values.date_of_birth || null,
          identity_number: values.identity_number || null,
          fund_region: values.fund_region || null,
          partner_id: values.partner_id || null,
          file_number: values.file_number || null,
          status: 'pending', // Taslak durumu
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Kayıt başarıyla oluşturuldu')
      onOpenChange(false)
      form.reset()
      
      // Detay sayfasına yönlendir
      router.push(`/needy/${data.id}`)
    } catch (error) {
      console.error('Kayıt hatası:', error)
      toast.error('Kayıt oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = form.watch('first_name') && form.watch('last_name') && form.watch('category_id')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-lg font-semibold">
            Yeni İhtiyaç Sahibi Ekle
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isFormValid || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Kapat
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 pt-4">
            {/* Kategori */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ad ve Soyad */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Soyad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Uyruk ve Doğum Tarihi */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uyruk</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Türkiye" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doğum Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Kimlik No ve Mernis Kontrolü */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="identity_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kimlik No</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="11 haneli TC Kimlik No" maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_mernis"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Mernis Kontrolü Yap
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Fon Bölgesi */}
            <FormField
              control={form.control}
              name="fund_region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fon Bölgesi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Fon bölgesi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUND_REGIONS.map((fund) => (
                        <SelectItem key={fund.value || 'empty'} value={fund.value || 'none'}>
                          {fund.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dosya Bağlantısı (2 Aşamalı) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partner_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosya Bağlantısı</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tür seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PARTNER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&nbsp;</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kurum/Saha seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">(Boş)</SelectItem>
                        {/* Dinamik olarak yüklenecek */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dosya Numarası */}
            <FormField
              control={form.control}
              name="file_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosya Numarası</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="45.645.645" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
