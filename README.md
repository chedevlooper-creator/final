# 🏠 Yardım Yönetim Paneli

> Sivil toplum kuruluşları için kapsamlı yardım ve bağış yönetim sistemi

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Proje Hakkında

Yardım Yönetim Paneli, sivil toplum kuruluşlarının yardım operasyonlarını dijital ortamda yönetmelerini sağlayan kapsamlı bir web uygulamasıdır. İhtiyaç sahiplerinin takibinden bağış yönetimine, gönüllü koordinasyonundan finansal raporlamaya kadar tüm süreçleri tek bir platformda birleştirir.

### 🎯 Hedef Kullanıcılar
- Yardım kuruluşları
- Sivil toplum organizasyonları
- Hayır kurumları
- Vakıflar ve dernekler

---

## 🚀 Temel Özellikler

| Modül | Açıklama |
|-------|----------|
| 👥 **İhtiyaç Sahipleri** | Kişi kayıt, durum takibi, aile bilgileri, gelir analizi |
| 💰 **Bağış Yönetimi** | Bağış kaydı, bağışçı takibi, kampanya yönetimi |
| 🤝 **Gönüllü Sistemi** | Gönüllü kayıt, beceri eşleştirme, görev atama |
| 👶 **Yetim Takibi** | Öğrenci bilgileri, eğitim durumu, sponsor eşleştirme |
| 📊 **Finans** | Gelir-gider takibi, bütçe yönetimi, finansal raporlar |
| 📅 **Takvim** | Etkinlik planlama, toplantı yönetimi, hatırlatmalar |
| 📝 **Başvurular** | Online başvuru formu, onay iş akışı, durum takibi |
| 📈 **Raporlama** | Detaylı istatistikler, Excel/PDF export, dashboard |
| 🔔 **Bildirimler** | Anlık bildirimler, email entegrasyonu |
| 🔐 **Güvenlik** | RBAC, audit log, MERNIS doğrulama |

---

## 🛠 Teknoloji Stack

### Frontend
```
Next.js 16.1.3      → App Router, Turbopack, Server Components
React 18            → Modern UI rendering
TypeScript 5        → Type-safe development
Tailwind CSS 3.4    → Utility-first styling
Radix UI            → Accessible component primitives
Framer Motion       → Smooth animations
```

### Backend & Database
```
Supabase            → PostgreSQL database, Auth, Storage
TanStack Query      → Data fetching & caching
Zustand             → Client state management
```

### DevOps & Monitoring
```
Sentry              → Error tracking & performance
PostHog             → Product analytics
Vercel              → Hosting & deployment
GitHub Actions      → CI/CD pipelines
```

---

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard modules
│   │   ├── account/       # User account
│   │   ├── aids/          # Aid management
│   │   ├── applications/  # Application tracking
│   │   ├── calendar/      # Event calendar
│   │   ├── donations/     # Donation management
│   │   ├── events/        # Event management
│   │   ├── finance/       # Financial module
│   │   ├── messages/      # Messaging system
│   │   ├── needy/         # Needy persons
│   │   ├── orphans/       # Orphan tracking
│   │   ├── purchase/      # Purchase management
│   │   ├── reports/       # Reporting
│   │   ├── settings/      # System settings
│   │   └── volunteers/    # Volunteer management
│   └── test/              # Test pages
│
├── components/             # React components
│   ├── charts/            # Chart components
│   ├── common/            # Shared components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   ├── navigation/        # Navigation components
│   ├── needy/             # Needy-specific components
│   ├── notification/      # Notification components
│   ├── performance/       # Performance monitoring
│   ├── ui/                # UI primitives (shadcn/ui)
│   └── upload/            # File upload components
│
├── hooks/                  # Custom React hooks
│   ├── queries/           # TanStack Query hooks (22 files)
│   ├── use-auth.ts        # Authentication hook
│   ├── use-notifications.ts
│   └── use-toast.ts
│
├── lib/                    # Utilities & services
│   ├── supabase/          # Supabase client configuration
│   ├── validations/       # Zod schemas
│   ├── analytics.ts       # PostHog analytics
│   ├── api-docs.ts        # OpenAPI specification
│   ├── audit.ts           # Audit logging
│   ├── bulk.ts            # Bulk operations
│   ├── email.ts           # Email templates
│   ├── errors.ts          # Error handling
│   ├── rbac.tsx           # Role-based access control
│   ├── security.ts        # Security utilities
│   └── upload.ts          # File upload utilities
│
├── stores/                 # Zustand stores
├── types/                  # TypeScript definitions
└── middleware.ts           # Next.js middleware

supabase/
└── migrations/            # Database migrations (16 files)
```

---

## 🏃 Hızlı Başlangıç

### Gereksinimler
- Node.js ≥ 25.0.0
- npm ≥ 10.0.0
- Supabase hesabı

### Kurulum

```bash
# 1. Repository'yi klonlayın
git clone https://github.com/your-org/yardim-yonetim-paneli.git
cd yardim-yonetim-paneli

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment variables oluşturun
cp .env.example .env.local

# 4. .env.local dosyasını düzenleyin
# Gerekli değişkenler için docs/SETUP.md'ye bakın

# 5. Development server'ı başlatın
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 📚 Dokümantasyon

| Doküman | Açıklama |
|---------|----------|
| [📐 Architecture](docs/ARCHITECTURE.md) | Sistem mimarisi ve tasarım kararları |
| [⚙️ Setup](docs/SETUP.md) | Detaylı kurulum rehberi |
| [🔌 API](docs/API.md) | API endpoint dokümantasyonu |
| [🗄️ Database](docs/DATABASE.md) | Veritabanı şeması ve migrations |
| [🔐 Security](docs/SECURITY.md) | Güvenlik yapısı ve RBAC sistemi |
| [✨ Features](docs/FEATURES.md) | Özellik detayları ve kullanım |
| [🤝 Contributing](docs/CONTRIBUTING.md) | Katkıda bulunma rehberi |

---

## 🔐 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Admin** | Tam erişim, kullanıcı yönetimi, sistem ayarları |
| **Moderator** | CRUD işlemleri, raporlama, başvuru onayı |
| **User** | Kayıt oluşturma ve düzenleme |
| **Viewer** | Sadece görüntüleme |

---

## 📊 Komutlar

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run test         # Unit tests
npm run test:ui      # Test UI
npm run test:coverage # Test coverage
npm run analyze      # Bundle analyzer
```

---

## 🔒 Security

### Security Features
- ✅ **Authentication**: Supabase Auth with JWT
- ✅ **Authorization**: Role-Based Access Control (RBAC)
- ✅ **Input Validation**: Zod schemas + custom sanitization
- ✅ **Rate Limiting**: API request throttling
- ✅ **XSS Protection**: Input sanitization, no dangerouslySetInnerHTML
- ✅ **SQL Injection Protection**: Parameterized queries via Supabase
- ✅ **CSRF Protection**: Next.js built-in protection
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- ✅ **Audit Logging**: All critical operations logged
- ✅ **Row Level Security**: Supabase RLS policies

### Security Documentation
- [Production Security Checklist](PRODUCTION_SECURITY_CHECKLIST.md)
- [Security Audit Report](SECURITY_AUDIT_REPORT.md)
- [Vercel Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)

### Reporting Security Issues
Please report security vulnerabilities to **security@yardimyonetim.com** (do not create public issues).

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen [Contributing Guide](docs/CONTRIBUTING.md) dokümanını inceleyin.

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

---

## 📞 İletişim

- **Email:** api@yardimyonetim.com
- **Website:** https://yardimyonetim.com
- **Issues:** [GitHub Issues](https://github.com/your-org/yardim-yonetim-paneli/issues)

---

<div align="center">
  <sub>Built with ❤️ for NGOs and charitable organizations</sub>
</div>
