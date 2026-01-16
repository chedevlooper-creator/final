---
name: yardim-panel-gelistirme
description: Yardım Yönetim Paneli geliştirme iş akışı. Projeyi çalıştırma, mock data kullanımı, ortam değişkenleri ve genel geliştirme kalıpları için kullanın.
---

# Yardım Paneli Geliştirme Skill

Bu proje sivil toplum kuruluşları için kapsamlı bir yardım yönetim sistemidir.

## Teknoloji Stack

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 14 | App Router ile modern React framework |
| TypeScript | 5.x | Tip güvenli kod geliştirme |
| Supabase | - | PostgreSQL veritabanı + Auth |
| shadcn/ui | - | 27+ hazır UI bileşeni |
| Tailwind CSS | 3.x | Stil yönetimi |
| TanStack Query | v5 | Veri çekme ve cache yönetimi |
| React Hook Form | - | Form yönetimi |
| Zod | - | Schema validasyonu |
| Zustand | - | Global state yönetimi |
| Lucide React | - | İkon kütüphanesi |

## Projeyi Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu (http://localhost:3000)
npm run dev

# Production build
npm run build

# Lint kontrolü
npm run lint
```

## Ortam Değişkenleri

`.env.local` dosyası (geçerli yapılandırma):
```env
# Supabase - kafkasportal projesi
NEXT_PUBLIC_SUPABASE_URL="https://jdrncdqyymlwcyvnnzoj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Mock data KAPALI - gerçek Supabase kullanılıyor
NEXT_PUBLIC_USE_MOCK_DATA="false"
```

## Mock Data Sistemi

Proje şu anda **gerçek Supabase veritabanı** kullanıyor. Mock data'ya geçiş için:

```env
NEXT_PUBLIC_USE_MOCK_DATA="true"
```

Mock data kontrolü hook'larda:
```typescript
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
```

Mock data dosyaları: `src/lib/mock-data/`

## Proje Yapısı

```
src/
├── app/
│   ├── (auth)/              # Auth sayfaları (login, register)
│   ├── (dashboard)/         # Dashboard sayfaları (42 modül)
│   │   ├── needy/           # İhtiyaç sahipleri
│   │   ├── applications/    # Başvurular
│   │   ├── donations/       # Bağışlar
│   │   ├── orphans/         # Yetimler & Öğrenciler
│   │   ├── volunteers/      # Gönüllüler
│   │   ├── finance/         # Finans
│   │   ├── purchase/        # Satın alma
│   │   ├── messages/        # Mesajlar
│   │   ├── calendar/        # Takvim
│   │   ├── events/          # Etkinlikler
│   │   ├── reports/         # Raporlar
│   │   ├── aids/            # Yardım işlemleri
│   │   └── settings/        # Ayarlar
│   ├── globals.css          # Global stiller
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui bileşenleri (27 adet)
│   ├── needy/               # İhtiyaç sahibi bileşenleri
│   ├── forms/               # Form bileşenleri
│   ├── common/              # Ortak bileşenler
│   └── layout/              # Layout bileşenleri
├── hooks/
│   ├── queries/             # TanStack Query hooks (14 adet)
│   ├── use-auth.ts          # Auth hook
│   └── use-toast.ts         # Toast hook
├── lib/
│   ├── supabase/            # Supabase istemcileri
│   ├── validations/         # Zod şemaları
│   ├── mock-data/           # Mock data dosyaları
│   └── menu-config.ts       # Sidebar menü yapılandırması
├── stores/                  # Zustand store'ları
└── types/
    └── database.types.ts    # Supabase tip tanımları
```

## Query Hooks (14 adet)

| Hook Dosyası | Modül |
|--------------|-------|
| `use-needy.ts` | İhtiyaç sahipleri |
| `use-applications.ts` | Başvurular |
| `use-donations.ts` | Bağışlar |
| `use-orphans.ts` | Yetimler |
| `use-volunteers.ts` | Gönüllüler |
| `use-aids.ts` | Yardımlar |
| `use-finance.ts` | Finans |
| `use-purchase.ts` | Satın alma |
| `use-messages.ts` | Mesajlar |
| `use-calendar.ts` | Takvim |
| `use-events.ts` | Etkinlikler |
| `use-reports.ts` | Raporlar |
| `use-lookups.ts` | Lookup tabloları |
| `use-users.ts` | Kullanıcılar |

## Geliştirme İpuçları

### Yeni sayfa eklerken
1. `src/app/(dashboard)/[modul-adi]/page.tsx` oluştur
2. `'use client'` direktifi ekle (client component için)
3. PageHeader bileşenini kullan

### Yeni bileşen eklerken
1. İlgili modül klasörüne veya `components/common/` altına ekle
2. TypeScript tipleri tanımla
3. Export'u index dosyasına ekle (varsa)

### Veri çekme
1. `src/hooks/queries/` altında TanStack Query hook'u oluştur
2. Mock data desteği ekle (USE_MOCK_DATA kontrolü)
3. Tip güvenliği için `Tables<'tablo_adi'>` kullan

### Form validasyonu
1. `src/lib/validations/` altında Zod şeması tanımla
2. `z.infer<typeof schema>` ile tip çıkar
3. `zodResolver` ile React Hook Form'a bağla

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/lib/menu-config.ts` | Sidebar menü yapılandırması (10 grup, 30+ link) |
| `src/middleware.ts` | Auth middleware (şu an devre dışı) |
| `src/types/database.types.ts` | Veritabanı tipleri (10 tablo tanımlı) |
| `supabase/migrations/` | 3 SQL migration dosyası |
| `.env.local` | Ortam değişkenleri |

## Stil Kuralları

- **Renk paleti:** Emerald-Cyan gradient
- **Tema:** Dark sidebar, light content area
- **Responsive:** `md:`, `lg:`, `xl:` prefix'leri
- **Spacing:** Tailwind CSS sınıfları (`space-y-4`, `gap-4`, etc.)

## Debugging

### Supabase bağlantı kontrolü
```typescript
const supabase = createClient()
const { data, error } = await supabase.from('needy_persons').select('count')
console.log({ data, error })
```

### Network isteklerini izleme
- Browser DevTools > Network tab
- Supabase Dashboard > Database > Logs

### Hata ayıklama
- `console.log` yerine `console.error` kullan hatalar için
- TanStack Query DevTools ekle (development'ta otomatik)
