# ✨ Özellikler ve Kullanım Rehberi

> Yardım Yönetim Paneli modülleri ve kullanım senaryoları

---

## 📋 Genel Bakış

Yardım Yönetim Paneli, sivil toplum kuruluşlarının tüm operasyonlarını tek platformda yönetmelerini sağlar.

---

## 🏠 Dashboard

### Ana Sayfa

Merkezi kontrol paneli, tüm kritik metrikleri tek bakışta gösterir.

**Kartlar:**
- 📊 Toplam ihtiyaç sahibi sayısı
- 💰 Bu aydaki bağış toplamı
- 📝 Bekleyen başvuru sayısı
- 🤝 Aktif gönüllü sayısı

**Grafikler:**
- Aylık bağış trendi
- Yardım dağılımı (kategori bazlı)
- Başvuru durumu dağılımı

**Son Aktiviteler:**
- Son eklenen kayıtlar
- Son onaylanan başvurular
- Yaklaşan etkinlikler

---

## 👥 İhtiyaç Sahipleri Modülü

### Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Kayıt Yönetimi** | Kapsamlı kişi kaydı (kimlik, adres, gelir) |
| **Aile Bilgileri** | Aile üyeleri ve bağımlı sayısı |
| **Gelir Analizi** | Aylık gelir, kira, borç takibi |
| **Durum Takibi** | Aktif, pasif, beklemede durumları |
| **MERNIS Doğrulama** | TC Kimlik numarası doğrulama |
| **Etiketleme** | Özel etiketlerle kategorize etme |
| **Dosya Yönetimi** | Belge ve fotoğraf yükleme |

### İş Akışı

```
1. Kayıt Oluşturma
   ↓
2. MERNIS Doğrulama (opsiyonel)
   ↓
3. Belge Yükleme
   ↓
4. Aktif Duruma Alma
   ↓
5. Yardım Başvurusu Bağlama
```

### Filtreleme Seçenekleri

- İlçe/Mahalle bazlı
- Kategori (Mülteci, Suriyeli, Yetim Ailesi, vb.)
- Durum (Aktif/Pasif/Beklemede)
- Gelir aralığı
- Aile büyüklüğü

---

## 💰 Bağış Yönetimi

### Bağış Türleri

| Tür | Açıklama |
|-----|----------|
| `cash` | Nakit bağış |
| `in_kind` | Ayni bağış (gıda, giyim) |
| `sacrifice` | Kurban bağışı |
| `zakat` | Zekat |
| `fitre` | Fitre |
| `sadaka` | Sadaka |

### Ödeme Yöntemleri

- 💵 Nakit
- 🏦 Banka havalesi
- 💳 Kredi kartı
- 🌐 Online ödeme

### Bağış Kaydı Örneği

```
Bağışçı: Ahmet Yılmaz
Tür: Nakit (cash)
Tutar: 5,000 TRY
Yöntem: Banka Havalesi
Durum: Tamamlandı
Not: Ramazan ayı bağışı
```

### Raporlama

- Günlük/haftalık/aylık bağış raporu
- Bağış türü dağılımı
- Bağışçı istatistikleri
- Excel/PDF export

---

## 📝 Başvuru Yönetimi

### Başvuru Türleri

| Tür | Açıklama |
|-----|----------|
| `food` | Gıda yardımı |
| `health` | Sağlık desteği |
| `education` | Eğitim yardımı |
| `shelter` | Barınma/Kira |
| `clothing` | Giyim yardımı |
| `fuel` | Yakacak yardımı |
| `household` | Ev eşyası |
| `cash` | Nakdi yardım |

### Durum Akışı

```
new (Yeni)
  ↓
in_review (İncelemede)
  ↓
approved (Onaylandı) ──→ rejected (Reddedildi)
  ↓
pending_delivery (Teslim Bekliyor)
  ↓
delivered (Teslim Edildi)
  ↓
completed (Tamamlandı)
```

### Öncelik Seviyeleri

| Seviye | Açıklama | Renk |
|--------|----------|------|
| `urgent` | Acil | 🔴 Kırmızı |
| `high` | Yüksek | 🟠 Turuncu |
| `medium` | Orta | 🟡 Sarı |
| `low` | Düşük | 🟢 Yeşil |

---

## 🤝 Gönüllü Yönetimi

### Özellikler

- Gönüllü kaydı ve profil yönetimi
- Beceri ve yetenek eşleştirme
- Görev atama ve takip
- Çalışma saati kaydı
- Performans değerlendirme

### Beceri Kategorileri

- 🚗 Araç kullanma
- 🩺 Sağlık (doktor, hemşire)
- 📚 Eğitim (öğretmen)
- 💻 Teknoloji
- 🗣️ Tercümanlık
- 🍳 Yemek hazırlama

### Görev Atama

```
1. Etkinlik/Görev oluştur
2. Gerekli beceriler belirle
3. Uygun gönüllüleri listele
4. Görev ata
5. Onay bekle
6. Takip et
```

---

## 👶 Yetim/Öğrenci Takibi

### Kayıt Türleri

| Tür | Açıklama |
|-----|----------|
| `ihh_orphan` | İHH yetimi |
| `orphan` | Diğer yetim |
| `family` | Aile sponsorluğu |
| `education_scholarship` | Eğitim bursu |

### Sponsorluk Durumları

```
preparing (Hazırlanıyor)
  ↓
assigned (Sponsor Atandı)
  ↓
active (Aktif)
  ↓
paused (Duraklatıldı) veya completed (Tamamlandı)
```

### Takip Edilen Bilgiler

- 📸 Fotoğraf
- 📚 Eğitim durumu (okul, sınıf)
- 👨‍👩‍👧 Veli bilgileri
- 💳 Sponsor bilgileri
- 📋 Periyodik raporlar

---

## 📊 Finans Modülü

### Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Gelir-Gider** | Tüm finansal hareketlerin kaydı |
| **Bütçe Yönetimi** | Departman/proje bazlı bütçeleme |
| **Banka Hesapları** | Çoklu banka hesabı takibi |
| **Raporlama** | Detaylı finansal raporlar |

### Gelir Kategorileri

- Bağışlar
- Sponsorluk ödemeleri
- Proje gelirleri
- Faiz gelirleri

### Gider Kategorileri

- Yardım ödemeleri
- Personel giderleri
- Kira ve utilities
- Operasyonel giderler

### Finans Dashboard

```
┌─────────────────────────────────────────┐
│  Toplam Gelir      │  Toplam Gider      │
│  ₺150,000          │  ₺120,000          │
├─────────────────────────────────────────┤
│  Net Bakiye: ₺30,000                    │
├─────────────────────────────────────────┤
│  Bu Ay Gelir: ₺25,000                   │
│  Bu Ay Gider: ₺18,000                   │
└─────────────────────────────────────────┘
```

---

## 📅 Takvim ve Etkinlikler

### Etkinlik Türleri

- 📋 Toplantılar
- 🎉 Organizasyonlar
- 🚚 Yardım dağıtımları
- 📚 Eğitimler
- 🏃 Kampanyalar

### Toplantı Yönetimi

- Toplantı oluşturma
- Katılımcı ekleme
- Gündem belirleme
- Karar takibi
- Toplantı tutanağı

### Hatırlatmalar

- Email bildirimi
- In-app bildirim
- Yaklaşan etkinlik uyarıları

---

## 📈 Raporlama

### Standart Raporlar

| Rapor | Açıklama |
|-------|----------|
| **İhtiyaç Sahibi Raporu** | Kategori, bölge bazlı dağılım |
| **Bağış Raporu** | Dönemsel bağış analizi |
| **Yardım Raporu** | Yapılan yardımların özeti |
| **Finansal Rapor** | Gelir-gider detayı |

### Export Formatları

- 📊 Excel (.xlsx)
- 📄 PDF
- 📋 CSV

### Örnek Rapor Çıktısı

```
═══════════════════════════════════════════
        AYLIK YARDIM RAPORU - Ocak 2024
═══════════════════════════════════════════

Toplam Yardım:        152 adet
Gıda Yardımı:          45 adet (29.6%)
Nakdi Yardım:          38 adet (25.0%)
Yakacak Yardımı:       25 adet (16.4%)
Eğitim Yardımı:        20 adet (13.2%)
Diğer:                 24 adet (15.8%)

Toplam Tutar: ₺125,000

Bölge Dağılımı:
- Merkez: 48 adet
- Güney: 35 adet
- Kuzey: 32 adet
- Batı: 37 adet

═══════════════════════════════════════════
```

---

## 🔔 Bildirim Sistemi

### Bildirim Türleri

- ✅ Başvuru onay/red
- 📝 Yeni kayıt ekleme
- 💰 Bağış alındı
- 📅 Yaklaşan etkinlik
- ⚠️ Sistem uyarıları

### Bildirim Kanalları

- 🔔 In-app bildirimler
- 📧 Email bildirimleri
- 📱 Push notifications (gelecek)

---

## ⚙️ Sistem Ayarları

### Kullanıcı Yönetimi

- Yeni kullanıcı oluşturma
- Rol atama
- Parola sıfırlama
- Hesap deaktive etme

### Lookup Tabloları

- Şehir/ilçe/mahalle
- Kategoriler
- Partner'lar
- Okullar

### Sistem Ayarları

- Email yapılandırması
- Bildirim tercihleri
- Güvenlik ayarları
- API anahtarları

---

## 🎨 Kullanıcı Arayüzü

### Tema Desteği

- 🌞 Light mode
- 🌙 Dark mode
- 💻 System preference

### Responsive Design

- Desktop optimized
- Tablet uyumlu
- Mobil görünüm

### Erişilebilirlik

- Keyboard navigation
- Screen reader uyumlu
- High contrast support

---

## 🔗 İlgili Dokümanlar

- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Security](./SECURITY.md)
