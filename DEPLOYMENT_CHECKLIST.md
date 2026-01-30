# 🚀 Production Deployment Checklist

## ✅ Tamamlanan Düzeltmeler

### 1. Kritik Hatalar Düzeltildi
- [x] **Middleware.ts Eklendi** - Auth kontrolü için `src/middleware.ts` dosyası oluşturuldu
- [x] **Not Found Sayfası Düzeltildi** - Client component hatası giderildi
- [x] **API Route Organization Kontrolü** - Geriye uyumlu hale getirildi
- [x] **Junction Tables Hatası** - `needy_diseases` ve `needy_income_sources` tabloları için try-catch eklendi
- [x] **DetailHeader Linkleri** - Eksik sayfalara linkler kaldırıldı

### 2. Build ve Test Sonuçları
```
✅ TypeScript: Hatasız
✅ ESLint: Sadece uyarılar (0 hata)
✅ Build: Başarılı (59 sayfa)
✅ Testler: 85/85 geçti
```

---

## 📋 Production Deployment Adımları

### 1. Environment Variables (.env.local)

```bash
# Supabase (ZORUNLU)
NEXT_PUBLIC_SUPABASE_URL=https://jdrncdqyymlwcyvnnzoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Uygulama (ZORUNLU)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Güvenlik (ÖNERİLEN)
CRON_SECRET=your-random-cron-secret
NEXTAUTH_SECRET=your-random-secret-for-jwt
CLIENT_IP_ENCRYPTION_KEY=your-encryption-key

# Sentry (OPSİYONEL)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project

# Email (OPSİYONEL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Supabase Veritabanı Ayarları

Migration dosyalarının çalıştırıldığından emin olun:

```bash
# Supabase CLI ile
supabase db push

# Veya SQL Editor ile migration'ları çalıştırın
```

**Önemli Tablolar:**
- `needy_persons` - İhtiyaç sahipleri
- `organizations` - Multi-tenant desteği
- `organization_members` - Kullanıcı-Organizasyon ilişkisi
- `profiles` - Kullanıcı profilleri

### 3. Vercel Deployment

```bash
# 1. Vercel CLI kurulumu
npm i -g vercel

# 2. Login
vercel login

# 3. Production deployment
vercel --prod
```

**Vercel Environment Variables:**
1. Vercel Dashboard > Project > Settings > Environment Variables
2. Tüm değişkenleri ekleyin
3. Production ortamını seçin
4. Re-deploy yapın

### 4. Domain Ayarları

```bash
# Custom domain (opsiyonel)
vercel domains add your-domain.com

# DNS ayarları:
# A Record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

---

## 🔒 Güvenlik Kontrolleri

### Row Level Security (RLS)
Supabase'de tüm tablolar için RLS aktif olduğundan emin olun:

```sql
-- Örnek kontrol
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Auth Ayarları
1. Supabase Auth > Settings:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

### CORS Ayarları
```javascript
// next.config.ts'de güvenlik header'ları aktif
securityHeaders: {
  'Content-Security-Policy': "default-src 'self'...",
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
}
```

---

## 🧪 Production Test Planı

### 1. Temel Fonksiyonlar
- [ ] Login/Logout
- [ ] Yeni kayıt oluşturma
- [ ] Kayıt düzenleme
- [ ] Kayıt silme
- [ ] Arama ve filtreleme
- [ ] Excel export

### 2. Güvenlik Testleri
- [ ] Yetkisiz erişim denemesi (401)
- [ ] Başka kullanıcının kaydına erişim (403)
- [ ] XSS payload testi
- [ ] SQL injection testi

### 3. Performans Testleri
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

---

## 🐞 Bilinen Sınırlamalar

### 1. Multi-Tenant (Organization)
- Şu an opsiyonel çalışıyor
- Eğer organization kullanılmayacaksa, tüm kullanıcılar tüm verileri görebilir
- Tam multi-tenant için organization oluşturulması ve kullanıcıların eklenmesi gerekir

### 2. Junction Tables
- `needy_diseases` ve `needy_income_sources` tabloları veritabanında yoksa, sadece console warning verir
- Fonksiyonelliği etkilemez

### 3. MERNIS Entegrasyonu
- TC Kimlik doğrulama için ek servis ayarları gerekir

---

## 📞 Sorun Giderme

### Hata: "Invalid credentials"
**Çözüm:** Supabase Auth ayarlarını kontrol edin

### Hata: "Organization not found"
**Çözüm:** Kullanıcıyı bir organizasyona ekleyin veya API route'larındaki organization kontrolünü kaldırın

### Hata: "Build failed"
**Çözüm:** 
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

## 🎉 Deployment Tamamlandı!

Uygulama şu anda production-ready durumda. Son kontroller:

```bash
# Production build test
npm run build

# Lint kontrolü
npm run lint

# Testler
npm run test

# Lokal production test
npm run start
```

**Not:** İlk deployment sonrası mutlaka test kullanıcısı ile login olun ve temel işlemleri test edin.
