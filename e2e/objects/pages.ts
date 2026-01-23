import { test, expect } from '@playwright/test'

/**
 * Yardım Yönetim Paneli - Page Object Models
 * Reusable page objects for E2E tests
 */

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"], input[name="email"]', email)
    await this.page.fill('input[type="password"], input[name="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL(/.*dashboard/, { timeout: 10000 })
  }

  async expectError() {
    const errorToast = this.page.locator('[role="alert"], .error, .toast-error')
    await expect(errorToast).toBeVisible({ timeout: 5000 })
  }

  async expectSuccess() {
    await expect(this.page).toHaveURL(/.*dashboard/)
  }
}

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/dashboard')
  }

  async expectVisible() {
    const heading = this.page.locator('h1')
    await expect(heading).toBeVisible()
  }

  async navigateTo(section: string) {
    const link = this.page.locator(`a:has-text("${section}"), [href*="${section}"]`)
    await link.first().click()
    await this.page.waitForTimeout(500)
  }

  async getStatsCardCount() {
    const statsCards = this.page.locator('[class*="stat"], [class*="card"], .metric')
    return await statsCards.count()
  }
}

export class NeedyPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/needy')
  }

  async search(query: string) {
    const searchInput = this.page.locator('input[placeholder*="ara"], input[placeholder*="search"]')
    const searchExists = await searchInput.count() > 0
    
    if (searchExists) {
      await searchInput.fill(query)
      await this.page.waitForTimeout(500)
    }
  }

  async openAddModal() {
    const addButton = this.page.locator('button:has-text("ekle"), button:has-text("yeni"), button:has-text("add")')
    await addButton.click()
    await this.page.waitForSelector('[role="dialog"], .modal', { state: 'visible' })
  }

  async fillForm(data: {
    firstName: string
    lastName: string
    phone?: string
    city?: string
  }) {
    await this.page.fill('input[name="firstName"], input[data-testid="first-name"]', data.firstName)
    await this.page.fill('input[name="lastName"], input[data-testid="last-name"]', data.lastName)
    
    if (data.phone) {
      await this.page.fill('input[name="phone"], input[data-testid="phone"]', data.phone)
    }
    
    if (data.city) {
      const citySelect = this.page.locator('select[name="city"], [data-testid="city-select"]')
      const cityExists = await citySelect.count() > 0
      
      if (cityExists) {
        await citySelect.selectOption({ index: 0 })
      }
    }
  }

  async submitForm() {
    const saveButton = this.page.locator('button:has-text("kaydet"), button:has-text("save"), button[type="submit"]')
    await saveButton.click()
  }

  async expectSuccess() {
    const successToast = this.page.locator('[class*="success"], [class*="toast-success"]')
    const toastExists = await successToast.count() > 0
    
    if (toastExists) {
      await expect(successToast.first()).toBeVisible()
    } else {
      const modal = this.page.locator('[role="dialog"], .modal')
      await expect(modal).not.toBeVisible({ timeout: 3000 })
    }
  }

  async clickFirstRow() {
    const firstRow = this.page.locator('tr, [class*="table-row"]').first()
    await firstRow.click()
    await this.page.waitForURL(/.*needy\/[a-f0-9-]+/)
  }

  async expectDetailView() {
    await expect(this.page).toHaveURL(/.*needy\/[a-f0-9-]+/)
    const details = this.page.locator('[class*="detail"], [class*="info"]')
    await expect(details.first()).toBeVisible()
  }
}

export class BasePage {
  constructor(private page: Page) {}

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `screenshots/${name}.png`,
      fullPage: true 
    })
  }

  async expectToast(message: string) {
    const toast = this.page.locator(`text=${message}`)
    await expect(toast).toBeVisible()
  }

  async waitForLoading() {
    const loading = this.page.locator('[class*="loading"], [class*="spinner"]')
    const loadingExists = await loading.count() > 0
    
    if (loadingExists) {
      await this.page.waitForSelector('[class*="loading"], [class*="spinner"]', { 
        state: 'hidden', 
        timeout: 5000 
      })
    }
  }

  async clickMenuButton(text: string) {
    const button = this.page.locator(`button:has-text("${text}")`)
    await button.click()
  }
}
