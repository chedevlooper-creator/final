/**
 * API Documentation Configuration
 * OpenAPI 3.0 specification for the API
 */

export const apiDocsConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Yardım Yönetim Paneli API',
    version: '1.0.0',
    description: 'Sivil toplum kuruluşları için yardım yönetim sistemi API',
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  paths: {
    '/needy': {
      get: {
        summary: 'İhtiyaç sahipleri listesi',
        tags: ['İhtiyaç Sahipleri'],
        responses: {
          '200': {
            description: 'Başarılı',
          },
        },
      },
    },
    '/applications': {
      get: {
        summary: 'Başvurular listesi',
        tags: ['Başvurular'],
        responses: {
          '200': {
            description: 'Başarılı',
          },
        },
      },
    },
    '/donations': {
      get: {
        summary: 'Bağışlar listesi',
        tags: ['Bağışlar'],
        responses: {
          '200': {
            description: 'Başarılı',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
}
