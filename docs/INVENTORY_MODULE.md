# 📦 Stok / Depo Yönetimi Modülü

> Yardım Yönetim Paneli - Envanter Takip Sistemi

---

## 📋 Genel Bakış

Stok/Depo yönetimi modülü, STK'ların ayni yardım malzemelerini (gıda, giyim, yakacak vb.) takip etmelerini sağlayan kapsamlı bir envanter sistemidir.

### ✨ Özellikler

- 📦 Çoklu depo yönetimi
- 🔢 Barkod/SKU ile hızlı takip
- 📊 Gerçek zamanlı stok seviyeleri
- ⚠️ Otomatik stok uyarıları
- 📅 Son kullanma tarihi takibi
- 🔄 Stok giriş/çıkış/transfer işlemleri
- 📋 Periyodik stok sayımı
- 🏷️ Parti/Lot takibi

---

## 🗄️ Veritabanı Şeması

### Tablolar

| Tablo | Açıklama |
|-------|----------|
| `warehouses` | Depo tanımları |
| `item_categories` | Ürün kategorileri |
| `suppliers` | Tedarikçiler |
| `inventory_items` | Ürün/envanter kalemleri |
| `warehouse_stocks` | Depo bazlı stok seviyeleri |
| `inventory_lots` | Parti/Lot takibi |
| `inventory_transactions` | Stok hareketleri |
| `stock_alerts` | Stok uyarıları |
| `stock_counts` | Stok sayım kayıtları |
| `stock_count_items` | Sayım detayları |

---

## 📁 Dosya Yapısı

```
supabase/migrations/
└── 20260130_inventory_management.sql    # Migration

src/types/
└── inventory.ts                         # TypeScript tipleri

src/lib/validations/
└── inventory.ts                         # Zod validasyon şemaları

src/app/actions/
└── inventory.ts                         # Server Actions

src/hooks/queries/
└── use-inventory.ts                     # TanStack Query hooks

src/hooks/mutations/
└── use-inventory-mutations.ts           # Mutation hooks

src/components/inventory/
├── quick-stock-dialog.tsx               # Hızlı stok giriş/çıkış
├── warehouse-dialog.tsx                 # Depo formu
├── transaction-dialog.tsx               # Hareket formu
└── count-dialog.tsx                     # Sayım formu

app/dashboard/inventory/
├── page.tsx                             # Ana sayfa (dashboard)
├── layout.tsx                           # Layout
├── warehouses/
│   └── page.tsx                         # Depo listesi
├── items/
│   └── page.tsx                         # Ürün listesi
├── transactions/
│   └── page.tsx                         # Hareketler
├── alerts/
│   └── page.tsx                         # Uyarılar
└── counts/
    └── page.tsx                         # Stok sayımı
```

---

## 🚀 Kullanım

### Menüden Erişim

```
Dashboard → Yardım Yönetimi → Stok / Depo
```

### Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Dashboard | `/dashboard/inventory` | Genel bakış ve istatistikler |
| Depolar | `/dashboard/inventory/warehouses` | Depo yönetimi |
| Ürünler | `/dashboard/inventory/items` | Envanter kalemleri |
| Hareketler | `/dashboard/inventory/transactions` | Stok hareketleri |
| Uyarılar | `/dashboard/inventory/alerts` | Stok uyarıları |
| Sayımlar | `/dashboard/inventory/counts` | Stok sayımı |

---

## 🔧 İş Akışları

### 1. Stok Girişi (Bağış Alımı)

```
1. Barkod okut
2. Ürün bilgisi otomatik gelir
3. Miktar gir
4. Kaydet → Stok artar
```

### 2. Stok Çıkışı (Yardım Dağıtımı)

```
1. Barkod okut
2. Ürün bilgisi otomatik gelir
3. Miktar gir
4. İhtiyaç sahibi seç (opsiyonel)
5. Kaydet → Stok azalır
```

### 3. Depo Transferi

```
1. Kaynak depo seç
2. Hedef depo seç
3. Ürün ve miktar gir
4. Kaydet → Kaynak azalır, hedef artar
```

### 4. Stok Sayımı

```
1. Sayım planla
2. Başlat
3. Ürünleri say ve kaydet
4. Farkları gör
5. Tamamla → Otomatik düzeltme
```

---

## ⚠️ Otomatik Uyarılar

Sistem otomatik olarak şu durumlarda uyarı oluşturur:

| Uyarı Tipi | Tetikleyici | Önem |
|------------|-------------|------|
| `low_stock` | Stok minimum seviyenin altına düşer | Yüksek |
| `out_of_stock` | Stok tükenir | Kritik |
| `expiring` | Son kullanma 30 gün içinde | Orta |
| `expired` | Son kullanma geçer | Kritik |
| `overstock` | Maksimum stok aşılır | Düşük |

---

## 📊 Raporlar

- **Stok Özeti**: Tüm ürünlerin toplam stokları
- **Depo Raporu**: Depo bazlı stok dağılımı
- **Hareket Raporu**: Giriş/çıkış/transfer özetleri
- **Son Kullanma Raporu**: Yaklaşan son kullanma tarihleri

---

## 🔌 API Örnekleri

### Stok Girişi

```typescript
import { quickStockIn } from '@/app/actions/inventory'

await quickStockIn({
  barcode: '8680000000001',
  warehouse_id: 'uuid',
  quantity: 100,
  notes: 'Bağış girişi'
})
```

### Depo Transferi

```typescript
import { transferBetweenWarehouses } from '@/app/actions/inventory'

await transferBetweenWarehouses({
  item_id: 'uuid',
  source_warehouse_id: 'uuid',
  destination_warehouse_id: 'uuid',
  quantity: 50
})
```

---

## 🎯 Gelecek Geliştirmeler

- [ ] Barkod yazıcı entegrasyonu
- [ ] QR kod desteği
- [ ] Depo yerleşim haritası
- [ ] Mobil sayım uygulaması
- [ ] Otomatik sipariş önerileri
- [ ] Tedarikçi performans raporları

---

## 📝 Notlar

- Tüm stok hareketleri `inventory_transactions` tablosuna kaydedilir
- `warehouse_stocks` view'ı gerçek zamanlı stok seviyelerini gösterir
- Parti takibi `inventory_lots` tablosu ile yapılır
- Otomatik uyarılar PostgreSQL trigger'ları ile oluşturulur
