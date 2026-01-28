'use client'

import { Control } from 'react-hook-form'
import {
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
import { FormSection } from './FormSection'
import { 
  User, 
  IdCard, 
  Briefcase, 
  Heart, 
  Phone,
  Shield,
  MapPin
} from 'lucide-react'
import { GENDERS, MARITAL_STATUSES, RELIGIONS, EDUCATION_STATUSES, EDUCATION_LEVELS } from '@/types/needy.types'
import { DISEASES, INCOME_SOURCES } from './MultiSelectSection'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { formatDateForInput } from '@/lib/utils'

interface BasicInfoFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  countries?: { id: string; name: string }[]
  cities?: { id: string; name: string }[]
  districts?: { id: string; name: string }[]
  neighborhoods?: { id: string; name: string }[]
  selectedDiseases?: string[]
  onDiseasesChange?: (diseases: string[]) => void
  selectedIncomeSources?: string[]
  onIncomeSourcesChange?: (sources: string[]) => void
}

export function BasicInfoForm({ 
  control, 
  countries = [], 
  cities = [], 
  districts = [],
  neighborhoods = [],
  selectedDiseases = [],
  onDiseasesChange,
  selectedIncomeSources = [],
  onIncomeSourcesChange
}: BasicInfoFormProps) {
  return (
    <div className="space-y-4">
      {/* Temel Bilgiler */}
      <FormSection title="Temel Bilgiler" icon={<User className="h-4 w-4 text-info" />}>
        {/* Kimlik Bilgileri - 4 Kolonlu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FormField
            control={control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Ad <span className="text-danger">*</span></FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Ad" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Soyad <span className="text-danger">*</span></FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Soyad" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="identity_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Kimlik Türü</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tc">TC Kimlik</SelectItem>
                    <SelectItem value="passport">Pasaport</SelectItem>
                    <SelectItem value="ikamet">İkamet</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="identity_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Kimlik No</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Kimlik numarası" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Kişisel Bilgiler - 4 Kolonlu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <FormField
            control={control}
            name="nationality_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Uyruk</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((c) => (
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
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Cinsiyet</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Doğum Tarihi</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ? (field.value.includes('T') ? field.value.split('T')[0] : field.value) : ''} 
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="birth_place"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Doğum Yeri</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Doğum yeri" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Aile ve Sosyal Bilgiler - 4 Kolonlu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <FormField
            control={control}
            name="marital_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Medeni Durum</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MARITAL_STATUSES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Din</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RELIGIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="father_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Baba Adı</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Baba adı" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="mother_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Anne Adı</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Anne adı" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Eğitim Bilgileri - 2 Kolonlu */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <FormField
            control={control}
            name="education_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Öğrenim Durumu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EDUCATION_STATUSES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="education_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Öğrenim Seviyesi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      {/* Adres Bilgileri - Ayrı Section */}
      <FormSection title="Adres Bilgileri" icon={<MapPin className="h-4 w-4 text-emerald-500" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FormField
            control={control}
            name="country_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Ülke</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((c) => (
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
            control={control}
            name="city_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">İl</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((c) => (
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
            control={control}
            name="district_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">İlçe</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="neighborhood_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Mahalle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-3">
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Açık Adres</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Sokak, bina no, daire no..." className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      {/* İletişim Bilgileri */}
      <FormSection title="İletişim Bilgileri" icon={<Phone className="h-4 w-4 text-success" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FormField
            control={control}
            name="mobile_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Cep Telefonu</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="5XX XXX XX XX" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="landline_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Sabit Telefon</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="0XXX XXX XX XX" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="foreign_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Yurt Dışı Telefon</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="+XX XXX XXX XX XX" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">E-posta</FormLabel>
                <FormControl>
                  <Input type="email" {...field} value={field.value || ''} placeholder="email@example.com" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <FormField
            control={control}
            name="family_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Ailedeki Kişi Sayısı</FormLabel>
                <Select 
                  onValueChange={(v) => field.onChange(parseInt(v, 10))} 
                  value={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} kişi
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      {/* Kimlik, Pasaport ve Vize Bilgileri */}
      <FormSection title="Kimlik, Pasaport ve Vize Bilgileri" icon={<IdCard className="h-4 w-4 text-purple-500" />} defaultOpen={false}>
        {/* Kimlik Bilgileri */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <FormField
            control={control}
            name="id_document_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Kimlik Belgesi Türü</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    <SelectItem value="id_card">Nüfus Cüzdanı</SelectItem>
                    <SelectItem value="tc_card">TC Kimlik Belgesi</SelectItem>
                    <SelectItem value="temp_residence">Geçici İkamet Belgesi</SelectItem>
                    <SelectItem value="foreign_id">Yabancı Kimlik Belgesi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="id_validity_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Geçerlilik Tarihi</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={formatDateForInput(field.value)} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="id_document_serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Seri Numarası</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Belge seri no" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pasaport Bilgileri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <FormField
            control={control}
            name="passport_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Pasaport Türü</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    <SelectItem value="regular">Umuma Mahsus</SelectItem>
                    <SelectItem value="special">Hususi (Yeşil)</SelectItem>
                    <SelectItem value="diplomatic">Diplomatik</SelectItem>
                    <SelectItem value="service">Hizmet</SelectItem>
                    <SelectItem value="temp">Geçici</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="passport_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Pasaport No</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Pasaport numarası" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="passport_expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Pasaport Bitiş</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={formatDateForInput(field.value)} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="visa_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Vize Türü</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="work">Çalışma İzni</SelectItem>
                    <SelectItem value="student">Öğrenci</SelectItem>
                    <SelectItem value="temp_residence">Geçici İkamet</SelectItem>
                    <SelectItem value="refugee">Mülteci</SelectItem>
                    <SelectItem value="asylum">Sığınmacı</SelectItem>
                    <SelectItem value="tourist">Turist</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Vize ve Geri Dönüş */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <FormField
            control={control}
            name="visa_expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Vize Bitiş</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={formatDateForInput(field.value)} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="return_status"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-xs font-medium">Geri Dönüş Durumu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="impossible">Geri Dönmesi Mümkün Değil</SelectItem>
                    <SelectItem value="no_means">Geri Dönmeye İmkanı Yok</SelectItem>
                    <SelectItem value="not_planning">Geri Dönmeyi Düşünmüyor</SelectItem>
                    <SelectItem value="will_return">Şartlar Uygunlaşınca Dönecek</SelectItem>
                    <SelectItem value="transit">Transit Geçiş</SelectItem>
                    <SelectItem value="visa_expiry">Vize Süresi Bitince Dönecek</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      {/* İş ve Gelir Durumu */}
      <FormSection title="İş ve Gelir Durumu" icon={<Briefcase className="h-4 w-4 text-warning" />} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FormField
            control={control}
            name="employment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Çalışma Durumu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employed">Çalışıyor</SelectItem>
                    <SelectItem value="unemployed">İşsiz</SelectItem>
                    <SelectItem value="retired">Emekli</SelectItem>
                    <SelectItem value="disabled">Malül</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="profession_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Meslek</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Meslek" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="living_situation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Yaşam Durumu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="own_house">Kendi Evi</SelectItem>
                    <SelectItem value="rental">Kiracı</SelectItem>
                    <SelectItem value="with_relatives">Akrabalarının Yanı</SelectItem>
                    <SelectItem value="shelter">Başkalarının Yanı</SelectItem>
                    <SelectItem value="homeless">Evsiz</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="social_security"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Sosyal Güvence</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="state">Devlet / SGK</SelectItem>
                    <SelectItem value="private">Özel Sigorta</SelectItem>
                    <SelectItem value="green_card">Yeşil Kart</SelectItem>
                    <SelectItem value="none">Yok</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Mali Bilgiler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <FormField
            control={control}
            name="monthly_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Aylık Gelir (₺)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="monthly_expense"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Aylık Gider (₺)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="rent_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Kira Tutarı (₺)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="debt_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Borç Tutarı (₺)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Gelir Kaynakları */}
        {onIncomeSourcesChange && (
          <div className="mt-5">
            <Label className="text-xs font-medium mb-2 block">Gelir Kaynakları</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-lg p-3 bg-muted/30">
              {INCOME_SOURCES.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedIncomeSources.includes(source.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onIncomeSourcesChange([...selectedIncomeSources, source.id])
                      } else {
                        onIncomeSourcesChange(selectedIncomeSources.filter(id => id !== source.id))
                      }
                    }}
                  />
                  <Label htmlFor={source.id} className="text-xs cursor-pointer">
                    {source.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormSection>

      {/* Sağlık Bilgileri */}
      <FormSection title="Sağlık Bilgileri" icon={<Heart className="h-4 w-4 text-pink-500" />} defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FormField
            control={control}
            name="blood_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Kan Grubu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A+">A Rh (+)</SelectItem>
                    <SelectItem value="A-">A Rh (-)</SelectItem>
                    <SelectItem value="B+">B Rh (+)</SelectItem>
                    <SelectItem value="B-">B Rh (-)</SelectItem>
                    <SelectItem value="AB+">AB Rh (+)</SelectItem>
                    <SelectItem value="AB-">AB Rh (-)</SelectItem>
                    <SelectItem value="0+">0 Rh (+)</SelectItem>
                    <SelectItem value="0-">0 Rh (-)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="is_smoker"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Sigara Kullanımı</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="never">Hiç Kullanmadım</SelectItem>
                    <SelectItem value="quit">Bıraktım</SelectItem>
                    <SelectItem value="occasional">Nadir</SelectItem>
                    <SelectItem value="regular">Sürekli</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="health_issue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Sağlık Problemi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    <SelectItem value="needs_treatment">Tedavi Edilmesi Gerekiyor</SelectItem>
                    <SelectItem value="in_treatment">Tedavi Oluyor</SelectItem>
                    <SelectItem value="untreatable">Tedavisi Mümkün Değil</SelectItem>
                    <SelectItem value="abroad_treatment">Yurtdışı Tedavi Gerekiyor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="disability_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Engellilik Oranı (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100}
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* İlaç ve Ameliyat Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <FormField
            control={control}
            name="regular_medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Düzenli Kullandığı İlaçlar</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="İlaç listesi" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="surgeries"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Geçirdiği Ameliyatlar</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Ameliyat listesi" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="mt-3">
          <FormField
            control={control}
            name="health_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Sağlık Notları</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Ek sağlık bilgileri" className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Hastalıklar */}
        {onDiseasesChange && (
          <div className="mt-5">
            <Label className="text-xs font-medium mb-2 block">Hastalık(lar)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
              {DISEASES.map((disease) => (
                <div key={disease.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={disease.id}
                    checked={selectedDiseases.includes(disease.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onDiseasesChange([...selectedDiseases, disease.id])
                      } else {
                        onDiseasesChange(selectedDiseases.filter(id => id !== disease.id))
                      }
                    }}
                  />
                  <Label htmlFor={disease.id} className="text-xs cursor-pointer">
                    {disease.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormSection>

      {/* Acil Durum İletişimi */}
      <FormSection title="Acil Durum İletişimi" icon={<Shield className="h-4 w-4 text-danger" />} defaultOpen={false}>
        {/* 1. Kişi */}
        <div className="p-3 border rounded-lg bg-muted/30 mb-3">
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">1. Acil Durum Kişisi</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField
              control={control}
              name="emergency_contact1_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Ad Soyad</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Ad Soyad" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="emergency_contact1_relation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Yakınlık</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Örn: Kardeş, Eş" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="emergency_contact1_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Telefon</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="5XX XXX XX XX" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* 2. Kişi */}
        <div className="p-3 border rounded-lg bg-muted/30">
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">2. Acil Durum Kişisi</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField
              control={control}
              name="emergency_contact2_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Ad Soyad</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Ad Soyad" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="emergency_contact2_relation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Yakınlık</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Örn: Kardeş, Eş" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="emergency_contact2_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Telefon</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="5XX XXX XX XX" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </FormSection>
    </div>
  )
}
