// Mock data for development
export const getMockNeedyPerson = (id: string) => ({
  id,
  category_id: '1',
  first_name: 'Test',
  last_name: 'User',
  nationality_id: '1',
  identity_number: '12345678901',
  date_of_birth: '1990-01-01',
  gender: 'male' as const,
  marital_status: 'married' as const,
  mobile_phone: '5551234567',
  email: 'test@example.com',
  country_id: '1',
  city_id: '1',
  district_id: '1',
  neighborhood_id: '1',
  address: 'Test Address',
  fund_region: 'free' as const,
  partner_type: 'partner' as const,
  partner_id: '1',
  file_number: 'TEST-001',
  family_size: 4,
  orphan_count: 0,
  monthly_income: 5000,
  monthly_expense: 4000,
  living_situation: 'rental' as const,
  criminal_record: false,
  status: 'active' as const,
  consent_status: 'received' as const,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export const getMockBankAccounts = (needyPersonId?: string) => []

export const mockCountries = [
  { id: '1', name: 'Türkiye' },
  { id: '2', name: 'Suriye' },
]

export const mockCities = [
  { id: '1', name: 'İstanbul', country_id: '1' },
  { id: '2', name: 'Ankara', country_id: '1' },
]

export const mockDistricts = [
  { id: '1', name: 'Başakşehir', city_id: '1' },
  { id: '2', name: 'Çankaya', city_id: '2' },
]

export const mockNeighborhoods = [
  { id: '1', name: 'Altınşehir', district_id: '1' },
  { id: '2', name: 'Bahçelievler', district_id: '2' },
]

export const mockCategories = [
  { id: '1', name: 'Yetim Ailesi', type: 'needy' as const },
  { id: '2', name: 'Mülteci Aile', type: 'needy' as const },
]

export const mockPartners = [
  { id: '1', name: 'Partner 1', type: 'partner' as const },
  { id: '2', name: 'Partner 2', type: 'field' as const },
]
