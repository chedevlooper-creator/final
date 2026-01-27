/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
    useVolunteersList,
    useVolunteerDetail,
    useCreateVolunteer,
    useUpdateVolunteer,
    useMissionsList,
    useCreateMission,
    useUpdateMission,
} from '../use-volunteers'

// ============================================
// Test Data
// ============================================
const mockVolunteer = {
    id: 'v-1',
    first_name: 'Ahmet',
    last_name: 'Gönüllü',
    email: 'ahmet@example.com',
    phone: '5551234567',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
}

const mockMission = {
    id: 'm-1',
    volunteer_id: 'v-1',
    mission_date: '2024-01-26',
    status: 'pending',
    volunteer: {
        id: 'v-1',
        first_name: 'Ahmet',
        last_name: 'Gönüllü',
        phone: '5551234567'
    }
}

// ============================================
// Mock Setup
// ============================================
let mockQueryResult: { data: unknown[]; error: unknown; count: number } = {
    data: [mockVolunteer],
    error: null,
    count: 1
}
let mockSingleResult: { data: unknown; error: unknown } = {
    data: mockVolunteer,
    error: null
}

const methodCalls: Record<string, unknown[][]> = {}

const createMockChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}

    const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'gte', 'lte', 'or']
    chainMethods.forEach(method => {
        chain[method] = (...args: unknown[]) => {
            if (!methodCalls[method]) methodCalls[method] = []
            methodCalls[method].push(args)
            return chain
        }
    })

    const finalChain = chain as any

    finalChain.range = (from: number, to: number) => {
        if (!methodCalls['range']) methodCalls['range'] = []
        methodCalls['range'].push([from, to])
        // range is often terminal or close to terminal, but let's return a thenable
        const promise = Promise.resolve(mockQueryResult)
        return Object.assign(promise, finalChain)
    }

    finalChain.single = () => Promise.resolve(mockSingleResult)

    finalChain.then = (onFulfilled: (value: unknown) => unknown) => {
        return Promise.resolve(onFulfilled(mockQueryResult))
    }

    return finalChain
}

const mockSupabase = {
    from: vi.fn((_table: string) => createMockChain()),
}

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase,
}))

// ============================================
// Test Wrapper Setup
// ============================================
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    })

function TestWrapper({ children }: { children: ReactNode }) {
    const queryClient = createTestQueryClient()
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('use-volunteers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.keys(methodCalls).forEach(key => delete methodCalls[key])
        mockQueryResult = { data: [mockVolunteer], error: null, count: 1 }
        mockSingleResult = { data: mockVolunteer, error: null }
    })

    describe('useVolunteersList', () => {
        it('should fetch volunteers list successfully', async () => {
            const { result } = renderHook(() => useVolunteersList(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data?.data).toEqual([mockVolunteer])
            expect(methodCalls['order']).toBeDefined()
        })

        it('should apply status filter correctly', async () => {
            renderHook(() => useVolunteersList({ status: 'active' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['eq']?.some(call => call[0] === 'status' && call[1] === 'active')).toBe(true)
            })
        })

        it('should apply search filter correctly', async () => {
            renderHook(() => useVolunteersList({ search: 'ahmet' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['or']?.[0][0]).toContain('ahmet')
            })
        })
    })

    describe('useVolunteerDetail', () => {
        it('should fetch volunteer detail', async () => {
            const { result } = renderHook(() => useVolunteerDetail('v-1'), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockVolunteer)
            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === 'v-1')).toBe(true)
        })
    })

    describe('useMissionsList', () => {
        it('should fetch missions with volunteer join', async () => {
            mockQueryResult = { data: [mockMission], error: null, count: 1 }

            const { result } = renderHook(() => useMissionsList(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data?.data[0].volunteer).toBeDefined()
            expect(methodCalls['select']?.[0][0]).toContain('volunteer:volunteers')
        })

        it('should apply date filters', async () => {
            renderHook(() => useMissionsList({ date_from: '2024-01-01', date_to: '2024-01-31' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['gte']?.some(call => call[0] === 'mission_date' && call[1] === '2024-01-01')).toBe(true)
                expect(methodCalls['lte']?.some(call => call[0] === 'mission_date' && call[1] === '2024-01-31')).toBe(true)
            })
        })
    })

    describe('Mutations', () => {
        it('should create volunteer', async () => {
            mockSingleResult = { data: { ...mockVolunteer, id: 'v-new' }, error: null }
            const { result } = renderHook(() => useCreateVolunteer(), {
                wrapper: TestWrapper,
            })

            const newVolunteer = { first_name: 'Yeni', last_name: 'Gönüllü', email: 'yeni@ex.com' }
            result.current.mutate(newVolunteer as any)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['insert']?.[0][0]).toEqual(newVolunteer)
        })

        it('should update mission', async () => {
            mockSingleResult = { data: { ...mockMission, status: 'completed' }, error: null }
            const { result } = renderHook(() => useUpdateMission(), {
                wrapper: TestWrapper,
            })

            result.current.mutate({ id: 'm-1', values: { status: 'completed' } })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['update']?.[0][0]).toEqual({ status: 'completed' })
            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === 'm-1')).toBe(true)
        })
    })
})
