# ⚙️ Kurulum Rehberi

> Yardım Yönetim Paneli'ni yerel ortamda ve production'da çalıştırma rehberi

---

## 📋 Gereksinimler

### Yazılım Gereksinimleri

| Yazılım | Minimum Versiyon | Önerilen |
|---------|-----------------|----------|
| Node.js | 25.0.0 | 25.4.0+ |
| npm | 10.0.0 | 10.x |
| Git | 2.30+ | Latest |

### Servis Gereksinimleri

| Servis | Amaç | Zorunlu |
|--------|------|---------|
| [Supabase](https://supabase.com) | Database, Auth, Storage | ✅ Evet |
| [Sentry](https://sentry.io) | Error tracking | ⚠️ Önerilen |
| [PostHog](https://posthog.com) | Analytics | ⚠️ Önerilen |
| [Vercel](https://vercel.com) | Hosting | ❌ Opsiyonel |

---

## 🚀 Hızlı Kurulum

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/your-org/yardim-yonetim-paneli.git
cd yardim-yonetim-paneli
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Dosyasını Oluşturun

```bash
cp .env.example .env.local
```

### 4. Environment Variables'ları Yapılandırın

`.env.local` dosyasını düzenleyin (detaylar aşağıda).

### 5. Development Server'ı Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 🔑 Environment Variables

### Zorunlu Değişkenler

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Opsiyonel Değişkenler

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# MERNIS Integration (TC Kimlik Doğrulama)
MERNIS_SERVICE_URL=https://tckimlik.nvi.gov.tr
MERNIS_USERNAME=your-username
MERNIS_PASSWORD=your-password
```

---

## 🗄️ Supabase Kurulumu

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını ve şifresini girin
4. Region olarak en yakın bölgeyi seçin (örn: `eu-central-1`)
5. Projenin oluşmasını bekleyin (~2 dakika)

### 2. API Anahtarlarını Alma

1. Project Settings → API bölümüne gidin
2. Şu değerleri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Migrations

Migration dosyalarını çalıştırmak için:

**Linux/macOS:**
```bash
chmod +x run-migrations.sh
./run-migrations.sh
```

**Windows:**
```cmd
run-migrations.bat
```

**Manuel çalıştırma:**
```bash
# Supabase CLI ile
supabase db push

# Veya SQL Editor'da manuel olarak
# supabase/migrations/ klasöründeki dosyaları sırayla çalıştırın
```

### 4. Row Level Security (RLS)

Migrations otomatik olarak RLS politikalarını oluşturur. Manuel kontrol için:

```sql
-- RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 5. İlk Kullanıcı Oluşturma

```bash
# scripts/create-user.js dosyasını düzenleyin
node scripts/create-user.js
```

Veya Supabase Dashboard → Authentication → Users bölümünden manuel olarak oluşturun.

---

## 🔐 Sentry Kurulumu

### 1. Sentry Projesi Oluşturma

1. [Sentry.io](https://sentry.io)'a gidin
2. Create Project → Next.js seçin
3. DSN'i kopyalayın

### 2. Environment Variables

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=yardim-yonetim-paneli
```

### 3. Konfigürasyon Dosyaları

Proje kökünde iki dosya mevcut:
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration

---

## 📊 PostHog Kurulumu

### 1. PostHog Hesabı

1. [PostHog](https://posthog.com)'a gidin
2. Sign up yapın
3. Project oluşturun

### 2. Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Doğrulama

```bash
npm run dev
# Tarayıcıda Console'u açın
# "PostHog initialized" mesajını görmelisiniz
```

---

## 🐳 Docker ile Kurulum (Opsiyonel)

### Dockerfile

```dockerfile
FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    env_file:
      - .env.local
```

### Çalıştırma

```bash
docker-compose up -d
```

---

## 🌐 Vercel Deployment

### 1. Vercel'e Bağlanma

```bash
npm i -g vercel
vercel login
vercel link
```

### 2. Environment Variables Ekleme

```bash
# Her değişken için
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

Veya Vercel Dashboard → Settings → Environment Variables

### 3. Deploy

```bash
vercel --prod
```

---

## 📦 Production Build

### Local Production Test

```bash
# Build
npm run build

# Start
npm run start
```

### Bundle Analysis

```bash
npm run analyze
```

Bu komut build çıktısının boyut analizini yapar.

---

## 🔧 Sorun Giderme

### "Module not found" Hatası

```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Supabase Bağlantı Hatası

1. Environment variables'ları kontrol edin
2. Supabase URL formatını doğrulayın (`https://` ile başlamalı)
3. API key'lerin doğru olduğundan emin olun

### TypeScript Hataları

```bash
# Type check
npx tsc --noEmit

# Cache temizleme
rm -rf .next
npm run dev
```

### Port Çakışması

```bash
# 3000 portunu kullanan process'i bul
lsof -i :3000

# Farklı port kullan
npm run dev -- -p 3001
```

### Node.js Versiyonu

```bash
# Versiyon kontrolü
node -v  # >= 25.0.0 olmalı

# nvm ile versiyon değiştirme
nvm use 25
```

---

## 📝 Checklist

Kurulum tamamlandığında aşağıdakileri kontrol edin:

- [ ] `npm run dev` hatasız çalışıyor
- [ ] `http://localhost:3000` açılıyor
- [ ] Login sayfası görünüyor
- [ ] Supabase bağlantısı çalışıyor
- [ ] İlk kullanıcı ile giriş yapılabiliyor
- [ ] Dashboard yükleniyor
- [ ] Console'da kritik hata yok

---

## 🔗 İlgili Dokümanlar

- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [API Documentation](./API.md)
- [Security](./SECURITY.md)
