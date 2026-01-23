import { test, expect } from './fixtures'

test.describe('Applications Module', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/applications')
  })

  test.describe('List View', () => {
    test('should display applications table', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('table')).toBeVisible()
      await expect(authenticatedPage.locator('tbody tr')).toHaveCount.greaterThan(0)
    })

    test('should display application columns', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('Başvuran')).toBeVisible()
      await expect(authenticatedPage.getByText('Yardım Tipi')).toBeVisible()
      await expect(authenticatedPage.getByText('Tarih')).toBeVisible()
      await expect(authenticatedPage.getByText('Durum')).toBeVisible()
    })

    test('should filter by status', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Durum")')
      await authenticatedPage.click('text=Beklemede')
      
      const firstRowStatus = authenticatedPage.locator('tbody tr:first-child td:last-child')
      await expect(firstRowStatus).toContainText('Beklemede')
    })

    test('should filter by aid type', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yardım Tipi")')
      await authenticatedPage.click('text=Gıda')
      
      const rows = authenticatedPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Gıda')
      }
    })

    test('should search applications by applicant name', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[placeholder*="Ara"]', 'Mehmet')
      await authenticatedPage.press('input[placeholder*="Ara"]', 'Enter')
      
      await authenticatedPage.waitForTimeout(500)
      const rows = authenticatedPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText('Mehmet')
      }
    })
  })

  test.describe('Application Details', () => {
    test('should show application details in modal', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child')
      await expect(authenticatedPage.getByText('Başvuru Detayları')).toBeVisible()
      await expect(authenticatedPage.getByText('Başvuran Bilgileri')).toBeVisible()
      await expect(authenticatedPage.getByText('Yardım Talebi')).toBeVisible()
    })

    test('should display application history', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child')
      await expect(authenticatedPage.getByText('İşlem Geçmişi')).toBeVisible()
      await expect(authenticatedPage.locator('.timeline-item')).toHaveCount.greaterThan(0)
    })

    test('should display attached documents', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child')
      const docsSection = authenticatedPage.locator('text=Ekli Belgeler')
      if (await docsSection.isVisible()) {
        await expect(authenticatedPage.locator('.document-link')).toHaveCount.greaterThan(0)
      }
    })
  })

  test.describe('Approval Workflow', () => {
    test('should approve application', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Onayla")')
      
      await expect(authenticatedPage.getByText('Başvuruyu Onayla')).toBeVisible()
      
      await authenticatedPage.fill('textarea[name="note"]', 'Başvuru incelendi ve onaylandı')
      await authenticatedPage.click('button:has-text("Onayla")')
      
      await expect(authenticatedPage.getByText('Başvuru onaylandı')).toBeVisible()
      
      const status = authenticatedPage.locator('tbody tr:first-child td:last-child')
      await expect(status).toContainText('Onaylandı')
    })

    test('should reject application', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Reddet")')
      
      await expect(authenticatedPage.getByText('Başvuruyu Reddet')).toBeVisible()
      
      await authenticatedPage.fill('textarea[name="reason"]', 'Gerekli belgeler eksik')
      await authenticatedPage.click('button:has-text("Reddet")')
      
      await expect(authenticatedPage.getByText('Başvuru reddedildi')).toBeVisible()
      
      const status = authenticatedPage.locator('tbody tr:first-child td:last-child')
      await expect(status).toContainText('Reddedildi')
    })

    test('should require rejection reason', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Reddet")')
      
      await authenticatedPage.click('button:has-text("Reddet")')
      
      await expect(authenticatedPage.getByText('Reddetme nedeni zorunludur')).toBeVisible()
    })

    test('should put application on hold', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Bekle")')
      
      await expect(authenticatedPage.getByText('Başvuru Bekleme Alındı')).toBeVisible()
      
      const status = authenticatedPage.locator('tbody tr:first-child td:last-child')
      await expect(status).toContainText('Beklemede')
    })
  })

  test.describe('Batch Operations', () => {
    test('should select multiple applications', async ({ authenticatedPage }) => {
      await authenticatedPage.check('tbody tr:first-child input[type="checkbox"]')
      await authenticatedPage.check('tbody tr:nth-child(2) input[type="checkbox"]')
      
      await expect(authenticatedPage.locator('input[type="checkbox"]:checked')).toHaveCount(2)
    })

    test('should bulk approve applications', async ({ authenticatedPage }) => {
      await authenticatedPage.check('tbody tr:first-child input[type="checkbox"]')
      await authenticatedPage.check('tbody tr:nth-child(2) input[type="checkbox"]')
      
      await authenticatedPage.click('button:has-text("Seçilenleri Onayla")')
      await authenticatedPage.click('button:has-text("Evet, Onayla")')
      
      await expect(authenticatedPage.getByText('2 başvuru onaylandı')).toBeVisible()
    })

    test('should bulk reject applications', async ({ authenticatedPage }) => {
      await authenticatedPage.check('tbody tr:first-child input[type="checkbox"]')
      await authenticatedPage.check('tbody tr:nth-child(2) input[type="checkbox"]')
      
      await authenticatedPage.click('button:has-text("Seçilenleri Reddet")')
      await authenticatedPage.fill('textarea[name="reason"]', 'Toplu red işlemi')
      await authenticatedPage.click('button:has-text("Reddet")')
      
      await expect(authenticatedPage.getByText('2 başvuru reddedildi')).toBeVisible()
    })
  })

  test.describe('Create Application', () => {
    test('should open create application dialog', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Başvuru")')
      await expect(authenticatedPage.getByText('Yeni Yardım Başvurusu')).toBeVisible()
    })

    test('should create application with valid data', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Başvuru")')
      
      await authenticatedPage.fill('input[name="applicantName"]', 'Test Başvuran')
      await authenticatedPage.fill('input[name="phone"]', '5551234567')
      await authenticatedPage.selectOption('select[name="aidType"]', 'Gıda')
      await authenticatedPage.fill('textarea[name="description"]', 'Test başvuru açıklaması')
      
      await authenticatedPage.click('button:has-text("Başvuru Oluştur")')
      
      await expect(authenticatedPage.getByText('Başvuru oluşturuldu')).toBeVisible()
    })
  })

  test.describe('Statistics & Reports', () => {
    test('should display application statistics', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText(/Toplam Başvuru/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Bekleyen/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Onaylanan/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Reddedilen/)).toBeVisible()
    })

    test('should display application chart', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('canvas')).toBeVisible()
    })

    test('should export applications report', async ({ authenticatedPage }) => {
      const downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button:has-text("Rapor Al")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.(xlsx|pdf)$/)
    })
  })

  test.describe('Notifications', () => {
    test('should notify on new application', async ({ authenticatedPage }) => {
      // Create new application
      await authenticatedPage.goto('/applications/new')
      await authenticatedPage.fill('input[name="applicantName"]', 'Notification Test')
      await authenticatedPage.fill('input[name="phone"]', '5559999999')
      await authenticatedPage.selectOption('select[name="aidType"]', 'Nakit')
      await authenticatedPage.click('button:has-text("Başvuru Oluştur")')
      
      // Check notification
      await authenticatedPage.goto('/applications')
      await expect(authenticatedPage.locator('.notification-badge')).toHaveText(/\d+/)
    })
  })

  test.describe('Permissions', () => {
    test('should allow moderator to approve', async ({ moderatorPage }) => {
      await moderatorPage.goto('/applications')
      await expect(moderatorPage.locator('button:has-text("Onayla")')).toBeVisible()
    })

    test('should not allow viewer to approve', async ({ viewerPage }) => {
      await viewerPage.goto('/applications')
      await expect(viewerPage.locator('button:has-text("Onayla")')).not.toBeVisible()
      await expect(viewerPage.locator('button:has-text("Reddet")')).not.toBeVisible()
    })
  })

  test.describe('Mobile Responsive', () => {
    test('should display correctly on mobile', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })
      await authenticatedPage.goto('/applications')
      
      await expect(authenticatedPage.locator('table')).not.toBeVisible()
      await expect(authenticatedPage.locator('.mobile-card')).toHaveCount.greaterThan(0)
    })
  })
})
