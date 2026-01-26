import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
    useDonationsList,
    useDonationDetail,
    useCreateDonation,
    useUpdateDonation,
    useDonationStats,
    useBulkDeleteDonations,
} from '../use-donations'

// ============================================
// Test Data
// ============================================
const mockDonation = {
    id: '1',
    amount: 1000,
    donation_type: 'nakdi',
    payment_status: 'completed',
    donor_name: 'Test Donor',
    donor_phone: '555-1234',
    donor_email: 'donor@test.com',
    category: { id: '1', name: 'Gıda' },
    created_at: '2024-01-01T00:00:00Z',
}

const mockDonationsList = [mockDonation]

// ============================================
// Mock Setup - Flexible chain that tracks calls
// ============================================
let mockQueryResult: { data: unknown[]; error: unknown; count: number } = {
    data: mockDonationsList,
    error: null,
    count: 1
}
let mockSingleResult: { data: unknown; error: unknown } = {
    data: mockDonation,
    error: null
}
let mockDeleteResult: { error: unknown } = { error: null }

const methodCalls: Record<string, unknown[][]> = {}

const createMockChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}

    const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'or', 'gte', 'lte', 'order']
    chainMethods.forEach(method => {
        chain[method] = (...args: unknown[]) => {
            if (!methodCalls[method]) methodCalls[method] = []
            methodCalls[method].push(args)
            return chain
        }
    })

    // Terminal methods that return promises
    chain['range'] = (...args: unknown[]) => {
        if (!methodCalls['range']) methodCalls['range'] = []
        methodCalls['range'].push(args)
        return Promise.resolve(mockQueryResult)
    }

    chain['single'] = () => Promise.resolve(mockSingleResult)

    return chain
}

// For delete chain specifically
const createDeleteChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}

    chain['in'] = (...args: unknown[]) => {
        if (!methodCalls['in']) methodCalls['in'] = []
        methodCalls['in'].push(args)
        return Promise.resolve(mockDeleteResult)
    }

    return chain
}

const mockSupabase = {
    from: vi.fn((_table: string) => {
        const baseChain = createMockChain()
        // Override delete to return deleteChain
        baseChain['delete'] = () => createDeleteChain() as unknown as typeof baseChain
        return baseChain
    }),
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
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    })

function TestWrapper({ children }: { children: ReactNode }) {
    const queryClient = createTestQueryClient()
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('use-donations', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset call tracking
        Object.keys(methodCalls).forEach(key => delete methodCalls[key])
        // Reset mock results
        mockQueryResult = { data: mockDonationsList, error: null, count: 1 }
        mockSingleResult = { data: mockDonation, error: null }
        mockDeleteResult = { error: null }
    })

    // ------------------------------------------
    // useDonationsList Tests
    // ------------------------------------------
    describe('useDonationsList', () => {
        it('should return initial loading state', () => {
            const { result } = renderHook(() => useDonationsList(), {
                wrapper: TestWrapper,
            })

            expect(result.current.isLoading).toBe(true)
        })

        it('should fetch donations list successfully', async () => {
            const { result } = renderHook(() => useDonationsList(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data?.data).toEqual(mockDonationsList)
            expect(result.current.data?.count).toBe(1)
        })

        it('should apply type filter', async () => {
            const { result } = renderHook(() => useDonationsList({ donation_type: 'nakdi' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['eq']).toBeDefined()
            expect(methodCalls['eq']?.some(call => call[0] === 'donation_type' && call[1] === 'nakdi')).toBe(true)
        })

        it('should apply status filter', async () => {
            const { result } = renderHook(() => useDonationsList({ payment_status: 'completed' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['eq']?.some(call => call[0] === 'payment_status' && call[1] === 'completed')).toBe(true)
        })

        it('should apply date range filter', async () => {
            const { result } = renderHook(
                () => useDonationsList({
                    date_from: '2024-01-01',
                    date_to: '2024-12-31',
                }),
                { wrapper: TestWrapper }
            )

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['gte']?.some(call => call[0] === 'created_at')).toBe(true)
            expect(methodCalls['lte']?.some(call => call[0] === 'created_at')).toBe(true)
        })

        it('should apply search filter', async () => {
            const { result } = renderHook(() => useDonationsList({ search: 'Test' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['or']).toBeDefined()
        })

        it('should handle pagination correctly', async () => {
            mockQueryResult = { data: mockDonationsList, error: null, count: 100 }

            const { result } = renderHook(
                () => useDonationsList({ page: 2, limit: 10 }),
                { wrapper: TestWrapper }
            )

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['range']?.[0]).toEqual([20, 29])
            expect(result.current.data?.totalPages).toBe(10)
        })

        it('should handle errors', async () => {
            mockQueryResult = { data: [], error: new Error('Database error'), count: 0 }

            const { result } = renderHook(() => useDonationsList(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    // ------------------------------------------
    // useDonationDetail Tests
    // ------------------------------------------
    describe('useDonationDetail', () => {
        it('should not fetch when id is empty', () => {
            const { result } = renderHook(() => useDonationDetail(''), {
                wrapper: TestWrapper,
            })

            expect(result.current.fetchStatus).toBe('idle')
        })

        it('should fetch donation detail when id is provided', async () => {
            mockSingleResult = { data: { ...mockDonation, aid_distribution: [] }, error: null }

            const { result } = renderHook(() => useDonationDetail('1'), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === '1')).toBe(true)
        })

        it('should handle detail fetch error', async () => {
            mockSingleResult = { data: null, error: new Error('Not found') }

            const { result } = renderHook(() => useDonationDetail('999'), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    // ------------------------------------------
    // useCreateDonation Tests
    // ------------------------------------------
    describe('useCreateDonation', () => {
        it('should create donation successfully', async () => {
            const newDonation = {
                amount: 500,
                donation_type: 'cash' as const,
                donor_name: 'New Donor',
                currency: 'TRY' as const,
            }

            mockSingleResult = { data: { id: '2', ...newDonation }, error: null }

            const queryClient = createTestQueryClient()
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            const { result } = renderHook(() => useCreateDonation(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            })

            result.current.mutate(newDonation)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(invalidateSpy).toHaveBeenCalled()
        })

        it('should handle creation error', async () => {
            mockSingleResult = { data: null, error: new Error('Validation error') }

            const { result } = renderHook(() => useCreateDonation(), {
                wrapper: TestWrapper,
            })

            result.current.mutate({
                amount: 100,
                donation_type: 'cash',
                currency: 'TRY',
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    // ------------------------------------------
    // useUpdateDonation Tests
    // ------------------------------------------
    describe('useUpdateDonation', () => {
        it('should update donation successfully', async () => {
            mockSingleResult = { data: { ...mockDonation, amount: 2000 }, error: null }

            const queryClient = createTestQueryClient()

            const { result } = renderHook(() => useUpdateDonation(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            })

            result.current.mutate({
                id: '1',
                values: { amount: 2000 },
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
        })

        it('should handle update error', async () => {
            mockSingleResult = { data: null, error: new Error('Update failed') }

            const queryClient = createTestQueryClient()

            const { result } = renderHook(() => useUpdateDonation(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            })

            result.current.mutate({
                id: '1',
                values: { amount: 2000 },
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })

    // ------------------------------------------
    // useDonationStats Tests
    // ------------------------------------------
    describe('useDonationStats', () => {
        it('should fetch donation stats', async () => {
            // Override the mock to handle stats queries
            const originalFrom = mockSupabase.from
            mockSupabase.from = vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: [{ amount: 100 }, { amount: 200 }],
                    error: null,
                    count: 2,
                }),
            }))

            const { result } = renderHook(() => useDonationStats(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toBeDefined()
            expect(result.current.data?.today).toBeDefined()

            // Restore original mock
            mockSupabase.from = originalFrom
        })
    })

    // ------------------------------------------
    // useBulkDeleteDonations Tests
    // ------------------------------------------
    describe('useBulkDeleteDonations', () => {
        it('should delete multiple donations', async () => {
            const queryClient = createTestQueryClient()
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            const { result } = renderHook(() => useBulkDeleteDonations(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            })

            result.current.mutate(['1', '2', '3'])

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['in']?.[0]).toEqual(['id', ['1', '2', '3']])
            expect(invalidateSpy).toHaveBeenCalled()
        })

        it('should handle bulk delete error', async () => {
            mockDeleteResult = { error: new Error('Delete failed') }

            const { result } = renderHook(() => useBulkDeleteDonations(), {
                wrapper: TestWrapper,
            })

            result.current.mutate(['1', '2'])

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })
        })
    })
})
