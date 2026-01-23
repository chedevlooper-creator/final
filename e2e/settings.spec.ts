import { test, expect } from './fixtures'

test.describe('Settings Module', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings')
  })

  test.describe('General Settings', () => {
    test('should display general settings page', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByText('Genel Ayarlar')).toBeVisible()
    })

    test('should update organization name', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[name="organizationName"]', 'Test Yardım Derneği')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Ayarlar güncellendi')).toBeVisible()
    })

    test('should update contact email', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[name="contactEmail"]', 'contact@example.com')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Ayarlar güncellendi')).toBeVisible()
    })

    test('should update contact phone', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[name="contactPhone"]', '+90 555 123 4567')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Ayarlar güncellendi')).toBeVisible()
    })

    test('should validate email format', async ({ authenticatedPage }) => {
      await authenticatedPage.fill('input[name="contactEmail"]', 'invalid-email')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Geçerli bir e-posta girin')).toBeVisible()
    })
  })

  test.describe('Profile Settings', () => {
    test('should display profile settings', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Profil")')
      await expect(authenticatedPage.getByText('Profil Ayarları')).toBeVisible()
    })

    test('should update user profile', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Profil")')
      
      await authenticatedPage.fill('input[name="firstName"]', 'Test')
      await authenticatedPage.fill('input[name="lastName"]', 'Kullanıcı')
      await authenticatedPage.fill('input[name="email"]', 'testuser@example.com')
      
      await authenticatedPage.click('button:has-text("Güncelle")')
      
      await expect(authenticatedPage.getByText('Profil güncellendi')).toBeVisible()
    })

    test('should change password', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Profil")')
      await authenticatedPage.click('button:has-text("Şifre Değiştir")')
      
      await authenticatedPage.fill('input[name="currentPassword"]', 'admin123')
      await authenticatedPage.fill('input[name="newPassword"]', 'newPassword123')
      await authenticatedPage.fill('input[name="confirmPassword"]', 'newPassword123')
      
      await authenticatedPage.click('button:has-text("Değiştir")')
      
      await expect(authenticatedPage.getByText('Şifre değiştirildi')).toBeVisible()
    })

    test('should validate password confirmation', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Profil")')
      await authenticatedPage.click('button:has-text("Şifre Değiştir")')
      
      await authenticatedPage.fill('input[name="currentPassword"]', 'admin123')
      await authenticatedPage.fill('input[name="newPassword"]', 'newPassword123')
      await authenticatedPage.fill('input[name="confirmPassword"]', 'differentPassword')
      
      await authenticatedPage.click('button:has-text("Değiştir")')
      
      await expect(authenticatedPage.getByText('Şifreler eşleşmiyor')).toBeVisible()
    })

    test('should upload profile picture', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Profil")')
      
      const fileInput = authenticatedPage.locator('input[type="file"]')
      await fileInput.setInputFiles('/tmp/test-avatar.png')
      
      await expect(authenticatedPage.getByText('Profil fotoğrafı yüklendi')).toBeVisible()
    })
  })

  test.describe('User Management', () => {
    test('should display users list', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Kullanıcılar")')
      await expect(adminPage.getByText('Kullanıcı Yönetimi')).toBeVisible()
      await expect(adminPage.locator('table')).toBeVisible()
    })

    test('should create new user', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Kullanıcılar")')
      await adminPage.click('button:has-text("Yeni Kullanıcı")')
      
      await adminPage.fill('input[name="email"]', 'newuser@example.com')
      await adminPage.fill('input[name="firstName"]', 'Yeni')
      await adminPage.fill('input[name="lastName"]', 'Kullanıcı')
      await adminPage.selectOption('select[name="role"]', 'user')
      await adminPage.fill('input[name="password"]', 'password123')
      
      await adminPage.click('button:has-text("Oluştur")')
      
      await expect(adminPage.getByText('Kullanıcı oluşturuldu')).toBeVisible()
    })

    test('should edit user', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Kullanıcılar")')
      await adminPage.click('tbody tr:nth-child(2) button:has-text("Düzenle")')
      
      await adminPage.selectOption('select[name="role"]', 'moderator')
      await adminPage.click('button:has-text("Güncelle")')
      
      await expect(adminPage.getByText('Kullanıcı güncellendi')).toBeVisible()
    })

    test('should delete user', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Kullanıcılar")')
      
      const rowsBefore = await adminPage.locator('tbody tr').count()
      
      await adminPage.click('tbody tr:last-child button:has-text("Sil")')
      await adminPage.click('button:has-text("Evet, Sil")')
      
      const rowsAfter = await adminPage.locator('tbody tr').count()
      expect(rowsAfter).toBeLessThan(rowsBefore)
    })

    test('should filter users by role', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Kullanıcılar")')
      await adminPage.selectOption('select[name="roleFilter"]', 'moderator')
      
      const rows = adminPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText('Moderatör')
      }
    })

    test('should search users', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Kullanıcılar")')
      await adminPage.fill('input[placeholder*="Ara"]', 'admin')
      
      await adminPage.waitForTimeout(500)
      const rows = adminPage.locator('tbody tr')
      const count = await rows.count()
      
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText('admin')
      }
    })
  })

  test.describe('Role & Permissions', () => {
    test('should display roles list', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Roller")')
      await expect(adminPage.getByText('Rol ve İzin Yönetimi')).toBeVisible()
    })

    test('should display role permissions', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Roller")')
      await adminPage.click('text=Admin')
      
      await expect(adminPage.getByText('İzinler')).toBeVisible()
      await expect(adminPage.locator('input[type="checkbox"]:checked')).toHaveCount.greaterThan(0)
    })

    test('should create custom role', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Roller")')
      await adminPage.click('button:has-text("Yeni Rol")')
      
      await adminPage.fill('input[name="roleName"]', 'Test Rolü')
      await adminPage.fill('textarea[name="description"]', 'Test rolü açıklaması')
      
      // Select some permissions
      await adminPage.click('input[type="checkbox"][name="view_dashboard"]')
      await adminPage.click('input[type="checkbox"][name="view_needy"]')
      
      await adminPage.click('button:has-text("Oluştur")')
      
      await expect(adminPage.getByText('Rol oluşturuldu')).toBeVisible()
    })

    test('should update role permissions', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Roller")')
      await adminPage.click('text=Moderatör')
      
      await adminPage.click('input[type="checkbox"][name="manage_users"]')
      await adminPage.click('button:has-text("Güncelle")')
      
      await expect(adminPage.getByText('Rol güncellendi')).toBeVisible()
    })

    test('should delete custom role', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Roller")')
      
      const customRoleCount = await adminPage.locator('text=Test Rolü').count()
      if (customRoleCount > 0) {
        await adminPage.click('text=Test Rolü')
        await adminPage.click('button:has-text("Sil")')
        await adminPage.click('button:has-text("Evet, Sil")')
        
        await expect(adminPage.getByText('Rol silindi')).toBeVisible()
      }
    })
  })

  test.describe('Notification Settings', () => {
    test('should display notification settings', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bildirimler")')
      await expect(authenticatedPage.getByText('Bildirim Ayarları')).toBeVisible()
    })

    test('should enable email notifications', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bildirimler")')
      
      await authenticatedPage.click('input[type="checkbox"][name="emailNotifications"]')
      await authenticatedPage.click('input[type="checkbox"][name="newApplicationAlert"]')
      await authenticatedPage.click('input[type="checkbox"][name="donationAlert"]')
      
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Bildirim ayarları güncellendi')).toBeVisible()
    })

    test('should set notification frequency', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Bildirimler")')
      
      await authenticatedPage.selectOption('select[name="digestFrequency"]', 'daily')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Bildirim ayarları güncellendi')).toBeVisible()
    })
  })

  test.describe('Security Settings', () => {
    test('should display security settings', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Güvenlik")')
      await expect(adminPage.getByText('Güvenlik Ayarları')).toBeVisible()
    })

    test('should enable two-factor authentication', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Güvenlik")')
      await authenticatedPage.click('button:has-text("2FA Etkinleştir")')
      
      await expect(authenticatedPage.getByText('İki Faktörlü Kimlik Doğrulama')).toBeVisible()
    })

    test('should view active sessions', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Güvenlik")')
      await authenticatedPage.click('button:has-text("Aktif Oturumlar")')
      
      await expect(authenticatedPage.getByText('Oturum Geçmişi')).toBeVisible()
      await expect(authenticatedPage.locator('.session-item')).toHaveCount.greaterThan(0)
    })

    test('should revoke session', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Güvenlik")')
      await authenticatedPage.click('button:has-text("Aktif Oturumlar")')
      
      await authenticatedPage.click('.session-item:last-child button:has-text("İptal")')
      
      await expect(authenticatedPage.getByText('Oturum iptal edildi')).toBeVisible()
    })

    test('should view audit logs', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Güvenlik")')
      await adminPage.click('button:has-text("Denetim Günlüğü")')
      
      await expect(adminPage.getByText('Denetim Kayıtları')).toBeVisible()
      await expect(adminPage.locator('table')).toBeVisible()
    })

    test('should filter audit logs', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Güvenlik")')
      await adminPage.click('button:has-text("Denetim Günlüğü")')
      
      await adminPage.selectOption('select[name="actionType"]', 'login')
      await adminPage.click('button:has-text("Filtrele")')
      
      await expect(adminPage.locator('tbody tr')).toHaveCount.greaterThan(0)
    })
  })

  test.describe('System Settings', () => {
    test('should display system settings', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Sistem")')
      await expect(adminPage.getByText('Sistem Ayarları')).toBeVisible()
    })

    test('should view system information', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Sistem")')
      
      await expect(adminPage.getByText(/Versiyon/)).toBeVisible()
      await expect(adminPage.getByText(/Ortam/)).toBeVisible()
    })

    test('should configure backup settings', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Sistem")')
      await adminPage.click('button:has-text("Yedekleme")')
      
      await adminPage.selectOption('select[name="frequency"]', 'daily')
      await adminPage.click('button:has-text("Kaydet")')
      
      await expect(adminPage.getByText('Yedekleme ayarları güncellendi')).toBeVisible()
    })

    test('should create backup', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Sistem")')
      await adminPage.click('button:has-text("Yedekleme")')
      await adminPage.click('button:has-text("Yedek Oluştur")')
      
      await expect(adminPage.getByText('Yedek oluşturuluyor...')).toBeVisible()
      await expect(adminPage.getByText('Yedek oluşturuldu')).toBeVisible({ timeout: 30000 })
    })

    test('should view storage usage', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Sistem")')
      
      await expect(adminPage.getByText(/Depolama/)).toBeVisible()
      await expect(adminPage.locator('.progress-bar')).toBeVisible()
    })
  })

  test.describe('Integrations', () => {
    test('should display integrations page', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Entegrasyonlar")')
      await expect(adminPage.getByText('Entegrasyonlar')).toBeVisible()
    })

    test('should connect SMS service', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Entegrasyonlar")')
      await adminPage.click('button:has-text("SMS Servisi")')
      
      await adminPage.selectOption('select[name="provider"]', 'twilio')
      await adminPage.fill('input[name="apiKey"]', 'test-api-key')
      await adminPage.fill('input[name="apiSecret"]', 'test-api-secret')
      
      await adminPage.click('button:has-text("Bağlan")')
      
      await expect(adminPage.getByText('SMS servisi bağlandı')).toBeVisible()
    })

    test('should connect payment gateway', async ({ adminPage }) => {
      await adminPage.click('button:has-text("Entegrasyonlar")')
      await adminPage.click('button:has-text("Ödeme Geçidi")')
      
      await adminPage.selectOption('select[name="provider"]', 'stripe')
      await adminPage.fill('input[name="publicKey"]', 'pk_test_123')
      await adminPage.fill('input[name="secretKey"]', 'sk_test_123')
      
      await adminPage.click('button:has-text("Bağlan")')
      
      await expect(adminPage.getByText('Ödeme geçidi bağlandı')).toBeVisible()
    })
  })

  test.describe('Localization', () => {
    test('should display localization settings', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dil")')
      await expect(authenticatedPage.getByText('Dil ve Bölge Ayarları')).toBeVisible()
    })

    test('should change language', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dil")')
      await authenticatedPage.selectOption('select[name="language"]', 'en')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Language settings updated')).toBeVisible()
    })

    test('should change timezone', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dil")')
      await authenticatedPage.selectOption('select[name="timezone"]', 'Europe/Istanbul')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Ayarlar güncellendi')).toBeVisible()
    })

    test('should change date format', async ({ authenticatedPage }) => {
      await authenticatedPage.click('button:has-text("Dil")')
      await authenticatedPage.selectOption('select[name="dateFormat"]', 'DD/MM/YYYY')
      await authenticatedPage.click('button:has-text("Kaydet")')
      
      await expect(authenticatedPage.getByText('Ayarlar güncellendi')).toBeVisible()
    })
  })

  test.describe('Permissions', () => {
    test('should allow admin to access all settings', async ({ adminPage }) => {
      await adminPage.goto('/settings')
      await expect(adminPage.locator('button:has-text("Kullanıcılar")')).toBeVisible()
      await expect(adminPage.locator('button:has-text("Roller")')).toBeVisible()
      await expect(adminPage.locator('button:has-text("Güvenlik")')).toBeVisible()
      await expect(adminPage.locator('button:has-text("Sistem")')).toBeVisible()
    })

    test('should allow moderator to access profile only', async ({ moderatorPage }) => {
      await moderatorPage.goto('/settings')
      await expect(moderatorPage.locator('button:has-text("Profil")')).toBeVisible()
      await expect(moderatorPage.locator('button:has-text("Kullanıcılar")')).not.toBeVisible()
      await expect(moderatorPage.locator('button:has-text("Sistem")')).not.toBeVisible()
    })

    test('should allow viewer to access profile only', async ({ viewerPage }) => {
      await viewerPage.goto('/settings')
      await expect(viewerPage.locator('button:has-text("Profil")')).toBeVisible()
      await expect(viewerPage.locator('button:has-text("Kullanıcılar")')).not.toBeVisible()
      await expect(viewerPage.locator('button:has-text("Roller")')).not.toBeVisible()
    })
  })

  test.describe('Mobile Responsive', () => {
    test('should display correctly on mobile', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 375, height: 667 })
      await authenticatedPage.goto('/settings')
      
      await expect(authenticatedPage.locator('.settings-nav')).toBeVisible()
      await expect(authenticatedPage.locator('.settings-content')).toBeVisible()
    })
  })
})
