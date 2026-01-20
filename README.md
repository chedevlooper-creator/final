# Yardım Yönetim Paneli 💚

Modern Next.js tabanlı yardım yönetim sistemi. İhtiyaç sahipleri, bağışlar, gönüllüler ve finansal işlemleri tek bir platformdan yönetin.

## 🚀 Özellikler

- **Yardım Yönetimi**: İhtiyaç sahipleri, başvurular ve yardımların takibi
- **Bağış Yönetimi**: Nakit ve ayni bağışların kaydı ve raporlanması
- **Gönüllü Yönetimi**: Gönüllüler ve görevlendirmelerin yönetimi
- **Finans Takibi**: Kasa, banka işlemleri ve raporlar
- **Burs Yönetimi**: Yetim ve öğrenci burs takibi
- **Modern UI**: Tailwind CSS + shadcn/ui ile güzel arayüz
- **Real-time Updates**: Supabase realtime subscriptions
- **PDF/Excel Export**: Raporları dışa aktarma

## 📋 Teknoloji Stacki

- **Framework**: Next.js 16 (App Router)
- **UI**: React 18, Tailwind CSS, shadcn/ui, Radix UI
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query, Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest, Testing Library
- **Error Tracking**: Sentry
- **Language**: TypeScript

## 🔧 Gereksinimler

- Node.js >= 20.0.0
- npm >= 10.0.0

## 📦 Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/Kafkasportal/Final-panel.git
cd Final-panel

# Bağımlılıkları yükleyin
npm install

# Environment değişkenlerini ayarlayın
cp .env.example .env.local
```

## 🔑 Environment Değişkenleri

`.env.local` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sentry (opsiyonel)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Node
NODE_ENV=development
```

**Değişkenleri nereden alacağım?**
1. Supabase projenizi oluşturun: https://supabase.com
2. Settings → API bölümünden URL ve keys'i alın
3. `service_role` key'i sadece server-side kullanım içindir

## 🗄️ Database Kurulumu

```bash
# Supabase migrations
supabase db push
```

Alternatif olarak `supabase/migrations/` klasöründeki SQL dosyalarını Supabase SQL Editor'da çalıştırın.

## 🏃 Development

```bash
# Development server'ı başlatın
npm run dev

# Tarayıcıda açın
http://localhost:3000
```

## 🧪 Testing

```bash
# Tüm testleri çalıştır
npm test

# Test UI ile çalıştır
npm run test:ui

# Coverage raporu
npm run test:coverage
```

## 🔨 Build

```bash
# Production build
npm run build

# Build analizi
npm run analyze
```

## 🚀 Production Deploy

### Vercel (Önerilen)

1. Bu repo'yu fork'layın
2. [Vercel](https://vercel.com) hesabınızla GitHub'a bağlanın
3. Repo'yu import edin
4. Environment variables'ı ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SENTRY_DSN` (opsiyonel)
5. Deploy butonuna tıklayın

### Docker

```bash
# Docker image build
docker build -t yardim-panel .

# Container çalıştır
docker run -p 3000:3000 --env-file .env.local yardim-panel
```

## 📁 Proje Yapısı

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Dashboard sayfaları
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── forms/       # Form components
│   ├── hooks/           # Custom React hooks
│   │   └── queries/     # React Query hooks
│   ├── lib/             # Utility functions
│   │   ├── supabase/    # Supabase client
│   │   └── validations/ # Zod schemas
│   └── types/           # TypeScript types
├── supabase/
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## 🔒 Güvenlik

- ✅ Supabase RLS (Row Level Security) enabled
- ✅ Environment variables validation
- ✅ Type-safe API routes
- ✅ Security headers configured
- ✅ Service role key sadece server-side

## 📊 Performance

- ✅ Next.js image optimization
- ✅ Bundle size optimization
- ✅ Lazy loading
- ✅ React Query caching
- ✅ Supabase connection pooling

## 🐛 Hata Bildirme

Bug report için issue açın: https://github.com/Kafkasportal/Final-panel/issues

## 📝 Lisans

Bu proje özel bir projedir.

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için issue açın veya repository discussion kullanın.

---

Made with 💚 by Kafkasportal Team
