# 🤝 Katkıda Bulunma Rehberi

> Yardım Yönetim Paneli projesine nasıl katkıda bulunabilirsiniz

---

## 📋 Genel Bakış

Projeye katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, katkı sürecini kolaylaştırmak için hazırlanmıştır.

---

## 🚀 Başlangıç

### 1. Repository'yi Fork Edin

```bash
# GitHub'da fork butonuna tıklayın
# Sonra fork'unuzu klonlayın
git clone https://github.com/YOUR_USERNAME/yardim-yonetim-paneli.git
cd yardim-yonetim-paneli
```

### 2. Upstream Remote Ekleyin

```bash
git remote add upstream https://github.com/original-org/yardim-yonetim-paneli.git
```

### 3. Bağımlılıkları Yükleyin

```bash
npm install
```

### 4. Development Ortamını Kurun

```bash
cp .env.example .env.local
# .env.local dosyasını düzenleyin
npm run dev
```

---

## 📝 Katkı Türleri

### 🐛 Bug Report

Bug bulduğunuzda:

1. [Issues](https://github.com/your-org/yardim-yonetim-paneli/issues) sayfasını kontrol edin
2. Daha önce raporlanmamışsa yeni issue açın
3. Bug report template'ini kullanın

**İyi bir bug report içerir:**
- Açık başlık
- Yeniden üretme adımları
- Beklenen davranış
- Gerçekleşen davranış
- Ekran görüntüsü/video (varsa)
- Ortam bilgisi (OS, browser, Node version)

### ✨ Feature Request

Yeni özellik önerisi için:

1. Feature request template'i kullanın
2. Problemi ve çözüm önerisini açıklayın
3. Alternatif çözümleri düşünün

### 📖 Documentation

Dokümantasyon katkıları için:

1. `docs/` klasöründeki dosyaları düzenleyin
2. README.md güncellemeleri
3. Code comment'leri

### 💻 Code Contribution

Kod katkısı için aşağıdaki süreci takip edin.

---

## 🔄 Git Workflow

### Branch Naming

```
feature/feature-name     # Yeni özellik
bugfix/bug-description   # Bug düzeltmesi
hotfix/critical-fix      # Acil düzeltme
docs/documentation-update # Dokümantasyon
refactor/refactor-desc   # Refactoring
```

### Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/) standardını kullanıyoruz.

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
| Type | Açıklama |
|------|----------|
| `feat` | Yeni özellik |
| `fix` | Bug düzeltmesi |
| `docs` | Dokümantasyon |
| `style` | Formatting, missing semicolons |
| `refactor` | Kod refactoring |
| `test` | Test ekleme/düzeltme |
| `chore` | Build, config değişiklikleri |
| `perf` | Performance improvement |

**Örnekler:**
```bash
git commit -m "feat(needy): add bulk import feature"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs: update API documentation"
git commit -m "refactor(hooks): simplify useNeedy hook"
```

### Pull Request Süreci

1. **Branch Oluşturun**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/my-feature
   ```

2. **Değişiklikleri Yapın**
   ```bash
   # Kod yazın, test edin
   npm run lint
   npm run test
   ```

3. **Commit Edin**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

4. **Push Edin**
   ```bash
   git push origin feature/my-feature
   ```

5. **Pull Request Açın**
   - GitHub'da PR oluşturun
   - Template'i doldurun
   - Reviewer atayın

---

## 📏 Code Style

### TypeScript

```typescript
// ✅ İyi
interface UserProps {
  name: string
  age: number
  email?: string
}

function getUser(id: string): Promise<User> {
  return supabase.from('users').select('*').eq('id', id).single()
}

// ❌ Kötü
function getUser(id) {
  return supabase.from('users').select('*').eq('id', id).single()
}
```

### React Components

```tsx
// ✅ İyi - Function component with types
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ❌ Kötü - No types, inline styles
export function Button(props) {
  return (
    <button style={{ color: 'red' }} onClick={props.onClick}>
      {props.children}
    </button>
  )
}
```

### File Naming

```
# Components
MyComponent.tsx          # ❌
my-component.tsx         # ✅
my-component/
  index.tsx             # ✅
  my-component.types.ts # ✅

# Hooks
useMyHook.ts            # ❌ (camelCase)
use-my-hook.ts          # ✅ (kebab-case)

# Utils
myUtils.ts              # ❌
my-utils.ts             # ✅
```

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports (@/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 3. Relative imports
import { MyComponent } from './my-component'
import type { MyType } from './types'
```

---

## 🧪 Testing

### Test Yazma

```typescript
// src/__tests__/my-component.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click event', async () => {
    const onClick = vi.fn()
    render(<MyComponent onClick={onClick} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Test Komutları

```bash
npm run test           # Tüm testler
npm run test:ui        # Test UI
npm run test:coverage  # Coverage raporu
```

---

## 📋 PR Checklist

Pull request açmadan önce:

- [ ] Kod `npm run lint` geçiyor
- [ ] Testler `npm run test` geçiyor
- [ ] TypeScript hataları yok (`npx tsc --noEmit`)
- [ ] Commit mesajları conventional commits formatında
- [ ] Gerekli dokümantasyon güncellendi
- [ ] Breaking change varsa belirtildi

---

## 🔍 Code Review

### Review Yapanlar İçin

- Kod kalitesi ve okunabilirlik
- Test coverage
- Performance etkileri
- Güvenlik açıkları
- Breaking changes

### Review Alanlar İçin

- Yapıcı feedback'e açık olun
- Değişiklikleri açıklayın
- Gerekirse tartışın, ama saygılı olun

---

## 📦 Release Süreci

### Versioning

[Semantic Versioning](https://semver.org/) kullanıyoruz:

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  # Patch: bug fix
1.0.0 → 1.1.0  # Minor: new feature (backward compatible)
1.0.0 → 2.0.0  # Major: breaking change
```

### Changelog

Her release için `CHANGELOG.md` güncellenir:

```markdown
## [1.2.0] - 2024-01-20

### Added
- Bulk import feature for needy persons
- Dark mode support

### Fixed
- Login redirect issue
- Mobile navigation bug

### Changed
- Improved dashboard performance
```

---

## 🏗️ Project Structure

Yeni dosya eklerken bu yapıyı takip edin:

```
src/
├── app/                    # Pages (Next.js App Router)
│   └── dashboard/
│       └── new-feature/
│           ├── page.tsx
│           └── loading.tsx
│
├── components/             # React components
│   └── new-feature/
│       ├── index.tsx
│       ├── new-feature-list.tsx
│       └── new-feature-card.tsx
│
├── hooks/
│   └── queries/
│       └── use-new-feature.ts
│
├── lib/
│   └── validations/
│       └── new-feature.ts
│
└── types/
    └── new-feature.ts
```

---

## 💬 İletişim

- **GitHub Issues** - Bug report, feature request
- **GitHub Discussions** - Sorular, fikirler
- **Email** - api@yardimyonetim.com

---

## 📜 Code of Conduct

### Beklentilerimiz

- Saygılı ve kapsayıcı iletişim
- Yapıcı eleştiri
- Farklı görüşlere açıklık
- Topluluk odaklı düşünme

### Kabul Edilemez Davranışlar

- Hakaret veya aşağılama
- Trolleme veya spam
- Kişisel saldırılar
- Harassment

---

## 📄 Lisans

Bu projeye katkıda bulunarak, katkılarınızın [MIT License](../LICENSE) altında lisanslanacağını kabul etmiş olursunuz.

---

<div align="center">
  <sub>Katkılarınız için teşekkür ederiz! ❤️</sub>
</div>
