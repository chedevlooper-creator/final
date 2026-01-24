import { test as base, expect as baseExpect } from '@playwright/test'

/**
 * Yardım Yönetim Paneli - Custom Test Fixtures
 * Reusable test fixtures with authentication and utilities
 */

export type TestOptions = {
  testUser?: {
    email: string
    password: string
    role?: string
  }
}

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

// Tüm fixture'ları tek bir test objesinde birleştir
export const test = base.extend<{
  authenticatedPage: typeof base['page']
  adminPage: typeof base['page']
  moderatorPage: typeof base['page']
  viewerPage: typeof base['page']
}>({
  // Default authenticated page (admin)
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', requireEnv('TEST_ADMIN_EMAIL'))
    await page.fill('input[type="password"], input[name="password"]', requireEnv('TEST_ADMIN_PASSWORD'))
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/, { timeout: 15000 })
    await use(page)
  },

  // Admin user fixture
  adminPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', requireEnv('TEST_ADMIN_EMAIL'))
    await page.fill('input[type="password"], input[name="password"]', requireEnv('TEST_ADMIN_PASSWORD'))
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/, { timeout: 15000 })
    await use(page)
  },

  // Moderator user fixture
  moderatorPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', requireEnv('TEST_MODERATOR_EMAIL'))
    await page.fill('input[type="password"], input[name="password"]', requireEnv('TEST_MODERATOR_PASSWORD'))
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/, { timeout: 15000 })
    await use(page)
  },

  // Viewer user fixture
  viewerPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', requireEnv('TEST_USER_EMAIL'))
    await page.fill('input[type="password"], input[name="password"]', requireEnv('TEST_USER_PASSWORD'))
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/, { timeout: 15000 })
    await use(page)
  },
})

export const expect = baseExpect
