# 🚀 Production Deployment Checklist

Bu checklist, Yardım Yönetim Paneli'nin production'a deploy edilmeden önce hazır olduğundan emin olmanızı sağlar.

**Multi-Tenant SaaS Ready**: Bu uygulama artık birden fazla derneğe (STK) satılabilecek şekilde multi-tenant mimariye sahiptir.

---

## 📊 Current Status

| Check | Status | Notes |
|-------|--------|-------|
| Lint | ✅ | 3 warning (React Compiler uyumluluk bilgisi) |
| TypeScript | ✅ | 0 hata |
| Testler | ✅ | 85 test geçti |
| Build | ✅ | Başarılı |
| npm audit | ✅ | 0 güvenlik açığı |
| Multi-tenant | ✅ | Migration ve middleware hazır |

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] **Supabase Setup**
  - [ ] Create Supabase project at https://supabase.com
  - [ ] Run all migrations in `supabase/migrations/`
  - [ ] Verify RLS policies are enabled on all tables
  - [ ] Set up storage buckets for file uploads
  - [ ] Configure CORS settings for production domain
  - [ ] Get API credentials: URL, Anon Key, Service Role Key

- [ ] **Environment Variables**
  - [ ] Copy `.env.example` to `.env.production.local`
  - [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
  - [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Set `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - [ ] Configure PostHog analytics key (optional)
  - [ ] Configure Sentry DSN for error tracking (recommended)
  - [ ] Set `CRON_SECRET` with random string: `openssl rand -base64 32`
  - [ ] Set `NEXTAUTH_SECRET` with random string: `openssl rand -base64 32`

- [ ] **External Services**
  - [ ] Set up MERNIS credentials (Turkey identity verification)
  - [ ] Configure SMTP settings for email notifications
  - [ ] Set up Sentry project for error tracking

### 2. Database Setup

- [ ] **Migrations**
  - [ ] Review all migration files in `supabase/migrations/`
  - [ ] Run migrations on Supabase project
  - [ ] Verify table structures match schema
  - [ ] Check foreign key relationships
  - [ ] Verify RLS policies are active

- [ ] **Multi-Tenant Setup** (ÖNEMLİ)
  - [ ] Run `20260128_multi_tenant_setup.sql` migration
  - [ ] Run `20260128_rls_tenant_policies.sql` migration
  - [ ] Create initial organization record
  - [ ] Set up organization_members for existing users
  - [ ] Verify tenant isolation with test queries

- [ ] **Seed Data** (optional)
  - [ ] Create admin user via Supabase dashboard
  - [ ] Create initial organization
  - [ ] Add admin user to organization as 'owner'
  - [ ] Set up lookup data (countries, cities, categories)
  - [ ] Configure system settings

### 3. Security Hardening

- [ ] **Supabase Security**
  - [ ] Enable Row Level Security on ALL tables
  - [ ] Review and test RLS policies
  - [ ] Disable anon access to sensitive operations
  - [ ] Set up API rate limiting in Supabase dashboard

- [ ] **Application Security**
  - [ ] Verify security headers in `src/lib/security.ts`
  - [ ] Test RBAC permissions for all roles
  - [ ] Ensure service role key is never used client-side
  - [ ] Verify audit logging is enabled
  - [ ] Test input validation on all forms

- [ ] **Known Vulnerabilities**
  - [ ] ⚠️ **xlsx package**: Version 0.18.5 has known vulnerabilities (Prototype Pollution, ReDoS)
    - Mitigation: Used only server-side for Excel export
    - Alternative: Consider replacing with `exceljs` in future
    - Documented in package.json overrides

### 4. Build & Deployment

- [ ] **Pre-Build Checks**
  - [ ] Run `npm run lint` - no errors
  - [ ] Run `npx tsc --noEmit` - no type errors
  - [ ] Run `npm run test` - all tests pass
  - [ ] Run `npm run build` - build succeeds
  - [ ] Check bundle size: `npm run analyze`

- [ ] **Vercel Configuration**
  - [ ] Connect project to Vercel
  - [ ] Set environment variables in Vercel dashboard
  - [ ] Configure custom domain
  - [ ] Set up automatic deployments on main branch push
  - [ ] Enable Vercel Analytics (optional)
  - [ ] Configure cron jobs in `vercel.json`

### 5. GitHub Secrets

Add these secrets to GitHub repository (Settings → Secrets and variables → Actions):

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` (optional)
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` (optional)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (optional)
- [ ] `SENTRY_AUTH_TOKEN` (optional)
- [ ] `SENTRY_ORG` (optional)
- [ ] `SENTRY_PROJECT` (optional)
- [ ] `SNYK_TOKEN` (for security scanning)
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `DEPLOY_URL`

### 6. Monitoring & Observability

- [ ] **Error Tracking**
  - [ ] Set up Sentry project
  - [ ] Configure client and server Sentry integration
  - [ ] Test error reporting
  - [ ] Set up alerting for critical errors

- [ ] **Analytics**
  - [ ] Set up PostHog project
  - [ ] Configure PostHog in `src/lib/posthog.ts`
  - [ ] Define events to track
  - [ ] Verify analytics are working

- [ ] **Performance**
  - [ ] Enable Core Web Vitals monitoring
  - [ ] Set up Vercel Analytics
  - [ ] Configure performance budgets

### 7. Backup & Disaster Recovery

- [ ] **Database Backups**
  - [ ] Enable Supabase automated backups
  - [ ] Set backup retention period
  - [ ] Test backup restoration process
  - [ ] Document recovery procedures

- [ ] **Application Backups**
  - [ ] Back up environment variables
  - [ ] Document deployment configuration
  - [ ] Create rollback plan

---

## 📋 Deployment Steps

### 1. Initial Deployment

```bash
# 1. Install dependencies
npm ci

# 2. Run pre-deployment checks
npm run lint
npx tsc --noEmit
npm run test

# 3. Build for production
npm run build

# 4. Test production build locally
npm start

# 5. Deploy to Vercel (via CLI or GitHub integration)
vercel --prod
```

### 2. Post-Deployment Verification

- [ ] Access production URL
- [ ] Test login functionality
- [ ] Create test data in each module
- [ ] Verify all API endpoints respond
- [ ] Test file uploads
- [ ] Test PDF/Excel exports
- [ ] Check browser console for errors
- [ ] Verify Sentry is receiving errors
- [ ] Check PostHog analytics dashboard

---

## 🔒 Production Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] `.env.production.local` is NOT committed to git
- [ ] Service role key is only used server-side
- [ ] RLS policies are tested and verified
- [ ] Rate limiting is configured
- [ ] Security headers are active
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Audit logging is working
- [ ] MERNIS integration is secure

---

## 📊 Performance Checklist

- [ ] Bundle size is acceptable (< 500KB initial)
- [ ] Images are optimized
- [ ] Font loading is optimized
- [ ] API responses are cached appropriately
- [ ] Database queries are optimized
- [ ] No memory leaks in long-running processes
- [ ] Core Web Vitals are passing (LCP, FID, CLS)

---

## 🔄 Post-Launch Monitoring

### Daily (First Week)
- [ ] Check error rate in Sentry
- [ ] Review performance metrics
- [ ] Monitor database usage
- [ ] Check API response times

### Weekly
- [ ] Review audit logs for suspicious activity
- [ ] Analyze user behavior in PostHog
- [ ] Check backup status
- [ ] Review and respond to any issues

### Monthly
- [ ] Security audit review
- [ ] Dependency updates
- [ ] Performance optimization review
- [ ] Backup restoration test

---

## 🆘 Emergency Procedures

### Rollback Plan
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy previous commit
git checkout [previous-commit-tag]
vercel --prod
```

### Incident Response
1. Check Sentry for errors
2. Check Vercel deployment logs
3. Check Supabase logs
4. Notify stakeholders
5. Implement fix or rollback

---

## 📞 Important Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Sentry Dashboard**: https://sentry.io
- **PostHog Dashboard**: https://app.posthog.com

---

## 📝 Notes

- **Node Version**: 24.x (specified in package.json engines)
- **Deployment Platform**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (errors), PostHog (analytics)

---

## 🏢 Multi-Tenant SaaS Deployment (Yeni STK Ekleme)

Her yeni dernek/STK için:

### 1. Yeni Organizasyon Oluşturma

```sql
-- Supabase SQL Editor'da çalıştırın
INSERT INTO organizations (name, slug, email, plan_tier)
VALUES ('Dernek Adı', 'dernek-slug', 'info@dernek.org', 'professional')
RETURNING id;
```

### 2. Admin Kullanıcı Atama

```sql
-- Yeni kullanıcı kaydolduktan sonra owner olarak ata
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('ORG_ID', 'USER_ID', 'owner');
```

### 3. Abonelik Yönetimi

| Plan | Max Users | Max Needy | Storage | Fiyat/Ay |
|------|-----------|-----------|---------|----------|
| Free | 3 | 100 | 500MB | Ücretsiz |
| Professional | 10 | 1000 | 5GB | TBD |
| Enterprise | Sınırsız | Sınırsız | 50GB | TBD |

### 4. Onboarding Checklist

- [ ] Organizasyon kaydı oluşturuldu
- [ ] Owner kullanıcı atandı
- [ ] Logo yüklendi
- [ ] İletişim bilgileri girildi
- [ ] Abonelik planı seçildi
- [ ] Email ayarları yapıldı
- [ ] SMS sağlayıcısı konfigüre edildi

---

## 🔑 Kalan Görevler (Multi-Tenant Tam Entegrasyon)

Aşağıdaki API route'ları `withOrgAuth` middleware ile güncellenmelidir:

- [ ] `/api/donations/route.ts`
- [ ] `/api/orphans/route.ts`
- [ ] `/api/volunteers/route.ts`
- [ ] `/api/meetings/route.ts`
- [ ] `/api/finance/bank-accounts/route.ts`
- [ ] `/api/dashboard/stats/route.ts`
- [ ] `/api/applications/route.ts` (varsa)
- [ ] Diğer tüm data API'leri

**Örnek Güncelleme Paterni:**
```typescript
import { withOrgAuth, createOrgErrorResponse } from '@/lib/organization-middleware'

export async function GET(request: NextRequest) {
  const orgAuthResult = await withOrgAuth(request)
  if (!orgAuthResult.success) {
    return createOrgErrorResponse(orgAuthResult.error, orgAuthResult.status)
  }

  const orgId = orgAuthResult.user.organization.id

  // Her sorguda .eq('organization_id', orgId) ekle
  const { data } = await supabase
    .from('table_name')
    .select('*')
    .eq('organization_id', orgId)
}
```

---

<sup>Last Updated: 2026-01-28</sup>
<sup>Document: docs/PRODUCTION_CHECKLIST.md</sup>
