import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Test helpers
export const createMockQueryClient = () => {
  return new QueryClient({
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
}

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createMockQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
}

export const mockNeedyPerson = {
  id: '1',
  first_name: 'Ahmet',
  last_name: 'Yılmaz',
  tc_kimlik: '12345678901',
  age: 45,
  nationality: 'TR',
  phone: '5551234567',
  city: 'Istanbul',
  status: 'active',
  category: 'Gida',
  created_at: '2024-01-01',
}

export const mockApplication = {
  id: '1',
  needy_person_id: '1',
  type: 'Gida',
  amount: 1000,
  status: 'pending',
  created_at: '2024-01-01',
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }
