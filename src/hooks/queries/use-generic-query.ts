/**
 * Generic Query Hook
 * 
 * This hook provides a reusable pattern for all React Query hooks
 * to reduce code duplication and ensure consistent behavior.
 */

import { useQuery, useQueryClient, UseQueryOptions, useMutation, UseMutationOptions } from '@tanstack/react-query'
import { ErrorHandler } from '@/lib/errors'
import { toast } from 'sonner'
import type { QueryOptions, PaginatedResponse } from '@/types/common'

/**
 * Generic Query Hook Options
 */
export interface UseGenericQueryParams<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
}

/**
 * Generic Mutation Hook Options
 */
export interface UseGenericMutationParams<TData, TVariables, TError = Error> {
  mutationFn: (variables: TVariables) => Promise<TData>
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
  successMessage?: string
  errorMessage?: string
}

/**
 * Generic Query Hook
 * Provides consistent caching, retry logic, and error handling
 */
export function useGenericQuery<T>({
  queryKey,
  queryFn,
  options,
}: UseGenericQueryParams<T>) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode
        if (statusCode >= 400 && statusCode < 500) {
          return false
        }
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    ...options,
  })
}

/**
 * Generic Mutation Hook
 * Provides consistent mutation behavior with automatic toast notifications
 */
export function useGenericMutation<TData, TVariables, TError = Error>({
  mutationFn,
  options,
  successMessage = 'İşlem başarılı',
  errorMessage,
}: UseGenericMutationParams<TData, TVariables, TError>) {
  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage)
    },
    onError: (error: unknown) => {
      const message = errorMessage || ErrorHandler.handle(error)
      toast.error(message)
    },
    ...options,
  })
}

/**
 * Generic Paginated Query Hook
 * Handles paginated data with automatic refetch on page change
 */
export function useGenericPaginatedQuery<T>({
  queryKey,
  queryFn,
  options,
}: UseGenericQueryParams<PaginatedResponse<T>>) {
  return useQuery<PaginatedResponse<T>>({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 2, // 2 minutes for paginated data
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    ...options,
  })
}

/**
 * Create a query hook factory
 * Returns a typed hook for a specific resource
 */
export function createQueryHook<T>(
  resource: string,
  defaultQueryFn: (options: QueryOptions) => Promise<T>
) {
  return (queryOptions: QueryOptions = {}) => {
    // Create a stable key from options
    const optionsKey = JSON.stringify(queryOptions)
    
    return useGenericQuery<T>({
      queryKey: [resource, 'list', optionsKey],
      queryFn: () => defaultQueryFn(queryOptions),
      options: {
        enabled: true, // Always enabled by default
      },
    })
  }
}

/**
 * Create a mutation hook factory
 * Returns a typed mutation hook for a specific operation
 */
export function createMutationHook<TData, TVariables>(
  operation: string,
  defaultMutationFn: (variables: TVariables) => Promise<TData>,
  defaultSuccessMessage?: string
) {
  return (options?: Omit<UseGenericMutationParams<TData, TVariables>, 'mutationFn'>) => {
    return useGenericMutation<TData, TVariables>({
      mutationFn: defaultMutationFn,
      successMessage: defaultSuccessMessage || options?.successMessage,
      errorMessage: options?.errorMessage,
      options: options?.options,
    })
  }
}

/**
 * Optimistic Update Hook
 * Automatically updates cache before mutation completes
 * 
 * This is a hook that must be called within a React component or another hook.
 */
export function useOptimisticMutation<TData, TVariables>(
  queryKey: string[],
  mutationFn: (variables: TVariables) => Promise<TData[]>,
  updateFn: (oldData: TData[], variables: TVariables) => TData[]
) {
  const queryClient = useQueryClient()
  
  return useMutation<TData[], Error, TVariables, { previousData: TData[] | undefined }>({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData[]>(queryKey)

      // Optimistically update to the new value
      queryClient.setQueryData<TData[]>(queryKey, (old = []) => updateFn(old, variables))

      // Return context with previous value
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous value
      if (context?.previousData) {
        queryClient.setQueryData<TData[]>(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
