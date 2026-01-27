# PRD — Yardım Yönetim Paneli

## Özet
Yardım Yönetim Paneli; sivil toplum kuruluşlarının ihtiyaç sahipleri, bağışlar, gönüllüler, başvurular ve finans süreçlerini tek platformda yönetmesini sağlayan web uygulamasıdır. Proje, operasyonel verimlilik, veri doğruluğu ve şeffaflık hedefleriyle tasarlanmıştır.

## Amaçlar
- İhtiyaç sahibi, bağış ve başvuru süreçlerini tek panelde yönetmek.
- Veri girişini hızlandırmak ve hataları azaltmak.
- Süreç görünürlüğünü artırmak (raporlama, durum takibi, audit log).
- Güvenli ve rol bazlı erişim sağlamak.

## Başarı Kriterleri
- Kritik iş akışlarının tamamında başarılı işlem oranı ≥ %95.
- En az 5 temel modülde (İhtiyaç, Bağış, Başvuru, Finans, Gönüllü) aktif kullanım.
- Aylık rapor üretim süresinin önceki yönteme göre ≥ %50 azalması.

## Hedef Kullanıcılar
- STK yöneticileri
- Saha ekipleri
- Operasyon ve finans ekipleri
- Gönüllü koordinatörleri

## Kapsam (MVP)
- İhtiyaç sahipleri kayıt ve MERNIS doğrulama
- Başvuru oluşturma ve durum takibi
- Bağış kaydı ve bağışçı takibi
- Finans gelir-gider takibi
- Gönüllü kayıt ve görev eşleştirme
- Raporlama (Excel/PDF dışa aktarma)
- RBAC ve audit log

## Kapsam Dışı
- Mobil uygulama (PWA sonrası)
- OCR ile belge tarama
- AI destekli eşleştirme ve analiz

## Kullanıcı Hikayeleri
- Operatör olarak ihtiyaç sahibini hızlıca kayıt etmek istiyorum.
- Yönetici olarak başvuruları durumlarına göre filtrelemek istiyorum.
- Finans kullanıcısı olarak dönemsel bağış raporu almak istiyorum.
- Gönüllü koordinatörü olarak görevleri uygun beceriye göre atamak istiyorum.

## Fonksiyonel Gereksinimler
- İhtiyaç sahibi CRUD, kimlik doğrulama, dosya yükleme
- Bağış CRUD, bağışçı bilgileri, ödeme yöntemi, makbuz
- Başvuru CRUD, durum akışı ve öncelik
- Finans kayıtları, bütçe ve raporlama
- Gönüllü kayıt, beceri ve görev yönetimi
- Bildirim gönderimi (email/sms)
- Rol bazlı erişim ve audit log

## Fonksiyonel Olmayan Gereksinimler
- Uygulama yanıt süresi: kritik ekranlarda < 2 sn
- Güvenlik: RLS, RBAC, kayıt denetimi
- Erişilebilirlik: form ve tablo etkileşimlerinde klavye desteği
- Ölçeklenebilirlik: en az 500 eşzamanlı kullanıcı

## Entegrasyonlar
- Supabase (DB, Auth, Storage)
- Sentry (hata takibi)
- PostHog (analitik)

## Analitik ve Ölçüm
- Kayıt oluşturma süresi
- Başvuru çevrim süresi
- Bağış kayıt sayısı ve tutarı
- Gönüllü görevlendirme oranı

## Riskler ve Varsayımlar
- MERNIS entegrasyonu gecikmeleri
- Veri kalitesi (manuel giriş)
- Kullanıcıların yeni iş akışlarına adaptasyonu

## Yol Haritası (Özet)
- Faz 1: Temel modüller ve altyapı (tamamlandı)
- Faz 2: Gelişmiş raporlama, PWA, bildirim merkezi (devam ediyor)
- Faz 3: AI destekli analiz ve otomasyon (planlanıyor)

## Açık Konular
- Bildirim kanalları ve hedef kitle segmentasyonu
- Raporlama için standart şablon seti
- Test kapsamı hedefleri ve başarı eşiği
