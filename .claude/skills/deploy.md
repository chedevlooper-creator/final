# Deploy

Deploy the application to Vercel.

## Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Pre-Deployment Checklist

1. Run `npx tsc --noEmit` - Type check passes
2. Run `npm run lint` - Linting passes
3. Run `npm run test` - Tests pass
4. Run `npm run build` - Build succeeds
5. Environment variables are set in Vercel
6. Database migrations are applied

## Required Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Optional

- NEXT_PUBLIC_SENTRY_DSN
- NEXT_PUBLIC_POSTHOG_KEY
- CRON_SECRET

## Notes

- Auto-deploy on push to main branch
- Node version: 24.x
- Output mode: standalone
