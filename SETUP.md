# 🚀 Kurulum Talimatları

Bu proje için geliştirilmiş yeni özelliklerin kurulum rehberi.

## ✅ Eklenen Özellikler

1. ✅ **Test Infrastructure (Vitest)**
2. ✅ **Error Tracking (Sentry)**
3. ✅ **API Documentation (OpenAPI/Swagger)**
4. ✅ **Performance Monitoring**
5. ✅ **Excel Export**
6. ✅ **CI/CD Pipeline (GitHub Actions)**

---

## 📦 Gerekli Paketlerin Kurulumu

```bash
# 1. Test paketleri
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom @vitest/ui

# 2. Error tracking
npm install @sentry/nextjs

# 3. Excel export
npm install xlsx

# Kurulum tamamlandıktan sonra test çalıştırın
npm run test
```

---

## 1️⃣ Test Infrastructure

### Dosyalar
- `vitest.config.ts` - Vitest konfigürasyonu
- `vitest.setup.ts` - Test setup (jest-dom matchers)
- `src/__tests__/lib/search.test.ts` - Search sistemi testleri
- `src/__tests__/components/utils.test.ts` - Utility fonksiyon testleri

### Kullanım
```bash
# Testleri çalıştır
npm run test

# Test UI (görsel arayüz)
npm run test:ui

# Coverage raporu
npm run test:coverage
```

---

## 2️⃣ Sentry (Error Tracking)

### Dosyalar
- `sentry.client.config.ts` - Client-side Sentry konfigürasyonu
- `sentry.server.config.ts` - Server-side Sentry konfigürasyonu

### Kurulum
```bash
# Sentry wizard ile otomatik kurulum
npx @sentry/wizard -i nextjs
```

### Environment Variables
```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### Özellikler
- ✅ Otomatik error tracking
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Sensitive data filtering
- ✅ Türkçe karakter desteği

---

## 3️⃣ API Documentation

### Dosyalar
- `src/lib/api-docs.ts` - OpenAPI specification
- `src/app/api/docs/route.ts` - API dokümantasyon endpoint

### Kullanım
```bash
# Dokümantasyonu görüntüle
curl http://localhost:3000/api/docs
```

### Swagger UI Entegrasyonu (Opsiyonel)
```bash
npm install swagger-ui-react
```

```typescript
// src/app/api/docs/ui/page.tsx
'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  return (
    <SwaggerUI url="/api/docs" />
  )
}
```

---

## 4️⃣ Performance Monitoring

### Dosyalar
- `src/lib/performance.ts` - Performance monitoring sistemi

### Kullanım
```typescript
// app/layout.tsx
import { measureWebVitals } from '@/lib/performance'

export default function RootLayout({ children }) {
  useEffect(() => {
    measureWebVitals()
  }, [])
  
  return <html>{children}</html>
}
```

### Metrics
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)

---

## 5️⃣ Excel Export

### Dosyalar
- `src/lib/export/excel.ts` - Excel export kütüphanesi

### Kullanım
```typescript
import { exportNeedyPersonsToExcel } from '@/lib/export/excel'

// İhtiyaç sahiplerini export et
exportNeedyPersonsToExcel(needyPersonsData)

// Bağışları export et
import { exportDonationsToExcel } from '@/lib/export/excel'
exportDonationsToExcel(donationsData)

// Custom export
import { exportToExcel } from '@/lib/export/excel'
exportToExcel(data, {
  filename: 'custom-export',
  sheetName: 'Data',
  author: 'Yardım Yönetim Paneli'
})
```

---

## 6️⃣ CI/CD Pipeline

### Dosyalar
- `.github/workflows/ci.yml` - GitHub Actions workflow

### GitHub Secrets (Ayarlanması Gerekenler)
GitHub repository → Settings → Secrets and variables → Actions

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Sentry
NEXT_PUBLIC_SENTRY_DSN

# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Snyk (Opsiyonel)
SNYK_TOKEN

# Deployment
DEPLOY_URL
```

### Pipeline Jobs
1. **Lint** - ESLint ve TypeScript kontrolü
2. **Test** - Test suite çalıştırma
3. **Build** - Next.js build
4. **Deploy** - Production'a deploy (main branch)
5. **Security** - Güvenlik audit

---

## 🔄 Sonraki Adımlar

### 1. Paketleri Yükleyin
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom @vitest/ui
npm install @sentry/nextjs
npm install xlsx
```

### 2. Testleri Çalıştırın
```bash
npm run test
```

### 3. Sentry'yi Kurun (Opsiyonel)
```bash
npx @sentry/wizard -i nextjs
```

### 4. GitHub Repository'yi Ayarlayın
- GitHub'da yeni repository oluşturun
- GitHub secrets'ları ekleyin
- Kodu push edin:
```bash
git add .
git commit -m "feat: Add test infrastructure, monitoring, and CI/CD"
git push origin main
```

### 5. İlk Deployment'ı İzleyin
GitHub Actions sekmesinden pipeline'ı izleyin.

---

## 📊 Dashboard Özellikleri

### Performance Dashboard'a Ekleme
```typescript
// src/app/dashboard/page.tsx
import { getPerformanceSummary } from '@/lib/performance'

export default function DashboardPage() {
  const perf = getPerformanceSummary()
  
  return (
    <div>
      <h2>Performance Metrics</h2>
      <p>Load Time: {perf.timing.loadComplete}ms</p>
      <p>DOM Content Loaded: {perf.timing.domContentLoaded}ms</p>
    </div>
  )
}
```

### Excel Export Button
```typescript
// components/export-button.tsx
import { exportNeedyPersonsToExcel } from '@/lib/export/excel'

export function ExportButton({ data }) {
  return (
    <Button onClick={() => exportNeedyPersonsToExcel(data)}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Excel'e Export Et
    </Button>
  )
}
```

---

## 🐛 Troubleshooting

### Testler Çalışmıyor
```bash
# Clear cache ve reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run test
```

### Sentry Hataları
- `.env.local` dosyasını kontrol edin
- `NEXT_PUBLIC_SENTRY_DSN`'i doğru girdiğinizden emin olun

### GitHub Actions Hataları
- Secrets'ların doğru ayarlandığını kontrol edin
- Repository settings'den Actions permissions'ı kontrol edin

---

## 📚 Ek Kaynaklar

- [Vitest Documentation](https://vitest.dev/)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Web Vitals](https://web.dev/vitals/)
- [SheetJS (xlsx)](https://docs.sheetjs.com/)

---

## ✨ Başarılı Kurulum!

Kurulum tamamlandı! Artık projenizde:
- ✅ Testler çalışıyor
- ✅ Error tracking aktif
- ✅ Performance monitoring aktif
- ✅ Excel export hazır
- ✅ CI/CD pipeline hazır

**İyi kodlamalar!** 🚀
