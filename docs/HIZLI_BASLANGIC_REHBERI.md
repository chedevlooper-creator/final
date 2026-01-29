# 🚀 Hızlı Başlangıç Rehberi

> 5 dakikada sistemi çalıştırın ve ilk kaydınızı oluşturun

**Hedef Süre:** 5-10 dakika  
**Zorluk:** 🟢 Kolay

---

## ✅ Ön Gereksinimler

Sistemi çalıştırmadan önce şunların yüklü olduğundan emin olun:

| Gereksinim | Minimum Versiyon | Kontrol Komutu |
|------------|------------------|----------------|
| Node.js | 22.0.0 | `node -v` |
| npm | 10.0.0 | `npm -v` |
| Git | 2.x | `git --version` |

---

## 📥 Adım 1: Kurulum (2 dakika)

```bash
# 1. Repository'yi klonlayın
git clone https://github.com/chedevlooper-creator/final.git
cd final

# 2. Bağımlılıkları yükleyin
npm install

# 3. Environment dosyasını oluşturun
cp .env.example .env.local
```

---

## 🔑 Adım 2: Supabase Kurulumu (3 dakika)

### 2.1. Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje adı girin: `yardim-yonetim`
4. Database şifre belirleyin (güçlü olsun!)
5. Region seçin: `Europe (Frankfurt)` veya en yakın
6. "Create new project" butonuna tıklayın (1-2 dakika sürer)

### 2.2. API Keys'i Alın

Proje oluşturulduktan sonra:

1. Sol menüden **Settings** → **API** seçin
2. Şu bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key (uzun bir string)
   - **service_role** key (uzun bir string, GİZLİ!)

### 2.3. .env.local Dosyasını Düzenleyin

`.env.local` dosyasını açın ve şunları güncelleyin:

```env
# Supabase (Zorunlu)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Sentry (Opsiyonel - şimdilik boş bırakabilirsiniz)
NEXT_PUBLIC_SENTRY_DSN=

# MERNIS (Opsiyonel - TC Kimlik doğrulama için)
MERNIS_USERNAME=
MERNIS_PASSWORD=
```

**⚠️ Önemli:** `.env.local` dosyası Git'e commit edilmez (güvenlik)!

---

## 🗄️ Adım 3: Veritabanı Kurulumu (1 dakika)

### Linux/macOS:

```bash
chmod +x run-migrations.sh
./run-migrations.sh
```

### Windows:

```bash
run-migrations.bat
```

Bu script:
- ✅ Supabase bağlantısını test eder
- ✅ 16 migration dosyasını sırayla çalıştırır
- ✅ Tabloları, indexleri, RLS politikalarını oluşturur

**Beklenen çıktı:**
```
✓ Migration 1/16: Initial schema... Done
✓ Migration 2/16: Add profiles... Done
...
✓ Migration 16/16: Final indexes... Done
✅ All migrations completed successfully!
```

---

## 🚀 Adım 4: Development Server (30 saniye)

```bash
npm run dev
```

Uygulama başladıktan sonra:

```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
○ Network:      http://192.168.1.100:3000
```

Tarayıcınızda `http://localhost:3000` adresine gidin.

---

## 👤 Adım 5: İlk Kullanıcı Oluşturma (1 dakika)

### 5.1. Supabase Dashboard'dan

1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. Sol menüden **Authentication** → **Users** seçin
3. **Add User** → **Create new user** butonuna tıklayın
4. Formu doldurun:
   - **Email:** `admin@example.com`
   - **Password:** `Admin123!` (güçlü bir şifre)
   - **Auto Confirm User:** ✅ İşaretleyin
5. **Create User** butonuna tıklayın

### 5.2. Admin Rolü Atama

Kullanıcı oluşturulduktan sonra:

1. Oluşan kullanıcıya tıklayın
2. **Raw User Meta Data** bölümüne gidin
3. Şu JSON'u ekleyin:

```json
{
  "role": "admin",
  "full_name": "Sistem Yöneticisi"
}
```

4. **Save** butonuna tıklayın

---

## 🎉 Adım 6: Sisteme Giriş Yapın!

1. Tarayıcınızda `http://localhost:3000/login` adresine gidin
2. Email: `admin@example.com`
3. Şifre: `Admin123!` (veya belirlediğiniz şifre)
4. **Giriş Yap** butonuna tıklayın

Başarılı! Dashboard'a yönlendirileceksiniz. 🎊

---

## 📝 İlk Kayıtlarınızı Oluşturun

### İlk İhtiyaç Sahibi Kaydı

1. **Dashboard** → **İhtiyaç Sahipleri** → **Yeni Kayıt**
2. Formu doldurun:
   - **Ad:** Mehmet
   - **Soyad:** Yılmaz
   - **Doğum Tarihi:** 01/01/1985
   - **Telefon:** 5551234567
   - **Şehir:** İstanbul
   - **İlçe:** Fatih
   - **Kategori:** Aile
3. **Kaydet** butonuna tıklayın

### İlk Bağış Kaydı

1. **Dashboard** → **Bağışlar** → **Yeni Bağış**
2. Formu doldurun:
   - **Bağışçı Adı:** Ahmet Demir
   - **Tür:** Nakit
   - **Tutar:** 1000
   - **Yöntem:** Banka Havalesi
   - **Durum:** Tamamlandı
3. **Kaydet** butonuna tıklayın

### İlk Başvuru

1. **Dashboard** → **Başvurular** → **Yeni Başvuru**
2. Formu doldurun:
   - **İhtiyaç Sahibi:** Mehmet Yılmaz (az önce oluşturduğunuz)
   - **Başvuru Türü:** Gıda
   - **Öncelik:** Orta
   - **Açıklama:** Aylık gıda kolisi talebi
   - **Tahmini Tutar:** 500
3. **Kaydet** butonuna tıklayın

---

## 🎨 Bonus: İlk Verileri Ekleyin

### Şehir ve İlçe Verileri

1. **Dashboard** → **Ayarlar** → **Şehirler**
2. **Yeni Şehir** → `İstanbul` → **Kaydet**
3. **İlçeler** sekmesine geçin
4. **Yeni İlçe** → `Fatih` (İstanbul'u seçin) → **Kaydet**
5. Diğer ilçeleri ekleyin: Kadıköy, Beşiktaş, Üsküdar, vb.

### Kategoriler

1. **Dashboard** → **Ayarlar** → **Kategoriler**
2. Şu kategorileri ekleyin:
   - Aile
   - Yetim Ailesi
   - Mülteci
   - Suriyeli
   - Yaşlı
   - Engelli

### Partner'lar

1. **Dashboard** → **Ayarlar** → **Partner'lar**
2. İşbirliği yaptığınız kurumları ekleyin:
   - İHH
   - Kızılay
   - AFAD
   - Yerel belediye

---

## 🔍 Sorun Giderme

### Port çakışması

```bash
# Farklı bir port kullanın
npm run dev -- -p 3001
```

### TypeScript hataları

```bash
# Cache'i temizleyin
rm -rf .next
npm run dev
```

### Bağlantı hatası

1. `.env.local` dosyasındaki URL'lerin doğruluğunu kontrol edin
2. Supabase projesinin çalıştığından emin olun
3. İnternet bağlantınızı kontrol edin

### Migration hataları

```bash
# Supabase bağlantısını test edin
curl https://YOUR_PROJECT_URL.supabase.co

# Migration'ları tek tek çalıştırın
npx supabase migration up
```

---

## 📚 Sonraki Adımlar

Tebrikler! Sistem çalışıyor. Şimdi ne yapabilirsiniz?

### 1. Özellikleri Keşfedin

- [ ] Tüm modülleri gezin
- [ ] Rapor oluşturun
- [ ] Grafikleri inceleyin
- [ ] Filtreleme ve arama yapın

### 2. Dokümantasyonu Okuyun

- [ ] [NELER_YAPILABILIR.md](./NELER_YAPILABILIR.md) - Tüm özellikler
- [ ] [FEATURES.md](./FEATURES.md) - Detaylı kullanım kılavuzu
- [ ] [API.md](./API.md) - API dokümantasyonu
- [ ] [DATABASE.md](./DATABASE.md) - Veritabanı şeması

### 3. Sistemi Özelleştirin

- [ ] Logo ve renkleri değiştirin
- [ ] Email şablonlarını düzenleyin
- [ ] Bildirim tercihlerini ayarlayın
- [ ] Yeni roller ve izinler tanımlayın

### 4. Ekip Üyelerini Ekleyin

- [ ] Moderator hesapları oluşturun
- [ ] User hesapları oluşturun
- [ ] Viewer hesapları oluşturun
- [ ] Her role uygun izinler verin

### 5. Production'a Hazırlık

- [ ] [DEPLOYMENT.md](./DEPLOYMENT.md) dokümanını okuyun
- [ ] Vercel'de proje oluşturun
- [ ] Environment variables'ı ayarlayın
- [ ] İlk deployment'ı yapın

---

## 🆘 Yardım ve Destek

### Dokümantasyon

| Doküman | Açıklama |
|---------|----------|
| [NELER_YAPILABILIR.md](./NELER_YAPILABILIR.md) | Kapsamlı özellik rehberi |
| [FEATURES.md](./FEATURES.md) | Detaylı kullanım senaryoları |
| [SETUP.md](./SETUP.md) | Teknik kurulum detayları |
| [API.md](./API.md) | API endpoint'leri |
| [DATABASE.md](./DATABASE.md) | Veritabanı yapısı |
| [SECURITY.md](./SECURITY.md) | Güvenlik politikaları |

### İletişim

- 📧 Email: api@yardimyonetim.com
- 🐛 Issues: [GitHub Issues](https://github.com/chedevlooper-creator/final/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/chedevlooper-creator/final/wiki)

---

## ✅ Checklist

Kurulum tamamlandı mı? Kontrol edin:

- [ ] Node.js >= 22.0.0 yüklü
- [ ] npm >= 10.0.0 yüklü
- [ ] Repository klonlandı
- [ ] `npm install` başarılı
- [ ] `.env.local` oluşturuldu ve dolduruldu
- [ ] Supabase projesi oluşturuldu
- [ ] Migration'lar çalıştırıldı
- [ ] İlk admin kullanıcı oluşturuldu
- [ ] `npm run dev` çalışıyor
- [ ] `http://localhost:3000` erişilebilir
- [ ] Giriş yapılabiliyor
- [ ] Dashboard görünüyor

Hepsi tamamsa: **🎉 Başarılı! Sistem hazır!**

---

<div align="center">
  <sub>Built with ❤️ for NGOs and charitable organizations</sub>
  <br>
  <sub>Son Güncelleme: 28 Ocak 2026</sub>
</div>
