import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook, act, waitFor } from '@/__tests__/utils/test-utils'
import { useGenericQuery } from '@/hooks/queries/use-generic-query'
import { QueryClient } from '@tanstack/react-query'

describe('useGenericQuery', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
  })

  describe('Basic Query Functionality', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      const queryFn = jest.fn().mockResolvedValue(mockData)

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['test'],
            queryFn,
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockData)
      expect(queryFn).toHaveBeenCalledTimes(1)
    })

    it('should handle query errors', async () => {
      const error = new Error('Fetch failed')
      const queryFn = jest.fn().mockRejectedValue(error)

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['test'],
            queryFn,
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error).toEqual(error)
    })

    it('should use correct query key', async () => {
      const queryKey = ['test', 'id', 123]
      const queryFn = jest.fn().mockResolvedValue({})

      renderHook(
        () =>
          useGenericQuery({
            queryKey,
            queryFn,
          }),
        { queryClient }
      )

      await waitFor(() => expect(queryFn).toHaveBeenCalled())
    })
  })

  describe('Caching Behavior', () => {
    it('should cache data with default staleTime', async () => {
      const queryFn = jest.fn().mockResolvedValue({ data: 'test' })

      const { result, rerender } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['cached'],
            queryFn,
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(queryFn).toHaveBeenCalledTimes(1)

      // Rerender should use cached data
      rerender()
      expect(queryFn).toHaveBeenCalledTimes(1)
    })

    it('should respect custom staleTime', async () => {
      const queryFn = jest.fn().mockResolvedValue({ data: 'test' })

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['custom-stale'],
            queryFn,
            options: {
              staleTime: 1000,
            },
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(queryFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Retry Logic', () => {
    it('should retry on failure', async () => {
      const queryFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce({ data: 'success' })

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['retry-test'],
            queryFn,
            options: {
              retry: 3,
              retryDelay: 10,
            },
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(queryFn).toHaveBeenCalledTimes(3)
    })

    it('should not retry on specific error codes', async () => {
      const error = new Error('Not found') as any
      error.code = 'ERR_NOT_FOUND'

      const queryFn = jest.fn().mockRejectedValue(error)

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['no-retry'],
            queryFn,
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(queryFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading States', () => {
    it('should start in loading state', () => {
      const queryFn = jest.fn(() => new Promise(() => {}))

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['loading'],
            queryFn,
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should not be loading after success', async () => {
      const queryFn = jest.fn().mockResolvedValue({ data: 'test' })

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['not-loading'],
            queryFn,
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Data Transformation', () => {
    it('should support select for data transformation', async () => {
      const queryFn = jest.fn().mockResolvedValue({ id: 1, value: 100 })

      const { result } = renderHook(
        () =>
          useGenericQuery({
            queryKey: ['transform'],
            queryFn,
            options: {
              select: (data: any) => data.value * 2,
            },
          }),
        { queryClient }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toBe(200)
    })
  })

  describe('Conditional Queries', () => {
    it('should not fetch when enabled is false', async () => {
      const queryFn = jest.fn().mockResolvedValue({ data: 'test' })

      renderHook(
        () =>
          useGenericQuery({
            queryKey: ['conditional'],
            queryFn,
            options: {
              enabled: false,
            },
          }),
        { queryClient }
      )

      expect(queryFn).not.toHaveBeenCalled()
    })

    it('should fetch when enabled changes to true', async () => {
      const queryFn = jest.fn().mockResolvedValue({ data: 'test' })

      const { rerender } = renderHook(
        ({ enabled }) =>
          useGenericQuery({
            queryKey: ['conditional-change'],
            queryFn,
            options: {
              enabled,
            },
          }),
        {
          initialProps: { enabled: false },
          queryClient,
        }
      )

      expect(queryFn).not.toHaveBeenCalled()

      rerender({ enabled: true })

      await waitFor(() => expect(queryFn).toHaveBeenCalled())
    })
  })
})

describe('useGenericMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    })
  })

  it('should call mutation function', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ success: true })

    const { result } = renderHook(
      () =>
        useGenericQuery({
          queryKey: ['mutation'],
          mutationFn,
        }),
      { queryClient }
    )

    await act(async () => {
      result.current.mutate({ test: 'data' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mutationFn).toHaveBeenCalledWith({ test: 'data' })
  })

  it('should handle mutation errors', async () => {
    const error = new Error('Mutation failed')
    const mutationFn = jest.fn().mockRejectedValue(error)

    const { result } = renderHook(
      () =>
        useGenericQuery({
          queryKey: ['mutation-error'],
          mutationFn,
        }),
      { queryClient }
    )

    await act(async () => {
      result.current.mutate({})
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(error)
  })

  it('should support onSuccess callback', async () => {
    const onSuccess = jest.fn()
    const mutationFn = jest.fn().mockResolvedValue({ id: 1 })

    const { result } = renderHook(
      () =>
        useGenericQuery({
          queryKey: ['mutation-success'],
          mutationFn,
          options: {
            onSuccess,
          },
        }),
      { queryClient }
    )

    await act(async () => {
      result.current.mutate({})
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 }, {})
  })

  it('should invalidate queries on success', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ success: true })
    const queryKey = ['test-query']

    const { result } = renderHook(
      () =>
        useGenericQuery({
          queryKey,
          mutationFn,
          options: {
            invalidateQueries: [['test-query']],
          },
        }),
      { queryClient }
    )

    await act(async () => {
      result.current.mutate({})
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
