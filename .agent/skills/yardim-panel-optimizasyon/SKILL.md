---
name: yardim-panel-optimizasyon
description: Proje optimizasyonu. Veritabanı indexleri, güvenlik düzeltmeleri, frontend performans ve tip uyumluluğu için kullanın.
---

# Optimizasyon Skill

## Yapılan Optimizasyonlar

### 1. ✅ Veritabanı Performans İndeksleri

`004_performance_indexes.sql` migration'ı uygulandı:

| Tablo | İndeksler |
|-------|-----------|
| `needy_persons` | status, category_id, city_id, country_id, partner_id, created_at DESC, is_active, first_name (trgm), last_name (trgm), identity_number (trgm) |
| `aid_applications` | status, needy_person_id, created_at DESC |
| `donations` | payment_status, donation_type, created_at DESC, category_id |
| `orphans` | status, partner_id, sponsor_id, created_at DESC |
| `beneficiaries` | durum, il, ilce, created_at DESC, ad (trgm), soyad (trgm) |
| `social_aid_applications` | basvuran_id, durum |
| `payments` | beneficiary_id, application_id, durum |
| Diğer lookup | cities(country_id), districts(city_id), neighborhoods(district_id) |
| Linked records | needy_dependents, needy_diseases, needy_income_sources, needy_bank_accounts, needy_documents, needy_photos, needy_sponsors, needy_tags, needy_interviews, needy_aids_received, needy_consents |
| User & roles | users(role_id), role_permissions(role_id), user_permissions(user_id) |

### 2. ✅ Güvenlik Düzeltmeleri

`005_security_fixes.sql` migration'ı uygulandı:

- **Function search_path** düzeltildi: `update_updated_at_column()` ve `update_updated_at()`
- **SECURITY DEFINER view** düzeltildi: `needy_card_summary` view SECURITY INVOKER olarak yeniden oluşturuldu

### 3. ✅ Next.js Konfigürasyonu

`next.config.mjs` optimizasyonları:

```javascript
// Image optimization
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60 * 60 * 24, // 24 hours
}

// Performance
compress: true
poweredByHeader: false

// Package import optimization
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns']
}

// Security headers
X-DNS-Prefetch-Control, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
```

### 4. ✅ TanStack Query Optimizasyonu

`providers.tsx` güncellemeleri:

- **Stale time**: 5 dakika (daha uzun cache)
- **GC time**: 30 dakika
- **Smart retry**: 404/403 hatalarında retry yapma, max 2 retry
- **Reconnect refetch**: Ağ bağlantısı geri geldiğinde refetch
- **React Query DevTools**: Development modunda aktif

### 5. ✅ Utility Fonksiyonları

`utils.ts` genişletildi:

| Fonksiyon | Açıklama |
|-----------|----------|
| `formatDate()` | Türkçe tarih formatlama |
| `formatDateShort()` | Kısa tarih (dd/mm/yyyy) |
| `formatDateTime()` | Tarih ve saat |
| `formatCurrency()` | Para birimi (TRY, USD, EUR) |
| `formatNumber()` | Binlik ayraç |
| `formatPercent()` | Yüzde |
| `formatPhone()` | Türk telefon formatı |
| `formatTCKN()` | TC Kimlik numarası |
| `truncate()` | Metin kısaltma |
| `capitalize()` | Kelime baş harfleri büyük |
| `getFullName()` | Ad soyad birleştirme |
| `formatFileSize()` | Dosya boyutu (KB, MB, GB) |
| `debounce()` | Arama inputları için |
| `slugify()` | URL-safe slug |
| `generateId()` | Rastgele ID |
| `statusColors` | Durum renk class'ları |
| `statusLabels` | Türkçe durum metinleri |

### 6. ✅ Zod v3 Downgrade

Zod v4 ↔ @hookform/resolvers uyumluluk sorunu çözüldü:

```bash
npm install zod@3.23.8 @hookform/resolvers@3.10.0
```

## Bekleyen Düzeltmeler

### Tip Uyumsuzlukları

Mock data dosyalarındaki tipler güncel `linked-records.types.ts` ile tam uyumlu hale getirilmeli:

1. `src/lib/mock-data/needy.ts` - NeedyPerson tipinde `updated_at` eksik
2. `src/components/needy/detail/tabs/ApplicationsTab.tsx` - Application tipi import sorunu

### Çözüm

```typescript
// needy.types.ts'e updated_at ekle
interface NeedyPerson {
  // ... diğer alanlar
  updated_at?: string  // Opsiyonel yap
}

// veya
// ApplicationsTab'daki import'u düzelt
// Application tipini aid_applications tablosuna göre güncelle
```

## Supabase Advisory Uyarıları

### Performans (Çözüldü)
- ✅ Eksik foreign key indexleri eklendi

### Güvenlik (Dikkat Edilmesi Gerekenler)
- ⚠️ Multiple permissive RLS policies (users tablosu)
- ⚠️ RLS policy always true (orphans tablosu INSERT/UPDATE)
- ⚠️ Leaked password protection disabled (Auth ayarları)

### RLS Policy Önerileri

```sql
-- Örnek: orphans tablosu için daha güvenli RLS
CREATE POLICY "Users can insert own orphans" ON orphans
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own orphans" ON orphans
  FOR UPDATE 
  USING (auth.uid() = created_by OR auth.role() = 'admin');
```

## Build Komutu

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Development
npm run dev
```
