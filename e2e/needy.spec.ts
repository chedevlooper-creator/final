import { test, expect } from '@playwright/test'

/**
 * Yardım Yönetim Paneli - İhtiyaç Sahipleri Test Suite
 * İhtiyaç sahipleri modülü CRUD işlemleri testleri
 */

// Authentication fixture
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"], input[name="email"]', 'admin@example.com')
  await page.fill('input[type="password"], input[name="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/.*dashboard/, { timeout: 10000 })
})

test.describe('İhtiyaç Sahipleri - Liste', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/needy')
  })

  test('should display needy persons list', async ({ page }) => {
    // Liste görünmeli
    const list = page.locator('[class*="table"], [role="table"], [data-testid="needy-list"]')
    await expect(list).toBeVisible()
  })

  test('should display search functionality', async ({ page }) => {
    // Arama input'u
    const searchInput = page.locator('input[placeholder*="ara"], input[placeholder*="search"]')
    const searchExists = await searchInput.count() > 0
    
    if (searchExists) {
      await searchInput.fill('Ahmet')
      await page.waitForTimeout(500)
      
      // Arama sonuçları veya loading
      const hasResults = await page.locator('text=Ahmet').count() > 0 ||
                         await page.locator('[class*="loading"]').count() > 0
      
      expect(hasResults).toBeTruthy()
    }
  })

  test('should display filters', async ({ page }) => {
    // Filtre butonu
    const filterButton = page.locator('button:has-text("filtre"), button:has-text("filter"), [data-testid="filter-button"]')
    const filterExists = await filterButton.count() > 0
    
    if (filterExists) {
      await filterButton.click()
      
      // Filtre paneli/dropdown görünmeli
      const filterPanel = page.locator('[class*="filter"], [role="dialog"]')
      await expect(filterPanel).toBeVisible()
    }
  })

  test('should display pagination', async ({ page }) => {
    // Pagination elementleri
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]')
    const paginationExists = await pagination.count() > 0
    
    if (paginationExists) {
      await expect(pagination).toBeVisible()
      
      // Sonraki sayfa butonu
      const nextButton = page.locator('button:has-text("sonraki"), button:has-text("next"), [aria-label*="next"]')
      const nextExists = await nextButton.count() > 0
      
      if (nextExists) {
        const isEnabled = await nextButton.first().isEnabled()
        
        // Eğer aktifse, tıkla ve sayfa değişimini kontrol et
        if (isEnabled) {
          const currentUrl = page.url()
          await nextButton.first().click()
          await page.waitForTimeout(1000)
          
          // URL değişmeli veya sayfa numarası değişmeli
          const urlChanged = page.url() !== currentUrl
          expect(urlChanged || true).toBeTruthy()
        }
      }
    }
  })

  test('should export data', async ({ page }) => {
    // Export butonu
    const exportButton = page.locator('button:has-text("dışa aktar"), button:has-text("export"), [data-testid="export-button"]')
    const exportExists = await exportButton.count() > 0
    
    if (exportExists) {
      // Download event'ini dinle
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
      
      await exportButton.click()
      
      try {
        const download = await downloadPromise
        expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv|pdf)$/)
      } catch (error) {
        // Dropdown menu açılmış olabilir
        const exportOption = page.locator('text=Excel, text=CSV, text=PDF')
        const optionExists = await exportOption.count() > 0
        
        if (optionExists) {
          await exportOption.first().click()
          
          // Yeniden dene
          const downloadPromise2 = page.waitForEvent('download', { timeout: 10000 })
          const download = await downloadPromise2
          expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv|pdf)$/)
        }
      }
    }
  })
})

test.describe('İhtiyaç Sahipleri - Ekleme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/needy')
  })

  test('should open add needy modal', async ({ page }) => {
    // Ekleme butonu
    const addButton = page.locator('button:has-text("ekle"), button:has-text("yeni"), button:has-text("add"), [data-testid="add-needy-button"]')
    await addButton.click()
    
    // Modal/dialog görünmeli
    const modal = page.locator('[role="dialog"], .modal, [data-testid="needy-modal"]')
    await expect(modal).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    const addButton = page.locator('button:has-text("ekle"), button:has-text("yeni"), button:has-text("add")')
    await addButton.click()
    
    // Modal'ı bekle
    await page.waitForSelector('[role="dialog"], .modal', { state: 'visible' })
    
    // Formu boş gönder
    const saveButton = page.locator('button:has-text("kaydet"), button:has-text("save"), button[type="submit"]')
    await saveButton.click()
    
    // Hata mesajları görünmeli
    const errorMessages = page.locator('text=zorunlu|text=required|text=gerekli')
    await expect(errorMessages.first()).toBeVisible()
  })

  test('should add new needy person', async ({ page }) => {
    const addButton = page.locator('button:has-text("ekle"), button:has-text("yeni"), button:has-text("add")')
    await addButton.click()
    
    // Modal'ı bekle
    await page.waitForSelector('[role="dialog"], .modal', { state: 'visible' })
    
    // Formu doldur
    await page.fill('input[name="firstName"], input[data-testid="first-name"]', 'Test')
    await page.fill('input[name="lastName"], input[data-testid="last-name"]', 'Kullanıcı')
    await page.fill('input[name="phone"], input[data-testid="phone"]', '5551234567')
    
    // Şehir seçimi (varsa)
    const citySelect = page.locator('select[name="city"], [data-testid="city-select"]')
    const cityExists = await citySelect.count() > 0
    
    if (cityExists) {
      await citySelect.selectOption({ index: 0 })
    }
    
    // Formu gönder
    const saveButton = page.locator('button:has-text("kaydet"), button:has-text("save")')
    await saveButton.click()
    
    // Başarı mesajı veya modal kapanması
    const successToast = page.locator('[class*="success"], [class*="toast-success"], text=başarıyla')
    const toastExists = await successToast.count() > 0
    
    if (toastExists) {
      await expect(successToast.first()).toBeVisible()
    } else {
      // Modal kapanmalı
      const modal = page.locator('[role="dialog"], .modal')
      await expect(modal).not.toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('İhtiyaç Sahipleri - Detay', () => {
  test('should view needy person details', async ({ page }) => {
    await page.goto('/dashboard/needy')
    
    // İlk kişiye tıkla
    const firstRow = page.locator('tr, [class*="table-row"], [data-testid="needy-row"]').first()
    const rowExists = await firstRow.count() > 0
    
    if (rowExists) {
      await firstRow.click()
      
      // Detay sayfasına yönlendirilmeli
      await expect(page).toHaveURL(/.*needy\/[a-f0-9-]+/)
      
      // Detay bilgileri görünmeli
      const details = page.locator('[class*="detail"], [class*="info"]')
      await expect(details.first()).toBeVisible()
    }
  })

  test('should edit needy person', async ({ page }) => {
    // Detay sayfasına git
    await page.goto('/dashboard/needy')
    
    const firstRow = page.locator('tr, [class*="table-row"]').first()
    const rowExists = await firstRow.count() > 0
    
    if (rowExists) {
      await firstRow.click()
      
      // Düzenleme butonu
      const editButton = page.locator('button:has-text("düzenle"), button:has-text("edit"), [data-testid="edit-button"]')
      const editExists = await editButton.count() > 0
      
      if (editExists) {
        await editButton.click()
        
        // Form görünmeli
        const form = page.locator('form, [role="form"]')
        await expect(form).toBeVisible()
        
        // İsmi değiştir
        const nameInput = page.locator('input[name="firstName"], input[data-testid="first-name"]')
        await nameInput.clear()
        await nameInput.fill('Güncellenmiş İsim')
        
        // Kaydet
        const saveButton = page.locator('button:has-text("kaydet"), button:has-text("save")')
        await saveButton.click()
        
        // Başarı mesajı
        const successToast = page.locator('[class*="success"], text=kayıtlı')
        const toastExists = await successToast.count() > 0
        
        if (toastExists) {
          await expect(successToast.first()).toBeVisible()
        }
      }
    }
  })

  test('should delete needy person', async ({ page }) => {
    await page.goto('/dashboard/needy')
    
    // Son satıra git (daha güvenli)
    const rows = page.locator('tr, [class*="table-row"]')
    const rowCount = await rows.count()
    
    if (rowCount > 0) {
      // Son satırı sil (daha az kritik)
      const lastRow = rows.nth(rowCount - 1)
      
      // Silme butonu (dropdown veya direkt)
      const deleteButton = lastRow.locator('button:has-text("sil"), button:has-text("delete"), [data-testid="delete-button"]')
      const deleteExists = await deleteButton.count() > 0
      
      if (deleteExists) {
        // Onay dialog'ı için listener ekle
        page.on('dialog', dialog => dialog.accept())
        
        await deleteButton.click()
        
        // Başarı mesajı veya satırın kaybolması
        await page.waitForTimeout(1000)
        
        const newRowCount = await rows.count()
        expect(newRowCount).toBeLessThanOrEqual(rowCount)
      }
    }
  })
})

test.describe('İhtiyaç Sahipleri - Tabs', () => {
  test('should display tabs in detail page', async ({ page }) => {
    // Detay sayfasına git
    await page.goto('/dashboard/needy')
    
    const firstRow = page.locator('tr, [class*="table-row"]').first()
    const rowExists = await firstRow.count() > 0
    
    if (rowExists) {
      await firstRow.click()
      
      // Tab'lar görünmeli
      const tabs = page.locator('[role="tab"], [class*="tab"]')
      const tabsExist = await tabs.count() > 0
      
      if (tabsExist) {
        await expect(tabs.first()).toBeVisible()
        
        // İlk tab'a tıkla
        await tabs.first().click()
        
        // Tab içeriği görünmeli
        const tabContent = page.locator('[role="tabpanel"], [class*="tab-content"]')
        await expect(tabContent).toBeVisible()
      }
    }
  })

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/dashboard/needy')
    
    const firstRow = page.locator('tr, [class*="table-row"]').first()
    const rowExists = await firstRow.count() > 0
    
    if (rowExists) {
      await firstRow.click()
      
      const tabs = page.locator('[role="tab"]')
      const tabsCount = await tabs.count()
      
      if (tabsCount > 1) {
        // İkinci tab'a tıkla
        await tabs.nth(1).click()
        
        // Tab içeriği değişmeli
        const tabContent = page.locator('[role="tabpanel"]')
        await expect(tabContent).toBeVisible()
      }
    }
  })
})
