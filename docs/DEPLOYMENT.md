# 🚀 Deployment Guide

Complete guide for deploying Yardım Yönetim Paneli using Vercel's native GitHub integration.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Push to main / Pull Request                    │ │
│  └──────────────────────┬─────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────┐
│   GitHub Actions    │         │      Vercel         │
│   (Quality Checks)  │         │   (Deployment)      │
│  - Lint             │         │  - Build            │
│  - Type Check       │         │  - Deploy           │
│  - Tests            │         │  - Preview URLs     │
│  - Security Audit   │         │  - Production       │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │  Supabase       │
                                  │  (Already       │
                                  │   Configured)   │
                                  └─────────────────┘
```

---

## 🔧 Setup Steps

### Step 1: Connect GitHub Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Vercel will automatically detect the Next.js framework

### Step 2: Configure Environment Variables in Vercel

Go to **Settings → Environment Variables** in your Vercel project and add:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Production domain | ✅ Yes |
| `CRON_SECRET` | Random string for cron jobs | ✅ Yes |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key | Optional |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL | Optional |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking | Optional |

**Note:** Since Supabase is already configured in Vercel, some variables may be pre-filled.

### Step 3: Configure Deployment Settings

In **Settings → General**:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Node Version: 24.x
```

### Step 4: Deploy!

**Automatic Deployment:**
```bash
# Push to main branch → Production
git push origin main

# Create PR → Preview Deployment
git checkout -b feature/new-feature
git push origin feature/new-feature
# Then create PR on GitHub
```

**Manual Deployment (via Vercel CLI):**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔄 Deployment Flow

### Main Branch (Production)

```
git push origin main
    │
    ├──▶ GitHub Actions: Quality Checks (parallel)
    │   ├── Lint & Type Check
    │   ├── Tests
    │   ├── Build Verification
    │   └── Security Audit
    │
    └──▶ Vercel: Auto-Deploy
        ├── Build application
        ├── Run migrations (if needed)
        └── Deploy to production
            └── https://your-domain.vercel.app
```

### Pull Request (Preview)

```
git push origin feature-branch
    │
    ├──▶ GitHub Actions: Quality Checks
    │
    └──▶ Vercel: Preview Deployment
        └── https://preview-url.vercel.app
```

---

## 🌳 Branch Strategy

| Branch | Deployment | Environment |
|--------|-----------|-------------|
| `main` | Automatic via Vercel | **Production** |
| `develop` | Automatic via Vercel | **Staging** |
| `feature/*` | PR → Preview URL | **Preview** |
| `hotfix/*` | PR → Preview → Merge to main | **Hotfix** |

---

## 🔐 GitHub Secrets (Optional)

Since Vercel handles deployment, you only need GitHub secrets for CI checks:

```bash
# Only required for CI workflow
SNYK_TOKEN          # For Snyk security scanning (optional)
```

**Not Required** (Vercel handles these):
- ~~VERCEL_TOKEN~~
- ~~VERCEL_ORG_ID~~
- ~~VERCEL_PROJECT_ID~~
- ~~NEXT_PUBLIC_SUPABASE_URL~~
- ~~NEXT_PUBLIC_SUPABASE_ANON_KEY~~

---

## 📊 Monitoring & Debugging

### Vercel Dashboard

- **Deployments**: View deployment history and logs
- **Functions**: Monitor serverless function performance
- **Analytics**: Page views, Core Web Vitals
- **Logs**: Real-time log streaming

### GitHub Actions

- **Actions Tab**: View CI/CD workflow results
- **Checks**: Each PR shows quality check status
- **Status Badges**: Add to README

```markdown
[![CI/CD](https://github.com/your-org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/repo/actions/workflows/ci.yml)
```

---

## 🛠️ Common Issues & Solutions

### Issue 1: Build Fails with Environment Variables

**Error:** `Your project's URL and API key are required`

**Solution:**
1. Go to Vercel Project → Settings → Environment Variables
2. Add all required variables
3. Redeploy from Vercel dashboard

### Issue 2: Supabase Connection Issues

**Error:** `Connection refused` or `Invalid API key`

**Solution:**
1. Verify Supabase is integrated in Vercel
2. Check environment variables match Supabase dashboard
3. Ensure RLS policies allow access

### Issue 3: CI Checks Pass but Deploy Fails

**Solution:**
1. Check Vercel deployment logs
2. Compare environment variables between CI and Vercel
3. Vercel builds use actual production values, CI uses mocks

### Issue 4: Preview Deployments Not Working

**Solution:**
1. Ensure repository is connected to Vercel
2. Check "Preview Deployment" is enabled in Vercel settings
3. Verify branch protection rules allow preview builds

---

## 🔄 Rollback Procedure

### Via Vercel Dashboard

1. Go to **Deployments** tab
2. Find the previous successful deployment
3. Click **"Promote to Production"**
4. Confirm rollback

### Via Git

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

---

## 📈 Performance Optimization

### Automatic Optimizations

Vercel automatically handles:
- Image optimization with `next/image`
- Static page generation
- Edge caching
- CDN distribution

### Manual Optimizations

```typescript
// next.config.ts
export default {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    domains: ['your-storage.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Edge runtime for API routes
  experimental: {
    runtime: 'edge',
  },
}
```

---

## 🔔 Notifications

### Configure Deployment Notifications

1. Vercel Dashboard → **Settings** → **Notifications**
2. Connect Slack, Discord, or Email
3. Configure events:
   - Deployment Success
   - Deployment Error
   - Domain Changed

---

## 📝 Pre-Deployment Checklist

Before pushing to `main`:

- [ ] All tests pass locally (`npm run test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables set in Vercel
- [ ] Supabase migrations applied
- [ ] Security audit passed (`npm audit`)
- [ ] Changelog updated (if applicable)

---

## 🎯 Quick Reference

```bash
# Development
npm run dev                 # Start local dev server

# Quality Checks
npm run lint               # ESLint
npx tsc --noEmit           # Type check
npm run test               # Run tests
npm run build              # Build for production

# Deployment
git push origin main       # Deploy to production
vercel                     # Deploy to preview
vercel --prod              # Deploy to production (manual)
```

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase + Vercel**: https://supabase.com/docs/guides-with-vercel

---

<sup>Last Updated: 2025-01-22</sup>
