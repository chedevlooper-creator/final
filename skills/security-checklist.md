# Güvenlik Kontrol Listesi

Bu doküman, Yardım Yönetim Paneli projesinde güvenlik açıklarını önlemek için best practices ve kontrol listeleri içerir.

## 🔒 Güvenlik İlkeleri

### 1. En Az Yetki İlkesi (Principle of Least Privilege)
- Kullanıcılar sadece ihtiyaç duyduğu yetkilere sahip olmalı
- Varsayılan olarak her şey reddedilmeli, sadece gerekli olan izin verilmeli
- Admin yetkileri minimal tutulmalı

### 2. Defense in Depth
- Çok katmanlı güvenlik önlemleri
- Client-side validation tek başına yeterli değil
- Server-side validation zorunlu
- Veritabanı seviyesinde de kontrol (RLS)

### 3. Security by Default
- Güvenli ayarlar varsayılan olmalı
- Güvensiz özellikler açıkça etkinleştirilmeli
- Production'da debug modu kapalı olmalı

## ✅ Mevcut Güvenlik Önlemleri

### 1. Authentication & Authorization
```typescript
// ✅ Mevcut: Supabase Auth
- JWT token based authentication
- Session management
- Password hashing (bcrypt)
- Email verification
- Password reset flow
```

### 2. Row Level Security (RLS)
```sql
-- ✅ Mevcut: Supabase RLS
ALTER TABLE needy_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view needy persons"
ON needy_persons FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert needy persons"
ON needy_persons FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update needy persons"
ON needy_persons FOR UPDATE
TO authenticated
USING (true);
```

### 3. Security Headers
```typescript
// ✅ Mevcut: Security headers (src/lib/security.ts)
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "..." // Mevcut ama iyileştirme gerekli
}
```

### 4. Input Validation
```typescript
// ✅ Mevcut: Zod validation
export const needyFormSchema = z.object({
  first_name: z.string().min(2).max(50),
  identity_number: z.string().refine(validateTC),
  email: z.string().email(),
  // ... diğer validasyonlar
})
```

## ⚠️ Güvenlik Riskleri ve Çözümler

### 1. Content Security Policy (CSP) ⚠️

#### Sorun
```typescript
// ❌ MEVCUT: unsafe-inline kullanımı
"script-src 'self' 'unsafe-eval' 'unsafe-inline'"
```

#### Risk
- XSS saldırılarına açık
- Inline script'ler çalıştırılabilir

#### Çözüm
```typescript
// ✅ ÖNERİLEN: Nonce-based CSP
import { headers } from 'next/headers'

export function getCSP() {
  const nonce = crypto.randomBytes(16).toString('base64')
  
  return {
    'Content-Security-Policy': [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'nonce-${nonce}'`,
      `img-src 'self' data: blob: https://*.supabase.co`,
      `font-src 'self' data:`,
      `connect-src 'self' https://*.supabase.co`,
      `frame-ancestors 'none'`,
    ].join('; ')
  }
}

// Next.js page'da kullanımı
export const metadata = {
  other: getCSP()
}
```

### 2. Environment Variables ⚠️

#### Sorun
```bash
# .env.local - Git'e eklenmeli mi kontrol et
NEXT_PUBLIC_SUPABASE_URL=... # ✅ Public (RLS ile korunuyor)
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # ✅ Public (RLS ile korunuyor)
SUPABASE_SERVICE_ROLE_KEY=... # ❌ BU ASLA CLIENT'A GİTMEMELİ
```

#### Çözüm
```typescript
// ✅ Server-side only
// app/api/protected-route/route.ts
import { createClient } from '@supabase/supabase-js'

// Service role key sadece server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ❌ Client'a gitmez
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Client-side never use service role key
```

### 3. SQL Injection ✅ (Korumalı)

#### Mevcut Koruma
```typescript
// ✅ Zod validation ile korunuyor
export const needyFormSchema = z.object({
  first_name: z.string().max(50),
  // ...
})

// ✅ Supabase prepared queries
const { data } = await supabase
  .from('needy_persons')
  .insert(validatedData)
  .select()
```

#### Ek Öneri
```typescript
// ✅ Ek validasyon: SQL injection patterns kontrolü
function checkForSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC|EXECUTE|INSERT|SELECT|UNION|UPDATE)\b)/i,
    /(--)/,
    /(;)/,
    /(\|)/,
    /(\/\*)/
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}
```

### 4. XSS Protection ✅ (Temel Koruma Var)

#### Mevcut Koruma
```typescript
// ✅ React otomatik escaping
<div>{userInput}</div> // Otomatik olarak escape edilir

// ❌ Dangerous: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Kullanılmıyor
```

#### Ek Öneri
```typescript
// ✅ DOMPurify ekleyin
import DOMPurify from 'dompurify'

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// Kullanımı
const cleanHTML = sanitizeHTML(dangerousHTML)
```

### 5. CSRF Protection ⚠️

#### Mevcut Durum
```typescript
// ⚠️ Mevcut: CSRF token yok
```

#### Çözüm
```typescript
// ✅ Next.js middleware ile CSRF protection
import { createHash, randomBytes } from 'crypto'

export async function generateCSRFToken(): Promise<string> {
  return randomBytes(32).toString('base64')
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  // Token'ı session ile karşılaştır
  const sessionToken = await getSessionToken()
  return token === sessionToken
}

// Middleware'da kullanım
export async function middleware(request: NextRequest) {
  if (request.method === 'POST') {
    const csrfToken = request.headers.get('x-csrf-token')
    if (!await validateCSRFToken(csrfToken || '')) {
      return new Response('Invalid CSRF token', { status: 403 })
    }
  }
  // ...
}
```

### 6. Rate Limiting ❌ (Eksik)

#### Sorun
```typescript
// ❌ Rate limiting yok
// API endpoint'leri spam saldırılara açık
```

#### Çözüm
```typescript
// ✅ Upstash Redis ile rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 istek / 10 saniye
  analytics: true
})

// API route'da kullanımı
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  const { success, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too many requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 10000).toISOString()
      }
    })
  }
  
  // ... normal işlem
}
```

### 7. Authentication Timeout ⚠️

#### Mevcut Durum
```typescript
// ⚠️ Supabase default: 1 hafta
```

#### Çözüm
```typescript
// ✅ Kısa session süresi (production için)
// supabase/migrations/auth_settings.sql
ALTER TABLE auth.sessions 
ALTER COLUMN expires_at SET DEFAULT now() + interval '1 hour';

// Refresh token rotation
ALTER TABLE auth.sessions 
ALTER COLUMN refresh_token_rotation_enabled SET DEFAULT true;
```

## 🛡️ Güvenlik Testleri

### 1. OWASP ZAP Scan
```bash
# OWASP ZAP ile güvenlik taraması
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://yourapp.com \
  -r zap-report.html
```

### 2. Dependency Check
```bash
# npm audit
npm audit
npm audit fix

# Snyk (daha kapsamlı)
npm install -g snyk
snyk test
snyk monitor
```

### 3. Environment Variable Check
```typescript
// ✅ Environment variable validation
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test'])
})

export const env = envSchema.parse(process.env)
```

## 📋 Güvenlik Kontrol Listesi

### Her Deployment Öncesi Kontrol Et

#### Authentication & Authorization
- [ ] Tüm endpoint'ler auth kontrolü var
- [ ] RLS politikaları aktif
- [ ] Session timeout ayarlı
- [ ] Password complexity requirements var
- [ ] 2FA (iki faktörlü doğrulama) aktif (opsiyonel)

#### Data Protection
- [ ] Input validation var (client + server)
- [ ] Output encoding yapılıyor
- [ ] SQL injection koruması var
- [ ] XSS koruması var
- [ ] CSRF token var (POST/PUT/DELETE)

#### Network Security
- [ ] HTTPS zorunlu (production)
- [ ] HSTS aktif
- [ ] Security headers var
- [ ] Rate limiting var
- [ ] API rate limiting var

#### Logging & Monitoring
- [ ] Error logging var
- [ ] Security event logging var
- [ ] Failed login attempts loglanıyor
- [ ] Suspicious activities alert var
- [ ] Log rotation yapılandırılmış

#### Code Security
- [ ] Hardcoded secrets yok
- [ ] Debug mode kapalı (production)
- [ ] Error messages sensitive bilgi içermiyor
- [ ] Dependencies güncel
- [ ] No known vulnerabilities

## 🚨 Güvenlik Incident Response Plan

### 1. Tespit
- Anomali tespit sistemi
- Log monitoring
- User reporting

### 2. İzolasyon
- Etkilenen sistemleri izole et
- Erişimi kısıtla
- Backup al

### 3. Analiz
- Root cause analizi
- Etki analizi
- Veri ihlali tespiti

### 4. Düzeltme
- Security patch uygula
- Sistemleri güncelle
- Test et

### 5. Bildirim
- Kullanıcıları bilgilendir
- Yetkilileri bilgilendir (KVKK gereği)
- Transparency report oluştur

## 📚 Kaynaklar

### Güvenlik Dokümantasyonu
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

### Güvenlik Araçları
- [OWASP ZAP](https://www.zaproxy.org/)
- [Snyk](https://snyk.io/)
- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)
- [Semgrep](https://semgrep.dev/)
- [CodeQL](https://codeql.github.com/)

### Güvenlik Testi
```bash
# Güvenlik testi komutları
npm audit                    # Dependency vulnerabilities
npm run test                # Unit tests
npm run test:e2e            # E2E tests
npm run lint                # Linting
npx snyk test              # Snyk scan
```

---

**Son Güncelleme:** 17 Ocak 2026  
**Versiyon:** 1.0.0  
**Durum:** Aktif Güvenlik Önlemleri: %75
