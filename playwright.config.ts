import { defineConfig, devices } from '@playwright/test'

/**
 * Yardım Yönetim Paneli - Playwright E2E Test Konfigürasyonu
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test dosyalarının konumu
  testDir: './e2e',
  
  // Testleri paralel çalıştır
  fullyParallel: true,
  
  // CI ortamında 'only' içeren testleri engelle
  forbidOnly: !!process.env.CI,
  
  // CI ortamında 2 kez dene
  retries: process.env.CI ? 2 : 0,
  
  // Worker sayısı (CI'da 1, lokalde undefined)
  workers: process.env.CI ? 1 : undefined,
  
  // Test raporlayıcı
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Paylaşılan ayarlar
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',
    
    // Screenshot ayarları
    screenshot: 'only-on-failure',
    
    // Video kaydı
    video: 'retain-on-failure',
    
    // Trace (hata ayıklama için)
    trace: 'on-first-retry',
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Farklı tarayıcılarda test çalıştırma
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testler
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet testler
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Development server'ı başlat
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 dakika
  },
})
