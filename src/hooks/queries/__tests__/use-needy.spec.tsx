/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
    useNeedyList,
    useNeedyDetail,
    useCreateNeedy,
    useUpdateNeedy,
    useDeleteNeedy,
    useBulkUpdateNeedyStatus,
    useNeedyStats,
} from '../use-needy'

// ============================================
// Test Data
// ============================================
const mockNeedyPerson = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    identity_number: '12345678901',
    status: 'active',
    category: { id: 'cat-1', name: 'Gıda' },
    city: { id: 'city-1', name: 'İstanbul' },
    created_at: '2024-01-01T00:00:00Z',
}

const mockNeedyList = [mockNeedyPerson]

// ============================================
// Mock Setup - Flexible chain that tracks calls
// ============================================
let mockQueryResult: { data: unknown[]; error: unknown; count: number } = {
    data: mockNeedyList,
    error: null,
    count: 1
}
let mockSingleResult: { data: unknown; error: unknown } = {
    data: mockNeedyPerson,
    error: null
}
let mockDeleteResult: any = { error: null }
let mockUpdateResult: any = { data: mockNeedyPerson, error: null }

const methodCalls: Record<string, unknown[][]> = {}

const createMockChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}

    const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'or', 'gte', 'lte', 'order', 'not']
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

    // For update/insert/delete follow-up actions like select()
    const originalSelect = chain['select']
    chain['select'] = (...args: unknown[]) => {
        originalSelect(...args)
        return chain
    }

    return chain
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

describe('use-needy', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset call tracking
        Object.keys(methodCalls).forEach(key => delete methodCalls[key])
        // Reset mock results
        mockQueryResult = { data: mockNeedyList, error: null, count: 1 }
        mockSingleResult = { data: mockNeedyPerson, error: null }
        mockDeleteResult = { error: null }
    })

    // ------------------------------------------
    // useNeedyList Tests
    // ------------------------------------------
    describe('useNeedyList', () => {
        it('should fetch needy list successfully', async () => {
            const { result } = renderHook(() => useNeedyList(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data?.data).toEqual(mockNeedyList)
            expect(result.current.data?.count).toBe(1)
        })

        it('should apply search filter', async () => {
            renderHook(() => useNeedyList({ search: 'John' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['or']).toBeDefined()
                expect(methodCalls['or']?.[0][0]).toContain('John')
            })
        })

        it('should apply status filter', async () => {
            renderHook(() => useNeedyList({ status: 'active' }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['eq']?.some(call => call[0] === 'status' && call[1] === 'active')).toBe(true)
            })
        })

        it('should handle pagination', async () => {
            mockQueryResult = { data: mockNeedyList, error: null, count: 100 }

            const { result } = renderHook(() => useNeedyList({ page: 1, limit: 10 }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['range']?.[0]).toEqual([10, 19])
            expect(result.current.data?.totalPages).toBe(10)
        })
    })

    // ------------------------------------------
    // useNeedyDetail Tests
    // ------------------------------------------
    describe('useNeedyDetail', () => {
        it('should fetch detail when id is provided', async () => {
            const { result } = renderHook(() => useNeedyDetail('1'), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === '1')).toBe(true)
        })
    })

    // ------------------------------------------
    // useCreateNeedy Tests
    // ------------------------------------------
    describe('useCreateNeedy', () => {
        it('should create needy person successfully', async () => {
            mockSingleResult = { data: { ...mockNeedyPerson, id: '2' }, error: null }

            const { result } = renderHook(() => useCreateNeedy(), {
                wrapper: TestWrapper,
            })

            const newPerson = {
                first_name: 'Jane',
                last_name: 'Doe',
                identity_number: '98765432109',
            }

            result.current.mutate(newPerson as Parameters<typeof result.current.mutate>[0])

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['insert']).toBeDefined()
            expect(methodCalls['insert']?.[0][0]).toMatchObject({
                first_name: 'Jane',
                status: 'active'
            })
        })
    })

    // ------------------------------------------
    // useUpdateNeedy Tests
    // ------------------------------------------
    describe('useUpdateNeedy', () => {
        it('should update successfully', async () => {
            mockSingleResult = { data: { ...mockNeedyPerson, first_name: 'Updated' }, error: null }

            const { result } = renderHook(() => useUpdateNeedy(), {
                wrapper: TestWrapper,
            })

            result.current.mutate({ id: '1', values: { first_name: 'Updated' } })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['update']?.[0][0]).toMatchObject({ first_name: 'Updated' })
        })
    })

    // ------------------------------------------
    // useDeleteNeedy Tests
    // ------------------------------------------
    describe('useDeleteNeedy', () => {
        it('should delete successfully', async () => {
            mockDeleteResult = { error: null }

            const { result } = renderHook(() => useDeleteNeedy(), {
                wrapper: TestWrapper,
            })

            result.current.mutate('1')

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['delete']).toBeDefined()
            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === '1')).toBe(true)
        })
    })

    // ------------------------------------------
    // useBulkUpdateNeedyStatus Tests
    // ------------------------------------------
    describe('useBulkUpdateNeedyStatus', () => {
        it('should update multiple status', async () => {
            mockUpdateResult = { data: null, error: null }

            const { result } = renderHook(() => useBulkUpdateNeedyStatus(), {
                wrapper: TestWrapper,
            })

            result.current.mutate({ ids: ['1', '2'], status: 'passive' })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['in']?.[0]).toEqual(['id', ['1', '2']])
            expect(methodCalls['update']?.[0][0]).toMatchObject({ status: 'passive' })
        })
    })

    // ------------------------------------------
    // useNeedyStats Tests
    // ------------------------------------------
    describe('useNeedyStats', () => {
        it('should fetch stats', async () => {
            const { result } = renderHook(() => useNeedyStats(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            // stats parallel query check
            expect(result.current.data).toBeDefined()
            expect(result.current.data).toMatchObject({
                active: expect.any(Number),
                pending: expect.any(Number),
                total: expect.any(Number)
            })
        })
    })
})
