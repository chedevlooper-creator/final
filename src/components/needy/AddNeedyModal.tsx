'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCategories, usePartners, useCountries } from '@/hooks/queries/use-lookups'
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
import { formatDateForInput } from '@/lib/utils'

// Basit kayıt için minimal schema
const addNeedySchema = z.object({
  category_id: z.string().min(1, 'Kategori seçilmeli'),
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  nationality_id: z.string().optional(),
  date_of_birth: z.string().optional(),
  identity_number: z.string()
    .regex(/^\d{11}$/, 'TC Kimlik numarası 11 haneli olmalıdır')
    .optional()
    .or(z.literal('')),
  check_mernis: z.boolean().optional().default(false),
  fund_region: z.string().optional(),
  partner_type: z.string().optional(),
  partner_id: z.string().optional(),
  file_number: z.string().optional(),
})

type AddNeedyFormValues = z.input<typeof addNeedySchema>

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
  const [isMernisVerifying, setIsMernisVerifying] = useState(false)
  const [mernisStatus, setMernisStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [mernisMessage, setMernisMessage] = useState('')

  // Fetch categories, partners, and countries from database
  const { data: categories } = useCategories('needy') as { data: Array<{ id: string; name: string; type: string | null }> | undefined }
  const { data: partners } = usePartners() as { data: Array<{ id: string; name: string; type: string | null }> | undefined }
  const { data: countries } = useCountries() as { data: Array<{ id: string; name: string; code: string }> | undefined }

  const form = useForm<AddNeedyFormValues>({
    resolver: zodResolver(addNeedySchema),
    defaultValues: {
      category_id: '', // Will be set to first category if available
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
      if (values.check_mernis && values.identity_number && values.date_of_birth) {
        const birthYear = new Date(values.date_of_birth).getFullYear()

        // Show loading state for MERNIS verification
        setIsMernisVerifying(true)
        setMernisStatus('verifying')
        setMernisMessage('MERNIS doğrulaması yapılıyor...')
        toast.loading('MERNIS doğrulaması yapılıyor...', { id: 'mernis-verify' })

        const mernisResponse = await fetch('/api/mernis/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tcKimlikNo: values.identity_number,
            ad: values.first_name,
            soyad: values.last_name,
            dogumYili: birthYear,
          }),
        })

        const mernisResult = await mernisResponse.json()

        setIsMernisVerifying(false)

        if (!mernisResult.verified) {
          setMernisStatus('error')
          setMernisMessage(mernisResult.message || 'Doğrulama başarısız')
          toast.error(`Mernis Doğrulama: ${mernisResult.message}`, { id: 'mernis-verify' })
          setIsLoading(false)
          return
        }

        setMernisStatus('success')
        setMernisMessage('TC Kimlik doğrulaması başarılı')
        toast.success('TC Kimlik doğrulaması başarılı', { id: 'mernis-verify' })
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

  const { isValid, isDirty } = form.formState
  const isFormValid = isValid && isDirty

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni İhtiyaç Sahibi Ekle</DialogTitle>
          <DialogDescription className="sr-only">
            Yeni ihtiyaç sahibi kişisi eklemek için aşağıdaki formu doldurun
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 border-b pb-4">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isFormValid || isLoading || isMernisVerifying}
            className="bg-emerald-600 hover:bg-emerald-700"
            data-testid="save-button"
          >
            {isLoading || isMernisVerifying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isMernisVerifying ? 'Doğrulanıyor...' : isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Kapat
          </Button>
        </div>

        <Form {...form}>
          <form className="space-y-4 pt-4">
            {/* Kategori */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={!categories || categories.length === 0}>
                    <FormControl>
                      <SelectTrigger data-testid="category-select">
                        <SelectValue placeholder={categories && categories.length > 0 ? "Kategori seçin" : "Kategoriler yükleniyor..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Kategoriler yükleniyor...</SelectItem>
                      )}
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
                    <FormLabel htmlFor="first_name">Ad *</FormLabel>
                    <FormControl>
                      <Input id="first_name" {...field} placeholder="Ad" data-testid="first-name-input" />
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
                    <FormLabel htmlFor="last_name">Soyad *</FormLabel>
                    <FormControl>
                      <Input id="last_name" {...field} placeholder="Soyad" data-testid="last-name-input" />
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
                    <FormLabel htmlFor="nationality_id">Uyruk</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!countries || countries.length === 0}>
                      <FormControl>
                        <SelectTrigger id="nationality_id" data-testid="nationality-select">
                          <SelectValue placeholder={countries && countries.length > 0 ? "Ülke seçin" : "Ülkeler yükleniyor..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries && countries.length > 0 ? (
                          countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Ülkeler yükleniyor...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="date_of_birth">Doğum Tarihi</FormLabel>
                    <FormControl>
                      <Input id="date_of_birth" type="date" {...field} value={formatDateForInput(field.value)} data-testid="date-of-birth-input" />
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
                    <FormLabel htmlFor="identity_number">Kimlik No</FormLabel>
                    <FormControl>
                      <Input id="identity_number" data-testid="identity-number-input" {...field} placeholder="11 haneli TC Kimlik No" maxLength={11} />
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
                        data-testid="mernis-checkbox"
                        disabled={isMernisVerifying}
                      />
                    </FormControl>
                    <div className="flex flex-col gap-1">
                      <FormLabel className="!mt-0 cursor-pointer flex items-center gap-2">
                        Mernis Kontrolü Yap
                        {isMernisVerifying && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        {mernisStatus === 'success' && <span className="text-success text-sm">✓ Doğrulandı</span>}
                        {mernisStatus === 'error' && <span className="text-destructive text-sm">✗ Başarısız</span>}
                      </FormLabel>
                      {mernisMessage && (
                        <span className={`text-xs ${mernisStatus === 'error' ? 'text-destructive' : mernisStatus === 'success' ? 'text-success' : 'text-muted-foreground'}`}>
                          {mernisMessage}
                        </span>
                      )}
                    </div>
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
                      <SelectTrigger data-testid="fund-region-select">
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
                        <SelectTrigger data-testid="partner-type-select">
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
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!partners || partners.length === 0}>
                      <FormControl>
                        <SelectTrigger data-testid="partner-id-select">
                          <SelectValue placeholder={partners && partners.length > 0 ? "Kurum/Saha seçin" : "Yükleniyor..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">(Boş)</SelectItem>
                        {partners && partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
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
                    <Input {...field} placeholder="45.645.645" data-testid="file-number-input" />
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
