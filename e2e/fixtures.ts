import { test as base } from '@playwright/test'

/**
 * Yardım Yönetim Paneli - Custom Test Fixtures
 * Reusable test fixtures with authentication and utilities
 */

export type TestOptions = {
  // Test kullanıcısı bilgileri
  testUser?: {
    email: string
    password: string
    role?: string
  }
}

// Authenticated page fixture
export const test = base.extend<{
  authenticatedPage: any
}>({
  authenticatedPage: async ({ page }, use) => {
    // Login işlemi
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', 'admin@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/, { timeout: 10000 })
    
    // Page'i kullan
    await use(page)
  },
})

// Admin user fixture
export const adminTest = base.extend<{
  adminPage: any
}>({
  adminPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/)
    
    await use(page)
  },
})

// Moderator user fixture
export const moderatorTest = base.extend<{
  moderatorPage: any
}>({
  moderatorPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'moderator@example.com')
    await page.fill('input[type="password"]', 'moderator123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/)
    
    await use(page)
  },
})

// Viewer user fixture
export const viewerTest = base.extend<{
  viewerPage: any
}>({
  viewerPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'viewer@example.com')
    await page.fill('input[type="password"]', 'viewer123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*dashboard/)
    
    await use(page)
  },
})

// Screenshot helper fixture
export const screenshotTest = base.extend<{
  screenshotHelper: any
}>({
  screenshotHelper: async ({ page }, use) => {
    const helper = {
      async takeScreenshot(name: string) {
        await page.screenshot({
          path: `screenshots/${name}.png`,
          fullPage: true
        })
      },
      
      async takeScreenshotOnError() {
        page.on('pageerror', async (error) => {
          const timestamp = new Date().toISOString()
          await page.screenshot({
            path: `screenshots/errors/${timestamp}.png`
          })
        })
      }
    }
    
    await use(helper)
  },
})

export const expect = base.expect
