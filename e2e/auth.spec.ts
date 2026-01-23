import { test, expect } from './fixtures'

/**
 * Yardım Yönetim Paneli - Authentication Test Suite
 * Login, logout ve yetkilendirme testleri
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Her testten önce login sayfasına git
    await page.goto('/login')
  })

  test('should display login page correctly', async ({ page }) => {
    // Başlık kontrolü
    await expect(page).toHaveTitle(/Yardım Yönetim Paneli/)
    
    // Login formu elementleri
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    const submitButton = page.locator('button[type="submit"]')
    
    // Elementlerin görünür olduğunu kontrol et
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
    
    // Button text kontrolü
    await expect(submitButton).toContainText(/giriş|login/i)
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Formu boş gönder
    await page.click('button[type="submit"]')
    
    // Hata mesajlarını kontrol et
    const errorMessage = page.locator('text=required|zorunlu|gerekli')
    await expect(errorMessage).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Geçersiz bilgilerle dene
    await page.fill('input[type="email"], input[name="email"]', 'wrong@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Hata mesajını kontrol et
    const errorToast = page.locator('[role="alert"], .error, .toast-error')
    await expect(errorToast).toBeVisible({ timeout: 5000 })
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Not: Bu test için geçerli bir kullanıcı gerekli
    // Demo amaçlı, gerçek testlerde test kullanıcısı kullanın
    
    // Email alanını doldur
    await page.fill('input[type="email"], input[name="email"]', 'admin@example.com')
    
    // Şifre alanını doldur
    await page.fill('input[type="password"], input[name="password"]', 'admin123')
    
    // Submit butonuna tıkla
    await page.click('button[type="submit"]')
    
    // Dashboard'a yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Dashboard başlığını kontrol et
    const dashboardHeading = page.locator('h1, .dashboard-title')
    await expect(dashboardHeading).toBeVisible()
  })

  test('should remember user with "remember me" option', async ({ page }) => {
    // Remember me checkbox'ı işaretle
    const rememberMeCheckbox = page.locator('input[type="checkbox"]')
    await rememberMeCheckbox.check()
    
    // Login yap
    await page.fill('input[type="email"], input[name="email"]', 'admin@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Login başarılı
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Sayfayı yenile
    await page.reload()
    
    // Hala giriş yapmış olmalı
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should logout successfully', async ({ page }) {
    // Önce login ol
    await page.fill('input[type="email"], input[name="email"]', 'admin@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Logout butonuna tıkla
    const logoutButton = page.locator('button:has-text("çıkış"), button:has-text("logout"), [data-testid="logout-button"]')
    await logoutButton.click()
    
    // Login sayfasına yönlendirildiğini kontrol et
    await expect(page).toHaveURL(/.*login/)
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Doğrudan protected route'a git
    await page.goto('/dashboard/needy')
    
    // Login sayfasına yönlendirilmeli
    await expect(page).toHaveURL(/.*login/)
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]')
    const toggleButton = page.locator('button[aria-label*="password"], .password-toggle')
    
    // Şifre gir
    await passwordInput.fill('test123')
    
    // Toggle butonuna tıkla (eğer varsa)
    const toggleExists = await toggleButton.count() > 0
    if (toggleExists) {
      await toggleButton.click()
      
      // Şifre görünür olmalı
      await expect(page.locator('input[type="text"]')).toBeVisible()
      
      // Tekrar tıkla
      await toggleButton.click()
      
      // Şifre tekrar gizli olmalı
      await expect(passwordInput).toBeVisible()
    }
  })
})

test.describe('Password Reset', () => {
  test('should show password reset form', async ({ page }) => {
    await page.goto('/login')
    
    // "Forgot password" linkine tıkla
    const forgotPasswordLink = page.locator('a:has-text("şifremi unuttum"), a:has-text("forgot password")')
    const linkExists = await forgotPasswordLink.count() > 0
    
    if (linkExists) {
      await forgotPasswordLink.click()
      
      // Password reset formu görünmeli
      const resetForm = page.locator('form, [data-testid="password-reset-form"]')
      await expect(resetForm).toBeVisible()
    }
  })

  test('should send password reset email', async ({ page }) => {
    await page.goto('/login')
    
    const forgotPasswordLink = page.locator('a:has-text("şifremi unuttum"), a:has-text("forgot password")')
    const linkExists = await forgotPasswordLink.count() > 0
    
    if (linkExists) {
      await forgotPasswordLink.click()
      
      // Email gir
      await page.fill('input[type="email"]', 'admin@example.com')
      
      // Submit et
      await page.click('button[type="submit"]')
      
      // Başarı mesajı görünmeli
      const successMessage = page.locator('text=gönderildi|text=sent|text=email')
      await expect(successMessage).toBeVisible()
    }
  })
})
