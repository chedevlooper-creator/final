/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
    useFinanceTransactions,
    useFinanceTransactionDetail,
    useFinanceSummary,
    useCreateFinanceTransaction,
    useUpdateFinanceTransaction,
    useDeleteFinanceTransaction,
} from '../use-finance'

// ============================================
// Test Data
// ============================================
const mockTransaction = {
    id: 'ft-1',
    transaction_number: 'GEL-20240101-1234',
    type: 'income',
    category: 'donation',
    amount: 1000,
    currency: 'TRY',
    account_type: 'cash',
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

const mockTransactionsList = [mockTransaction]

// ============================================
// Mock Setup
// ============================================
let mockQueryResult: { data: unknown[]; error: unknown; count: number } = {
    data: mockTransactionsList,
    error: null,
    count: 1
}
let mockSingleResult: { data: unknown; error: unknown } = {
    data: mockTransaction,
    error: null
}

const methodCalls: Record<string, unknown[][]> = {}

const createMockChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}

    const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'gte', 'lte']
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
        return finalChain
    }

    finalChain.single = () => {
        // single() is usually a terminal method in our usage
        // but we can make it return a promise or the chain with custom then
        return Promise.resolve(mockSingleResult)
    }

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

describe('use-finance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.keys(methodCalls).forEach(key => delete methodCalls[key])
        mockQueryResult = { data: mockTransactionsList, error: null, count: 1 }
        mockSingleResult = { data: mockTransaction, error: null }
    })

    // ------------------------------------------
    // useFinanceTransactions Tests
    // ------------------------------------------
    describe('useFinanceTransactions', () => {
        it('should fetch transactions list successfully', async () => {
            const { result } = renderHook(() => useFinanceTransactions(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data?.data).toEqual(mockTransactionsList)
        })

        it('should apply filters correctly', async () => {
            renderHook(() => useFinanceTransactions({
                type: 'income',
                account_type: 'cash',
                category: 'donation'
            }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['eq']?.some(call => call[0] === 'type' && call[1] === 'income')).toBe(true)
                expect(methodCalls['eq']?.some(call => call[0] === 'account_type' && call[1] === 'cash')).toBe(true)
                expect(methodCalls['eq']?.some(call => call[0] === 'category' && call[1] === 'donation')).toBe(true)
            })
        })

        it('should handle pagination', async () => {
            renderHook(() => useFinanceTransactions({ page: 1, limit: 10 }), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(methodCalls['range']?.[0]).toEqual([10, 19])
            })
        })
    })

    // ------------------------------------------
    // useFinanceSummary Tests
    // ------------------------------------------
    describe('useFinanceSummary', () => {
        it('should fetch and calculate correctly', async () => {
            // Mock parallel calls results
            mockSupabase.from.mockImplementation((table: string) => {
                const chain: any = createMockChain()
                chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
                    // Simplest mock: return 500 for any data list
                    return Promise.resolve(onFulfilled({ data: [{ amount: 500, type: 'income' }] }))
                }
                return chain
            })

            const { result } = renderHook(() => useFinanceSummary(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const summary = result.current.data
            expect(summary?.totalIncome).toBe(500)
            expect(summary?.netBalance).toBeDefined()
        })
    })

    // ------------------------------------------
    // useCreateFinanceTransaction Tests
    // ------------------------------------------
    describe('useCreateFinanceTransaction', () => {
        it('should create a transaction with generated number', async () => {
            mockSingleResult = { data: { ...mockTransaction, id: 'new-ft' }, error: null }

            const { result } = renderHook(() => useCreateFinanceTransaction(), {
                wrapper: TestWrapper,
            })

            const input = {
                type: 'income' as const,
                category: 'donation',
                amount: 250,
                account_type: 'cash' as const,
            }

            result.current.mutate(input)

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['insert']?.[0][0]).toMatchObject({
                ...input,
                transaction_number: expect.stringMatching(/GEL-\d{8}-\d{4}/)
            })
        })
    })

    // ------------------------------------------
    // useUpdateFinanceTransaction Tests
    // ------------------------------------------
    describe('useUpdateFinanceTransaction', () => {
        it('should update record correctly', async () => {
            mockSingleResult = { data: { ...mockTransaction, description: 'Updated' }, error: null }

            const { result } = renderHook(() => useUpdateFinanceTransaction(), {
                wrapper: TestWrapper,
            })

            result.current.mutate({ id: 'ft-1', values: { description: 'Updated' } })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['update']?.[0][0]).toMatchObject({ description: 'Updated' })
        })
    })

    // ------------------------------------------
    // useDeleteFinanceTransaction Tests
    // ------------------------------------------
    describe('useDeleteFinanceTransaction', () => {
        it('should delete record correctly', async () => {
            const { result } = renderHook(() => useDeleteFinanceTransaction(), {
                wrapper: TestWrapper,
            })

            result.current.mutate('ft-1')

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(methodCalls['delete']).toBeDefined()
            expect(methodCalls['eq']?.some(call => call[0] === 'id' && call[1] === 'ft-1')).toBe(true)
        })
    })
})
