# 🤖 GitHub Actions Workflows

Bu repo'da otomatik kod kalitesi ve güvenlik kontrolü için 6 farklı workflow bulunur. 

## 🚀 Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Ne zaman çalışır:**
- Her push
- Her pull request
- Manuel tetikleme

**Ne yapar:**
- ✅ ESLint kontrolü
- ✅ TypeScript type check
- ✅ Build testi
- ✅ Security audit
- ✅ Test suite

**Kullanım:**
```bash
# Manuel çalıştırma
gh workflow run ci.yml
```

---

### 2. Auto-Fix Bot (`auto-fix.yml`)

**Ne zaman çalışır:**
- PR açıldığında
- PR güncellendiğinde

**Ne yapar:**
- 🔧 ESLint --fix
- 🔧 Prettier formatting
- 🔧 Unused imports temizleme
- 🔧 Otomatik commit

**Not:** Sadece kendi repo PR'larında çalışır (fork PR'larda güvenlik sebebiyle çalışmaz).

---

### 3. Security Scanner (`security.yml`)

**Ne zaman çalışır:**
- Günlük (saat 02:00)
- Her PR
- Manuel tetikleme

**Ne yapar:**
- 🔒 Hardcoded secrets taraması
- 🔒 RBAC kontrolleri
- 🔒 XSS riski kontrolü
- 🔒 SQL injection kontrolü
- 🔒 Dependency audit

**Kritik hatada:** Otomatik issue açar

---

### 4. Type Safety Checker (`type-check.yml`)

**Ne zaman çalışır:**
- Her PR
- Haftalık (Pazartesi 09:00)

**Ne yapar:**
- 🎯 `any` tipi sayısı
- 🎯 `@ts-ignore` sayısı
- 🎯 Unsafe assertion sayısı
- 🎯 Dosya bazında rapor

**Hedef:** Strict mode (0 any, 0 ignore)

---

### 5. Dependency Update (`dependency-update.yml`)

**Ne zaman çalışır:**
- Haftalık (Pazartesi 09:00)
- Manuel tetikleme

**Ne yapar:**
- 📦 Outdated packages kontrolü
- 📦 Security patch'ler
- 📦 Minor version updates
- 📦 Otomatik PR açma

---

### 6. Code Quality (`code-quality.yml`)

**Ne zaman çalışır:**
- Her PR
- Main branch push
- Manuel tetikleme

**Ne yapar:**
- 📊 Bundle size analizi
- 📊 Unused code detection
- 📊 Duplicate code finder

---

## 🔧 Kurulum

### 1. Workflow Dosyalarını Ekleyin

```bash
mkdir -p .github/workflows
# Dosyalar zaten .github/workflows/ klasöründe
```

### 2. Labels Oluşturun

```bash
gh label create "auto-fixed" --color "0E8A16" --description "Automatically fixed by bot"
gh label create "dependencies" --color "0366D6" --description "Dependency updates"
gh label create "security" --color "D73A4A" --description "Security related"
gh label create "automated" --color "FBCA04" --description "Automated PR"
```

Veya Windows için PowerShell scripti:

```powershell
.\setup-labels.ps1
```

### 3. Branch Protection Kuralları (Önerilen)

```
Settings > Branches > Add rule

Branch name pattern: main

☑️ Require status checks to pass before merging
  - lint
  - type-check
  - build
  - security
  
☑️ Require branches to be up to date before merging
```

---

## 📊 PR'da Ne Görürsünüz

Her PR'da şu kontroller otomatik çalışır:

```
✅ CI/CD Pipeline
  ✅ Lint
  ✅ Type Check
  ✅ Build
  ✅ Security
  ✅ Tests

🤖 Auto-Fix Bot
  ✅ Code formatted
  ✅ Imports cleaned

🔒 Security Scanner
  ✅ No secrets found
  ✅ RBAC checks OK
  ✅ No XSS risks

🎯 Type Safety
  ⚠️  5 'any' types found
```

---

## 🚨 Hata Durumunda

### Build Başarısız

```bash
# Local'de test edin
npm run build

# Hatayı düzeltin
# Push edin, workflow otomatik tekrar çalışır
```

### Security Issue

```bash
# Güvenlik raporunu inceleyin
gh run view <run-id>

# Kritik hatalar için issue açılır
# İssue'yu çözün, PR'a ekleyin
```

### Type Errors

```bash
# TypeScript hatalarını görmek için
npx tsc --noEmit

# any tiplerini görmek için
grep -r ": any" src/
```

---

## 💡 Best Practices

### ✅ Do

- PR açmadan önce `npm run lint` çalıştırın
- Commit mesajlarında conventional commits kullanın
- Breaking change'lerde BREAKING CHANGE: ekleyin
- Security issue'larını hemen düzeltin

### ❌ Don't

- Workflow'ları disable etmeyin
- Security check'leri ignore etmeyin
- Auto-fix'i manuel revert etmeyin
- @ts-ignore aşırı kullanmayın

---

## 🔍 Debug

### Workflow Loglarını Görme

```bash
# Son çalışmayı görüntüle
gh run list --workflow=ci.yml

# Detaylı log
gh run view <run-id> --log
```

### Local'de Test

```bash
# CI'ın yaptığını local'de test edin
npm ci                    # Clean install
npm run lint             # Lint
npx tsc --noEmit         # Type check
npm run build            # Build
npm test                 # Tests
```

---

## 📞 Destek

Workflow'larla ilgili sorun yaşarsanız:

1. GitHub Actions sekmesinde hata loglarını kontrol edin
2. Issue açın: `bug` label'ı ile
3. Workflow dosyasını ve hata mesajını ekleyin

---

## 📖 İlgili Dokümantasyon

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint](https://eslint.org/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Son Güncelleme:** 2026-01-21
