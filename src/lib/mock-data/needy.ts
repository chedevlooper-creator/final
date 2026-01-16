import { NeedyPerson } from '@/types/needy.types'
import type { BankAccount, Document, Photo, AidReceived, Currency, TransactionType, DocumentType, PhotoType, AidType, DeliveryStatus } from '@/types/linked-records.types'

// Mock Lookup Data
export const mockCountries = [
  { id: '1', name: 'Türkiye' },
  { id: '2', name: 'Suriye' },
  { id: '3', name: 'Irak' },
  { id: '4', name: 'Afganistan' },
  { id: '5', name: 'Yemen' },
]

export const mockCities = [
  { id: '1', name: 'İstanbul (Avrupa)', country_id: '1' },
  { id: '2', name: 'İstanbul (Anadolu)', country_id: '1' },
  { id: '3', name: 'Ankara', country_id: '1' },
  { id: '4', name: 'İzmir', country_id: '1' },
  { id: '5', name: 'Bursa', country_id: '1' },
  { id: '6', name: 'Antalya', country_id: '1' },
  { id: '7', name: 'Gaziantep', country_id: '1' },
]

export const mockDistricts = [
  { id: '1', name: 'Başakşehir', city_id: '1' },
  { id: '2', name: 'Beylikdüzü', city_id: '1' },
  { id: '3', name: 'Kadıköy', city_id: '2' },
  { id: '4', name: 'Üsküdar', city_id: '2' },
  { id: '5', name: 'Çankaya', city_id: '3' },
  { id: '6', name: 'Keçiören', city_id: '3' },
]

export const mockNeighborhoods = [
  { id: '1', name: 'Altınşehir Mah.', district_id: '1' },
  { id: '2', name: 'Bahçeşehir 1. Kısım Mah.', district_id: '1' },
  { id: '3', name: 'Bahçeşehir 2. Kısım Mah.', district_id: '1' },
  { id: '4', name: 'Kayabaşı Mah.', district_id: '1' },
]

export const mockCategories = [
  { id: '1', name: 'Yetim Ailesi', type: 'needy' },
  { id: '2', name: 'Mülteci Aile', type: 'needy' },
  { id: '3', name: 'İhtiyaç Sahibi Aile', type: 'needy' },
  { id: '4', name: 'Öğrenci (Yabancı)', type: 'needy' },
  { id: '5', name: 'Öğrenci (TC)', type: 'needy' },
]

export const mockPartners = [
  { id: '1', name: 'KafkasDer İstanbul Şubesi' },
  { id: '2', name: 'KafkasDer Ankara Şubesi' },
  { id: '3', name: 'Yardım Birimi Merkez' },
  { id: '4', name: 'Saha Ekibi 1' },
  { id: '5', name: 'Saha Ekibi 2' },
]

// Mock Needy Persons
export const mockNeedyPersons: NeedyPerson[] = [
  {
    id: '1',
    file_number: 'NE-2024-001',
    category_id: '1',
    partner_id: '1',
    first_name: 'Ahmet',
    last_name: 'Yılmaz',
    first_name_original: 'أحمد',
    last_name_original: 'يلما',
    nationality_id: '1',
    country_id: '1',
    city_id: '1',
    district_id: '1',
    neighborhood_id: '1',
    identity_type: 'tc',
    identity_number: '12345678901',
    gender: 'male',
    date_of_birth: '1990-05-15',
    birth_place: 'İstanbul',
    marital_status: 'married',
    education_status: 'graduated',
    education_level: 'high',
    religion: 'muslim',
    criminal_record: false,
    father_name: 'Mehmet',
    mother_name: 'Ayşe',
    family_size: 4,
    mobile_phone: '5301234567',
    phone: '02121234567',
    email: 'ahmet.yilmaz@example.com',
    address: 'Başakşehir Evleri 1.Etap 4.Kısım Sitesi D/ Blok No: 14A/ Daire: 61',
    status: 'active',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    created_ip: '192.168.1.100',
    total_aid_amount: 5000,
    consent_status: 'received',
    consent_date: '2024-01-15',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    file_number: 'NE-2024-002',
    category_id: '2',
    partner_id: '2',
    first_name: 'Fatma',
    last_name: 'Demir',
    nationality_id: '2',
    country_id: '1',
    city_id: '7',
    identity_type: 'passport',
    passport_number: 'SY123456',
    gender: 'female',
    date_of_birth: '1985-08-20',
    birth_place: 'Halep',
    marital_status: 'married',
    education_status: 'dropout',
    education_level: 'middle',
    religion: 'muslim',
    criminal_record: false,
    father_name: 'Ali',
    mother_name: 'Zeynep',
    family_size: 6,
    mobile_phone: '5059876543',
    email: 'fatma.demir@example.com',
    address: 'Gaziantep Merkez Mah. No: 45',
    status: 'active',
    is_active: true,
    created_at: '2024-02-01T14:20:00Z',
    created_ip: '192.168.1.101',
    total_aid_amount: 7500,
    consent_status: 'pending',
    updated_at: '2024-02-01T14:20:00Z',
  },
  {
    id: '3',
    file_number: 'NE-2024-003',
    category_id: '3',
    partner_id: '3',
    first_name: 'Muhammed',
    last_name: 'Kaya',
    nationality_id: '1',
    country_id: '1',
    city_id: '3',
    district_id: '5',
    identity_type: 'tc',
    identity_number: '98765432109',
    gender: 'male',
    date_of_birth: '1988-12-10',
    birth_place: 'Ankara',
    marital_status: 'single',
    education_status: 'student',
    education_level: 'bachelor',
    religion: 'muslim',
    criminal_record: false,
    father_name: 'Hasan',
    mother_name: 'Hatice',
    family_size: 3,
    mobile_phone: '5321112233',
    email: 'muhammed.kaya@example.com',
    address: 'Çankaya Merkez Cad. No: 12/5',
    status: 'pending',
    is_active: true,
    created_at: '2024-03-10T09:15:00Z',
    created_ip: '192.168.1.102',
    total_aid_amount: 2500,
    consent_status: 'received',
    consent_date: '2024-03-10',
    updated_at: '2024-03-10T09:15:00Z',
  },
]

// Mock Linked Records
export const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    needy_person_id: '1',
    account_holder_name: 'Ahmet Yılmaz',
    currency: 'TRY' as Currency,
    transaction_type: 'havale' as TransactionType,
    iban: 'TR330006100519786457841326',
    bank_name: 'Ziraat Bankası',
    branch_name: 'Başakşehir Şubesi',
    branch_code: '519',
    account_number: '786457841326',
    swift_code: 'TCZBTR2A',
    address: 'Başakşehir, İstanbul',
    is_active: true,
    is_primary: true,
    created_at: '2024-01-15T10:35:00Z',
    updated_at: '2024-01-15T10:35:00Z',
    created_by: null,
    notes: null,
  },
]

export const mockDocuments: Document[] = [
  {
    id: '1',
    needy_person_id: '1',
    document_type: 'kimlik' as DocumentType,
    document_name: 'TC Kimlik Kartı',
    file_path: '/documents/1/id-card.pdf',
    file_size: 245760,
    mime_type: 'application/pdf',
    issue_date: '2020-01-01',
    expiry_date: '2030-12-31',
    document_number: '12345678901',
    issuing_authority: 'Nüfus Müdürlüğü',
    is_verified: true,
    verified_by: 'Admin',
    verified_at: '2024-01-15T10:40:00Z',
    created_at: '2024-01-15T10:40:00Z',
    updated_at: '2024-01-15T10:40:00Z',
    created_by: null,
    notes: null,
  },
  {
    id: '2',
    needy_person_id: '1',
    document_type: 'pasaport' as DocumentType,
    document_name: 'Pasaport',
    file_path: '/documents/1/passport.pdf',
    file_size: 512000,
    mime_type: 'application/pdf',
    issue_date: '2022-01-01',
    expiry_date: '2028-06-30',
    document_number: 'AB123456',
    issuing_authority: 'Pasaport Şubesi',
    is_verified: true,
    verified_by: 'Admin',
    verified_at: '2024-01-15T10:45:00Z',
    created_at: '2024-01-15T10:45:00Z',
    updated_at: '2024-01-15T10:45:00Z',
    created_by: null,
    notes: null,
  },
]

export const mockPhotos: Photo[] = [
  {
    id: '1',
    needy_person_id: '1',
    photo_type: 'profile' as PhotoType,
    file_path: '/photos/1/profile.jpg',
    file_name: 'profile.jpg',
    file_size: 102400,
    mime_type: 'image/jpeg',
    width: 400,
    height: 400,
    thumbnail_path: '/photos/1/profile_thumb.jpg',
    is_primary: true,
    is_consent_given: true,
    consent_date: '2024-01-15',
    created_at: '2024-01-15T10:50:00Z',
    updated_at: '2024-01-15T10:50:00Z',
    created_by: null,
    description: 'Profil Fotoğrafı',
  },
]

// Application mock data kaldırıldı - aid_applications tablosundan sorgulayın

export const mockAidsReceived: AidReceived[] = [
  {
    id: '1',
    needy_person_id: '1',
    application_id: null,
    aid_type: 'cash' as AidType,
    aid_category: 'emergency',
    description: 'Acil nakdi yardım',
    amount: 1000,
    currency: 'TRY' as Currency,
    quantity: null,
    unit: null,
    aid_date: '2024-01-25T12:00:00Z',
    delivery_date: '2024-01-25T12:00:00Z',
    delivery_method: 'bank_transfer',
    delivery_status: 'delivered' as DeliveryStatus,
    delivered_by: 'Yardım Ekibi',
    delivered_at: '2024-01-25T12:30:00Z',
    receipt_number: 'RCT-2024-001',
    receipt_path: null,
    created_at: '2024-01-25T12:00:00Z',
    updated_at: '2024-01-25T12:30:00Z',
    created_by: null,
    notes: null,
  },
  {
    id: '2',
    needy_person_id: '1',
    application_id: null,
    aid_type: 'food' as AidType,
    aid_category: 'regular',
    description: 'Düzenli gıda yardımı',
    amount: 500,
    currency: 'TRY' as Currency,
    quantity: 1,
    unit: 'paket',
    aid_date: '2024-02-15T10:30:00Z',
    delivery_date: '2024-02-15T11:00:00Z',
    delivery_method: 'hand_delivery',
    delivery_status: 'delivered' as DeliveryStatus,
    delivered_by: 'Saha Ekibi',
    delivered_at: '2024-02-15T11:30:00Z',
    receipt_number: 'RCT-2024-002',
    receipt_path: null,
    created_at: '2024-02-15T10:30:00Z',
    updated_at: '2024-02-15T11:30:00Z',
    created_by: null,
    notes: null,
  },
]


// Mock Data Helper Functions
export function getMockNeedyPerson(id: string): NeedyPerson | null {
  return mockNeedyPersons.find(p => p.id === id) || null
}

export function getMockNeedyList(filters?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}): { data: NeedyPerson[], count: number } {
  let filtered = [...mockNeedyPersons]

  // Apply filters
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchLower) ||
      p.file_number?.toLowerCase().includes(searchLower) ||
      p.identity_number?.toLowerCase().includes(searchLower)
    )
  }

  if (filters?.status) {
    filtered = filtered.filter(p => p.status === filters.status)
  }

  // Pagination
  const page = filters?.page || 0
  const limit = filters?.limit || 20
  const start = page * limit
  const end = start + limit

  return {
    data: filtered.slice(start, end),
    count: filtered.length,
  }
}

export function getMockBankAccounts(needyPersonId: string): BankAccount[] {
  return mockBankAccounts.filter(acc => acc.needy_person_id === needyPersonId)
}

export function getMockDocuments(needyPersonId: string): Document[] {
  return mockDocuments.filter(doc => doc.needy_person_id === needyPersonId)
}

export function getMockPhotos(needyPersonId: string): Photo[] {
  return mockPhotos.filter(photo => photo.needy_person_id === needyPersonId)
}

// getMockApplications kaldırıldı - aid_applications tablosundan sorgulayın

export function getMockAidsReceived(needyPersonId: string): AidReceived[] {
  return mockAidsReceived.filter(aid => aid.needy_person_id === needyPersonId)
}
