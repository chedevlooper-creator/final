# VERCEL_SETUP.md

🚀 **Vercel Dağıtımı İçin Hızlı Başlangıç Rehberi**  
Bu kılavuz, Vercel üzerinde bir proje dağıtmak için ihtiyaç duyacağınız adım adım talimatları içermektedir.

---

## 1) Vercel Hesabı Oluşturma ve Projeyi İçe Aktarma  
1. [Vercel](https://vercel.com) web sitesine gidin.
2. Sağ üst köşedeki **“Sign Up”** butonuna tıklayın.  
3. GitHub, GitLab veya Bitbucket hesabınızla giriş yapın.  
4. Projenizi içe aktarmak için **“Import Project”** butonuna tıklayın.
5. İlgili depoyu seçin ve Vercel ile bağlantı kurun.

---

## 2) Ortam Değişkenleri Ekleme  
Projelerinizi başarılı bir şekilde dağıtabilmek için gerekli ortam değişkenlerini eklemeniz gerekecek.

1. Vercel paneline giriş yapın.
2. Projeniz için **Settings** (Ayarlar) sekmesine gidin.  
3. **Environment Variables** (Ortam Değişkenleri) bölümüne gidin.
   - **Supabase URL**: `SUPABASE_URL`  
   - **Supabase Anahtarları**: `SUPABASE_KEY`  
   - **Sentry DSN**: `SENTRY_DSN`  
   - **PostHog Anahtarları**: `POSTHOG_KEY`  
4. **Save** butonuna tıklayarak değişiklikleri kaydedin.

---

## 3) İlk Dağıtım Süreci  
1. Projeniz ayarlandıktan sonra, Vercel ilk dağıtımını otomatik olarak başlatacaktır.  
2. Dağıtım sürecini izlemek için Vercel konsolundaki **Deployments** sekmesine tıklayın.  
3. Dağıtım tamamlandığında, bağlantınız hazır olacaktır.

---

## 4) Ortak Hataların Giderilmesi  
- **Sunucu Hatası (500)**: Bu hata genellikle uygulamanızda bir hata olduğunda görülür. Geri dönüp kodunuzu kontrol edin.
- **Bağlantı Hatası**: Ortam değişkenlerinin doğru ayarlandığından emin olun.

---

## 5) Dağıtım Sonrası Kontrol Listesi  
- ✅ Projenizin URL’sini kontrol edin.  
- ✅ Ortam değişkenlerinin doğruluğunu kontrol edin.
- ✅ Uygulamanızın beklenildiği gibi çalıştığından emin olun.

---

Bu rehberle Vercel üzerinde projenizi hızlı bir şekilde dağıtabilir ve ihtiyaç duyduğunuz bilgileri kolaylıkla bulabilirsiniz!