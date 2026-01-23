'use client'

/**
 * CSP Nonce Provider
 *
 * Provides the CSP nonce to client components for use in inline scripts/styles.
 * This is used when implementing nonce-based Content Security Policy.
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { NonceProvider } from '@/components/providers/nonce-provider'
 *
 * export default function RootLayout({ children }) {
 *   const nonce = headers().get('x-nonce') || ''
 *   return (
 *     <NonceProvider nonce={nonce}>
 *       {children}
 *     </NonceProvider>
 *   )
 * }
 * ```
 */

import { createContext, useContext, ReactNode } from 'react'

interface NonceContextValue {
  nonce: string
}

const NonceContext = createContext<NonceContextValue>({ nonce: '' })

export interface NonceProviderProps {
  children: ReactNode
  nonce: string
}

export function NonceProvider({ children, nonce }: NonceProviderProps) {
  return (
    <NonceContext.Provider value={{ nonce }}>
      {children}
    </NonceContext.Provider>
  )
}

/**
 * Hook to access the CSP nonce in client components
 */
export function useCSPNonce(): string {
  return useContext(NonceContext).nonce
}

/**
 * Get the nonce attribute for inline scripts/styles
 * Usage: <script nonce={getNonce()} />
 */
export function getNonceAttribute(nonce: string): { nonce: string } | {} {
  return nonce ? { nonce } : {}
}
