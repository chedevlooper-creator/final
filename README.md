# Yardım Yönetim Paneli

Sivil toplum kuruluşları için kapsamlı yardım yönetim sistemi paneli.

## 🚀 Teknoloji Stack'i

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **Veritabanı:** Supabase (PostgreSQL)
- **UI:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Form Validation:** React Hook Form + Zod
- **Icons:** Lucide React

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── (auth)/            # Auth sayfaları (login)
│   └── (dashboard)/       # Dashboard sayfaları
│       ├── needy/         # İhtiyaç Sahipleri
│       ├── applications/  # Yardım Başvuruları
│       ├── donations/     # Bağışlar
│       ├── orphans/       # Yetimler & Öğrenciler
│       └── finance/       # Finans
├── components/
│   ├── ui/                # shadcn/ui componentleri
│   ├── layout/            # Layout componentleri
│   ├── forms/             # Form componentleri
│   ├── tables/            # Tablo componentleri
│   └── common/            # Ortak componentler
├── hooks/
│   ├── queries/           # TanStack Query hooks
│   └── use-auth.ts        # Auth hook
├── lib/
│   ├── supabase/          # Supabase client'ları
│   └── validations/       # Zod şemaları
├── stores/                # Zustand store'ları
└── types/                 # TypeScript tipleri
```

## 🗄️ Modüller

1. **İhtiyaç Sahipleri** - Kayıt, listeleme, detay görüntüleme
2. **Yardım Başvuruları** - Başvuru alma, durum takibi
3. **Bağış Yönetimi** - Nakit, ayni, kurban bağışları
4. **Yetimler & Öğrenciler** - Yetim kayıtları, sponsor atama
5. **Finans** - Kasa, banka, gelir-gider takibi

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarla

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Supabase Veritabanını Oluştur

`supabase/migrations/001_initial_schema.sql` dosyasını Supabase SQL Editor'da çalıştırın.

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## 📝 Özellikler

### İhtiyaç Sahipleri
- ✅ Yeni kayıt oluşturma (100+ form alanı)
- ✅ Listeleme ve filtreleme
- ✅ TC Kimlik validasyonu
- ✅ IBAN validasyonu
- ✅ Kategori ve etiket sistemi

### Yardım Başvuruları
- ✅ Başvuru oluşturma
- ✅ Durum takibi (7 aşama)
- ✅ Öncelik belirleme
- ✅ İhtiyaç sahibi seçimi

### Bağış Yönetimi
- ✅ Nakit/ayni bağış kaydı
- ✅ Bağış türleri (zekat, fitre, sadaka, kurban)
- ✅ Çoklu para birimi desteği
- ✅ Ödeme yöntemi takibi

### Finans
- ✅ Kasa/banka bakiye görüntüleme
- ✅ Gelir-gider listesi
- ✅ Döviz kurları widget'ı
- ✅ Aylık özet istatistikler

## 🔒 Güvenlik

- Row Level Security (RLS) aktif
- Supabase Auth entegrasyonu
- Middleware ile sayfa koruması
- Server-side session yönetimi

## 📦 Komutlar

```bash
# Geliştirme
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## 🎨 Tasarım

- Modern ve temiz arayüz
- Gradient renk paleti (emerald-cyan)
- Responsive tasarım
- Dark sidebar, light content
- Animasyonlu geçişler

## 📄 Lisans

MIT
