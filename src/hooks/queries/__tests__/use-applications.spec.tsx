/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
    useApplicationsList,
    useApplicationDetail,
    useCreateApplication,
    useUpdateApplication,
} from '../use-applications'

// ============================================
// Test Data
// ============================================
const mockApplication = {
    id: 'app-1',
    needy_person_id: 'needy-1',
    application_type: 'food',
    status: 'new',
    priority: 'high',
    description: 'Need food support',
    created_at: '2024-01-01T00:00:00Z',
    needy_person: {
        id: 'needy-1',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-1234'
    }
}

const mockApplicationsList = [mockApplication]

// ============================================
// Mock Setup
// ============================================
let mockQueryResult: { data: unknown[]; error: unknown; count: number } = {
    data: mockApplicationsList,
    error: null,
    count: 1
}
let mockSingleResult: { data: unknown; error: unknown } = {
    data: mockApplication,
    error: null
}

const methodCalls: Record<string, unknown[][]> = {}

const createMockChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}

    const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'order']
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
        return Promise.resolve(mockQueryResult)
    }

    finalChain.single = () => Promise.resolve(mockSingleResult)

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

describe('use-applications', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.keys(methodCalls).forEach(key => delete methodCalls[key])
        mockQueryResult = { data: mockApplicationsList, error: null, count: 1 }
        mockSingleResult = { data: mockApplication, error: null }
    })

    // ------------------------------------------
    // useApplicationsList Tests
    // ------------------------------------------
    describe('useApplicationsList', () => {
        it('should fetch applications list successfully', async () => {
            const { result } = renderHook(() => useApplicationsList(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data?.data).toEqual(mockApplicationsList)
            expect(result.current.data?.count).toBe(1)
        })

        it('should apply status filter', async () => {
            renderHook(() => useApplicationsList({ status: 'pending' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['eq']?.some(call => call[0] === 'status' && call[1] === 'pending')).toBe(true)
            })
        })

        it('should apply priority filter', async () => {
            renderHook(() => useApplicationsList({ priority: 'high' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['eq']?.some(call => call[0] === 'priority' && call[1] === 'high')).toBe(true)
            })
        })

        it('should handle pagination', async () => {
            mockQueryResult = { data: mockApplicationsList, error: null, count: 50 }

            const { result } = renderHook(() => useApplicationsList({ page: 1, limit: 10 }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['range']?.[0]).toEqual([10, 19])
        })
    })

    // ------------------------------------------
    // useApplicationDetail Tests
    // ------------------------------------------
    describe('useApplicationDetail', () => {
        it('should fetch application detail when id is provided', async () => {
            const { result } = renderHook(() => useApplicationDetail('app-1'), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === 'app-1')).toBe(true)
            expect(result.current.data).toEqual(mockApplication)
        })

        it('should not fetch when id is missing', () => {
            const { result } = renderHook(() => useApplicationDetail(''), {
                wrapper: TestWrapper,
            })

            expect(result.current.fetchStatus).toBe('idle')
        })
    })

    // ------------------------------------------
    // useCreateApplication Tests
    // ------------------------------------------
    describe('useCreateApplication', () => {
        it('should create application with "new" status', async () => {
            mockSingleResult = { data: { ...mockApplication, id: 'new-app' }, error: null }

            const { result } = renderHook(() => useCreateApplication(), {
                wrapper: TestWrapper,
            })

            const newAppData = {
                needy_person_id: 'needy-1',
                application_type: 'cash',
                description: 'Monthly support',
                priority: 'medium'
            }

            result.current.mutate(newAppData as Parameters<typeof result.current.mutate>[0])

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['insert']?.[0][0]).toMatchObject({
                ...newAppData,
                status: 'new'
            })
        })
    })

    // ------------------------------------------
    // useUpdateApplication Tests
    // ------------------------------------------
    describe('useUpdateApplication', () => {
        it('should update application status and data', async () => {
            mockSingleResult = { data: { ...mockApplication, status: 'approved' }, error: null }

            const { result } = renderHook(() => useUpdateApplication(), {
                wrapper: TestWrapper,
            })

            result.current.mutate({
                id: 'app-1',
                values: { status: 'approved', description: 'Updated' }
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['update']?.[0][0]).toMatchObject({
                status: 'approved',
                description: 'Updated'
            })
            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === 'app-1')).toBe(true)
        })
    })
})
