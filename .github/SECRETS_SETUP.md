# GitHub Secrets ve Vercel Yapılandırması

Bu dosya, GitHub Actions ve Vercel deploy için gerekli secrets'ların nasıl ekleneceğini açıklar.

## 🔐 GitHub Secrets Ekleme

GitHub repository'nizde şu secrets'ları eklemeniz gerekiyor:

### Repository Secrets Ekleme Adımları:
1. GitHub repository'nize gidin: `https://github.com/Kafkasportal/Final-panel`
2. **Settings** > **Secrets and variables** > **Actions** > **New repository secret**
3. Aşağıdaki secrets'ları tek tek ekleyin:

### Gerekli Secrets:

#### Vercel Secrets:
- **Name:** `VERCEL_TOKEN`
  - **Value:** `<YOUR_VERCEL_TOKEN>`

- **Name:** `VERCEL_ORG_ID`
  - **Value:** `team_3iJKMz7mDaPqR5hfw5q7giOT` (Vercel Organization/Team ID)

- **Name:** `VERCEL_PROJECT_ID`
  - **Value:** Vercel dashboard'dan alın (Settings > General > Project ID)

#### Supabase Secrets:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
  - **Value:** `https://jdrncdqyymlwcyvnnzoj.supabase.co`

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Value:** `<YOUR_NEXT_PUBLIC_SUPABASE_ANON_KEY>`

- **Name:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Opsiyonel)
  - **Value:** `<YOUR_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY>`

- **Name:** `SUPABASE_SERVICE_ROLE_KEY` (Server-side işlemler için)
  - **Value:** `<YOUR_SUPABASE_SERVICE_ROLE_KEY>`

#### Diğer Secrets (Opsiyonel):
- **Name:** `NEXT_PUBLIC_SENTRY_DSN`
  - **Value:** Sentry DSN (eğer kullanıyorsanız)

## 🚀 Vercel Environment Variables

Vercel dashboard'da da environment variables eklemeniz gerekiyor:

### Vercel Environment Variables Ekleme:
1. Vercel dashboard'a gidin: `https://vercel.com/dashboard`
2. Projenizi seçin
3. **Settings** > **Environment Variables**
4. Aşağıdaki variables'ları ekleyin:

### Production, Preview, ve Development için:

```
NEXT_PUBLIC_SUPABASE_URL=https://jdrncdqyymlwcyvnnzoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_NEXT_PUBLIC_SUPABASE_ANON_KEY>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<YOUR_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY>
```

### Server-side için (sadece Production):
```
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
SUPABASE_JWT_SECRET=<YOUR_SUPABASE_JWT_SECRET>
```

## 📋 Vercel Org ID ve Project ID Nasıl Bulunur?

1. Vercel dashboard'a gidin
2. Projenizi seçin
3. **Settings** > **General** bölümüne gidin
4. **Organization ID** ve **Project ID** değerlerini kopyalayın

## ✅ Kontrol Listesi

- [ ] GitHub Secrets eklendi
- [ ] Vercel Environment Variables eklendi
- [ ] VERCEL_ORG_ID ve VERCEL_PROJECT_ID eklendi
- [ ] Workflow dosyası commit edildi
- [ ] İlk deploy test edildi

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:**
- Bu secrets'ları asla kod repository'sine commit etmeyin
- `.env.local` dosyasını `.gitignore`'da tutun
- Secrets'ları sadece GitHub Secrets ve Vercel Environment Variables'da saklayın
- Token'ları düzenli olarak rotate edin
