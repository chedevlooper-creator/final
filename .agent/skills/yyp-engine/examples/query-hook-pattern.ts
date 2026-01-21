'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * YYP Projesi İçin Standartlaştırılmış Query Hook Kalıbı
 * 
 * Bu yapı:
 * 1. Merkezi Supabase client'ı (@/lib/supabase/client) kullanır.
 * 2. TanStack Query 5+ standartlarını (staleTime, gcTime) uygular.
 * 3. Merkezi query key yönetimi sağlar.
 * 4. Silme ve güncelleme sonrası cache invalidation yapar.
 */

export function useFeatureList(filters: any = {}) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    // 1. Veri Çekme (Query)
    const query = useQuery({
        queryKey: ['feature-name', 'list', filters],
        queryFn: async () => {
            let dbQuery = supabase
                .from('table_name')
                .select('*', { count: 'exact' });

            // Filtreleme mantığı
            if (filters.search) {
                dbQuery = dbQuery.ilike('name', `%${filters.search}%`);
            }

            const { data, error, count } = await dbQuery
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, count };
        },
        staleTime: 5 * 60 * 1000, // 5 dakika taze tut
    });

    // 2. Veri Silme (Mutation)
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('table_name')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            toast.success('Kayıt başarıyla silindi.');
            // İlgili listeyi geçersiz kıl ve tekrar çekilmesini sağla
            queryClient.invalidateQueries({ queryKey: ['feature-name', 'list'] });
        },
        onError: (error: any) => {
            toast.error('Hata oluştu: ' + error.message);
        }
    });

    return {
        ...query,
        deleteRecord: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending
    };
}
