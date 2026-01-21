'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasResourcePermission } from '@/lib/rbac';
import { needyFormSchema } from '@/lib/validations/needy';
import { ErrorHandler, AuthorizationError, ValidationError, ErrorType } from '@/lib/errors';
import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';

/**
 * YYP Projesi İçin Standartlaştırılmış Server Action Kalıbı
 * 
 * Bu yapı:
 * 1. RBAC (Rol Bazlı Erişim Control) doğrulaması yapar.
 * 2. Zod şeması ile girdi doğrulaması yapar.
 * 3. Projenin merkezi ErrorHandler sistemini kullanır.
 * 4. Next.js 16+ uyumlu cache yönetimi sağlar.
 */

export async function createNeedyPersonAction(rawData: unknown) {
    try {
        const supabase = await createServerSupabaseClient();

        // 1. Yetki Kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw ErrorHandler.createError(ErrorType.AUTHENTICATION, 'Oturum bulunamadı.');

        const role = (user.user_metadata?.['role'] as any) || 'viewer';
        if (!hasResourcePermission(role, 'needy_persons', 'create')) {
            throw new AuthorizationError('İhtiyaç sahibi kaydı oluşturma yetkiniz yok.');
        }

        // 2. Veri Doğrulama
        const validation = needyFormSchema.safeParse(rawData);
        if (!validation.success) {
            // İlk hatayı yakala ve ValidationError olarak fırlat
            const error = validation.error.errors[0];
            throw new ValidationError(error.message, error.path.join('.'), null);
        }

        // 3. Veritabanı İşlemi
        const { data, error } = await supabase
            .from('needy_persons')
            .insert(validation.data)
            .select()
            .single();

        if (error) throw ErrorHandler.fromSupabaseError(error);

        // 4. Cache Güncelleme
        revalidatePath('/dashboard/needy');

        return {
            success: true,
            data,
            message: 'İhtiyaç sahibi başarıyla kaydedildi.'
        };

    } catch (error) {
        // Sentry kaydı
        Sentry.captureException(error);

        // Kullanıcı dostu hata mesajı döndür
        return {
            success: false,
            message: ErrorHandler.handle(error)
        };
    }
}
