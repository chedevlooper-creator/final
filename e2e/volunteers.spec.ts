import { test, expect } from './fixtures'

test.describe('Volunteers Module', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/volunteers')
  })

  test.describe('List View', () => {
    test('should display volunteers table', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('table')).toBeVisible()
      await expect(authenticatedPage.locator('tbody tr')).toHaveCount.greaterThan(0)
    })

    test('should display volunteer columns', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('İsim')).toBeVisible()
      await expect(authenticatedPage.getByText('Telefon')).toBeVisible()
      await expect(authenticatedPage.getByText('E-posta')).toBeVisible()
      await expect(authenticatedPage.getByText('Durum')).toBeVisible()
      await expect(authenticatedPage.getByText('Uzmanlık')).toBeVisible()
    })

    test('should filter by status', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Durum")')
      await authenticatedPage.click('text=Aktif')
      
      const firstRowStatus = authenticatedPage.locator('tbody tr:first-child td:nth-child(4)')
      await expect(firstRowStatus).toContainText('Aktif')
    })

    test('should filter by skill', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Uzmanlık")')
      await authenticatedPage.click('text=Dağıtım')
      
      const rows = authenticatedPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Dağıtım')
      }
    })

    test('should search volunteers by name', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[placeholder*="Ara"]', 'Ayşe')
      await authenticatedPage.press('input[placeholder*="Ara"]', 'Enter')
      
      await authenticatedPage.waitForTimeout(500)
      const rows = authenticatedPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText('Ayşe')
      }
    })
  })

  test.describe('Create Volunteer', () => {
    test('should open create dialog', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Gönüllü")')
      await expect(authenticatedPage.getByText('Yeni Gönüllü Ekle')).toBeVisible()
    })

    test('should create volunteer with valid data', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Gönüllü")')
      
      await authenticatedPage.fill('input[name="firstName"]', 'Test')
      await authenticatedPage.fill('input[name="lastName"]', 'Gönüllü')
      await authenticatedPage.fill('input[name="email"]', 'test@example.com')
      await authenticatedPage.fill('input[name="phone"]', '5551234567')
      await authenticatedPage.selectOption('select[name="status"]', 'Aktif')
      
      // Select skills
      await authenticatedPage.click('input[type="checkbox"][value="distribution"]')
      await authenticatedPage.click('input[type="checkbox"][value="collection"]')
      
      await authenticatedPage.fill('textarea[name="notes"]', 'Test gönüllü notları')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Gönüllü başarıyla eklendi')).toBeVisible()
      await expect(authenticatedPage.getByText('Test Gönüllü')).toBeVisible()
    })

    test('should validate required fields', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Gönüllü")')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Bu alan zorunludur')).toBeVisible()
    })

    test('should validate email format', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Gönüllü")')
      await authenticatedPage.fill('input[name="email"]', 'invalid-email')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Geçerli bir e-posta girin')).toBeVisible()
    })

    test('should validate phone format', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Gönüllü")')
      await authenticatedPage.fill('input[name="phone"]', '123')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Geçerli bir telefon numarası girin')).toBeVisible()
    })
  })

  test.describe('Update Volunteer', () => {
    test('should open edit dialog', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      await expect(authenticatedPage.getByText('Gönüllü Bilgilerini Düzenle')).toBeVisible()
    })

    test('should update volunteer information', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      
      await authenticatedPage.fill('input[name="phone"]', '5559999999')
      await authenticatedPage.selectOption('select[name="status"]', 'Pasif')
      await authenticatedPage.click('button:has-text("Güncelle")')
      
      await expect(authenticatedPage.getByText('Gönüllü güncellendi')).toBeVisible()
      await expect(authenticatedPage.locator('tbody tr:first-child')).toContainText('5559999999')
      await expect(authenticatedPage.locator('tbody tr:first-child')).toContainText('Pasif')
    })

    test('should update volunteer skills', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      
      await authenticatedPage.click('input[type="checkbox"][value="delivery"]')
      await authenticatedPage.click('button:has-text("Güncelle")')
      
      await expect(authenticatedPage.getByText('Gönüllü güncellendi')).toBeVisible()
    })
  })

  test.describe('Delete Volunteer', () => {
    test('should show delete confirmation', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Sil")')
      await expect(authenticatedPage.getByText('Bu gönüllüyü silmek istediğinizden emin misiniz?')).toBeVisible()
    })

    test('should delete volunteer', async ({ authenticatedPage }) => {
      const rowsBefore = await authenticatedPage.locator('tbody tr').count()
      
      await authenticatedPage.click('tbody tr:first-child button:has-text("Sil")')
      await authenticatedPage.click('button:has-text("Evet, Sil")')
      
      await expect(authenticatedPage.getByText('Gönüllü silindi')).toBeVisible()
      
      const rowsAfter = await authenticatedPage.locator('tbody tr').count()
      expect(rowsAfter).toBeLessThan(rowsBefore)
    })
  })

  test.describe('Volunteer Profile', () => {
    test('should display volunteer profile', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child')
      await expect(authenticatedPage.getByText('Gönüllü Profili')).toBeVisible()
      await expect(authenticatedPage.getByText('İletişim Bilgileri')).toBeVisible()
      await expect(authenticatedPage.getByText('Uzmanlık Alanları')).toBeVisible()
    })

    test('should display volunteer activity history', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child')
      await expect(authenticatedPage.getByText('Aktivite Geçmişi')).toBeVisible()
    })

    test('should display volunteer statistics', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child')
      await expect(authenticatedPage.getByText(/Toplam Aktivite/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Son Aktivite/)).toBeVisible()
    })
  })

  test.describe('Skill Management', () => {
    test('should display all available skills', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Yeni Gönüllü")')
      
      await expect(authenticatedPage.getByText('Dağıtım')).toBeVisible()
      await expect(authenticatedPage.getByText('Toplama')).toBeVisible()
      await expect(authenticatedPage.getByText('Teslimat')).toBeVisible()
      await expect(authenticatedPage.getByText('Lojistik')).toBeVisible()
      await expect(authenticatedPage.getByText('İletişim')).toBeVisible()
    })

    test('should filter volunteers by skill', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Uzmanlık")')
      await authenticatedPage.click('text=Lojistik')
      
      const rows = authenticatedPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText('Lojistik')
      }
    })
  })

  test.describe('Assignment Management', () => {
    test('should assign task to volunteer', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Görev Ata")')
      
      await expect(authenticatedPage.getByText('Görev Ata')).toBeVisible()
      await authenticatedPage.selectOption('select[name="task"]', 'Dağıtım')
      await authenticatedPage.fill('input[name="date"]', '2026-01-30')
      await authenticatedPage.fill('textarea[name="notes"]', 'Test görevi')
      await authenticatedPage.click('button:has-text("Ata")')
      
      await expect(authenticatedPage.getByText('Görev atandı')).toBeVisible()
    })

    test('should view volunteer tasks', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Görevler")')
      
      await expect(authenticatedPage.getByText('Görev Listesi')).toBeVisible()
    })
  })

  test.describe('Availability Management', () => {
    test('should set volunteer availability', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Uygunluk")')
      
      await expect(authenticatedPage.getByText('Uygunluk Ayarları')).toBeVisible()
      
      await authenticatedPage.click('input[type="checkbox"][name="monday"]')
      await authenticatedPage.click('input[type="checkbox"][name="wednesday"]')
      await authenticatedPage.click('input[type="checkbox"][name="friday"]')
      
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Uygunluk güncellendi')).toBeVisible()
    })
  })

  test.describe('Communication', () => {
    test('should send message to volunteer', async ({ authenticatedPage }) => {
      await authenticatedPage.click('tbody tr:first-child button:has-text("Mesaj")')
      
      await expect(authenticatedPage.getByText('Mesaj Gönder')).toBeVisible()
      await authenticatedPage.fill('textarea[name="message"]', 'Test mesajı')
      await authenticatedPage.click('button:has-text("Gönder")')
      
      await expect(authenticatedPage.getByText('Mesaj gönderildi')).toBeVisible()
    })

    test('should send bulk message', async ({ authenticatedPage }) => {
      await authenticatedPage.check('tbody tr:first-child input[type="checkbox"]')
      await authenticatedPage.check('tbody tr:nth-child(2) input[type="checkbox"]')
      
      await authenticatedPage.click('button:has-text("Toplu Mesaj")')
      await authenticatedPage.fill('textarea[name="message"]', 'Toplu test mesajı')
      await authenticatedPage.click('button:has-text("Gönder")')
      
      await expect(authenticatedPage.getByText('Mesajlar gönderildi')).toBeVisible()
    })
  })

  test.describe('Statistics & Reports', () => {
    test('should display volunteer statistics', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText(/Toplam Gönüllü/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Aktif/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Pasif/)).toBeVisible()
    })

    test('should display skills distribution chart', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.locator('canvas')).toBeVisible()
    })

    test('should export volunteer list', async ({ authenticatedPage }) => {
      const downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button:has-text("Dışa Aktar")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv|pdf)$/)
    })
  })

  test.describe('Permissions', () => {
    test('should allow moderator to manage volunteers', async ({ moderatorPage }) => {
      await moderatorPage.goto('/volunteers')
      await expect(moderatorPage.locator('button:has-text("Yeni Gönüllü")')).toBeVisible()
      await expect(moderatorPage.locator('button:has-text("Düzenle")')).toBeVisible()
    })

    test('should not allow viewer to manage volunteers', async ({ viewerPage }) => {
      await viewerPage.goto('/volunteers')
      await expect(viewerPage.locator('button:has-text("Yeni Gönüllü")')).not.toBeVisible()
      await expect(viewerPage.locator('button:has-text("Düzenle")')).not.toBeVisible()
      await expect(viewerPage.locator('button:has-text("Sil")')).not.toBeVisible()
    })
  })

  test.describe('Mobile Responsive', () => {
    test('should display correctly on mobile', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })
      await authenticatedPage.goto('/volunteers')
      
      await expect(authenticatedPage.locator('table')).not.toBeVisible()
      await expect(authenticatedPage.locator('.mobile-card')).toHaveCount.greaterThan(0)
    })
  })
})
