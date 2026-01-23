# 🗄️ Veritabanı Dokümantasyonu

> Yardım Yönetim Paneli veritabanı şeması ve yapısı

---

## 📋 Genel Bakış

Veritabanı **Supabase (PostgreSQL)** üzerinde çalışmaktadır. Row Level Security (RLS) aktiftir ve tüm tablolar UUID primary key kullanmaktadır.

### Özellikler
- ✅ UUID-based primary keys
- ✅ Row Level Security (RLS)
- ✅ Automatic timestamps (`created_at`, `updated_at`)
- ✅ Soft delete support (`is_active`)
- ✅ Audit columns (`created_by`, `updated_by`)
- ✅ Performance indexes
- ✅ Foreign key constraints

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOOKUP TABLES                                │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│  countries   │    cities    │  districts   │    neighborhoods       │
│     ↓        │      ↓       │      ↓       │          ↓             │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────┬─────────────┘
       │              │              │                  │
       ▼              ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NEEDY_PERSONS                                 │
│  - Personal info                                                     │
│  - Identity documents                                                │
│  - Living situation                                                  │
│  - Income & debts                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      AID_APPLICATIONS                                 │
│  - Application tracking                                               │
│  - Status workflow                                                    │
│  - Amount management                                                  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│    DONATIONS     │    │     ORPHANS      │    │      SPONSORS        │
│  - Donor info    │    │  - Student info  │◄───│  - Sponsor info      │
│  - Payment       │    │  - Education     │    │  - Contact           │
│  - Types         │    │  - Guardian      │    └──────────────────────┘
└──────────────────┘    └──────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│    PROFILES      │    │  NOTIFICATIONS   │    │      MEETINGS        │
│  - User info     │    │  - User notifs   │    │  - Meeting schedule  │
│  - Role          │    │  - Read status   │    │  - Participants      │
└──────────────────┘    └──────────────────┘    └──────────────────────┘
```

---

## 📁 Tablolar

### Lookup (Referans) Tabloları

#### `countries`
Ülke listesi

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `name` | TEXT | Ülke adı |
| `code` | TEXT | ISO kodu (TR, US) |
| `phone_code` | TEXT | Telefon kodu (+90) |
| `is_active` | BOOLEAN | Aktif mi |
| `created_at` | TIMESTAMPTZ | Oluşturma tarihi |

#### `cities`
Şehir listesi

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `country_id` | UUID | FK → countries |
| `name` | TEXT | Şehir adı |
| `phone_code` | TEXT | Alan kodu |
| `is_active` | BOOLEAN | Aktif mi |

#### `districts`
İlçe listesi

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `city_id` | UUID | FK → cities |
| `name` | TEXT | İlçe adı |
| `is_active` | BOOLEAN | Aktif mi |

#### `neighborhoods`
Mahalle listesi

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `district_id` | UUID | FK → districts |
| `name` | TEXT | Mahalle adı |
| `is_active` | BOOLEAN | Aktif mi |

#### `categories`
Kategori listesi (çoklu amaçlı)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `name` | TEXT | Kategori adı |
| `type` | TEXT | Tip (needy, donation, application) |
| `is_active` | BOOLEAN | Aktif mi |

#### `partners`
Partner/Saha listesi

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `name` | TEXT | Partner adı |
| `type` | TEXT | Tip (partner, field) |
| `is_active` | BOOLEAN | Aktif mi |

---

### Ana Tablolar

#### `needy_persons` (İhtiyaç Sahipleri)
Ana ihtiyaç sahibi tablosu

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `file_number` | TEXT | Dosya numarası |
| `category_id` | UUID | FK → categories |
| `partner_id` | UUID | FK → partners |
| `field_id` | UUID | FK → partners |
| **Kişisel Bilgiler** |||
| `first_name` | TEXT | Ad |
| `last_name` | TEXT | Soyad |
| `first_name_original` | TEXT | Orijinal ad (Arapça) |
| `last_name_original` | TEXT | Orijinal soyad |
| `gender` | TEXT | Cinsiyet (male/female) |
| `date_of_birth` | DATE | Doğum tarihi |
| `phone` | TEXT | Telefon |
| `email` | TEXT | E-posta |
| `address` | TEXT | Adres |
| **Kimlik Bilgileri** |||
| `identity_type` | TEXT | tc/passport/other |
| `identity_number` | TEXT | TC Kimlik No |
| `passport_number` | TEXT | Pasaport No |
| `passport_type` | TEXT | Pasaport tipi |
| `passport_expiry` | DATE | Pasaport bitiş |
| `visa_type` | TEXT | Vize tipi |
| **Yaşam Durumu** |||
| `living_situation` | TEXT | Konut durumu |
| `income_source` | TEXT | Gelir kaynağı |
| `monthly_income` | DECIMAL | Aylık gelir |
| `rent_amount` | DECIMAL | Kira tutarı |
| `debt_amount` | DECIMAL | Borç tutarı |
| `family_size` | INTEGER | Aile büyüklüğü |
| **Sağlık** |||
| `health_status` | TEXT | Sağlık durumu |
| `disability_status` | TEXT | Engellilik durumu |
| **Meta** |||
| `notes` | TEXT | Notlar |
| `status` | TEXT | Durum (active/inactive/pending) |
| `is_active` | BOOLEAN | Aktif mi |
| `tags` | TEXT[] | Etiketler |
| **Audit** |||
| `created_by` | UUID | Oluşturan |
| `updated_by` | UUID | Güncelleyen |
| `created_at` | TIMESTAMPTZ | Oluşturma |
| `updated_at` | TIMESTAMPTZ | Güncelleme |

**Enum Değerleri:**
```sql
identity_type: 'tc', 'passport', 'other'
gender: 'male', 'female'
living_situation: 'own_house', 'rental', 'with_relatives', 'shelter', 'homeless', 'other'
income_source: 'none', 'salary', 'pension', 'social_aid', 'charity', 'other'
status: 'active', 'inactive', 'pending'
```

---

#### `aid_applications` (Yardım Başvuruları)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `application_number` | TEXT | Başvuru numarası |
| `needy_person_id` | UUID | FK → needy_persons |
| `application_type` | TEXT | Başvuru tipi |
| `status` | TEXT | Durum |
| `priority` | TEXT | Öncelik |
| `assigned_user_id` | UUID | Atanan kullanıcı |
| `description` | TEXT | Açıklama |
| `requested_amount` | DECIMAL | Talep edilen tutar |
| `approved_amount` | DECIMAL | Onaylanan tutar |
| `notes` | TEXT | Notlar |
| `created_by` | UUID | Oluşturan |
| `updated_by` | UUID | Güncelleyen |
| `created_at` | TIMESTAMPTZ | Oluşturma |
| `updated_at` | TIMESTAMPTZ | Güncelleme |

**Enum Değerleri:**
```sql
application_type: 'food', 'health', 'education', 'shelter', 'clothing', 'fuel', 'household', 'cash', 'other'
status: 'new', 'in_review', 'approved', 'rejected', 'pending_delivery', 'delivered', 'completed'
priority: 'low', 'medium', 'high', 'urgent'
```

---

#### `donations` (Bağışlar)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `donation_number` | TEXT | Bağış numarası |
| `donor_name` | TEXT | Bağışçı adı |
| `donor_phone` | TEXT | Telefon |
| `donor_email` | TEXT | E-posta |
| `donation_type` | TEXT | Bağış tipi |
| `category_id` | UUID | FK → categories |
| `amount` | DECIMAL | Tutar |
| `currency` | TEXT | Para birimi |
| `payment_method` | TEXT | Ödeme yöntemi |
| `payment_status` | TEXT | Ödeme durumu |
| `description` | TEXT | Açıklama |
| `notes` | TEXT | Notlar |
| `created_by` | UUID | Oluşturan |
| `updated_by` | UUID | Güncelleyen |
| `created_at` | TIMESTAMPTZ | Oluşturma |
| `updated_at` | TIMESTAMPTZ | Güncelleme |

**Enum Değerleri:**
```sql
donation_type: 'cash', 'in_kind', 'sacrifice', 'zakat', 'fitre', 'sadaka'
currency: 'TRY', 'USD', 'EUR', 'GBP'
payment_method: 'cash', 'bank_transfer', 'credit_card', 'online'
payment_status: 'pending', 'completed', 'cancelled'
```

---

#### `orphans` (Yetimler/Öğrenciler)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `file_number` | TEXT | Dosya numarası |
| `type` | TEXT | Tip (ihh_orphan, orphan, family, education_scholarship) |
| `partner_id` | UUID | FK → partners |
| `field_name` | TEXT | Saha adı |
| **Kişisel Bilgiler** |||
| `first_name` | TEXT | Ad |
| `last_name` | TEXT | Soyad |
| `first_name_original` | TEXT | Orijinal ad |
| `last_name_original` | TEXT | Orijinal soyad |
| `nationality_id` | UUID | FK → countries |
| `country_id` | UUID | FK → countries |
| `gender` | TEXT | Cinsiyet |
| `date_of_birth` | DATE | Doğum tarihi |
| `identity_number` | TEXT | Kimlik no |
| **Sponsorluk** |||
| `status` | TEXT | Sponsorluk durumu |
| `last_assignment_date` | DATE | Son atama tarihi |
| `assignment_status` | TEXT | Atama durumu |
| `sponsor_id` | UUID | FK → sponsors |
| **Eğitim** |||
| `school_id` | UUID | FK → schools |
| `grade` | TEXT | Sınıf |
| `education_status` | TEXT | Eğitim durumu |
| **Veli Bilgileri** |||
| `guardian_name` | TEXT | Veli adı |
| `guardian_relation` | TEXT | Yakınlık |
| `guardian_phone` | TEXT | Veli telefonu |
| **Diğer** |||
| `photo_url` | TEXT | Fotoğraf URL |
| `address` | TEXT | Adres |
| `notes` | TEXT | Notlar |
| `created_at` | TIMESTAMPTZ | Oluşturma |
| `updated_at` | TIMESTAMPTZ | Güncelleme |

**Enum Değerleri:**
```sql
type: 'ihh_orphan', 'orphan', 'family', 'education_scholarship'
status: 'preparing', 'assigned', 'active', 'paused', 'completed'
```

---

#### `profiles` (Kullanıcı Profilleri)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | PK, FK → auth.users |
| `email` | TEXT | E-posta |
| `full_name` | TEXT | Tam ad |
| `avatar_url` | TEXT | Avatar URL |
| `role` | TEXT | Kullanıcı rolü |
| `phone` | TEXT | Telefon |
| `is_active` | BOOLEAN | Aktif mi |
| `last_login` | TIMESTAMPTZ | Son giriş |
| `created_at` | TIMESTAMPTZ | Oluşturma |
| `updated_at` | TIMESTAMPTZ | Güncelleme |

**Roller:**
```sql
role: 'admin', 'moderator', 'user', 'viewer'
```

---

#### `notifications` (Bildirimler)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → profiles |
| `title` | TEXT | Başlık |
| `message` | TEXT | Mesaj |
| `type` | TEXT | Tip |
| `link` | TEXT | Link |
| `is_read` | BOOLEAN | Okundu mu |
| `created_at` | TIMESTAMPTZ | Oluşturma |

---

#### `meetings` (Toplantılar)

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key |
| `title` | TEXT | Başlık |
| `description` | TEXT | Açıklama |
| `date` | DATE | Tarih |
| `time` | TIME | Saat |
| `location` | TEXT | Konum |
| `status` | TEXT | Durum |
| `created_by` | UUID | Oluşturan |
| `created_at` | TIMESTAMPTZ | Oluşturma |
| `updated_at` | TIMESTAMPTZ | Güncelleme |

---

## 🔐 Row Level Security (RLS)

Tüm ana tablolarda RLS aktiftir.

### Policy Yapısı

```sql
-- Authenticated kullanıcılar için okuma
CREATE POLICY "Allow authenticated read" 
  ON needy_persons 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Authenticated kullanıcılar için ekleme
CREATE POLICY "Allow authenticated insert" 
  ON needy_persons 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Authenticated kullanıcılar için güncelleme
CREATE POLICY "Allow authenticated update" 
  ON needy_persons 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Lookup tablolar herkes için okuma
CREATE POLICY "Allow public read" 
  ON countries 
  FOR SELECT 
  USING (true);
```

---

## 📈 Indexes

### Performance Indexes

```sql
-- Needy Persons
CREATE INDEX idx_needy_persons_status ON needy_persons(status);
CREATE INDEX idx_needy_persons_category ON needy_persons(category_id);
CREATE INDEX idx_needy_persons_city ON needy_persons(city_id);
CREATE INDEX idx_needy_persons_identity ON needy_persons(identity_number);

-- Aid Applications
CREATE INDEX idx_aid_applications_status ON aid_applications(status);
CREATE INDEX idx_aid_applications_needy ON aid_applications(needy_person_id);
CREATE INDEX idx_aid_applications_type ON aid_applications(application_type);

-- Donations
CREATE INDEX idx_donations_type ON donations(donation_type);
CREATE INDEX idx_donations_status ON donations(payment_status);

-- Orphans
CREATE INDEX idx_orphans_status ON orphans(status);
CREATE INDEX idx_orphans_sponsor ON orphans(sponsor_id);
CREATE INDEX idx_orphans_type ON orphans(type);
```

---

## ⚡ Triggers

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to all main tables
CREATE TRIGGER update_needy_persons_updated_at 
  BEFORE UPDATE ON needy_persons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📦 Migrations

| Migration | Açıklama |
|-----------|----------|
| `001_initial_schema.sql` | Ana tablolar ve lookup'lar |
| `002_extended_needy_schema.sql` | Genişletilmiş ihtiyaç sahibi şeması |
| `003_linked_records_schema.sql` | İlişkili kayıtlar |
| `004_performance_indexes.sql` | Performans indexleri |
| `005_security_fixes.sql` | Güvenlik düzeltmeleri |
| `006_enable_rls.sql` | RLS aktivasyonu |
| `007_extension_fix.sql` | Extension düzeltmeleri |
| `008_cleanup_duplicate_indexes.sql` | Duplicate index temizliği |
| `009_profiles_table.sql` | Kullanıcı profilleri |
| `010_notifications_table.sql` | Bildirim sistemi |
| `011_skills_management.sql` | Beceri yönetimi |
| `012_performance_indexes.sql` | Ek performans indexleri |
| `013_performance_functions.sql` | Performans fonksiyonları |
| `20260118_core_tables.sql` | Core tablolar |
| `20260119_meeting_management.sql` | Toplantı yönetimi |
| `20260120_bank_accounts.sql` | Banka hesapları |

### Migration Çalıştırma

```bash
# Linux/macOS
./run-migrations.sh

# Windows
run-migrations.bat

# Supabase CLI
supabase db push
```

---

## 🔗 İlgili Dokümanlar

- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Security](./SECURITY.md)
