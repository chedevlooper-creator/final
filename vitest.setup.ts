import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
// @ts-expect-error - Vitest global types
expect.extend(matchers)

// Cleanup after each test
// @ts-expect-error - Vitest global types
afterEach(() => {
  cleanup()
})
