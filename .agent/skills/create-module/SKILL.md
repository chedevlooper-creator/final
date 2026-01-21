---
name: create-module
description: Yeni bir modül için gerekli tüm dosyaları (page, components, hooks, types) standartlara uygun şekilde oluşturur.
---

# 🏗️ Create Module Skill

Bu skill, YYP projesinde yeni bir modül oluşturmak için gerekli tüm dosyaları otomatik olarak oluşturur.

## Kullanım

Kullanıcıdan aşağıdaki bilgileri al:
1. **Modül Adı** (örn: "courses", "trainings", "medical-records")
2. **Türkçe Açıklama** (örn: "Eğitim Kursları", "Sağlık Kayıtları")
3. **Ana Alanlar** (örn: "name, description, start_date, end_date, status")

## Oluşturulacak Dosyalar

### 1. Page Dosyası
- **Konum:** `src/app/dashboard/[module-name]/page.tsx`
- **İçerik:** Liste sayfası (table view) + server component
- **Özellikler:**
  - Supabase'den veri çekme
  - Filtreleme ve arama
  - Sayfalama
  - Tablo görünümü

### 2. Detail Page
- **Konum:** `src/app/dashboard/[module-name]/[id]/page.tsx`
- **İçerik:** Detay/düzenleme sayfası
- **Özellikler:**
  - Form ile düzenleme
  - Yeni kayıt oluşturma (id="new")
  - Photo section (varsa)
  - Tabs for related data

### 3. Query Hook
- **Konum:** `src/hooks/queries/use-[module-name].ts`
- **İçerik:** TanStack Query hooks
- **Fonksiyonlar:**
  - `use[ModuleName]List` - Liste çekme
  - `use[ModuleName]Detail` - Detay çekme
  - `useCreate[ModuleName]` - Yeni kayıt
  - `useUpdate[ModuleName]` - Güncelleme
  - `useDelete[ModuleName]` - Silme

### 4. Type Definitions
- **Konum:** `src/types/[module-name].types.ts`
- **İçerik:** TypeScript tipleri
- **Tipler:**
  - Ana veri tipi
  - Form tipi
  - Filter tipi

### 5. Validation Schema
- **Konum:** `src/lib/validations/[module-name].ts`
- **İçerik:** Zod validation şemaları
- **Şemalar:**
  - Create schema
  - Update schema
  - Filter schema

### 6. Components
- **Konum:** `src/components/[module-name]/`
- **Dosyalar:**
  - `[ModuleName]Table.tsx` - Tablo bileşeni
  - `[ModuleName]Form.tsx` - Form bileşeni
  - `[ModuleName]Filter.tsx` - Filtre bileşeni

## Standartlar

### YYP-Engine Standartlarına Uygunluk
- ✅ Server components veri okuma için
- ✅ Client components interaktif öğeler için
- ✅ TanStack Query merkezi hook yönetimi
- ✅ Zod validation
- ✅ shadcn/ui components
- ✅ TypeScript strict mode
- ✅ Proper error handling
- ✅ Loading states
- ✅ Toast notifications

### RBAC Integration
Her dosyada uygun yetki kontrolleri ekle:
- List görünümü: `read` yetkisi
- Create: `create` yetkisi
- Update: `update` yetkisi
- Delete: `delete` yetkisi

## Örnek Komut İşlemi

```typescript
// Kullanıcı: "Kurslar modülü oluştur"
//
// Skill şunları yapar:
// 1. Modül adını normalize et: "courses"
// 2. Tüm dosyaları oluştur
// 3. Gerekli import'ları ekle
// 4. RBAC kontrollerini yerleştir
// 5. Kullanıcıya özet rapor sun
```

## Migration Hatırlatması

Kullanıcıya yeni modül için veritabanı migration'ı oluşturması gerektiğini hatırlat:

```bash
# Migration için /add-migration skill'ini kullanabilirsin
/add-migration [table-name]
```

## Checklist

Tüm dosyalar oluşturulduktan sonra kullanıcıya şunu göster:

- [ ] Page dosyası oluşturuldu
- [ ] Detail page oluşturuldu
- [ ] Query hooks oluşturuldu
- [ ] Type definitions oluşturuldu
- [ ] Validation schemas oluşturuldu
- [ ] Components oluşturuldu
- [ ] RBAC kontrolleri eklendi
- [ ] Migration hatırlatması yapıldı

---
*Bu skill YYP-Engine standartlarını takip eder.*
