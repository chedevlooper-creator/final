import { test, expect } from './fixtures'

test.describe('Donations Module', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/donations')
  })

  test.describe('List View', () => {
    test('should display donations table', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('table')).toBeVisible()
      await expect(authenticatedPage.locator('tbody tr')).toHaveCount.greaterThan(0)
    })

    test('should display donation columns correctly', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('Bağışçı')).toBeVisible()
      await expect(authenticatedPage.getByText('Tutar')).toBeVisible()
      await expect(authenticatedPage.getByText('Tarih')).toBeVisible()
      await expect(authenticatedPage.getByText('Durum')).toBeVisible()
    })

    test('should filter donations by status', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Durum")')
      await authenticatedPage.click('text=Beklemede')
      
      const statusColumn = authenticatedPage.locator('tbody tr:first-child td:last-child')
      await expect(statusColumn).toContainText('Beklemede')
    })

    test('should search donations by donor name', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[placeholder*="Ara"]', 'Ahmet')
      await authenticatedPage.press('input[placeholder*="Ara"]', 'Enter')
      
      await authenticatedPage.waitForTimeout(500)
      const rows = authenticatedPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText('Ahmet', { timeout: 5000 })
      }
    })

    test('should paginate donations', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Sonraki")')
      await authenticatedPage.waitForURL(/.*page=2/)
    })
  })

  test.describe('Create Donation', () => {
    test('should open create donation dialog', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Bağış")')
      await expect(authenticatedPage.getByText('Yeni Bağış Ekle')).toBeVisible()
    })

    test('should create donation with valid data', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Bağış")')
      
      await authenticatedPage.fill('input[name="donorName"]', 'Test Bağışçı')
      await authenticatedPage.fill('input[name="amount"]', '500')
      await authenticatedPage.selectOption('select[name="type"]', 'Nakit')
      await authenticatedPage.fill('textarea[name="note"]', 'Test bağış notu')
      
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Bağış başarıyla eklendi')).toBeVisible()
      await expect(authenticatedPage.getByText('Test Bağışçı')).toBeVisible()
    })

    test('should validate required fields', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Bağış")')
      
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Bu alan zorunludur')).toBeVisible()
    })

    test('should validate amount format', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Bağış")')
      
      await authenticatedPage.fill('input[name="amount"]', 'abc')
      
      await expect(authenticatedPage.getByText('Geçerli bir tutar girin')).toBeVisible()
    })
  })

  test.describe('Update Donation', () => {
    test('should open edit dialog', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      await expect(authenticatedPage.getByText('Bağışı Düzenle')).toBeVisible()
    })

    test('should update donation amount', async ({ authenticatedPage }) => {
      const firstRow = authenticatedPage.locator('tbody tr:first-child')
      const originalAmount = await firstRow.locator('td:nth-child(2)').textContent()
      
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      await authenticatedPage.fill('input[name="amount"]', '1000')
      await authenticatedPage.click('button:has-text("Güncelle")')
      
      await expect(authenticatedPage.getByText('Bağış güncellendi')).toBeVisible()
      await expect(authenticatedPage.locator('tbody tr:first-child')).toContainText('1000')
    })

    test('should update donation status', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      await authenticatedPage.selectOption('select[name="status"]', 'Onaylandı')
      await authenticatedPage.click('button:has-text("Güncelle")')
      
      await expect(authenticatedPage.getByText('Bağış güncellendi')).toBeVisible()
      await expect(authenticatedPage.locator('tbody tr:first-child')).toContainText('Onaylandı')
    })
  })

  test.describe('Delete Donation', () => {
    test('should show delete confirmation', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Sil")')
      await expect(authenticatedPage.getByText('Bu bağışı silmek istediğinizden emin misiniz?')).toBeVisible()
    })

    test('should delete donation', async ({ authenticatedPage }) => {
      const rowsBefore = await authenticatedPage.locator('tbody tr').count()
      
      await authenticatedPage.click('tbody tr:first-child button:has-text("Sil")')
      await authenticatedPage.click('button:has-text("Evet, Sil")')
      
      await expect(authenticatedPage.getByText('Bağış silindi')).toBeVisible()
      
      const rowsAfter = await authenticatedPage.locator('tbody tr').count()
      expect(rowsAfter).toBeLessThan(rowsBefore)
    })
  })

  test.describe('Export Functionality', () => {
    test('should export to Excel', async ({ authenticatedPage }) => {
      const downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button:has-text("Excel")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.xlsx')
    })

    test('should export to PDF', async ({ authenticatedPage }) => {
      const downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button:has-text("PDF")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.pdf')
    })
  })

  test.describe('Statistics', () => {
    test('should display total donations', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText(/Toplam Bağış/)).toBeVisible()
      const amountText = await authenticatedPage.getByText(/₺/).first().textContent()
      expect(amountText).toBeTruthy()
    })

    test('should display monthly chart', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('canvas')).toBeVisible()
    })
  })

  test.describe('Permissions', () => {
    test('should hide create button for viewer role', async ({ viewerPage }) => {
      await viewerPage.goto('/donations')
      await expect(viewerPage.locator('button:has-text("Yeni Bağış")')).not.toBeVisible()
    })

    test('should hide edit/delete buttons for viewer role', async ({ viewerPage }) => {
      await viewerPage.goto('/donations')
      await expect(viewerPage.locator('button:has-text("Düzenle")')).not.toBeVisible()
      await expect(viewerPage.locator('button:has-text("Sil")')).not.toBeVisible()
    })
  })
})
