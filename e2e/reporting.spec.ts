import { test, expect } from './fixtures'

const runFull = process.env['E2E_RUN_FULL'] === 'true'
const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

test.describe('Reporting Module', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    if (!runFull) {
      test.skip(true, 'E2E_RUN_FULL not set')
    }
    await authenticatedPage.goto('/reports')
  })

  test.describe('Dashboard Overview', () => {
    test('should display reports dashboard', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('Raporlama Paneli')).toBeVisible()
      await expect(authenticatedPage.locator('section[class*="stat-card"]')).toHaveCount.greaterThan(0)
    })

    test('should display key metrics', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText(/Toplam Bağış/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Toplam Dağıtım/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Aktif Gönüllü/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Yardım Alan/)).toBeVisible()
    })

    test('should display quick reports', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('Hızlı Raporlar')).toBeVisible()
      await expect(authenticatedPage.getByText('Aylık Özet')).toBeVisible()
      await expect(authenticatedPage.getByText('Bağış Raporu')).toBeVisible()
      await expect(authenticatedPage.getByText('Dağıtım Raporu')).toBeVisible()
    })
  })

  test.describe('Donation Reports', () => {
    test('should generate donation summary report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      
      await expect(authenticatedPage.getByText('Bağış Raporu Oluştur')).toBeVisible()
      
      // Set date range
      await authenticatedPage.fill('input[name="startDate"]', '2026-01-01')
      await authenticatedPage.fill('input[name="endDate"]', '2026-01-31')
      
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Rapor oluşturuldu')).toBeVisible()
    })

    test('should filter donations by type', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      
      await authenticatedPage.selectOption('select[name="donationType"]', 'Nakit')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.locator('table')).toBeVisible()
      await expect(authenticatedPage.getByText('Nakit')).toBeVisible()
    })

    test('should display donation trends chart', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.locator('canvas')).toBeVisible()
    })

    test('should export donation report to PDF', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      const downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button:has-text("PDF İndir")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.pdf')
    })

    test('should export donation report to Excel', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      const downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button:has-text("Excel İndir")')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.xlsx')
    })
  })

  test.describe('Distribution Reports', () => {
    test('should generate distribution report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dağıtım Raporu")')
      
      await expect(authenticatedPage.getByText('Dağıtım Raporu Oluştur')).toBeVisible()
      
      await authenticatedPage.fill('input[name="startDate"]', '2026-01-01')
      await authenticatedPage.fill('input[name="endDate"]', '2026-01-31')
      
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Rapor oluşturuldu')).toBeVisible()
    })

    test('should filter by distribution type', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dağıtım Raporu")')
      
      await authenticatedPage.selectOption('select[name="distributionType"]', 'Gıda')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Gıda')).toBeVisible()
    })

    test('should display distribution by region', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dağıtım Raporu")')
      await authenticatedPage.click('input[type="checkbox"][name="groupByRegion"]')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Bölge')).toBeVisible()
    })
  })

  test.describe('Application Reports', () => {
    test('should generate application status report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Başvuru Raporu")')
      
      await expect(authenticatedPage.getByText('Başvuru Raporu Oluştur')).toBeVisible()
      
      await authenticatedPage.selectOption('select[name="status"]', 'Onaylandı')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Onaylanan Başvurular')).toBeVisible()
    })

    test('should display application conversion funnel', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Başvuru Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.locator('.funnel-chart')).toBeVisible()
    })
  })

  test.describe('Volunteer Reports', () => {
    test('should generate volunteer activity report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Gönüllü Raporu")')
      
      await expect(authenticatedPage.getByText('Gönüllü Raporu Oluştur')).toBeVisible()
      
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Gönüllü Aktiviteleri')).toBeVisible()
    })

    test('should display volunteer performance metrics', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Gönüllü Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText(/Toplam Görev/)).toBeVisible()
      await expect(authenticatedPage.getByText(/Tamamlanan/)).toBeVisible()
    })
  })

  test.describe('Custom Reports', () => {
    test('should create custom report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Özel Rapor")')
      
      await expect(authenticatedPage.getByText('Özel Rapor Oluştur')).toBeVisible()
      
      // Select data sources
      await authenticatedPage.click('input[type="checkbox"][name="donations"]')
      await authenticatedPage.click('input[type="checkbox"][name="distributions"]')
      
      // Select fields
      await authenticatedPage.click('input[type="checkbox"][name="amount"]')
      await authenticatedPage.click('input[type="checkbox"][name="date"]')
      await authenticatedPage.click('input[type="checkbox"][name="type"]')
      
      await authenticatedPage.fill('input[name="reportName"]', 'Test Özel Rapor')
      
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.getByText('Rapor oluşturuldu')).toBeVisible()
    })

    test('should save custom report template', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Özel Rapor")')
      
      await authenticatedPage.click('input[type="checkbox"][name="donations"]')
      await authenticatedPage.fill('input[name="reportName"]', 'Kaydedilen Rapor')
      
      await authenticatedPage.click('button:has-text("Şablonu Kaydet")')
      
      await expect(authenticatedPage.getByText('Şablon kaydedildi')).toBeVisible()
    })

    test('should load saved report template', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Kaydedilen Şablonlar")')
      
      await expect(authenticatedPage.locator('.template-item')).toHaveCount.greaterThan(0)
      
      await authenticatedPage.click('.template-item:first-child')
      
      await expect(authenticatedPage.getByText('Şablon yüklendi')).toBeVisible()
    })
  })

  test.describe('Scheduled Reports', () => {
    test('should create scheduled report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Zamanlanmış Rapor")')
      
      await expect(authenticatedPage.getByText('Zamanlanmış Rapor Oluştur')).toBeVisible()
      
      await authenticatedPage.fill('input[name="reportName"]', 'Haftalık Rapor')
      await authenticatedPage.selectOption('select[name="frequency"]', 'Haftalık')
      await authenticatedPage.selectOption('select[name="reportType"]', 'Bağış Özeti')
      await authenticatedPage.fill('input[name="recipients"]', requireEnv('TEST_ADMIN_EMAIL'))
      
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Zamanlanmış rapor oluşturuldu')).toBeVisible()
    })

    test('should list scheduled reports', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Zamanlanmış Raporlar")')
      
      await expect(authenticatedPage.getByText('Zamanlanmış Raporlar')).toBeVisible()
      await expect(authenticatedPage.locator('table')).toBeVisible()
    })

    test('should edit scheduled report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Zamanlanmış Raporlar")')
      await authenticatedPage.click('tbody tr:first-child button:has-text("Düzenle")')
      
      await authenticatedPage.selectOption('select[name="frequency"]', 'Aylık')
      await authenticatedPage.click('button:has-text("Güncelle")')
      
      await expect(authenticatedPage.getByText('Rapor güncellendi')).toBeVisible()
    })

    test('should delete scheduled report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Zamanlanmış Raporlar")')
      
      const rowsBefore = await authenticatedPage.locator('tbody tr').count()
      
      await authenticatedPage.click('tbody tr:first-child button:has-text("Sil")')
      await authenticatedPage.click('button:has-text("Evet, Sil")')
      
      const rowsAfter = await authenticatedPage.locator('tbody tr').count()
      expect(rowsAfter).toBeLessThan(rowsBefore)
    })
  })

  test.describe('Report Visualization', () => {
    test('should display charts and graphs', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await expect(authenticatedPage.locator('canvas')).toHaveCount.greaterThan(0)
    })

    test('should toggle between chart types', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await authenticatedPage.click('button:has-text("Çubuk Grafik")')
      await expect(authenticatedPage.locator('.bar-chart')).toBeVisible()
      
      await authenticatedPage.click('button:has-text("Pasta Grafik")')
      await expect(authenticatedPage.locator('.pie-chart')).toBeVisible()
      
      await authenticatedPage.click('button:has-text("Çizgi Grafik")')
      await expect(authenticatedPage.locator('.line-chart')).toBeVisible()
    })

    test('should display data table', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      await authenticatedPage.click('button:has-text("Tablo Görünümü")')
      
      await expect(authenticatedPage.locator('table')).toBeVisible()
    })
  })

  test.describe('Report Export', () => {
    test('should export to multiple formats', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      // PDF
      let downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button[title="PDF"]')
      let download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.pdf')
      
      // Excel
      downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button[title="Excel"]')
      download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.xlsx')
      
      // CSV
      downloadPromise = authenticatedPage.waitForEvent('download')
      await authenticatedPage.click('button[title="CSV"]')
      download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.csv')
    })

    test('should email report', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await authenticatedPage.click('button:has-text("E-posta")')
      
      await authenticatedPage.fill('input[name="recipients"]', 'test@example.com')
      await authenticatedPage.fill('input[name="subject"]', 'Test Raporu')
      await authenticatedPage.fill('textarea[name="message"]', 'Test raporu ektedir')
      
      await authenticatedPage.click('button:has-text("Gönder")')
      
      await expect(authenticatedPage.getByText('Rapor gönderildi')).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should generate report within reasonable time', async ({ authenticatedPage }) => {
      const startTime = Date.now()
      
      await authenticatedPage.click('button:has-text("Bağış Raporu")')
      await authenticatedPage.click('button:has-text("Oluştur")')
      
      await authenticatedPage.waitForSelector('table')
      const endTime = Date.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(5000) // 5 seconds
    })
  })

  test.describe('Permissions', () => {
    test('should allow admin to create reports', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/reports')
      await expect(authenticatedPage.locator('button:has-text("Özel Rapor")')).toBeVisible()
      await expect(authenticatedPage.locator('button:has-text("Zamanlanmış Rapor")')).toBeVisible()
    })

    test('should allow moderator to view reports', async ({ moderatorPage }) => {
      await moderatorPage.goto('/reports')
      await expect(moderatorPage.locator('button:has-text("Bağış Raporu")')).toBeVisible()
      await expect(moderatorPage.locator('button:has-text("Dağıtım Raporu")')).toBeVisible()
    })

    test('should allow viewer to view reports only', async ({ viewerPage }) => {
      await viewerPage.goto('/reports')
      await expect(viewerPage.locator('button:has-text("Bağış Raporu")')).toBeVisible()
      await expect(viewerPage.locator('button:has-text("Özel Rapor")')).not.toBeVisible()
    })
  })
})
