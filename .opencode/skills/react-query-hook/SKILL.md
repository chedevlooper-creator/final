---
name: react-query-hook
description: React Query hook'u oluşturma ve caching yapılandırması
license: MIT
compatibility: opencode
---

## Ne yaparım

- useGenericQuery pattern'ine uygun hook yazarım
- Mutasyon hook'u oluştururum
- Query keys organize ederim
- staleTime ve gcTime ayarlarım
- Pagination desteği eklerim
- Turkish toast mesajları eklerim

## Ne zaman kullanılır

Veri fetching veya mutasyon eklerken:
- Yeni bir tablo için listeleme hook'u
- CRUD işlemleri için mutasyon
- Filtreleme ve arama için query
- Realtime subscription için hook

## Kullanım örneği

"Gönüllüler için query hook'u oluştur" → useVolunteersList
"İhtiyaç sahibi ekleme mutasyonu" → createNeedyPerson
"Bağış listesi hook'u" → useDonations
