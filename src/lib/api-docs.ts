/**
 * API Documentation Configuration
 * OpenAPI/Swagger specification generator
  */

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
    contact?: {
      name: string
      email: string
    }
    license?: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, unknown>
  components: {
    schemas: Record<string, unknown>
    responses: Record<string, unknown>
    parameters: Record<string, unknown>
  }
  tags: Array<{
    name: string
    description: string
  }>
}

export const apiDocsConfig: OpenAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'Yardım Yönetim Paneli API',
    version: '1.0.0',
    description: `
Yardım Yönetim Paneli REST API Dokümantasyonu

Bu API, sivil toplum kuruluşları için geliştirilmiş kapsamlı bir yardım ve bağış yönetim sistemine erişim sağlar.

## Authentication
API'ye erişim için JWT token kullanılır. Login endpoint'inden alınan token'ı her request'te \`Authorization\` header'ında göndermelisiniz.

## Rate Limiting
- Production: 100 request / 15 dakika
- Development: Limitsiz

## Error Handling
Tüm error response'ları şu formatta döner:
\`\`\`json
{
  "error": "Hata mesajı",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`
    `,
    contact: {
      name: 'API Support',
      email: 'api@yardimyonetim.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000',
      description: 'Development Server',
    },
    {
      url: 'https://api.yardimyonetim.com',
      description: 'Production Server',
    },
  ],
  paths: {},
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Hata mesajı' },
          code: { type: 'string', description: 'Hata kodu' },
          details: { type: 'object', description: 'Detaylı hata bilgisi' },
        },
        required: ['error'],
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      PaginationParams: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1, description: 'Sayfa numarası' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: 'Sayfa başına öğe sayısı' },
        },
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          data: { type: 'array' },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Yetkisiz erişim',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Giriş yapmalısınız',
              code: 'UNAUTHORIZED',
            },
          },
        },
      },
      Forbidden: {
        description: 'Yetersiz yetki',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Bu işlem için yetkiniz yok',
              code: 'FORBIDDEN',
            },
          },
        },
      },
      NotFound: {
        description: 'Kaynak bulunamadı',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Kaynak bulunamadı',
              code: 'NOT_FOUND',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validasyon hatası',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                code: { type: 'string' },
                details: {
                  type: 'object',
                  properties: {
                    fields: {
                      type: 'object',
                      description: 'Alan bazlı hata mesajları',
                    },
                  },
                },
              },
            },
            example: {
              error: 'Validasyon hatası',
              code: 'VALIDATION_ERROR',
              details: {
                fields: {
                  email: 'Geçerli bir email adresi giriniz',
                  password: 'Şifre en az 8 karakter olmalı',
                },
              },
            },
          },
        },
      },
    },
    parameters: {
      AuthHeader: {
        name: 'Authorization',
        in: 'header',
        description: 'JWT access token',
        required: true,
        schema: {
          type: 'string',
          example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      IdParam: {
        name: 'id',
        in: 'path',
        description: 'Kaynak ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Kimlik doğrulama işlemleri',
    },
    {
      name: 'Donations',
      description: 'Bağış yönetimi',
    },
    {
      name: 'Needy Persons',
      description: 'İhtiyaç sahipleri yönetimi',
    },
    {
      name: 'Aids',
      description: 'Yardım işlemleri',
    },
    {
      name: 'Orphans',
      description: 'Yetim/öğrenci yönetimi',
    },
    {
      name: 'Volunteers',
      description: 'Gönüllü yönetimi',
    },
    {
      name: 'Finance',
      description: 'Finans işlemleri',
    },
    {
      name: 'Reports',
      description: 'Raporlama',
    },
    {
      name: 'Settings',
      description: 'Sistem ayarları',
    },
  ],
}

/**
 * API Route decorator - Add documentation to API routes
 */
export function DocumentRoute(config: {
  summary: string
  description?: string
  tags?: string[]
  parameters?: unknown[]
  requestBody?: unknown
  responses?: unknown
  security?: unknown[]
}) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store metadata for documentation generation
    const classConstructor = target.constructor as unknown as Record<string, unknown>
   
    // Get existing metadata or create new
    const existingDocs = (classConstructor['__api_docs_metadata__'] as Record<string, unknown> | undefined) ?? {}
    if (typeof existingDocs === 'object' && existingDocs !== null) {
      existingDocs[propertyKey] = config;
      (classConstructor as Record<string, unknown>)['__api_docs_metadata__'] = existingDocs
    }
    
    return descriptor
  }
}

/**
 */
export function generateOpenAPISpec(routes: Record<string, unknown>): OpenAPISpec {
  const spec = { ...apiDocsConfig }
  
  // Process routes and build paths
  for (const [path, routeConfig] of Object.entries(routes)) {
    spec.paths[path] = routeConfig
  }
  
  return spec
}
