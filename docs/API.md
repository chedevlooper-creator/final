# 🔌 API Dokümantasyonu

> Yardım Yönetim Paneli REST API referansı

---

## 📋 Genel Bilgiler

### Base URL

| Ortam | URL |
|-------|-----|
| Development | `http://localhost:3000` |
| Production | `https://api.yardimyonetim.com` |

### Response Format

Tüm API yanıtları JSON formatındadır.

**Başarılı Yanıt:**
```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı"
}
```

**Hata Yanıtı:**
```json
{
  "error": "Hata mesajı",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

| Code | Açıklama |
|------|----------|
| `200` | Başarılı |
| `201` | Oluşturuldu |
| `400` | Geçersiz istek |
| `401` | Yetkisiz erişim |
| `403` | Erişim reddedildi |
| `404` | Bulunamadı |
| `429` | Rate limit aşıldı |
| `500` | Sunucu hatası |

---

## 🔐 Authentication

### JWT Token Authentication

API, Supabase JWT token'ları ile korunmaktadır.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "admin"
    },
    "session": {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "eyJhbGciOi...",
      "expires_at": 1234567890
    }
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 📊 Rate Limiting

| Ortam | Limit |
|-------|-------|
| Production | 100 request / 15 dakika |
| Development | Limitsiz |

Rate limit aşıldığında:
```json
{
  "error": "Rate limit aşıldı",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 📁 API Endpoints

### İhtiyaç Sahipleri (Needy Persons)

#### Liste

```http
GET /api/needy
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Açıklama |
|-------|------|---------|----------|
| `page` | number | 1 | Sayfa numarası |
| `limit` | number | 20 | Sayfa başına kayıt |
| `search` | string | - | Ad/soyad araması |
| `status` | string | - | Durum filtresi |
| `district` | string | - | İlçe filtresi |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Ahmet",
      "last_name": "Yılmaz",
      "tc_no": "1234567890",
      "phone": "+905551234567",
      "district": "Merkez",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Detay

```http
GET /api/needy/{id}
Authorization: Bearer <token>
```

#### Oluşturma

```http
POST /api/needy
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "tc_no": "12345678901",
  "phone": "+905551234567",
  "address": "Merkez Mahallesi",
  "district": "Merkez",
  "family_size": 4,
  "monthly_income": 5000
}
```

#### Güncelleme

```http
PUT /api/needy/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "inactive",
  "notes": "Güncelleme notu"
}
```

#### Silme

```http
DELETE /api/needy/{id}
Authorization: Bearer <token>
```

---

### Bağışlar (Donations)

#### Liste

```http
GET /api/donations
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Açıklama |
|-------|------|----------|
| `page` | number | Sayfa numarası |
| `limit` | number | Sayfa başına kayıt |
| `donor_id` | uuid | Bağışçı filtresi |
| `type` | string | Bağış tipi (cash, in_kind) |
| `date_from` | date | Başlangıç tarihi |
| `date_to` | date | Bitiş tarihi |

#### Oluşturma

```http
POST /api/donations
Authorization: Bearer <token>
Content-Type: application/json

{
  "donor_name": "Mehmet Kaya",
  "amount": 1000,
  "type": "cash",
  "payment_method": "bank_transfer",
  "notes": "Ramazan bağışı"
}
```

---

### Finans (Finance)

#### Gelir-Gider Listesi

```http
GET /api/finance
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Açıklama |
|-------|------|----------|
| `type` | string | income / expense |
| `category` | string | Kategori filtresi |
| `date_from` | date | Başlangıç tarihi |
| `date_to` | date | Bitiş tarihi |

#### Finans Özeti

```http
GET /api/finance/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "total_income": 150000,
    "total_expense": 120000,
    "balance": 30000,
    "monthly_income": 25000,
    "monthly_expense": 18000
  }
}
```

---

### Toplantılar (Meetings)

#### Liste

```http
GET /api/meetings
Authorization: Bearer <token>
```

#### Oluşturma

```http
POST /api/meetings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Haftalık Değerlendirme",
  "description": "Haftalık faaliyetlerin değerlendirilmesi",
  "date": "2024-01-20",
  "time": "14:00",
  "location": "Toplantı Salonu A",
  "participants": ["uuid1", "uuid2"]
}
```

#### Katılımcı Ekleme

```http
POST /api/meetings/{id}/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "uuid",
  "role": "attendee"
}
```

---

### MERNIS Doğrulama

#### TC Kimlik Doğrulama

```http
POST /api/mernis/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "tc_no": "12345678901",
  "first_name": "AHMET",
  "last_name": "YILMAZ",
  "birth_year": 1990
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "tc_no": "12345678901"
  }
}
```

---

### Cron Jobs

#### Günlük Özet

```http
POST /api/cron/daily-summary
Authorization: Bearer <cron_secret>
```

Bu endpoint, Vercel Cron veya benzeri servisler tarafından çağrılır.

---

## 📄 API Dokümantasyonu Endpoint

OpenAPI/Swagger spesifikasyonuna erişim:

```http
GET /api/docs
```

Interactive documentation:
```
http://localhost:3000/api/docs
```

---

## 🔗 Supabase Client Kullanımı

### Browser Client

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Veri çekme
const { data, error } = await supabase
  .from('needy_persons')
  .select('*')
  .limit(10)

// Insert
const { data, error } = await supabase
  .from('needy_persons')
  .insert({ first_name: 'Test', last_name: 'User' })
  .select()
  .single()
```

### Server Client

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('needy_persons')
    .select('*')
  
  return Response.json({ data })
}
```

---

## 🪝 React Query Hooks

### useNeedy Hook

```typescript
import { useNeedy, useNeedyById, useCreateNeedy } from '@/hooks/queries'

// Liste
const { data, isLoading, error } = useNeedy({
  page: 1,
  limit: 20,
  search: 'ahmet'
})

// Detay
const { data: person } = useNeedyById(id)

// Oluşturma
const createMutation = useCreateNeedy()

createMutation.mutate({
  first_name: 'Ahmet',
  last_name: 'Yılmaz'
})
```

### useDonations Hook

```typescript
import { useDonations, useCreateDonation } from '@/hooks/queries'

const { data: donations } = useDonations({
  type: 'cash',
  date_from: '2024-01-01'
})

const createDonation = useCreateDonation()
```

---

## 🛡️ Error Codes

| Code | Açıklama |
|------|----------|
| `UNAUTHORIZED` | Giriş yapılmamış |
| `FORBIDDEN` | Yetersiz yetki |
| `NOT_FOUND` | Kaynak bulunamadı |
| `VALIDATION_ERROR` | Validasyon hatası |
| `DUPLICATE_ENTRY` | Tekrarlayan kayıt |
| `RATE_LIMIT_EXCEEDED` | Rate limit aşıldı |
| `INTERNAL_ERROR` | Sunucu hatası |
| `DATABASE_ERROR` | Veritabanı hatası |
| `MERNIS_ERROR` | MERNIS doğrulama hatası |

---

## 📊 Pagination

Tüm liste endpoint'leri aşağıdaki pagination yapısını kullanır:

**Request:**
```
?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔗 İlgili Dokümanlar

- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [Security](./SECURITY.md)
