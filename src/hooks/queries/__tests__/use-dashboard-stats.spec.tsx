/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
    useDashboardStats,
    useMonthlyDonationTrend,
    useApplicationTypeDistribution,
    useCityDistribution,
    useRecentActivities,
} from '../use-dashboard-stats'

// ============================================
// Mock Setup
// ============================================
const methodCalls: Record<string, unknown[][]> = {}

const createMockChain = () => {
    const chain: Record<string, (...args: unknown[]) => unknown> = {}
    const chainMethods = ['select', 'eq', 'gte', 'lte', 'order', 'limit', 'not', 'in']

    chainMethods.forEach(method => {
        chain[method] = (...args: unknown[]) => {
            if (!methodCalls[method]) methodCalls[method] = []
            methodCalls[method].push(args)
            return chain
        }
    })

    // Default values for then/catch/finally to simulate a promise if needed
    // But here we'll use our terminal methods
    return chain
}

const mockSupabase = {
    from: vi.fn((_table: string) => {
        const chain = createMockChain() as any
        chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
            const result = { data: [], error: null, count: 0 }
            return Promise.resolve(onFulfilled(result))
        }

        return chain
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
            queries: { retry: false, gcTime: 0 },
        },
    })

function TestWrapper({ children }: { children: ReactNode }) {
    const queryClient = createTestQueryClient()
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('use-dashboard-stats', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.keys(methodCalls).forEach(key => delete methodCalls[key])
    })

    // ------------------------------------------
    // useDashboardStats Tests
    // ------------------------------------------
    describe('useDashboardStats', () => {
        it('should fetch all dashboard stats in parallel', async () => {
            // Mock different responses for different table queries
            mockSupabase.from.mockImplementation((table: string) => {
                const chain: any = createMockChain()
                chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
                    let result: Record<string, unknown> = { data: [], error: null, count: 0 }

                    if (table === 'needy_persons') result = { data: [], error: null, count: 100 }
                    if (table === 'applications') result = { data: [], error: null, count: 25 }
                    if (table === 'volunteers') result = { data: [], error: null, count: 10 }
                    if (table === 'donations') result = { data: [{ amount: 500 }, { amount: 1500 }], error: null, count: 50 }

                    return Promise.resolve(onFulfilled(result))
                }
                return chain
            })

            const { result } = renderHook(() => useDashboardStats(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const stats = result.current.data
            expect(stats?.totalNeedy).toBe(100)
            expect(stats?.pendingApplications).toBe(25)
            expect(stats?.activeVolunteers).toBe(10)
            expect(stats?.todayDonations).toBe(2000)
            expect(stats?.totalDonationCount).toBe(50)
        })
    })

    // ------------------------------------------
    // useMonthlyDonationTrend Tests
    // ------------------------------------------
    describe('useMonthlyDonationTrend', () => {
        it('should aggregate donations by month', async () => {
            const now = new Date()
            const currentMonth = now.toISOString().slice(0, 7)

            mockSupabase.from.mockImplementation(() => {
                const chain: any = createMockChain()
                chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
                    return Promise.resolve(onFulfilled({
                        data: [
                            { created_at: `${currentMonth}-01T10:00:00Z`, amount: 1000 },
                            { created_at: `${currentMonth}-15T12:00:00Z`, amount: 500 },
                        ],
                        error: null
                    }))
                }
                return chain
            })

            const { result } = renderHook(() => useMonthlyDonationTrend(3), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const trend = result.current.data
            expect(trend).toHaveLength(3)
            // The current month should be the last item in the result (i=0 in loop)
            const currentMonthTrend = trend?.find(t => t.month === currentMonth)
            expect(currentMonthTrend?.value).toBe(1500)
        })
    })

    // ------------------------------------------
    // useApplicationTypeDistribution Tests
    // ------------------------------------------
    describe('useApplicationTypeDistribution', () => {
        it('should count and sort application types', async () => {
            mockSupabase.from.mockImplementation(() => {
                const chain: any = createMockChain()
                chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
                    return Promise.resolve(onFulfilled({
                        data: [
                            { application_type: 'food' },
                            { application_type: 'food' },
                            { application_type: 'health' },
                        ],
                        error: null
                    }))
                }
                return chain
            })

            const { result } = renderHook(() => useApplicationTypeDistribution(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const distribution = result.current.data
            expect(distribution).toContainEqual(expect.objectContaining({ label: 'Gıda', value: 2 }))
            expect(distribution).toContainEqual(expect.objectContaining({ label: 'Sağlık', value: 1 }))
            // Should be sorted by value (descending)
            expect(distribution?.[0].label).toBe('Gıda')
        })
    })

    // ------------------------------------------
    // useCityDistribution Tests
    // ------------------------------------------
    describe('useCityDistribution', () => {
        it('should fetch cities and map names correctly', async () => {
            mockSupabase.from.mockImplementation((table: string) => {
                const chain: any = createMockChain()
                chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
                    if (table === 'needy_persons') {
                        return Promise.resolve(onFulfilled({
                            data: [{ city_id: 'city-1' }, { city_id: 'city-1' }, { city_id: 'city-2' }],
                            error: null
                        }))
                    }
                    if (table === 'cities') {
                        return Promise.resolve(onFulfilled({
                            data: [
                                { id: 'city-1', name: 'İstanbul' },
                                { id: 'city-2', name: 'Ankara' },
                            ],
                            error: null
                        }))
                    }
                    return Promise.resolve(onFulfilled({ data: [], error: null }))
                }
                return chain
            })

            const { result } = renderHook(() => useCityDistribution(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const distribution = result.current.data
            expect(distribution).toHaveLength(2)
            expect(distribution).toContainEqual(expect.objectContaining({ label: 'İstanbul', value: 2 }))
            expect(distribution).toContainEqual(expect.objectContaining({ label: 'Ankara', value: 1 }))
        })
    })

    // ------------------------------------------
    // useRecentActivities Tests
    // ------------------------------------------
    describe('useRecentActivities', () => {
        it('should combine and sort donations and aids', async () => {
            mockSupabase.from.mockImplementation((table: string) => {
                const chain: any = createMockChain()
                chain['then'] = (onFulfilled: (value: unknown) => unknown) => {
                    if (table === 'donations') {
                        return Promise.resolve(onFulfilled({
                            data: [{ id: 'd1', donor_name: 'Donor A', amount: 100, created_at: '2024-01-02T10:00:00Z' }],
                            error: null
                        }))
                    }
                    if (table === 'aids') {
                        return Promise.resolve(onFulfilled({
                            data: [{
                                id: 'a1',
                                aid_type: 'Gıda',
                                created_at: '2024-01-02T11:00:00Z',
                                needy_person: { first_name: 'John', last_name: 'Doe' }
                            }],
                            error: null
                        }))
                    }
                    return Promise.resolve(onFulfilled({ data: [], error: null }))
                }
                return chain
            })

            const { result } = renderHook(() => useRecentActivities(), {
                wrapper: TestWrapper,
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const activities = result.current.data
            expect(activities).toHaveLength(2)
            // Aid is more recent (11:00 vs 10:00) so it should be first
            expect(activities?.[0].type).toBe('aid')
            expect(activities?.[1].type).toBe('donation')
        })
    })
})
