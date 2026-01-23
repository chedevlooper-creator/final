import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const USE_MOCK_DATA = process.env['NEXT_PUBLIC_USE_MOCK_DATA'] === 'true'

// Types
interface Event {
    id: string
    title: string
    description: string | null
    event_type: string
    location: string | null
    address: string | null
    start_date: string
    end_date: string | null
    capacity: number | null
    registered: number
    status: string
    created_at: string
}

// Mock data
const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Ramazan İftar Organizasyonu',
        description: 'Muhtaç ailelere iftar yemeği dağıtımı',
        event_type: 'charity',
        location: 'Başakşehir Meydan',
        address: 'Başakşehir Meydanı, İstanbul',
        start_date: '2026-03-15T18:00:00Z',
        end_date: '2026-03-15T21:00:00Z',
        capacity: 500,
        registered: 350,
        status: 'upcoming',
        created_at: '2026-01-10T10:00:00Z',
    },
    {
        id: '2',
        title: 'Gönüllü Eğitim Semineri',
        description: 'Yeni gönüllüler için temel eğitim',
        event_type: 'education',
        location: 'Dernek Merkezi',
        address: 'Merkez, İstanbul',
        start_date: '2026-02-01T10:00:00Z',
        end_date: '2026-02-01T16:00:00Z',
        capacity: 50,
        registered: 35,
        status: 'upcoming',
        created_at: '2026-01-05T10:00:00Z',
    },
]

export function useEventsList(filters?: { type?: string; status?: string }) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['events', filters],
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                let data = [...mockEvents]
                if (filters?.type) data = data.filter((e) => e.event_type === filters.type)
                if (filters?.status) data = data.filter((e) => e.status === filters.status)
                return data
            }

            let query = supabase.from('events').select('*').order('start_date', { ascending: true })
            if (filters?.type) query = query.eq('event_type', filters.type)
            if (filters?.status) query = query.eq('status', filters.status)

            const { data, error } = await query
            if (error) throw error
            return data
        },
    })
}

export function useEventDetail(id: string) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            if (USE_MOCK_DATA) {
                return mockEvents.find((e) => e.id === id) || null
            }

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!id && id !== 'new',
    })
}

export function useCreateEvent() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async (data: Partial<Event>) => {
            if (USE_MOCK_DATA) {
                return { ...data, id: Date.now().toString() }
            }

            const { data: result, error } = await supabase
                .from('events')
                .insert(data)
                .select()
                .single()

            if (error) throw error
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
        },
    })
}

export function useUpdateEvent() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Event> }) => {
            if (USE_MOCK_DATA) {
                return { ...data, id }
            }

            const { data: result, error } = await supabase
                .from('events')
                .update(data)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return result
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            queryClient.invalidateQueries({ queryKey: ['event', id] })
        },
    })
}
