# 🔒 Production Security & Deployment Checklist

This checklist ensures the application is secure and production-ready before deployment.

## ✅ Pre-Deployment Security Checklist

### 1. Environment Variables
- [ ] All required environment variables are set in Vercel dashboard
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only!)
- [ ] Optional but recommended variables are configured:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `NEXT_PUBLIC_POSTHOG_KEY`
  - `CRON_SECRET`
  - `MERNIS_USERNAME` and `MERNIS_PASSWORD` (if using ID verification)
- [ ] No hardcoded secrets in code
- [ ] `.env.local` is in `.gitignore`
- [ ] Test environment variables are separate from production

### 2. Database Security (Supabase)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested and verified
- [ ] Service role key is only used server-side
- [ ] Database migrations are applied to production
- [ ] Database backups are configured
- [ ] Connection pooling is configured properly

### 3. Authentication & Authorization
- [ ] Middleware authentication is working (`src/proxy.ts`)
- [ ] All protected routes require authentication
- [ ] RBAC (Role-Based Access Control) is implemented
- [ ] User roles are properly enforced (admin, moderator, user, viewer)
- [ ] Session management is secure
- [ ] Password policies are enforced

### 4. API Security
- [ ] All API routes use authentication checks
- [ ] Input validation with Zod schemas
- [ ] Rate limiting is implemented (see `src/lib/rate-limit.ts`)
- [ ] CORS is properly configured
- [ ] SQL injection protection (using Supabase parameterized queries)
- [ ] XSS protection (no `dangerouslySetInnerHTML`)
- [ ] CSRF protection (Next.js built-in)

### 5. Security Headers
- [ ] Security headers configured in `next.config.ts`
- [ ] CSP (Content Security Policy) is active
- [ ] HSTS (HTTP Strict Transport Security) enabled
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Additional headers in `vercel.json`

### 6. Code Quality & Type Safety
- [ ] TypeScript build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] No `any` types in critical paths
- [ ] Proper error handling in all routes

### 7. Dependency Security
- [ ] Run `npm audit` and review vulnerabilities
- [ ] Known vulnerability in `xlsx` package is acceptable (server-side only, no user uploads)
- [ ] All dependencies are up to date
- [ ] No vulnerable packages in production dependencies

### 8. Data Protection
- [ ] User input is sanitized (see `src/lib/sanitize.ts`)
- [ ] File uploads are validated
- [ ] Sensitive data is not logged
- [ ] PII (Personally Identifiable Information) is protected
- [ ] GDPR/KVKK compliance if applicable

### 9. Monitoring & Logging
- [ ] Sentry error tracking configured
- [ ] PostHog analytics configured (optional)
- [ ] Vercel analytics enabled
- [ ] Error logging doesn't expose sensitive data
- [ ] Performance monitoring is active

### 10. Deployment Configuration
- [ ] Node.js version set to 24.x in `vercel.json`
- [ ] Build command is correct: `npm run build`
- [ ] Output directory is `.next`
- [ ] Framework preset is Next.js
- [ ] Regions configured appropriately
- [ ] Cron jobs are configured (if needed)

---

## 🚀 Deployment Steps

### 1. Local Testing
```bash
# Install dependencies
npm ci

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm run test

# Build for production
npm run build

# Test production build locally
npm start
```

### 2. Security Scan
```bash
# Check for vulnerabilities
npm audit

# Review and fix critical/high vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### 3. Vercel Configuration
- Configure environment variables in Vercel dashboard
- Set Node.js version to 24.x
- Enable Vercel Analytics
- Configure custom domain (if applicable)
- Set up deployment protection (optional)

### 4. Database Setup
```bash
# Apply migrations to production database
npx supabase db push --project-ref YOUR_PROJECT_REF

# Verify RLS policies
# Check Supabase dashboard > Authentication > Policies
```

### 5. Deploy
```bash
# Via Vercel CLI
vercel --prod

# Or push to main branch for auto-deployment
git push origin main
```

### 6. Post-Deployment Verification
- [ ] Application loads successfully
- [ ] Login/authentication works
- [ ] Database connections work
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Security headers are present (check with browser DevTools)
- [ ] SSL/TLS certificate is valid
- [ ] Monitoring tools are receiving data

---

## 🔍 Security Testing

### Manual Security Tests
1. **Authentication Bypass**: Try accessing protected routes without login
2. **Authorization**: Try accessing resources belonging to other users
3. **XSS**: Test input fields with `<script>alert('XSS')</script>`
4. **SQL Injection**: Test with `' OR '1'='1` in inputs
5. **CSRF**: Test form submissions from external sites
6. **Rate Limiting**: Make rapid requests to API endpoints

### Automated Security Scans
```bash
# Run CodeQL security scan (GitHub Actions)
# Check .github/workflows/ for security workflows

# Use OWASP ZAP or similar tools for penetration testing
```

---

## 📊 Performance Checklist

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Images are optimized
- [ ] Bundle size is reasonable (< 500KB initial load)
- [ ] Code splitting is implemented
- [ ] Lazy loading where appropriate

---

## 🆘 Rollback Plan

If issues occur after deployment:

1. **Immediate**: Use Vercel dashboard to rollback to previous deployment
2. **Via CLI**: `vercel rollback`
3. **Git**: Revert commit and redeploy
4. **Database**: Restore from backup if needed

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/database/security)
- [Vercel Security](https://vercel.com/docs/security)

---

## 🔐 Security Incident Response

If a security issue is discovered:

1. **Assess**: Determine severity and impact
2. **Contain**: Take affected systems offline if necessary
3. **Fix**: Deploy patch immediately
4. **Notify**: Inform users if their data was compromised
5. **Review**: Conduct post-mortem and update security measures
6. **Document**: Update security documentation

---

**Last Updated**: 2026-01-25  
**Next Review**: Before each major release
