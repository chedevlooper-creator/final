# 🤖 YYP Claude Agent Skills

Bu proje için özel olarak oluşturulmuş Claude Agent skill'leri. Bu skill'ler YYP (Yardım Yönetim Paneli) projesinde hızlı ve standartlara uygun geliştirme yapmanızı sağlar.

## 📚 Mevcut Skill'ler

### 1. 🏗️ /create-module
Yeni bir modül için gerekli tüm dosyaları otomatik oluşturur.

**Kullanım:**
```
/create-module
```

**Ne Yapar:**
- Dashboard page oluşturur (`src/app/dashboard/[module]/page.tsx`)
- Detail page oluşturur (`src/app/dashboard/[module]/[id]/page.tsx`)
- Query hooks oluşturur (`src/hooks/queries/use-[module].ts`)
- Type definitions oluşturur (`src/types/[module].types.ts`)
- Validation schemas oluşturur (`src/lib/validations/[module].ts`)
- Component'leri oluşturur (`src/components/[module]/`)

**Örnek:**
```
Claude: Kurslar modülü oluşturmak istiyorum
/create-module

Modül Adı: courses
Türkçe Açıklama: Eğitim Kursları Yönetimi
Ana Alanlar: name, description, start_date, end_date, instructor_id, status
```

---

### 2. 🪝 /create-query-hook
Bir tablo için standart TanStack Query hookları oluşturur.

**Kullanım:**
```
/create-query-hook
```

**Ne Yapar:**
- `use[Name]List` - Liste çekme
- `use[Name]Detail` - Detay çekme
- `useCreate[Name]` - Yeni kayıt
- `useUpdate[Name]` - Güncelleme
- `useDelete[Name]` - Silme

**Özellikler:**
- ✅ TanStack Query 5 standartları
- ✅ Merkezi Supabase client kullanımı
- ✅ Cache invalidation
- ✅ Toast notifications
- ✅ Loading ve error states

**Örnek:**
```
/create-query-hook

Tablo Adı: trainings
Hook Adı: Trainings
İlişkiler: instructor:users(id,full_name), category:categories(id,name)
```

---

### 3. ⚡ /create-server-action
RBAC ve validation içeren güvenli server action oluşturur.

**Kullanım:**
```
/create-server-action
```

**Ne Yapar:**
- Authentication kontrolü
- RBAC (role-based access control) kontrolü
- Zod validation
- Error handling
- Audit logging
- Cache revalidation
- Sentry integration

**Örnek:**
```
/create-server-action

Action Adı: createTraining
Tablo Adı: trainings
İşlem Tipi: create
Gerekli Yetki: create
```

---

### 4. 📝 /create-form
shadcn/ui ve Zod validation ile form bileşeni oluşturur.

**Kullanım:**
```
/create-form
```

**Ne Yapar:**
- React Hook Form kurulumu
- Zod schema oluşturma
- shadcn/ui component'leri ile form alanları
- Validation messages
- Loading states
- Error handling

**Desteklenen Field Tipleri:**
- Text Input
- Textarea
- Number
- Date Picker
- Select Dropdown
- Combobox (searchable select)
- Checkbox
- Radio Group
- Multi-Select
- File Upload

**Örnek:**
```
/create-form

Form Adı: TrainingForm
Form Alanları:
  - name: text (required, min 3 chars)
  - description: textarea (optional)
  - start_date: date (required)
  - end_date: date (required)
  - instructor_id: select (required)
  - status: select (default: pending)
  - max_participants: number (min 1, max 100)
```

---

### 5. 🗄️ /add-migration
Yeni bir Supabase migration dosyası oluşturur.

**Kullanım:**
```
/add-migration
```

**Ne Yapar:**
- Migration dosyası oluşturur (`supabase/migrations/[timestamp]_[description].sql`)
- Standart tablo yapısını hazırlar
- Index'leri oluşturur
- RLS policy'leri ekler
- Trigger'ları ayarlar
- Audit alanlarını ekler

**Standart Kolonlar:**
- `id UUID PRIMARY KEY`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`
- `created_by UUID`
- `updated_by UUID`
- `created_ip INET`
- `is_active BOOLEAN`

**Örnek:**
```
/add-migration

Tablo Adı: trainings
Açıklama: Add trainings table for education management
Kolonlar:
  - name TEXT NOT NULL
  - description TEXT
  - start_date DATE NOT NULL
  - end_date DATE NOT NULL
  - instructor_id UUID REFERENCES users(id)
  - max_participants INTEGER
  - status TEXT CHECK (status IN ('active', 'completed', 'cancelled'))
```

---

### 6. 🔒 /check-security
Kodda güvenlik açıkları ve RBAC eksikliklerini tespit eder.

**Kullanım:**
```
/check-security [tam|modül|dosya]
```

**Ne Kontrol Eder:**
- ⚠️ Eksik RBAC kontrolleri
- 🛡️ Validation eksiklikleri
- 🔐 Authentication sorunları
- 💉 XSS vulnerabilities
- 🔑 Hardcoded secrets
- 🌐 CORS issues
- 📝 Missing RLS policies
- 🔄 CSRF protection

**Örnek:**
```
# Tüm projeyi tara
/check-security tam

# Sadece needy modülünü tara
/check-security modül needy

# Belirli dosyaları tara
/check-security dosya src/app/actions/donations.ts
```

**Çıktı:**
- Güvenlik açıklarının listesi
- Hangi dosyalarda olduğu
- Nasıl düzeltileceği
- Kod örnekleri

---

### 7. 🚀 /yyp-engine (Mevcut)
YYP projesi için master geliştirme protokolü ve standartlar.

**Kullanım:**
```
/yyp-engine
```

**İçerik:**
- Mimari katmanlar (Next.js 16 + React 19)
- Server vs Client component'ler
- Veri yönetimi (Supabase & TanStack Query)
- RBAC yapısı
- Klasör hiyerarşisi
- Kodlama kuralları

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Yeni Özellik Ekleme
```
1. /add-migration           # Veritabanı tablosu oluştur
2. /create-module          # Tüm dosyaları scaffold et
3. /check-security modül   # Güvenlik kontrolü yap
```

### Senaryo 2: Sadece CRUD Eklemek
```
1. /create-query-hook      # Hooks oluştur
2. /create-form           # Form bileşeni oluştur
```

### Senaryo 3: Güvenli API Endpoint
```
1. /create-server-action   # Server action oluştur
2. /check-security dosya   # Güvenlik kontrolü yap
```

### Senaryo 4: Migration Oluşturma
```
1. /add-migration          # Migration dosyası oluştur
2. supabase db push        # Migration'ı uygula
3. /create-query-hook      # Hook'ları oluştur
```

---

## 📋 Skill'leri Kullanma İpuçları

### ✅ DO
- Skill'leri sırayla kullan (migration → module → security check)
- Her skill'den sonra oluşturulan dosyaları gözden geçir
- Güvenlik kontrollerini mutlaka yap
- Standartlara uygunluğu kontrol et

### ❌ DON'T
- Skill'leri pas geçme (özellikle security check)
- Auto-generated kodu düzenlemeden commit etme
- RBAC kontrollerini atlama
- Validation'sız veri kaydetme

---

## 🛠️ Özelleştirme

Her skill'i projenize göre özelleştirebilirsiniz:

1. `.agent/skills/[skill-name]/SKILL.md` dosyasını düzenleyin
2. Yeni template'ler ekleyin
3. Validation kurallarını güncelleyin
4. Proje standartlarınızı yansıtın

---

## 📝 Yeni Skill Ekleme

Yeni bir skill eklemek için:

```bash
# 1. Skill klasörü oluştur
mkdir -p .agent/skills/[skill-name]

# 2. SKILL.md dosyası oluştur
touch .agent/skills/[skill-name]/SKILL.md

# 3. İçeriği ekle (diğer skill'leri örnek alarak)
```

**SKILL.md formatı:**
```markdown
---
name: skill-name
description: Kısa açıklama
---

# Skill Başlığı

## Kullanım
...

## Ne Yapar
...

## Örnek
...
```

---

## 🤝 Katkıda Bulunma

Yeni skill önerileri veya iyileştirmeler için:
1. Yeni skill oluşturun
2. Test edin
3. Dokümante edin
4. README'yi güncelleyin

---

## 📚 Kaynaklar

- [YYP Engine Standards](./skills/yyp-engine/SKILL.md)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)

---

## 📊 Skill İstatistikleri

| Skill | Dosya Sayısı | Kod Satırı | Kullanım |
|-------|-------------|-----------|----------|
| create-module | 6-8 | ~1000 | Yeni modül |
| create-query-hook | 1 | ~150 | CRUD hooks |
| create-server-action | 1 | ~100 | API logic |
| create-form | 1 | ~200 | Forms |
| add-migration | 1 | ~200 | Database |
| check-security | - | - | Security audit |

---

## 🎓 Öğrenme Yolu

1. **Başlangıç:** `/yyp-engine` ile standartları öğren
2. **Pratik:** `/create-module` ile basit bir modül oluştur
3. **Derinleştir:** `/create-server-action` ve `/create-query-hook` kullan
4. **Güvenlik:** `/check-security` ile projeyi tara
5. **Uzmanlaş:** Custom skill'ler oluştur

---

## 🆘 Yardım

Skill'lerle ilgili sorunlar için:
- Skill dokümantasyonunu okuyun
- Örnek kullanımları inceleyin
- Claude'a soru sorun: "Bu skill nasıl kullanılır?"

---

**Son Güncelleme:** 2026-01-21
**Versiyon:** 1.0.0
**Proje:** YYP (Yardım Yönetim Paneli)
