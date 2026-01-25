# 🚀 Vercel Deployment Guide - Updated 2026-01-25

## ✅ Pre-Deployment Status

### Build Status
- ✅ TypeScript compilation: **PASSING**
- ✅ Production build: **SUCCESSFUL**
- ✅ Security scan (CodeQL): **NO VULNERABILITIES**
- ⚠️ Dependency audit: 1 low-risk vulnerability in `xlsx` (acceptable, server-side only)

### Security Improvements
- ✅ Rate limiting utility added
- ✅ Input sanitization utilities added
- ✅ Environment variable validation enhanced
- ✅ Security headers configured in Vercel
- ✅ No hardcoded secrets
- ✅ No XSS vulnerabilities
- ✅ CSRF protection (Next.js built-in)
- ✅ SQL injection protection (Supabase parameterized queries)

---

## 📋 Required Environment Variables

### Critical (Must Set in Vercel Dashboard)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (your service role key - NEVER expose to client!)

# Node Environment
NODE_ENV=production
```

### Optional but Recommended

```bash
# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Security
CRON_SECRET=your-random-secure-secret-here

# Turkish ID Verification (if needed)
MERNIS_USERNAME=your-mernis-username
MERNIS_PASSWORD=your-mernis-password
```

---

## 🔧 Vercel Configuration

The repository includes `vercel.json` with optimized settings:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "build": {
    "env": {
      "NODE_VERSION": "24"
    }
  }
}
```

### Key Settings:
- ✅ Node.js 24.x enforced
- ✅ Security headers configured
- ✅ Cron job for daily tasks (10 AM UTC)
- ✅ IAD1 region (US East)

---

## 🚀 Deployment Steps

### Option 1: Auto-Deploy via GitHub

1. **Connect Repository to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `main` branch for production

2. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all required variables listed above
   - Select "Production" environment

3. **Deploy**
   - Push to `main` branch
   - Vercel will auto-deploy
   - Monitor deployment logs

### Option 2: Manual Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview (for testing)
vercel

# Deploy to production
vercel --prod
```

---

## ✅ Post-Deployment Verification

### 1. Check Application
- [ ] Visit your production URL
- [ ] Test login functionality
- [ ] Verify database connections work
- [ ] Check API endpoints respond
- [ ] Verify no console errors

### 2. Security Headers Check

Open browser DevTools → Network → Select any request → Check headers:

```bash
# Should include:
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 3. Performance Check

Run Lighthouse audit:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 4. Monitoring

- ✅ Vercel Analytics: Automatic
- ✅ Sentry (if configured): Check error tracking
- ✅ PostHog (if configured): Check analytics

---

## 🐛 Troubleshooting

### Build Fails with "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build Fails with TypeScript Errors

```bash
# Run type check locally
npx tsc --noEmit

# Fix reported errors
# Then push to deploy
```

### Environment Variables Not Working

1. Check spelling and format in Vercel dashboard
2. Ensure variables are set for correct environment (Production/Preview)
3. Redeploy after adding/updating variables

### Database Connection Errors

1. Verify Supabase URL and keys are correct
2. Check Supabase project is active
3. Verify RLS policies allow access
4. Check connection limits in Supabase dashboard

### Rate Limiting Issues

If API requests are being blocked:

```typescript
// Adjust limits in src/lib/rate-limit.ts
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500 // Increase this
})
```

---

## 🔄 Rollback Procedure

### Via Vercel Dashboard

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

### Via CLI

```bash
vercel rollback
```

### Via Git

```bash
git revert HEAD
git push origin main
```

---

## 📊 Monitoring & Alerts

### Vercel Analytics
- Real User Monitoring
- Web Vitals
- Request logs

### Sentry (Optional)
```bash
# Check error rate
# Set up alerts for critical errors
```

### PostHog (Optional)
```bash
# User analytics
# Feature usage tracking
# Session recording
```

---

## 🔐 Security Considerations

### Before Going Live

1. ✅ All environment variables set securely
2. ✅ SUPABASE_SERVICE_ROLE_KEY only in environment variables (never in code)
3. ✅ RLS policies enabled and tested in Supabase
4. ✅ Security headers configured
5. ✅ Rate limiting in place
6. ✅ Input validation/sanitization implemented
7. ✅ No hardcoded secrets in repository
8. ✅ CodeQL security scan passing

### Regular Maintenance

- Run `npm audit` monthly
- Update dependencies quarterly
- Review security logs weekly
- Monitor error rates daily

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [PRODUCTION_SECURITY_CHECKLIST.md](./PRODUCTION_SECURITY_CHECKLIST.md)

---

## 🆘 Support

### Deployment Issues
- Check [Vercel Status](https://www.vercel-status.com/)
- Review deployment logs in Vercel dashboard
- Contact Vercel support if needed

### Application Issues
- Check Sentry for error tracking
- Review server logs in Vercel dashboard
- Check Supabase logs for database issues

---

**Deployment Checklist Summary:**

- [ ] Environment variables configured in Vercel
- [ ] Node.js version set to 24.x
- [ ] Security headers verified
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Application tested in preview environment
- [ ] Performance benchmarks met
- [ ] Monitoring tools configured
- [ ] Backup and rollback plan ready
- [ ] Team notified of deployment

---

**Last Updated:** 2026-01-25  
**Status:** ✅ Ready for Production Deployment
