---
name: yyp-engine
description: Yardım Yönetim Paneli (YYP) Master Proje Motoru. Next.js 16+, Supabase ve RBAC standartlarını kapsayan tam ölçekli geliştirme rehberi.
---

# 🚀 YYP-Engine: Master Geliştirme Protokolü

Bu döküman, projenin tüm teknik katmanlarını (frontend, backend, database, security) kapsayan ana rehberdir.

## 🏛️ Mimari Katmanlar (Next.js 16 + React 19)

### 1. Server-Side Mantığı
- **Server Components:** Veri okuma işlemleri (`select`) mümkün olduğunca server component seviyesinde yapılmalıdır.
- **Server Actions:** Tüm veri yazma/güncelleme işlemleri (`insert`, `update`, `delete`) server action'lar üzerinden yürütülmelidir.
- **Cache Yönetimi:** `revalidatePath` ve `revalidateTag` kullanılarak veri tutarlılığı sağlanmalıdır.

### 2. Veri Yönetimi (Supabase & TanStack Query 5)
- **Supabase Client:** 
    - Server: `@/lib/supabase/server`
    - Client: `@/lib/supabase/client`
- **Merkezi Hooklar:** Tüm query ve mutation tanımları `src/hooks/queries` altında toplanmalı, komponent içinde doğrudan supabase çağrısı yapılmamalıdır.

### 3. Güvenlik ve Yetkilendirme (RBAC)
- **Role Control:** `@/lib/rbac.tsx` üzerindeki `hasPermission` ve `hasResourcePermission` fonksiyonları kullanılmalıdır.
- **Hassas Veri:** Kullanıcı rolleri her zaman server-side (server actions/components) doğrulanmalıdır.

## 📁 Klasör Hiyerarşisi Standartları

- `src/app`: Page, Layout ve Route tanımları.
- `src/components`: UI ve Feature-based bileşenler.
- `src/lib`: İş mantığı, yardımcılar, konfigürasyon.
- `src/hooks/queries`: Veri akışını yöneten merkezi TanStack Query hookları.
- `src/types`: Global tip tanımları.

## 🛡️ Kodlama Kuralları

- **TypeScript:** Daima `@/*` alias'larını kullanın.
- **Validation:** Giriş verileri (formlar, API) `zod` ile validate edilmelidir.
- **UI:** Bileşenler `shadcn` standartlarına ve projenin renk paletine sadık kalmalıdır.

---
*Her yeni modül veya özellik bu protokole uymak zorundadır.*
