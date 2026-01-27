'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { needyPersonSchema, NeedyPersonFormValues } from '@/lib/validations/needy'
import { useCreateNeedy, useUpdateNeedy } from '@/hooks/queries/use-needy'
import { useCountries, useCities, useCategories, usePartners } from '@/hooks/queries/use-lookups'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Tables } from '@/types/database.types'
import { formatDateForInput } from '@/lib/utils'

interface NeedyFormProps {
  initialData?: Tables<'needy_persons'>
  onSuccess?: () => void
}

const LIVING_SITUATIONS = [
  { value: 'own_house', label: 'Kendi Evi' },
  { value: 'rental', label: 'Kiracı' },
  { value: 'with_relatives', label: 'Akraba Yanı' },
  { value: 'shelter', label: 'Barınak' },
  { value: 'homeless', label: 'Evsiz' },
  { value: 'other', label: 'Diğer' },
]

const INCOME_SOURCES = [
  { value: 'none', label: 'Gelir Yok' },
  { value: 'salary', label: 'Maaş' },
  { value: 'pension', label: 'Emekli Maaşı' },
  { value: 'social_aid', label: 'Sosyal Yardım' },
  { value: 'charity', label: 'Hayırsever Yardımı' },
  { value: 'other', label: 'Diğer' },
]

export function NeedyForm({ initialData, onSuccess }: NeedyFormProps) {
  const createMutation = useCreateNeedy()
  const updateMutation = useUpdateNeedy()
  const isEditing = !!initialData

  const { data: countries } = useCountries() as { data: Array<{ id: string; name: string; code: string | null }> | undefined }
  const { data: categories } = useCategories('needy') as { data: Array<{ id: string; name: string; type: string | null }> | undefined }
  const { data: partners } = usePartners() as { data: Array<{ id: string; name: string; type: string | null }> | undefined }

  const form = useForm<NeedyPersonFormValues>({
    resolver: zodResolver(needyPersonSchema),
    defaultValues: initialData ? {
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      first_name_original: initialData.first_name_original,
      last_name_original: initialData.last_name_original,
      category_id: initialData.category_id,
      partner_id: initialData.partner_id,
      nationality_id: initialData.nationality_id,
      country_id: initialData.country_id,
      city_id: initialData.city_id,
      district_id: initialData.district_id,
      identity_type: initialData.identity_type as 'tc' | 'passport' | 'other' | null,
      identity_number: initialData.identity_number,
      passport_number: initialData.passport_number,
      gender: initialData.gender as 'male' | 'female' | null,
      date_of_birth: initialData.date_of_birth,
      phone: initialData.phone,
      email: initialData.email,
      address: initialData.address,
      living_situation: initialData.living_situation as 'own_house' | 'rental' | 'with_relatives' | 'shelter' | 'homeless' | 'other' | null,
      income_source: initialData.income_source as 'none' | 'salary' | 'pension' | 'social_aid' | 'charity' | 'other' | null,
      monthly_income: initialData.monthly_income,
      rent_amount: initialData.rent_amount,
      debt_amount: initialData.debt_amount,
      family_size: initialData.family_size,
      health_status: initialData.health_status,
      disability_status: initialData.disability_status,
      notes: initialData.notes,
      status: (initialData.status as 'active' | 'inactive' | 'pending') || 'active',
      is_active: initialData.is_active ?? true,
      tags: initialData.tags || [],
    } : {
      first_name: '',
      last_name: '',
      status: 'active',
      is_active: true,
    },
  })

  const selectedCountryId = form.watch('country_id')
  const { data: cities } = useCities(selectedCountryId || undefined) as { data: Array<{ id: string; name: string; country_id: string | null }> | undefined }

  const onSubmit = async (values: NeedyPersonFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData.id, values })
        toast.success('Kayıt güncellendi')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Kayıt oluşturuldu')
      }
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu'
      toast.error(errorMessage)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Kişisel</TabsTrigger>
            <TabsTrigger value="identity">Kimlik</TabsTrigger>
            <TabsTrigger value="address">Adres</TabsTrigger>
            <TabsTrigger value="financial">Mali Durum</TabsTrigger>
          </TabsList>

          {/* Kişisel Bilgiler */}
          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad" {...field} />
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
                      <Input placeholder="Soyad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Erkek</SelectItem>
                        <SelectItem value="female">Kadın</SelectItem>
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
                    <FormLabel>Doğum Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={formatDateForInput(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="0500 000 00 00" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@email.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
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
                    <FormLabel>Partner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Partner seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partners?.map((p) => (
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
          </TabsContent>

          {/* Kimlik Bilgileri */}
          <TabsContent value="identity" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="identity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kimlik Türü</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tc">TC Kimlik</SelectItem>
                        <SelectItem value="passport">Pasaport</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identity_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TC Kimlik No</FormLabel>
                    <FormControl>
                      <Input placeholder="11 haneli TC kimlik" maxLength={11} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passport_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasaport No</FormLabel>
                    <FormControl>
                      <Input placeholder="Pasaport numarası" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uyruk</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Uyruk seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Adres Bilgileri */}
          <TabsContent value="address" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ülke</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ülke seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şehir</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedCountryId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Şehir seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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
                name="living_situation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yaşam Durumu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LIVING_SITUATIONS.map((ls) => (
                          <SelectItem key={ls.value} value={ls.value}>
                            {ls.label}
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
                name="family_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hane Nüfusu</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Açık adres" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Mali Durum */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="income_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gelir Kaynağı</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INCOME_SOURCES.map((is) => (
                          <SelectItem key={is.value} value={is.value}>
                            {is.label}
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
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aylık Gelir (₺)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rent_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kira Tutarı (₺)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="debt_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borç Tutarı (₺)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ek notlar..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess}>
            İptal
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
