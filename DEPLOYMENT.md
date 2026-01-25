# 🚀 Vercel Deployment Guide

## ⚠️ IMPORTANT: Environment Variables Required for Build

**Note:** This application requires environment variables to build successfully. During local development and CI/CD, you can create a `.env.local` file with placeholder values (this file is in `.gitignore` and won't be committed).

For production deployment on Vercel, **all environment variables MUST be configured in the Vercel dashboard** before deployment.

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

---

## Pre-Deployment Checklist

### 1. Environment Variables
Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:

**Required (Production):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Optional (Recommended):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
CRON_SECRET=your-random-secret
```

### 2. Local Build Test
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build test
npm run build

# Bundle analysis (optional)
ANALYZE=true npm run build
```

### 3. Database Migrations
Supabase migrations'ların production database'de çalıştırıldığından emin olun:

```bash
npx supabase db push
```

### 4. Vercel Settings

**Build & Development Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm ci`
- Node Version: `24.x`

**Domains:**
- Production: `your-domain.com`
- Preview: `your-repo-*.vercel.app`

### 5. Deployment
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Failed: TypeScript Errors
```bash
# Local'de type check
npm run type-check

# Hataları düzelt ve tekrar dene
```

### Build Failed: Missing Environment Variables
Vercel dashboard → Settings → Environment Variables → Add missing variables

### Build Failed: Out of Memory
Vercel dashboard → Settings → General → Node.js Version → Ensure 24.x

### Runtime Errors: Database Connection
- Supabase URL ve keys'leri kontrol edin
- RLS policies'i doğrulayın
- Supabase connection limits'i kontrol edin

## Post-Deployment

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

### 2. Monitoring
- Vercel Analytics: Automatic
- Sentry: Check error tracking
- PostHog: Check analytics

### 3. Performance
- Lighthouse score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s

## Rollback
```bash
# Vercel dashboard'dan previous deployment'a geri dön
# veya CLI ile:
vercel rollback
```

## Support
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create an issue

---

## 📋 Quick Deployment Steps

1. ✅ Local'de test et: `npm run type-check && npm run build`
2. ✅ Vercel'e environment variables ekle
3. ✅ GitHub'a push yap
4. ✅ Vercel otomatik deploy edecek
5. ✅ Deployment loglarını kontrol et
6. ✅ Production URL'i test et

## 🔐 Security Checklist

- [ ] Environment variables Vercel'de eklendi
- [ ] SUPABASE_SERVICE_ROLE_KEY sadece server-side kullanılıyor
- [ ] CRON_SECRET güvenli ve random
- [ ] RLS policies aktif
- [ ] Security headers yapılandırıldı
- [ ] CORS ayarları doğru

## 🎯 Performance Optimization

- [ ] Image optimization aktif
- [ ] Bundle size kontrol edildi (<500kb ideal)
- [ ] Unused dependencies temizlendi
- [ ] Code splitting yapıldı
- [ ] Lazy loading uygulandı

## 📊 Monitoring

**Vercel Analytics:**
- Real User Monitoring
- Web Vitals
- Request logs

**Sentry:**
- Error tracking
- Performance monitoring
- Release tracking

**PostHog:**
- User analytics
- Feature flags
- Session recording
