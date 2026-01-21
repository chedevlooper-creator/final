---
name: create-server-action
description: RBAC ve validation içeren standart server action oluşturur.
---

# ⚡ Create Server Action Skill

Bu skill, YYP projesinde güvenli ve standartlaştırılmış server action'lar oluşturur.

## Kullanım

Kullanıcıdan aşağıdaki bilgileri al:
1. **Action Adı** (örn: "createCourse", "updateNeedyPerson")
2. **Tablo Adı** (örn: "courses", "needy_persons")
3. **İşlem Tipi** (create, update, delete)
4. **Gerekli Yetki** (create, update, delete, admin)

## Oluşturulan Action Yapısı

### Dosya: `src/app/actions/[resource-name].ts`

```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { hasResourcePermission } from '@/lib/rbac'
import { [schema]Schema } from '@/lib/validations/[resource]'
import {
  ErrorHandler,
  AuthorizationError,
  ValidationError,
  ErrorType
} from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'

/**
 * [Action Açıklaması]
 *
 * @param rawData - Kullanıcıdan gelen ham veri
 * @returns Success/error response
 */
export async function [actionName]Action(rawData: unknown) {
  try {
    // 1. Supabase Client & User
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw ErrorHandler.createError(
        ErrorType.AUTHENTICATION,
        'Oturum bulunamadı.'
      )
    }

    // 2. RBAC Kontrolü
    const role = (user.user_metadata?.['role'] as any) || 'viewer'
    if (!hasResourcePermission(role, '[resource_name]', '[permission]')) {
      throw new AuthorizationError(
        '[Resource] için [action] yetkisi yok.'
      )
    }

    // 3. Validation
    const validation = [schema]Schema.safeParse(rawData)
    if (!validation.success) {
      const error = validation.error.errors[0]
      throw new ValidationError(
        error.message,
        error.path.join('.'),
        null
      )
    }

    // 4. Database Operation
    const { data, error } = await supabase
      .from('[table_name]')
      .[operation](validation.data)
      .select()
      .single()

    if (error) throw ErrorHandler.fromSupabaseError(error)

    // 5. Audit Log (optional)
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: '[action_type]',
      resource_type: '[resource_name]',
      resource_id: data.id,
      details: { changes: validation.data }
    })

    // 6. Cache Invalidation
    revalidatePath('/dashboard/[resource-path]')
    revalidatePath(`/dashboard/[resource-path]/${data.id}`)

    // 7. Success Response
    return {
      success: true,
      data,
      message: '[Başarı mesajı]'
    }

  } catch (error) {
    // Error Logging
    Sentry.captureException(error, {
      tags: { action: '[actionName]' },
      user: { id: user?.id }
    })

    // Error Response
    return {
      success: false,
      message: ErrorHandler.handle(error)
    }
  }
}
```

## Action Tipleri

### 1. CREATE Action

```typescript
export async function createResourceAction(rawData: unknown) {
  // ... yukarıdaki template

  const { data, error } = await supabase
    .from('table_name')
    .insert(validation.data)
    .select()
    .single()
}
```

### 2. UPDATE Action

```typescript
export async function updateResourceAction(id: string, rawData: unknown) {
  // ... RBAC ve validation

  const { data, error } = await supabase
    .from('table_name')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single()
}
```

### 3. DELETE Action

```typescript
export async function deleteResourceAction(id: string) {
  // ... RBAC kontrolü

  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id)

  if (error) throw ErrorHandler.fromSupabaseError(error)

  return { success: true, message: 'Kayıt silindi.' }
}
```

### 4. BULK Action

```typescript
export async function bulkUpdateResourceAction(ids: string[], updates: any) {
  // ... RBAC ve validation

  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .in('id', ids)
    .select()
}
```

## Güvenlik Katmanları

### ✅ 1. Authentication
- User session kontrolü
- JWT token validasyonu

### ✅ 2. Authorization (RBAC)
- Role-based permissions
- Resource-level permissions
- Field-level permissions (gelişmiş)

### ✅ 3. Validation
- Zod schema validation
- Type safety
- Custom validators

### ✅ 4. Error Handling
- Merkezi ErrorHandler
- User-friendly messages
- Sentry integration

### ✅ 5. Audit Trail
- Who did what, when
- Change tracking
- Compliance ready

### ✅ 6. Rate Limiting (optional)
```typescript
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

await limiter.check(user.id, 10) // max 10 requests per minute
```

## Client-Side Usage

```typescript
'use client'

import { createCourseAction } from '@/app/actions/courses'
import { useTransition } from 'react'

export function CourseForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createCourseAction({
        name: formData.get('name'),
        // ...
      })

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return <form action={handleSubmit}>...</form>
}
```

## Best Practices

### ✅ DO
- Always validate input with Zod
- Always check permissions
- Always handle errors properly
- Always revalidate paths after mutations
- Log important actions
- Use transactions for multi-table operations

### ❌ DON'T
- Don't trust client data
- Don't skip permission checks
- Don't expose sensitive errors to client
- Don't forget to revalidate cache
- Don't perform heavy operations synchronously

## Testing

```typescript
import { createCourseAction } from '@/app/actions/courses'

describe('createCourseAction', () => {
  it('should create course with valid data', async () => {
    const result = await createCourseAction({
      name: 'Test Course',
      // ...
    })

    expect(result.success).toBe(true)
  })

  it('should reject without permissions', async () => {
    // Mock user without permissions
    const result = await createCourseAction({ ... })

    expect(result.success).toBe(false)
    expect(result.message).toContain('yetki')
  })
})
```

---
*Bu skill YYP-Engine güvenlik standartlarını ve Next.js 15+ server action pattern'lerini takip eder.*
