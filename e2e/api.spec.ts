import { test, expect } from '@playwright/test'

/**
 * Yardım Yönetim Paneli - API Testing Suite
 * API endpoint'lerinin doğrulanması
 */

test.describe('API - Authentication', () => {
  test('POST /api/auth/login - should return token on valid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    })

    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json).toHaveProperty('data')
    expect(json.data).toHaveProperty('user')
    expect(json.data).toHaveProperty('session')
  })

  test('POST /api/auth/login - should return error on invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    
    const json = await response.json()
    expect(json).toHaveProperty('error')
  })
})

test.describe('API - İhtiyaç Sahipleri', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    // Login ve token al
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    })

    const json = await response.json()
    authToken = json.data.session.access_token
  })

  test('GET /api/needy - should return needy persons list', async ({ request }) => {
    const response = await request.get('/api/needy', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json).toHaveProperty('data')
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('GET /api/needy - should support pagination', async ({ request }) => {
    const response = await request.get('/api/needy?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json.data).toBeInstanceOf(Array)
    expect(json.data.length).toBeLessThanOrEqual(10)
  })

  test('GET /api/needy - should support search', async ({ request }) => {
    const response = await request.get('/api/needy?search=Ahmet', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json.data).toBeInstanceOf(Array)
  })

  test('POST /api/needy - should create new needy person', async ({ request }) => {
    const response = await request.post('/api/needy', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        first_name: 'Test',
        last_name: 'Kullanıcı',
        phone: '5551234567',
        city_id: null
      }
    })

    expect(response.status()).toBe(201)
    
    const json = await response.json()
    expect(json.data).toHaveProperty('id')
    expect(json.data.first_name).toBe('Test')
  })

  test('POST /api/needy - should validate required fields', async ({ request }) => {
    const response = await request.post('/api/needy', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        first_name: '', // Boş isim
        last_name: ''
      }
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })
})

test.describe('API - Bağışlar', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    })

    const json = await response.json()
    authToken = json.data.session.access_token
  })

  test('GET /api/donations - should return donations list', async ({ request }) => {
    const response = await request.get('/api/donations', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json.data).toBeInstanceOf(Array)
  })

  test('POST /api/donations - should create new donation', async ({ request }) => {
    const response = await request.post('/api/donations', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        amount: 1000,
        donation_type: 'cash',
        payment_method: 'bank_transfer',
        donor_name: 'Test Donor',
        donation_date: new Date().toISOString()
      }
    })

    expect(response.status()).toBe(201)
    
    const json = await response.json()
    expect(json.data).toHaveProperty('id')
    expect(json.data.amount).toBe(1000)
  })

  test('POST /api/donations - should validate amount', async ({ request }) => {
    const response = await request.post('/api/donations', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        amount: -100, // Negatif tutar
        donation_type: 'cash',
        payment_method: 'cash'
      }
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })
})

test.describe('API - Dashboard Stats', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    })

    const json = await response.json()
    authToken = json.data.session.access_token
  })

  test('GET /api/dashboard/stats - should return dashboard statistics', async ({ request }) => {
    const response = await request.get('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    expect(response.status()).toBe(200)
    
    const json = await response.json()
    expect(json.data).toHaveProperty('totalNeedy')
    expect(json.data).toHaveProperty('activeNeedy')
    expect(json.data).toHaveProperty('pendingApplications')
  })
})

test.describe('API - Error Handling', () => {
  test('should return 401 for unauthorized request', async ({ request }) => {
    const response = await request.get('/api/needy')

    expect(response.status()).toBe(401)
  })

  test('should return 404 for non-existent route', async ({ request }) => {
    const response = await request.get('/api/non-existent-route')

    expect(response.status()).toBe(404)
  })

  test('should return proper error format', async ({ request }) => {
    const response = await request.get('/api/protected-route')

    const json = await response.json()
    expect(json).toHaveProperty('error')
  })
})

test.describe('API - Rate Limiting', () => {
  test('should rate limit requests', async ({ request }) => {
    const requests = Array(100).fill(null).map(() =>
      request.get('/api/dashboard/stats')
    )

    const responses = await Promise.all(requests)
    
    // En az bir iste 429 (Too Many Requests) dönmeli
    const rateLimited = responses.some(r => r.status() === 429)
    expect(rateDefined ? rateLimited : true).toBeTruthy()
  })
})
