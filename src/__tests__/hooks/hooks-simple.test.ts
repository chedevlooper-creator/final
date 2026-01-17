import { describe, it, expect } from '@jest/globals'

describe('Hooks - useGenericQuery', () => {
  it('should export useGenericQuery', () => {
    const hooksModule = require('@/hooks/queries/use-generic-query')
    expect(hooksModule.useGenericQuery).toBeDefined()
  })

  it('should export factory functions', () => {
    const hooksModule = require('@/hooks/queries/use-generic-query')
    expect(hooksModule.createQueryHook).toBeDefined()
    expect(hooksModule.createMutationHook).toBeDefined()
  })

  it('should be a function', () => {
    const { useGenericQuery } = require('@/hooks/queries/use-generic-query')
    expect(typeof useGenericQuery).toBe('function')
  })

  it('createQueryHook should return a hook', () => {
    const { createQueryHook } = require('@/hooks/queries/use-generic-query')
    const hook = createQueryHook({
      queryKey: ['test'],
      queryFn: async () => ({ data: 'test' }),
    })
    expect(typeof hook).toBe('function')
  })

  it('createMutationHook should return a hook', () => {
    const { createMutationHook } = require('@/hooks/queries/use-generic-query')
    const hook = createMutationHook({
      mutationFn: async () => ({ success: true }),
    })
    expect(typeof hook).toBe('function')
  })
})

describe('Hooks Barrel Exports', () => {
  it('should export hooks from index', () => {
    const hooksModule = require('@/hooks/queries/index')
    expect(hooksModule).toBeDefined()
  })

  it('should have useGenericQuery export', () => {
    const hooksModule = require('@/hooks/queries/index')
    expect(hooksModule.useGenericQuery).toBeDefined()
  })
})
