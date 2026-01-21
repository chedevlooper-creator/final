---
name: check-security
description: Kodda güvenlik açıkları, RBAC eksiklikleri ve validation sorunlarını tespit eder.
---

# 🔒 Check Security Skill

Bu skill, YYP projesinde güvenlik açıklarını, eksik RBAC kontrollerini ve validation sorunlarını tespit eder.

## Kullanım

Kullanıcıya şu seçenekleri sun:
1. **Tam Tarama** - Tüm proje taranır
2. **Modül Tarama** - Belirli bir modül taranır (örn: "needy", "donations")
3. **Dosya Tarama** - Belirli dosyalar taranır

## Kontrol Edilen Güvenlik Açıkları

### 1. ⚠️ RBAC Eksiklikleri

#### Server Actions'da RBAC Kontrolü
```typescript
// ❌ BAD - No permission check
export async function deleteUserAction(id: string) {
  const supabase = await createServerSupabaseClient()
  await supabase.from('users').delete().eq('id', id)
}

// ✅ GOOD - With permission check
export async function deleteUserAction(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.user_metadata?.['role']
  if (!hasResourcePermission(role, 'users', 'delete')) {
    throw new AuthorizationError('Yetkiniz yok')
  }

  await supabase.from('users').delete().eq('id', id)
}
```

#### API Routes'da RBAC Kontrolü
```typescript
// ❌ BAD - No auth check
export async function GET(request: Request) {
  const supabase = createClient()
  const { data } = await supabase.from('sensitive_data').select()
  return Response.json(data)
}

// ✅ GOOD - With auth check
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = user.user_metadata?.['role']
  if (!hasResourcePermission(role, 'sensitive_data', 'read')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data } = await supabase.from('sensitive_data').select()
  return Response.json(data)
}
```

### 2. 🛡️ Validation Eksiklikleri

#### Form Validation
```typescript
// ❌ BAD - No validation
export async function createUserAction(data: any) {
  await supabase.from('users').insert(data)
}

// ✅ GOOD - With Zod validation
export async function createUserAction(rawData: unknown) {
  const validation = userSchema.safeParse(rawData)
  if (!validation.success) {
    throw new ValidationError('Invalid data')
  }

  await supabase.from('users').insert(validation.data)
}
```

#### SQL Injection Prevention
```typescript
// ❌ BAD - String interpolation
const query = `SELECT * FROM users WHERE email = '${email}'`

// ✅ GOOD - Parameterized queries (Supabase handles this)
await supabase.from('users').select().eq('email', email)
```

### 3. 🔐 Authentication Issues

#### Missing Auth Checks
```typescript
// ❌ BAD - No auth check
export async function getUserData(userId: string) {
  const supabase = createClient()
  return await supabase.from('users').select().eq('id', userId).single()
}

// ✅ GOOD - With auth check
export async function getUserData(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Users can only access their own data
  if (user.id !== userId && user.user_metadata?.['role'] !== 'admin') {
    throw new Error('Forbidden')
  }

  return await supabase.from('users').select().eq('id', userId).single()
}
```

### 4. 💉 XSS Vulnerabilities

#### Dangerous HTML Rendering
```typescript
// ❌ BAD - Direct HTML rendering
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - Sanitized or text only
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
<div dangerouslySetInnerHTML={{ __html: sanitized }} />

// Or better: Just use text
<div>{userInput}</div>
```

### 5. 🔑 Sensitive Data Exposure

#### Logging Sensitive Data
```typescript
// ❌ BAD - Logging passwords
console.log('User login:', { email, password })

// ✅ GOOD - Don't log sensitive data
console.log('User login attempt:', { email })
```

#### Exposing Secrets
```typescript
// ❌ BAD - Hardcoded secrets
const apiKey = 'sk_live_abc123'

// ✅ GOOD - Environment variables
const apiKey = process.env.API_KEY
```

#### Client-Side Secrets
```typescript
// ❌ BAD - Service role key on client
const supabase = createClient(url, SERVICE_ROLE_KEY)

// ✅ GOOD - Anon key on client
const supabase = createClient(url, ANON_KEY)
```

### 6. 🌐 CORS Issues

```typescript
// ❌ BAD - Allow all origins
headers.set('Access-Control-Allow-Origin', '*')

// ✅ GOOD - Specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
if (allowedOrigins.includes(origin)) {
  headers.set('Access-Control-Allow-Origin', origin)
}
```

### 7. 📝 RLS (Row Level Security) Issues

#### Missing RLS Policies
```sql
-- ❌ BAD - No RLS
CREATE TABLE sensitive_data (...);
-- No ENABLE ROW LEVEL SECURITY

-- ✅ GOOD - With RLS
CREATE TABLE sensitive_data (...);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own data"
  ON sensitive_data FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

### 8. 🔄 CSRF Protection

#### Form Submissions
```typescript
// ✅ GOOD - Next.js Server Actions have built-in CSRF protection
// Just use server actions properly

export async function submitForm(formData: FormData) {
  'use server'
  // This is automatically protected
}
```

## Tarama Komutları

### Grep Patterns for Security Issues

```bash
# 1. Missing RBAC checks in server actions
grep -r "export async function.*Action" src/app/actions/ | \
  grep -v "hasResourcePermission\|hasPermission"

# 2. Direct Supabase calls without auth
grep -r "createClient()" src/app/api/ | \
  grep -v "auth.getUser\|getSession"

# 3. Dangerous HTML rendering
grep -r "dangerouslySetInnerHTML" src/

# 4. Console.log with potential sensitive data
grep -r "console.log.*password\|console.log.*token\|console.log.*secret" src/

# 5. Hardcoded credentials
grep -r "api[_-]?key.*=.*['\"][^$]" src/ | \
  grep -v "process.env\|NEXT_PUBLIC"

# 6. No validation
grep -r "export async function.*Action" src/ | \
  grep -v "safeParse\|parse\|schema"

# 7. SQL injection risks (raw queries)
grep -r "\.query\|\.raw" src/

# 8. Missing error handling
grep -r "export async function.*Action" src/ | \
  grep -v "try\|catch"
```

## Otomatik Tarama Script'i

### Dosya: `.agent/skills/check-security/scripts/security-scan.sh`

```bash
#!/bin/bash

echo "🔒 YYP Security Scanner"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Counters
ISSUES=0

# 1. Check RBAC in Server Actions
echo "1️⃣  Checking RBAC in Server Actions..."
MISSING_RBAC=$(grep -r "export async function.*Action" src/app/actions/ 2>/dev/null | \
  grep -v "hasResourcePermission\|hasPermission" | wc -l)

if [ "$MISSING_RBAC" -gt 0 ]; then
  echo -e "${RED}   ❌ Found $MISSING_RBAC server actions without RBAC checks${NC}"
  ISSUES=$((ISSUES + MISSING_RBAC))
else
  echo -e "${GREEN}   ✅ All server actions have RBAC checks${NC}"
fi

# 2. Check Auth in API Routes
echo "2️⃣  Checking Auth in API Routes..."
MISSING_AUTH=$(find src/app/api -name "route.ts" -exec grep -L "auth.getUser\|getSession" {} \; 2>/dev/null | wc -l)

if [ "$MISSING_AUTH" -gt 0 ]; then
  echo -e "${RED}   ❌ Found $MISSING_AUTH API routes without auth checks${NC}"
  ISSUES=$((ISSUES + MISSING_AUTH))
else
  echo -e "${GREEN}   ✅ All API routes have auth checks${NC}"
fi

# 3. Check for dangerouslySetInnerHTML
echo "3️⃣  Checking for XSS vulnerabilities..."
XSS_RISKS=$(grep -r "dangerouslySetInnerHTML" src/ 2>/dev/null | wc -l)

if [ "$XSS_RISKS" -gt 0 ]; then
  echo -e "${YELLOW}   ⚠️  Found $XSS_RISKS uses of dangerouslySetInnerHTML${NC}"
  ISSUES=$((ISSUES + XSS_RISKS))
else
  echo -e "${GREEN}   ✅ No dangerouslySetInnerHTML found${NC}"
fi

# 4. Check for hardcoded secrets
echo "4️⃣  Checking for hardcoded secrets..."
HARDCODED=$(grep -r "api[_-]key.*=.*['\"][^$]" src/ 2>/dev/null | \
  grep -v "process.env\|NEXT_PUBLIC" | wc -l)

if [ "$HARDCODED" -gt 0 ]; then
  echo -e "${RED}   ❌ Found $HARDCODED potential hardcoded secrets${NC}"
  ISSUES=$((ISSUES + HARDCODED))
else
  echo -e "${GREEN}   ✅ No hardcoded secrets found${NC}"
fi

# 5. Check for missing validation
echo "5️⃣  Checking for validation in actions..."
NO_VALIDATION=$(grep -r "export async function.*Action" src/ 2>/dev/null | \
  grep -v "safeParse\|parse\|schema" | wc -l)

if [ "$NO_VALIDATION" -gt 0 ]; then
  echo -e "${YELLOW}   ⚠️  Found $NO_VALIDATION actions without validation${NC}"
  ISSUES=$((ISSUES + NO_VALIDATION))
else
  echo -e "${GREEN}   ✅ All actions have validation${NC}"
fi

# Summary
echo ""
echo "======================="
if [ "$ISSUES" -eq 0 ]; then
  echo -e "${GREEN}✅ No security issues found!${NC}"
else
  echo -e "${RED}⚠️  Found $ISSUES potential security issues${NC}"
  echo "Please review and fix them."
fi
echo "======================="
```

## Güvenlik Checklist

Her yeni özellik için kontrol et:

### Server Actions
- [ ] `hasResourcePermission` kontrolü var mı?
- [ ] User authentication kontrolü var mı?
- [ ] Zod validation kullanılıyor mu?
- [ ] Error handling düzgün mü?
- [ ] Sentry'ye log gidiyor mu?
- [ ] Sensitive data loglanmıyor mu?

### API Routes
- [ ] Authentication check var mı?
- [ ] Authorization check var mı?
- [ ] Input validation var mı?
- [ ] CORS düzgün ayarlanmış mı?
- [ ] Rate limiting var mı (gerekiyorsa)?

### Components
- [ ] User input sanitize ediliyor mu?
- [ ] XSS koruması var mı?
- [ ] CSRF koruması var mı?
- [ ] Sensitive data client'a gönderilmiyor mu?

### Database
- [ ] RLS enabled mı?
- [ ] Policy'ler doğru tanımlı mı?
- [ ] Foreign key constraints var mı?
- [ ] Index'ler performans için uygun mu?

## Otomatik Düzeltme Önerileri

Skill şunları önerebilir:

1. **Eksik RBAC için:**
   - Hangi dosyada eksik?
   - Hangi permission gerekli?
   - Kod örneği sun

2. **Eksik Validation için:**
   - Zod schema oluştur
   - Validation ekle
   - Type safety sağla

3. **XSS riskleri için:**
   - DOMPurify kullan
   - Veya text rendering'e geç

4. **Hardcoded secrets için:**
   - .env'e taşı
   - Environment variable kullan

---
*Bu skill YYP güvenlik standartlarını ve OWASP Top 10'u takip eder.*
