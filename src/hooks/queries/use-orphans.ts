import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Types
interface Orphan {
    id: string
    file_number: string | null
    type: string
    first_name: string
    last_name: string
    gender: string | null
    date_of_birth: string | null
    status: string
    photo_url: string | null
    guardian_name: string | null
    created_at: string
}

// Mock data
const mockOrphans: Orphan[] = [
    {
        id: '1',
        file_number: 'YTM-2026-0001',
        type: 'orphan',
        first_name: 'Muhammed',
        last_name: 'Yılmaz',
        gender: 'male',
        date_of_birth: '2015-05-15',
        status: 'active',
        photo_url: null,
        guardian_name: 'Ayşe Yılmaz',
        created_at: '2026-01-01T10:00:00Z',
    },
    {
        id: '2',
        file_number: 'YTM-2026-0002',
        type: 'ihh_orphan',
        first_name: 'Fatma',
        last_name: 'Kaya',
        gender: 'female',
        date_of_birth: '2016-08-20',
        status: 'active',
        photo_url: null,
        guardian_name: 'Mehmet Kaya',
        created_at: '2026-01-02T10:00:00Z',
    },
]

export function useOrphansList(filters?: { type?: string; status?: string; search?: string }) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['orphans', filters],
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                let data = [...mockOrphans]
                if (filters?.type) data = data.filter((o) => o.type === filters.type)
                if (filters?.status) data = data.filter((o) => o.status === filters.status)
                if (filters?.search) {
                    const search = filters.search.toLowerCase()
                    data = data.filter((o) =>
                        o.first_name.toLowerCase().includes(search) ||
                        o.last_name.toLowerCase().includes(search)
                    )
                }
                return data
            }

            let query = supabase.from('orphans').select('*').order('created_at', { ascending: false })
            if (filters?.type) query = query.eq('type', filters.type)
            if (filters?.status) query = query.eq('status', filters.status)
            if (filters?.search) {
                query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
            }

            const { data, error } = await query
            if (error) throw error
            return data
        },
    })
}

export function useOrphanDetail(id: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['orphan', id],
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                return mockOrphans.find((o) => o.id === id) || null
            }

            const { data, error } = await supabase
                .from('orphans')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!id && id !== 'new',
    })
}

export function useCreateOrphan() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async (data: Partial<Orphan>) => {
            if (USE_MOCK_DATA) {
                return { ...data, id: Date.now().toString() }
            }

            const { data: result, error } = await supabase
                .from('orphans')
                .insert(data)
                .select()
                .single()

            if (error) throw error
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orphans'] })
        },
    })
}

export function useUpdateOrphan() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Orphan> }) => {
            if (USE_MOCK_DATA) {
                return { ...data, id }
            }

            const { data: result, error } = await supabase
                .from('orphans')
                .update(data)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return result
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['orphans'] })
            queryClient.invalidateQueries({ queryKey: ['orphan', id] })
        },
    })
}
