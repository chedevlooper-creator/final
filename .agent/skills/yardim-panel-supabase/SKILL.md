---
name: yardim-panel-supabase
description: Supabase veritabanı işlemleri. Tablo yapıları, ilişkiler, tip-güvenli sorgular ve migration kalıpları için kullanın.
---

# Supabase Veritabanı Skill

## Bağlı Proje

| Proje | ID | Bölge | Durum |
|-------|----|----|-------|
| kafkasportal | `jdrncdqyymlwcyvnnzoj` | `eu-central-1` | ✅ ACTIVE_HEALTHY |

## Veritabanı Şeması (55 Tablo)

### Ana Tablolar

| Tablo | Açıklama | RLS |
|-------|----------|-----|
| `needy_persons` | İhtiyaç sahipleri (50+ alan) | ✅ |
| `beneficiaries` | Faydalanıcılar (alternatif model) | ✅ |
| `aid_applications` | Yardım başvuruları | ✅ |
| `social_aid_applications` | Sosyal yardım başvuruları | ✅ |
| `orphans` | Yetimler & öğrenciler | ✅ |
| `donations` | Bağış kayıtları | ✅ |
| `payments` | Ödeme kayıtları | ✅ |
| `in_kind_aids` | Ayni yardımlar | ✅ |
| `referrals` | Sevk işlemleri | ✅ |

### İlişkili Tablolar (needy_persons)

| Tablo | Açıklama |
|-------|----------|
| `needy_dependents` | Bakmakla yükümlü kişiler |
| `needy_diseases` | Hastalık kayıtları |
| `needy_income_sources` | Gelir kaynakları |
| `needy_bank_accounts` | Banka hesapları |
| `needy_documents` | Belgeler |
| `needy_photos` | Fotoğraflar |
| `needy_references` | Referanslar |
| `needy_sponsors` | Sponsor ilişkileri |
| `needy_orphan_relations` | Yetim ilişkileri |
| `needy_consents` | Rıza beyanları |
| `needy_social_cards` | Sosyal kart bilgileri |
| `needy_interviews` | Görüşme notları |
| `needy_interview_sessions` | Görüşme oturumları |
| `needy_aids_received` | Alınan yardımlar |
| `needy_tags` | Etiketler |
| `needy_card_summary` | Kart özeti (View) |

### Lookup Tabloları

| Tablo | Açıklama |
|-------|----------|
| `countries` | Ülkeler |
| `cities` | Şehirler (country_id FK) |
| `districts` | İlçeler (city_id FK) |
| `neighborhoods` | Mahalleler (district_id FK) |
| `categories` | Kategoriler |
| `partners` | Partner kuruluşlar |
| `sponsors` | Sponsorlar |
| `sponsorship_types` | Sponsorluk tipleri |
| `tags` | Etiketler |
| `diseases` | Hastalıklar |
| `income_sources` | Gelir kaynakları |
| `professions` | Meslekler |
| `schools` | Okullar |
| `hospitals` | Hastaneler |
| `sectors` | Sektörler |
| `units` | Birimler |

### Kullanıcı & Rol Yönetimi

| Tablo | Açıklama |
|-------|----------|
| `users` | Sistem kullanıcıları |
| `roles` | Roller (8 kayıt) |
| `permissions` | İzinler |
| `role_permissions` | Rol-izin eşleştirmeleri |
| `user_permissions` | Kullanıcı-izin eşleştirmeleri |
| `role_audit_logs` | Rol değişiklik logları |
| `audit_logs` | Genel audit logları |

### Diğer Tablolar

| Tablo | Açıklama |
|-------|----------|
| `members` | Dernek üyeleri |
| `kumbaras` | Kumbaralar |
| `hospital_appointments` | Hastane randevuları |
| `treatment_costs` | Tedavi maliyetleri |
| `treatment_outcomes` | Tedavi sonuçları |
| `beneficiary_family_members` | Aile üyeleri |
| `documents` | Genel belgeler |

## Supabase İstemcileri

### Client-side (Browser)
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

### Server-side
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
```

## Tip-Güvenli Sorgular

### Tipler
```typescript
import { Tables, InsertTables, UpdateTables } from '@/types/database.types'

// Row tipi
type NeedyPerson = Tables<'needy_persons'>

// Insert tipi
type NewNeedy = InsertTables<'needy_persons'>

// Update tipi
type UpdateNeedy = UpdateTables<'needy_persons'>
```

### İlişkili Veri Çekme (needy_persons örneği)
```typescript
const { data, error } = await supabase
  .from('needy_persons')
  .select(`
    *,
    category:categories(id, name),
    partner:partners(id, name),
    nationality:countries!nationality_id(id, name),
    country:countries!country_id(id, name),
    city:cities(id, name),
    district:districts(id, name),
    neighborhood:neighborhoods(id, name)
  `)
  .eq('id', id)
  .single()
```

### Liste + Pagination + Filtreleme
```typescript
let query = supabase
  .from('needy_persons')
  .select(`
    *,
    category:categories(name),
    partner:partners(name),
    country:countries!country_id(name),
    city:cities(name)
  `, { count: 'exact' })
  .order('created_at', { ascending: false })

// Arama
if (search) {
  query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,identity_number.ilike.%${search}%`)
}

// Filtreleme
if (category_id) query = query.eq('category_id', category_id)
if (status) query = query.eq('status', status)
if (city_id) query = query.eq('city_id', city_id)

// Pagination
const { data, error, count } = await query.range(page * limit, (page + 1) * limit - 1)
```

### CRUD İşlemleri
```typescript
// Insert
const { data, error } = await supabase
  .from('needy_persons')
  .insert(values)
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('needy_persons')
  .update(values)
  .eq('id', id)
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('needy_persons')
  .delete()
  .eq('id', id)
```

## Migration Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `001_initial_schema.sql` | Temel tablolar (12KB) |
| `002_extended_needy_schema.sql` | Genişletilmiş needy şeması (20KB) |
| `003_linked_records_schema.sql` | İlişkili kayıt tabloları (21KB) |

### Yeni Migration Kalıbı
```sql
-- Yeni tablo
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- RLS politikası
CREATE POLICY "Authenticated users can do all" ON my_table
  FOR ALL USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX idx_my_table_status ON my_table(status);
```

## Ana Tablo Alanları

### needy_persons (50+ alan)
- **Kimlik:** `id`, `file_number`, `identity_type`, `identity_number`, `passport_number`, `passport_type`, `passport_expiry`, `visa_type`
- **Kişisel:** `first_name`, `last_name`, `first_name_original`, `last_name_original`, `gender`, `date_of_birth`
- **İletişim:** `phone`, `email`, `address`
- **Lokasyon:** `country_id`, `city_id`, `district_id`, `neighborhood_id`, `nationality_id`
- **Organizasyon:** `category_id`, `partner_id`, `field_id`
- **Finansal:** `monthly_income`, `rent_amount`, `debt_amount`, `income_source`, `living_situation`
- **Aile:** `family_size`
- **Sağlık:** `health_status`, `disability_status`
- **Durum:** `status`, `is_active`, `tags`
- **Meta:** `notes`, `created_at`, `updated_at`, `created_by`, `updated_by`

### beneficiaries (alternatif detaylı model)
- `basvuru_no`, `tc_kimlik_no`, `ad`, `soyad`, `dogum_tarihi`, `cinsiyet`
- `telefon`, `email`, `adres`, `ulke_id`, `il_id`, `ilce_id`, `mahalle_id`
- `medeni_durum`, `egitim_durumu`, `meslek_id`, `is_durumu`
- `aylik_gelir`, `kira_tutari`, `borc_tutari`
- `engel_durumu`, `engel_orani`, `kronik_hastalik`
- `hane_nufusu`, `cocuk_sayisi`, `yetim_sayisi`, `calisan_sayisi`, `bakmakla_yukumlu_sayisi`
- `sponsorluk_tipi`, `riza_beyani_durumu`, `notlar`

### orphans
- `file_number`, `type`, `partner_id`, `field_name`
- `first_name`, `last_name`, `first_name_original`, `last_name_original`
- `nationality_id`, `country_id`, `city_id`, `district_id`
- `gender`, `date_of_birth`, `identity_number`
- `status`, `last_assignment_date`, `assignment_status`
- `sponsor_id`, `school_id`, `grade`, `education_status`
- `photo_url`, `guardian_name`, `guardian_relation`, `guardian_phone`, `address`

### donations
- `donation_number`, `donor_name`, `donor_phone`, `donor_email`
- `donation_type`, `category_id`, `amount`, `currency`
- `payment_method`, `payment_status`, `description`, `notes`
