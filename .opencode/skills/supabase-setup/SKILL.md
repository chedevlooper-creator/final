---
name: supabase-setup
description: Supabase tablosu oluşturma, RLS kuralları ve migration yazma
license: MIT
compatibility: opencode
---

## Ne yaparım

- Supabase tablosu SQL şeması oluştururum
- Row Level Security (RLS) kuralları yazarım
- Migration dosyası oluştururum
- Index ve trigger eklerim
- Type-safe query örnekleri sunarım

## Ne zaman kullanılır

Yeni bir tablo veya veritabanı yapısı oluşturulurken:
- Kullanıcı, ihtiyaç sahibi, bağış vs. tabloları
- RLS politikaları ekleme
- Performans için index oluşturma
- Migration dosyası yazma

## Örnek kullanım

"Kişiler tablosu oluştur" → Ad, soyad, telefon, e-posta alanları
"RLS kuralı ekle" → Sadece kendi kaydını görsün
"Index ekle" → Telefon numarası için unique index