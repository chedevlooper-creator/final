// İhtiyaç Sahibi - Tam Type Tanımları

export interface NeedyPerson {
  id: string
  file_number?: string
  category_id?: string
  partner_id?: string
  field_id?: string
  sponsorship_type_id?: string

  // Kişisel Bilgiler
  first_name: string
  last_name: string
  first_name_original?: string
  last_name_original?: string
  nationality_id?: string
  country_id?: string
  city_id?: string
  district_id?: string
  neighborhood_id?: string

  // Kimlik Bilgileri
  identity_type?: 'tc' | 'passport' | 'other'
  identity_number?: string
  passport_number?: string
  passport_type?: 'none' | 'diplomatic' | 'temp' | 'service' | 'special' | 'regular'
  passport_expiry?: string
  visa_type?: 'work' | 'student' | 'temp_residence' | 'dual_citizen' | 'refugee' | 'asylum' | 'tourist'
  visa_expiry?: string
  return_status?: 'impossible' | 'no_means' | 'not_planning' | 'will_return' | 'transit' | 'visa_expiry'

  // Kimlik Detay
  father_name?: string
  mother_name?: string
  id_document_type?: 'none' | 'id_card' | 'tc_card' | 'temp_residence' | 'foreign_id'
  id_document_serial?: string
  id_validity_date?: string
  previous_nationality_id?: string
  previous_name?: string

  // Kişisel Detaylar
  gender?: 'male' | 'female'
  date_of_birth?: string
  birth_place?: string
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
  education_status?: 'never' | 'graduated' | 'dropout' | 'student'
  education_level?: 'primary' | 'middle' | 'high' | 'associate' | 'bachelor' | 'master' | 'literate'
  religion?: 'muslim' | 'christian' | 'jewish' | 'buddhist' | 'other'
  criminal_record?: boolean

  // İletişim
  phone?: string
  mobile_phone?: string
  mobile_operator?: string
  landline_phone?: string
  foreign_phone?: string
  email?: string
  address?: string

  // Aile
  family_size?: number
  linked_orphan_id?: string
  linked_card_id?: string

  // İş ve Gelir
  living_situation?: 'own_house' | 'rental' | 'with_relatives' | 'shelter' | 'homeless' | 'other'
  income_source?: string
  monthly_income?: number
  monthly_expense?: number
  rent_amount?: number
  debt_amount?: number
  social_security?: 'state' | 'private' | 'green_card' | 'none'
  employment_status?: 'employed' | 'unemployed' | 'retired' | 'disabled'
  sector_id?: string
  profession_id?: string
  profession_description?: string
  additional_notes_tr?: string
  additional_notes_en?: string
  additional_notes_ar?: string

  // Sağlık
  health_status?: string
  disability_status?: string
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-'
  is_smoker?: 'never' | 'quit' | 'occasional' | 'regular'
  health_issue?: 'none' | 'needs_treatment' | 'in_treatment' | 'untreatable' | 'abroad_treatment'
  disability_rate?: number
  prosthetics?: string
  regular_medications?: string
  surgeries?: string
  health_notes?: string

  // Acil Durum
  emergency_contact1_name?: string
  emergency_contact1_relation?: string
  emergency_contact1_phone?: string
  emergency_contact2_name?: string
  emergency_contact2_relation?: string
  emergency_contact2_phone?: string

  // Fotoğraf ve Rıza
  photo_url?: string
  consent_status?: 'pending' | 'received' | 'rejected'
  consent_date?: string

  // Fon ve Dosya
  fund_region?: 'europe' | 'free'

  // Meta
  notes?: string
  status: 'active' | 'inactive' | 'pending'
  is_active: boolean
  tags?: string[]

  // Kayıt Bilgileri
  total_aid_amount?: number
  application_count?: number
  aid_count?: number
  created_ip?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string

  // İlişkili Veriler (Join)
  category?: { id: string; name: string }
  nationality?: { id: string; name: string }
  country?: { id: string; name: string }
  city?: { id: string; name: string }
  district?: { id: string; name: string }
  neighborhood?: { id: string; name: string }
  partner?: { id: string; name: string }
  sector?: { id: string; name: string }
  profession?: { id: string; name: string }
}

// Banka Hesabı (Needy Person için)
// Not: Genel BankAccount için @/types/finance.types kullanın
export interface NeedyPersonBankAccount {
  id: string
  needy_person_id: string
  account_holder: string
  currency: string
  transaction_type?: string
  iban?: string
  bank_name?: string
  branch_name?: string
  account_number?: string
  swift_code?: string
  address?: string
  is_active: boolean
  created_at: string
}

// Doküman
export interface Document {
  id: string
  entity_type: string
  entity_id: string
  document_type?: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  group_name?: string
  is_active: boolean
  uploaded_at: string
}

// Bağımlı Kişi
// @deprecated Import from @/types/linked-records.types for more comprehensive type
export type { Dependent } from '@/types/linked-records.types'

// Görüşme Kaydı
// @deprecated Import from @/types/linked-records.types for more comprehensive type
export type { Interview } from '@/types/linked-records.types'

// Rıza Beyanı
// @deprecated Import from @/types/linked-records.types for more comprehensive type
export type { Consent } from '@/types/linked-records.types'

// Sosyal Kart
// @deprecated Import from @/types/linked-records.types for more comprehensive type
export type { SocialCard } from '@/types/linked-records.types'

// Referans
// @deprecated Import from @/types/linked-records.types for more comprehensive type
export type { NeedyReference } from '@/types/linked-records.types'

// Dropdown Seçenekleri
export const CATEGORIES = [
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

export const PASSPORT_TYPES = [
  { value: 'none', label: 'Yok' },
  { value: 'diplomatic', label: 'Diplomatik' },
  { value: 'temp', label: 'Geçici (Seyahat Belgesi)' },
  { value: 'service', label: 'Hizmet (Devlet Görevi)' },
  { value: 'special', label: 'Hususi (Yeşil)' },
  { value: 'regular', label: 'Umuma Mahsus' },
]

export const VISA_TYPES = [
  { value: 'work', label: 'Çalışma İzni' },
  { value: 'student', label: 'Eğitim / Öğrenci' },
  { value: 'temp_residence', label: 'Geçici İkamet' },
  { value: 'dual_citizen', label: 'İkinci Vatandaşlık' },
  { value: 'refugee', label: 'Mülteci' },
  { value: 'asylum', label: 'Sığınmacı' },
  { value: 'tourist', label: 'Turist / Seyahat' },
]

export const RETURN_STATUSES = [
  { value: 'impossible', label: 'Geri Dönmesi Mümkün Değil' },
  { value: 'no_means', label: 'Geri Dönmeye İmkanı Yok' },
  { value: 'not_planning', label: 'Geri Dönmeyi Düşünmüyor' },
  { value: 'will_return', label: 'Şartlar Uygunlaşınca Dönecek' },
  { value: 'transit', label: 'Transit Geçiş' },
  { value: 'visa_expiry', label: 'Vize Süresi Bitince Dönecek' },
]

export const ID_DOCUMENT_TYPES = [
  { value: 'none', label: 'Yok' },
  { value: 'id_card', label: 'Nüfus Cüzdanı' },
  { value: 'tc_card', label: 'TC Kimlik Belgesi' },
  { value: 'temp_residence', label: 'Geçici İkamet Belgesi' },
  { value: 'foreign_id', label: 'Yabancı Kimlik Belgesi' },
]

export const MARITAL_STATUSES = [
  { value: 'single', label: 'Bekar' },
  { value: 'married', label: 'Evli' },
  { value: 'divorced', label: 'Boşanmış' },
  { value: 'widowed', label: 'Dul' },
]

export const EDUCATION_STATUSES = [
  { value: 'never', label: 'Hiç Okula Gitmedi' },
  { value: 'graduated', label: 'Mezun' },
  { value: 'dropout', label: 'Okulu Bıraktı' },
  { value: 'student', label: 'Öğrenci' },
]

export const EDUCATION_LEVELS = [
  { value: 'literate', label: 'Okur Yazar' },
  { value: 'primary', label: 'İlkokul' },
  { value: 'middle', label: 'Ortaokul' },
  { value: 'high', label: 'Lise' },
  { value: 'associate', label: 'Ön Lisans' },
  { value: 'bachelor', label: 'Lisans' },
  { value: 'master', label: 'Yüksek Lisans' },
]

export const LIVING_SITUATIONS = [
  { value: 'own_house', label: 'Kendi Evi' },
  { value: 'rental', label: 'Kira' },
  { value: 'with_relatives', label: 'Akrabalarının Yanı' },
  { value: 'shelter', label: 'Başkalarının Yanı' },
  { value: 'homeless', label: 'Evsiz / Sokakta Yaşıyor' },
  { value: 'other', label: 'Diğer' },
]

export const SOCIAL_SECURITY_TYPES = [
  { value: 'state', label: 'Devlet / SGK' },
  { value: 'private', label: 'Özel Sigorta' },
  { value: 'green_card', label: 'Yeşil Kart / Muhtaçlık Kartı' },
  { value: 'none', label: 'Yok' },
]

export const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Çalışıyor' },
  { value: 'unemployed', label: 'İşsiz' },
  { value: 'retired', label: 'Emekli' },
  { value: 'disabled', label: 'Malül' },
]

export const BLOOD_TYPES = [
  { value: 'A+', label: 'A Rh (+)' },
  { value: 'A-', label: 'A Rh (-)' },
  { value: 'B+', label: 'B Rh (+)' },
  { value: 'B-', label: 'B Rh (-)' },
  { value: 'AB+', label: 'AB Rh (+)' },
  { value: 'AB-', label: 'AB Rh (-)' },
  { value: '0+', label: '0 Rh (+)' },
  { value: '0-', label: '0 Rh (-)' },
]

export const SMOKER_STATUSES = [
  { value: 'never', label: 'Hiç Kullanmadım' },
  { value: 'quit', label: 'Kullanıyordum Bıraktım' },
  { value: 'occasional', label: 'Nadir Kullanıyorum' },
  { value: 'regular', label: 'Sürekli Kullanıyorum' },
]

export const HEALTH_ISSUES = [
  { value: 'none', label: 'Yok' },
  { value: 'needs_treatment', label: 'Tedavi Edilmesi Gerekiyor' },
  { value: 'in_treatment', label: 'Tedavi Oluyor' },
  { value: 'untreatable', label: 'Tedavisi Mümkün Değil' },
  { value: 'abroad_treatment', label: 'Yurtdışında Tedavisi Gerekiyor' },
]

export const DISABILITY_RATES = [
  { value: 'none', label: 'Yok' },
  { value: 'less_20', label: '%20\'den Az' },
  { value: '20_50', label: '%20 - %50 Arası' },
  { value: 'more_50', label: '%50\'den Fazla' },
]

export const MOBILE_OPERATORS = [
  { value: '530', label: '530' },
  { value: '531', label: '531' },
  { value: '532', label: '532' },
  { value: '533', label: '533' },
  { value: '534', label: '534' },
  { value: '535', label: '535' },
  { value: '536', label: '536' },
  { value: '537', label: '537' },
  { value: '538', label: '538' },
  { value: '539', label: '539' },
  { value: '540', label: '540' },
  { value: '541', label: '541' },
  { value: '542', label: '542' },
  { value: '543', label: '543' },
  { value: '544', label: '544' },
  { value: '545', label: '545' },
  { value: '546', label: '546' },
  { value: '547', label: '547' },
  { value: '548', label: '548' },
  { value: '549', label: '549' },
  { value: '551', label: '551' },
  { value: '552', label: '552' },
  { value: '553', label: '553' },
  { value: '554', label: '554' },
  { value: '555', label: '555' },
  { value: '559', label: '559' },
  { value: '561', label: '561' },
]

export const FUND_REGIONS = [
  { value: 'europe', label: 'Avrupa' },
  { value: 'free', label: 'Serbest' },
]

export const GENDERS = [
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
]

export const RELIGIONS = [
  { value: 'muslim', label: 'Müslüman' },
  { value: 'christian', label: 'Hristiyan' },
  { value: 'jewish', label: 'Yahudi' },
  { value: 'buddhist', label: 'Budist' },
  { value: 'other', label: 'Diğer' },
]

// Linked Records Tab Types
export const LINKED_RECORD_TABS = [
  { id: 'bank_accounts', label: 'Banka Hesapları', icon: 'CreditCard' },
  { id: 'documents', label: 'Dokümanlar', icon: 'FileText' },
  { id: 'photos', label: 'Fotoğraflar', icon: 'Image' },
  { id: 'orphans', label: 'Baktığı Yetimler', icon: 'Baby' },
  { id: 'dependents', label: 'Baktığı Kişiler', icon: 'Users' },
  { id: 'sponsors', label: 'Sponsorlar', icon: 'Heart' },
  { id: 'references', label: 'Referanslar', icon: 'UserCheck' },
  { id: 'interviews', label: 'Görüşme Kayıtları', icon: 'MessageSquare' },
  { id: 'sessions', label: 'Görüşme Seans Takibi', icon: 'Calendar' },
  { id: 'applications', label: 'Yardım Talepleri', icon: 'ClipboardList', badge: true },
  { id: 'aids', label: 'Yapılan Yardımlar', icon: 'Gift' },
  { id: 'consents', label: 'Rıza Beyanları', icon: 'Shield' },
  { id: 'cards', label: 'Sosyal Kartlar', icon: 'Wallet' },
  { id: 'summary', label: 'Kart Özeti', icon: 'BarChart' },
]
