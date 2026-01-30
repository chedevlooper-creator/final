# 🎁 Kumbara Sistemi

> Fiziksel bağış kutuları (kumbara) takip ve yönetim sistemi

---

## 📋 Genel Bakış

Kumbara sistemi, STK'ların fiziksel bağış kutularını (cami, okul, iş yeri vb. lokasyonlardaki) takip etmelerini, toplama rotalarını planlamalarını ve performanslarını ölçmelerini sağlar.

### ✨ Özellikler

- 📍 Kumbara lokasyon takibi (GPS koordinatları)
- 🗺️ Toplama rotası planlama
- 👤 Toplayıcı atama
- 📊 Performans analizi (hedef vs gerçekleşen)
- 🔧 Bakım ve arıza yönetimi
- 📅 Otomatik toplama planlama
- 💰 Tahmini vs gerçek toplama tutarları

---

## 🗄️ Veritabanı Şeması

### Tablolar

| Tablo | Açıklama |
|-------|----------|
| `donation_box_location_types` | Lokasyon tipleri (Cami, Okul, vb.) |
| `donation_boxes` | Kumbara tanımları |
| `collection_routes` | Toplama rotaları |
| `route_boxes` | Rota-kumbara ilişkisi |
| `collections` | Toplama koleksiyonları |
| `collection_details` | Kumbara bazlı toplama detayları |
| `donation_box_maintenance` | Bakım kayıtları |

---

## 📁 Dosya Yapısı

```
supabase/migrations/
└── 20260130_donation_boxes.sql         # Migration

src/types/
└── donation-boxes.ts                   # TypeScript tipleri

src/lib/validations/
└── donation-boxes.ts                   # Zod validasyon şemaları

src/app/actions/
└── donation-boxes.ts                   # Server Actions

src/hooks/queries/
└── use-donation-boxes.ts               # TanStack Query hooks

src/hooks/mutations/
└── use-donation-box-mutations.ts       # Mutation hooks

src/components/donation-boxes/
├── donation-box-dialog.tsx             # Kumbara formu
├── route-dialog.tsx                    # Rota formu
└── collection-dialog.tsx               # Toplama formu

app/dashboard/donations/
├── boxes/
│   └── page.tsx                        # Kumbara listesi
├── routes/
│   └── page.tsx                        # Rota listesi
└── collections/
    └── page.tsx                        # Toplama kayıtları
```

---

## 🚀 Kullanım

### Menüden Erişim

```
Dashboard → Bağış Yönetimi → Kumbaralar
Dashboard → Bağış Yönetimi → Toplama Rotaları
```

### Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Kumbaralar | `/dashboard/donations/boxes` | Kumbara yönetimi ve performans |
| Rotalar | `/dashboard/donations/routes` | Toplama güzergahları |
| Toplamalar | `/dashboard/donations/collections` | Toplama planları ve kayıtları |

---

## 🔧 İş Akışları

### 1. Yeni Kumbara Ekleme

```
1. Kumbaralar sayfasına git
2. "Yeni Kumbara" butonuna tıkla
3. Lokasyon bilgilerini gir
4. Hedef tutar belirle
5. Kaydet
```

### 2. Toplama Rotası Oluşturma

```
1. Rotalar sayfasına git
2. "Yeni Rota" butonuna tıkla
3. Rota adı ve bölge seç
4. Toplayıcı ata
5. Toplama günlerini ve sıklığını belirle
6. Rotaya kumbara ekle (sıralı)
```

### 3. Toplama Planlama

```
1. Toplamalar sayfasına git
2. "Yeni Toplama" butonuna tıkla
3. Rota seç (otomatik toplayıcı gelir)
4. Tarih ve saat belirle
5. Planla → Otomatik tüm kumbaralar listelenir
```

### 4. Toplama Yapma

```
1. Planlanan toplamayı "Başlat"
2. Rotadaki kumbaraları tek tek dolaş
3. Her kumbara için:
   - Toplanan miktarı gir
   - Fotoğraf çek
   - Not ekle (varsa)
4. Tümü tamamlandığında "Tamamla"
```

---

## 📊 Performans Takibi

Her kumbara için şu metrikler hesaplanır:

- **Hedef Başım Oranı**: Gerçekleşen / Hedef × 100
- **Ortalama Toplama Tutarı**: Tüm toplamaların ortalaması
- **Toplam Toplama Sayısı**: Kaç kez toplandığı

**Renk Kodları:**
- 🟢 Yeşil (≥80%): İyi performans
- 🟡 Sarı (50-79%): Orta performans
- 🔴 Kırmızı (<50%): Düşük performans (yer değiştirme değerlendirilmeli)

---

## 🔌 API Örnekleri

### Yeni Kumbara Oluşturma

```typescript
import { createDonationBox } from '@/app/actions/donation-boxes'

await createDonationBox({
  code: 'KMB-004',
  name: 'Yeni Camii Kumbarası',
  location_type_id: 'uuid',
  location_name: 'Yeni Camii',
  city: 'İstanbul',
  district: 'Üsküdar',
  estimated_monthly_amount: 3000
})
```

### Toplama Başlatma

```typescript
import { startCollection } from '@/app/actions/donation-boxes'

await startCollection('collection-uuid')
```

### Kumbara Bakım Kaydı

```typescript
import { createMaintenance } from '@/app/actions/donation-boxes'

await createMaintenance({
  box_id: 'box-uuid',
  maintenance_type: 'repair',
  description: 'Kilit değişimi gerekiyor',
  scheduled_date: '2026-02-01'
})
```

---

## 📈 Raporlar

- **Aylık Toplama Özeti**: Tutar ve kumbara sayısı
- **Rota Performansı**: Rota bazlı verimlilik
- **Kumbara Performansı**: Hedef başarım oranları
- **Düşük Performanslı Kumbaralar**: Yer değiştirme adayları

---

## 🎯 Gelecek Geliştirmeler

- [ ] Mobil uygulama (toplayıcılar için)
- [ ] QR kod ile hızlı kumbara tanıma
- [ ] GPS navigasyon entegrasyonu
- [ ] Otomatik rota optimizasyonu
- [ ] Bildirim sistemi (toplama hatırlatmaları)
- [ ] Kumbara doluluk sensörü entegrasyonu

---

## 📝 Notlar

- Kumbara kodları benzersiz olmalıdır (örn: KMB-001)
- Rota kodları benzersiz olmalıdır (örn: ROTA-001)
- Toplama numarası otomatik oluşturulur (TOP-YYYYMMDD-XXX)
- Bakımdaki kumbaralar otomatik olarak pasif duruma geçer
