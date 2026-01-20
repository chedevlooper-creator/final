---
name: finance-backend
description: Finance module için Supabase backend entegrasyonu - tablolar, API routes, React Query hooks
license: MIT
---

## Ne yaparım

Finance module için tam backend entegrasyonu sağlarım:
- Supabase migration dosyaları (bank_accounts, cash_transactions, merchants, purchase_requests)
- RLS (Row Level Security) policies
- API routes (/api/finance/*) - GET/POST/PATCH/DELETE
- React Query hooks (useGenericQuery pattern)
- Zod validation schemas
- Turkish error messages
- Dashboard summary endpoint

## Ne zaman kullanılır

Finance module backend eksik olduğunda:
- Banka hesapları yönetimi
- Kasa işlemleri (gelir/gider)
- Tedarikçiler
- Satın alma talepleri
- Bakiye ve raporlamalar

## Kullanım

```
ulw: Finance module complete

Tablolar:
- bank_accounts: Banka hesapları
- cash_transactions: Kasa işlemleri
- merchants: Tedarikçiler
- purchase_requests: Satın alma talepleri

API Routes:
- /api/finance/bank-accounts (CRUD)
- /api/finance/cash-transactions (CRUD + filters)
- /api/finance/merchants (CRUD)
- /api/finance/purchase-requests (CRUD + approval workflow)
- /api/finance/summary (dashboard stats)

Features:
- Zod validation
- RLS protection
- Turkish UI strings
- Error handling
- React Query caching
```

## Özellikler

**Bank Accounts:**
- CRUD operations
- Primary account seçimi
- Bakiye hesaplaması
- IBAN validasyonu

**Cash Transactions:**
- Gelir/Gider tipi
- Banka hesabı atama
- Tarih aralığı filtrelemesi
- Referans numarası
- Bakiye güncellemeleri

**Merchants:**
- CRUD operations
- İletişim bilgileri
- Vergi numarası
- Statüs yönetimi

**Purchase Requests:**
- Talep oluşturma
- Approval workflow (pending → approved/rejected)
- Tedarikçi atama
- Tutar yönetimi

**RLS Policies:**
- Admin: Full read/write/delete
- Moderator: Read/write, no delete
- Viewer: Read-only
