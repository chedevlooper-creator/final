# 🚀 YYP Skills - Hızlı Referans

## 📝 Komut Listesi

```bash
/yyp-engine           # Proje standartları ve mimari
/create-module        # Yeni modül scaffold et
/create-query-hook    # TanStack Query hooks oluştur
/create-server-action # Güvenli server action oluştur
/create-form          # Form bileşeni oluştur
/add-migration        # Database migration oluştur
/check-security       # Güvenlik taraması yap
```

## 🎯 Hızlı Kullanım

### Yeni Modül Ekle (Full Stack)
```
/add-migration        ← Database table oluştur
/create-module        ← Tüm dosyaları scaffold et
/check-security       ← Güvenlik kontrolü
```

### Sadece Frontend
```
/create-query-hook    ← API hooks
/create-form          ← Form component
```

### Sadece Backend
```
/add-migration        ← Database schema
/create-server-action ← Server logic
```

## 🔥 En Çok Kullanılanlar

| Skill | Ne Zaman | Çıktı |
|-------|----------|-------|
| `/create-module` | Yeni özellik | 6-8 dosya |
| `/create-query-hook` | CRUD gerektiğinde | 1 dosya |
| `/create-form` | Form gerektiğinde | 1 dosya |
| `/add-migration` | Yeni tablo | 1 SQL dosyası |
| `/check-security` | Her commit'ten önce | Rapor |

## 💡 İpuçları

- Skill isimlerini `/` ile başlat
- Adım adım ilerle (migration → hooks → form)
- Her skill'den sonra kontrol et
- Security check'i unutma!

## 🆘 Sorun Giderme

**Skill çalışmıyor?**
- Skill adını doğru yazdığınızdan emin olun (`/create-module`)
- SKILL.md dosyasının varlığını kontrol edin

**Dosya zaten var hatası?**
- Mevcut dosyaları yedekleyin
- Veya skill'e "mevcut dosyayı güncelle" deyin

**RBAC hatası?**
- `/check-security` çalıştırın
- Eksik yetki kontrollerini ekleyin

## 📞 Yardım

Claude'a sorun:
```
"create-module skill'i nasıl kullanılır?"
"Güvenlik kontrolü nasıl yapılır?"
"Yeni bir skill nasıl oluşturulur?"
```

---
*Daha fazla detay için: [README.md](./README.md)*
