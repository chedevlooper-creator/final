/**
 * Email Notification System - Core Library
 * Email gönderimi için merkezi yönetim sistemi
 * 
 * @version 1.0.0
 * @author Aid Management Panel Team
 */

// Email gönderim hataları için özel sınıflar
export class EmailError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'EmailError';
  }
}

export class EmailValidationError extends EmailError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'EmailValidationError';
  }
}

export class EmailSendError extends EmailError {
  constructor(message: string, public providerError?: any) {
    super(message, 'SEND_ERROR');
    this.name = 'EmailSendError';
  }
}

// Email sağlayıcı tipleri
export enum EmailProvider {
  SMTP = 'smtp',
  SENDGRID = 'sendgrid',
  AWS_SES = 'aws_ses',
  MAILGUN = 'mailgun',
  POSTMARK = 'postmark'
}

// Email öncelik seviyeleri
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Email template tipleri
export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  DONATION_RECEIPT = 'donation_receipt',
  VOLUNTEER_ASSIGNMENT = 'volunteer_assignment',
  INVENTORY_ALERT = 'inventory_alert',
  SYSTEM_NOTIFICATION = 'system_notification',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  CUSTOM = 'custom'
}

// Email yapılandırması arayüzü
export interface EmailConfig {
  provider: EmailProvider;
  from: {
    email: string;
    name: string;
  };
  replyTo?: string;
  settings?: {
    // SMTP ayarları
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
    
    // SendGrid ayarları
    sendGridApiKey?: string;
    
    // AWS SES ayarları
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    
    // Mailgun ayarları
    domain?: string;
    mailgunApiKey?: string;
    
    // Postmark ayarları
    serverToken?: string;
    
    // Genel ayarlar
    maxRecipients?: number;
    rateLimit?: number; // dakikadaki email sayısı
  };
}

// Email gönderim seçenekleri
export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  template?: EmailTemplate;
  templateData?: Record<string, any>;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  priority?: EmailPriority;
  tags?: string[];
  headers?: Record<string, string>;
  scheduledAt?: Date;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

// Email ek dosyası arayüzü
export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  encoding?: 'base64' | 'utf8';
  contentType?: string;
}

// Email sonucu arayüzü
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: EmailProvider;
  timestamp: Date;
}

// Email istatistikleri arayüzü
export interface EmailStatistics {
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  avgDeliveryTime: number;
  successRate: number;
  providerStats: Record<EmailProvider, {
    sent: number;
    failed: number;
  }>;
}

// Email kuyruğu öğesi arayüzü
export interface QueuedEmail {
  id: string;
  options: EmailOptions;
  scheduledAt: Date;
  attempts: number;
  maxAttempts: number;
  priority: EmailPriority;
  createdAt: Date;
}

// Email template içeriği arayüzü
export interface EmailTemplateContent {
  subject: string;
  text: string;
  html: string;
  variables: string[];
}

// Email gönderen sınıfı
export class EmailSender {
  private config: EmailConfig;
  private queue: Map<string, QueuedEmail> = new Map();
  private statistics: EmailStatistics = {
    totalSent: 0,
    totalFailed: 0,
    totalQueued: 0,
    avgDeliveryTime: 0,
    successRate: 0,
    providerStats: {
      [EmailProvider.SMTP]: { sent: 0, failed: 0 },
      [EmailProvider.SENDGRID]: { sent: 0, failed: 0 },
      [EmailProvider.AWS_SES]: { sent: 0, failed: 0 },
      [EmailProvider.MAILGUN]: { sent: 0, failed: 0 },
      [EmailProvider.POSTMARK]: { sent: 0, failed: 0 }
    }
  };
  private isProcessingQueue: boolean = false;
  private static instance: EmailSender;

  private constructor(config: EmailConfig) {
    this.config = config;
    this.startQueueProcessor();
  }

  /**
   * Singleton örneğini al
   */
  static getInstance(config?: EmailConfig): EmailSender {
    if (!EmailSender.instance) {
      if (!config) {
        throw new EmailError('Email configuration required for first initialization');
      }
      EmailSender.instance = new EmailSender(config);
    }
    return EmailSender.instance;
  }

  /**
   * Email doğrulama
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Email seçeneklerini doğrula
   */
  private validateOptions(options: EmailOptions): void {
    // Alıcı doğrulama
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    for (const email of recipients) {
      if (!this.validateEmail(email)) {
        throw new EmailValidationError(`Geçersiz email adresi: ${email}`);
      }
    }

    // CC doğrulama
    if (options.cc) {
      const ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc];
      for (const email of ccEmails) {
        if (!this.validateEmail(email)) {
          throw new EmailValidationError(`Geçersiz CC email adresi: ${email}`);
        }
      }
    }

    // BCC doğrulama
    if (options.bcc) {
      const bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      for (const email of bccEmails) {
        if (!this.validateEmail(email)) {
          throw new EmailValidationError(`Geçersiz BCC email adresi: ${email}`);
        }
      }
    }

    // Konu doğrulama
    if (!options.subject || options.subject.trim().length === 0) {
      throw new EmailValidationError('Email konusu boş olamaz');
    }

    // İçerik doğrulama
    if (!options.template && !options.html && !options.text) {
      throw new EmailValidationError('Email içeriği veya template seçilmelidir');
    }

    // Rate limiting kontrolü
    if (this.config.settings?.rateLimit) {
      const recentEmails = this.statistics.totalSent;
      const maxPerMinute = this.config.settings.rateLimit;
      // Basit rate limiting - production'da daha gelişmiş olmalı
      if (recentEmails > 0 && recentEmails % maxPerMinute === 0) {
        // Rate limit aşıldı, kuyruğa ekle
        console.warn(`Rate limit aşıldı. Email kuyruğa ekleniyor.`);
      }
    }
  }

  /**
   * Template'i işle
   */
  private processTemplate(template: EmailTemplate, data: Record<string, any>): EmailTemplateContent {
    const templates = this.getTemplates();
    const templateContent = templates[template];

    if (!templateContent) {
      throw new EmailValidationError(`Template bulunamadı: ${template}`);
    }

    // Template değişkenlerini değiştir
    let subject = templateContent.subject;
    let text = templateContent.text;
    let html = templateContent.html;

    for (const key of templateContent.variables) {
      const value = data[key] || '';
      const placeholder = `{{${key}}}`;
      
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      text = text.replace(new RegExp(placeholder, 'g'), value);
      html = html.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject, text, html, variables: templateContent.variables };
  }

  /**
   * Email template'lerini al
   */
  private getTemplates(): Record<EmailTemplate, EmailTemplateContent> {
    return {
      [EmailTemplate.WELCOME]: {
        subject: 'Yardım Yönetim Paneline Hoş Geldiniz',
        text: 'Merhaba {{name}},\n\nYardım Yönetim Paneline hoş geldiniz!\n\nHesabınız oluşturuldu ve hemen kullanmaya başlayabilirsiniz.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Yardım Yönetim Paneline Hoş Geldiniz! 👋</h2>
            <p>Merhaba <strong>{{name}}</strong>,</p>
            <p>Hesabınız başarıyla oluşturuldu. Yardım yönetimi platformumuza hoş geldiniz!</p>
            <p>Hemen başlamak için aşağıdaki butona tıklayın:</p>
            <a href="{{loginUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Giriş Yap</a>
            <p>Herhangi bir sorunuz için bize ulaşın.</p>
            <p>Saygılarımızla,<br>Yardım Yönetim Paneli Ekibi</p>
          </div>
        `,
        variables: ['name', 'loginUrl']
      },
      [EmailTemplate.PASSWORD_RESET]: {
        subject: 'Şifre Sıfırlama Talebi',
        text: 'Merhaba {{name}},\n\nŞifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n{{resetUrl}}\n\nBu link 1 saat geçerlidir.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Şifre Sıfırlama</h2>
            <p>Merhaba <strong>{{name}}</strong>,</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
            <a href="{{resetUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Şifremi Sıfırla</a>
            <p><strong>Önemli:</strong> Bu link sadece 1 saat geçerlidir.</p>
            <p>Eğer bu talebi siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
            <p>Saygılarımızla,<br>Yardım Yönetim Paneli Ekibi</p>
          </div>
        `,
        variables: ['name', 'resetUrl']
      },
      [EmailTemplate.DONATION_RECEIPT]: {
        subject: 'Bağış Makbuzu - {{donationId}}',
        text: 'Sayın {{donorName}},\n\n{{amount}} tutarındaki bağışınız için teşekkür ederiz.\n\nBağış ID: {{donationId}}\nTarih: {{date}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🙏 Bağışınız İçin Teşekkürler</h2>
            <p>Sayın <strong>{{donorName}}</strong>,</p>
            <p><strong>{{amount}}</strong> tutarındaki bağışınız için teşekkür ederiz.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Bağış Detayları</h3>
              <p><strong>Bağış ID:</strong> {{donationId}}</p>
              <p><strong>Tarih:</strong> {{date}}</p>
              <p><strong>Tutar:</strong> {{amount}}</p>
              <p><strong>Kategori:</strong> {{category}}</p>
            </div>
            <p>Bu bağış, ihtiyaç sahiplerine ulaştırılmak üzere kullanılacaktır.</p>
            <p>Saygılarımızla,<br>Yardım Yönetim Paneli Ekibi</p>
          </div>
        `,
        variables: ['donorName', 'amount', 'donationId', 'date', 'category']
      },
      [EmailTemplate.VOLUNTEER_ASSIGNMENT]: {
        subject: 'Gönüllü Görev Ataması - {{taskName}}',
        text: 'Merhaba {{volunteerName}},\n\n{{taskName}} görevine atandınız.\n\nBaşlangıç: {{startDate}}\nKonum: {{location}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🤝 Yeni Görev Ataması</h2>
            <p>Merhaba <strong>{{volunteerName}}</strong>,</p>
            <p>Sizin için yeni bir görev atandı:</p>
            <div style="background: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3>{{taskName}}</h3>
              <p><strong>Başlangıç:</strong> {{startDate}}</p>
              <p><strong>Konum:</strong> {{location}}</p>
              <p><strong>Açıklama:</strong> {{description}}</p>
            </div>
            <p>Görev detaylarını görüntülemek için aşağıdaki butona tıklayın:</p>
            <a href="{{taskUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Görevi Görüntüle</a>
            <p>Saygılarımla,<br>Yardım Yönetim Paneli Ekibi</p>
          </div>
        `,
        variables: ['volunteerName', 'taskName', 'startDate', 'location', 'description', 'taskUrl']
      },
      [EmailTemplate.INVENTORY_ALERT]: {
        subject: '⚠️ Stok Uyarısı - {{itemName}}',
        text: 'Stok uyarısı!\n\nÜrün: {{itemName}}\nMevcut: {{currentStock}}\nMinimum: {{minStock}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">⚠️ Stok Uyarısı</h2>
            <p>Aşağıdaki ürünün stoğu kritik seviyenin altına düştü:</p>
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3>{{itemName}}</h3>
              <p><strong>Mevcut Stok:</strong> {{currentStock}}</p>
              <p><strong>Minimum Stok:</strong> {{minStock}}</p>
              <p><strong>Depo:</strong> {{warehouse}}</p>
            </div>
            <p>Lütfen stok yenileme işlemi yapın.</p>
            <a href="{{inventoryUrl}}" style="background: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Stok Yönetimine Git</a>
          </div>
        `,
        variables: ['itemName', 'currentStock', 'minStock', 'warehouse', 'inventoryUrl']
      },
      [EmailTemplate.SYSTEM_NOTIFICATION]: {
        subject: '{{subject}}',
        text: '{{message}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>{{title}}</h2>
            <p>{{message}}</p>
            {{#if actionUrl}}
            <a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">İşlem Yap</a>
            {{/if}}
          </div>
        `,
        variables: ['subject', 'title', 'message', 'actionUrl']
      },
      [EmailTemplate.WEEKLY_REPORT]: {
        subject: 'Haftalık Rapor - {{weekStartDate}} ile {{weekEndDate}} arası',
        text: 'Haftalık özet raporunuz:\n\nToplam Bağış: {{totalDonations}}\nToplam Gönüllü: {{totalVolunteers}}\nYardım Alan: {{totalHelped}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📊 Haftalık Rapor</h2>
            <p><strong>{{weekStartDate}}</strong> ile <strong>{{weekEndDate}}</strong> arası özet:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0;">💰 Toplam Bağış</h3>
                <p style="font-size: 32px; margin: 8px 0; color: #28a745;">{{totalDonations}}</p>
              </div>
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0;">🤝 Toplam Gönüllü</h3>
                <p style="font-size: 32px; margin: 8px 0; color: #007bff;">{{totalVolunteers}}</p>
              </div>
              <div>
                <h3 style="margin: 0;">❤️ Yardım Alan</h3>
                <p style="font-size: 32px; margin: 8px 0; color: #dc3545;">{{totalHelped}}</p>
              </div>
            </div>
            <p>Detaylı raporu görüntülemek için aşağıdaki butona tıklayın:</p>
            <a href="{{reportUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Raporu Görüntüle</a>
          </div>
        `,
        variables: ['weekStartDate', 'weekEndDate', 'totalDonations', 'totalVolunteers', 'totalHelped', 'reportUrl']
      },
      [EmailTemplate.MONTHLY_REPORT]: {
        subject: 'Aylık Rapor - {{month}} {{year}}',
        text: 'Aylık özet raporunuz:\n\nToplam Bağış: {{totalDonations}}\nAktif Gönüllü: {{activeVolunteers}}\nYeni İhtiyaç Sahibi: {{newNeedyPersons}}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📈 Aylık Rapor - {{month}} {{year}}</h2>
            <p>Bu ayın performans özeti:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0;">💰 Toplam Bağış</h3>
                <p style="font-size: 32px; margin: 8px 0; font-weight: bold;">{{totalDonations}}</p>
              </div>
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0;">🤝 Aktif Gönüllü</h3>
                <p style="font-size: 32px; margin: 8px 0; font-weight: bold;">{{activeVolunteers}}</p>
              </div>
              <div>
                <h3 style="margin: 0;">👥 Yeni İhtiyaç Sahibi</h3>
                <p style="font-size: 32px; margin: 8px 0; font-weight: bold;">{{newNeedyPersons}}</p>
              </div>
            </div>
            <a href="{{reportUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 16px 0;">Detaylı Rapor</a>
          </div>
        `,
        variables: ['month', 'year', 'totalDonations', 'activeVolunteers', 'newNeedyPersons', 'reportUrl']
      },
      [EmailTemplate.CUSTOM]: {
        subject: '{{subject}}',
        text: '{{text}}',
        html: '{{html}}',
        variables: []
      }
    };
  }

  /**
   * Email gönder (simüle edilmiş)
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    const startTime = Date.now();
    
    try {
      // Validasyon
      this.validateOptions(options);

      // Template işleme
      let subject = options.subject;
      let text = options.text;
      let html = options.html;

      if (options.template && options.templateData) {
        const templateContent = this.processTemplate(options.template, options.templateData);
        subject = templateContent.subject;
        text = templateContent.text;
        html = templateContent.html;
      }

      // Email gönderimi (simülasyon)
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Gerçek uygulamada burada email sağlayıcısı kullanılır
      console.log(`📧 Email gönderiliyor:`, {
        to: options.to,
        subject,
        messageId
      });

      // Başarılı gönderim simülasyonu
      await new Promise(resolve => setTimeout(resolve, 100));

      const deliveryTime = Date.now() - startTime;
      
      // İstatistik güncelle
      this.statistics.totalSent++;
      this.statistics.providerStats[this.config.provider].sent++;
      this.statistics.successRate = (this.statistics.totalSent / (this.statistics.totalSent + this.statistics.totalFailed)) * 100;
      this.statistics.avgDeliveryTime = (this.statistics.avgDeliveryTime * (this.statistics.totalSent - 1) + deliveryTime) / this.statistics.totalSent;

      return {
        success: true,
        messageId,
        provider: this.config.provider,
        timestamp: new Date()
      };

    } catch (error: any) {
      // Hata kaydı
      this.statistics.totalFailed++;
      this.statistics.providerStats[this.config.provider].failed++;
      this.statistics.successRate = (this.statistics.totalSent / (this.statistics.totalSent + this.statistics.totalFailed)) * 100;

      return {
        success: false,
        error: error.message,
        provider: this.config.provider,
        timestamp: new Date()
      };
    }
  }

  /**
   * Toplu email gönder
   */
  async sendBulk(optionsList: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const options of optionsList) {
      const result = await this.send(options);
      results.push(result);
    }

    return results;
  }

  /**
   * Emaili kuyruğa ekle
   */
  enqueue(options: EmailOptions, scheduledAt?: Date): string {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedEmail: QueuedEmail = {
      id,
      options,
      scheduledAt: scheduledAt || new Date(),
      attempts: 0,
      maxAttempts: 3,
      priority: options.priority || EmailPriority.NORMAL,
      createdAt: new Date()
    };

    this.queue.set(id, queuedEmail);
    this.statistics.totalQueued++;

    console.log(`📬 Email kuyruğa eklendi: ${id}`);

    return id;
  }

  /**
   * Email kuyruğunu işle
   */
  private async startQueueProcessor(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;

    const processQueue = async () => {
      const now = new Date();
      
      for (const [id, queuedEmail] of this.queue.entries()) {
        if (queuedEmail.scheduledAt <= now && queuedEmail.attempts < queuedEmail.maxAttempts) {
          console.log(`📤 Kuyruktaki email gönderiliyor: ${id}`);
          
          queuedEmail.attempts++;
          const result = await this.send(queuedEmail.options);

          if (result.success) {
            this.queue.delete(id);
            console.log(`✅ Kuyruktaki email başarıyla gönderildi: ${id}`);
          } else if (queuedEmail.attempts >= queuedEmail.maxAttempts) {
            console.error(`❌ Email gönderilemedi, maksimum deneme sayısına ulaşıldı: ${id}`);
            this.queue.delete(id);
          }
        }
      }

      // Her 30 saniyede bir kuyruğu kontrol et
      setTimeout(processQueue, 30000);
    };

    processQueue();
  }

  /**
   * İstatistikleri al
   */
  getStatistics(): EmailStatistics {
    return { ...this.statistics };
  }

  /**
   * İstatistikleri sıfırla
   */
  resetStatistics(): void {
    this.statistics = {
      totalSent: 0,
      totalFailed: 0,
      totalQueued: 0,
      avgDeliveryTime: 0,
      successRate: 0,
      providerStats: {
        [EmailProvider.SMTP]: { sent: 0, failed: 0 },
        [EmailProvider.SENDGRID]: { sent: 0, failed: 0 },
        [EmailProvider.AWS_SES]: { sent: 0, failed: 0 },
        [EmailProvider.MAILGUN]: { sent: 0, failed: 0 },
        [EmailProvider.POSTMARK]: { sent: 0, failed: 0 }
      }
    };
  }

  /**
   * Kuyruktaki emailleri al
   */
  getQueuedEmails(): QueuedEmail[] {
    return Array.from(this.queue.values());
  }

  /**
   * Kuyruktaki emaili iptal et
   */
  cancelQueuedEmail(id: string): boolean {
    return this.queue.delete(id);
  }

  /**
   * Email konfigürasyonunu güncelle
   */
  updateConfig(config: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Yardımcı fonksiyonlar
export const email = {
  /**
   * Email gönder
   */
  send: (options: EmailOptions): Promise<EmailResult> => {
    return EmailSender.getInstance().send(options);
  },

  /**
   * Toplu email gönder
   */
  sendBulk: (optionsList: EmailOptions[]): Promise<EmailResult[]> => {
    return EmailSender.getInstance().sendBulk(optionsList);
  },

  /**
   * Emaili kuyruğa ekle
   */
  enqueue: (options: EmailOptions, scheduledAt?: Date): string => {
    return EmailSender.getInstance().enqueue(options, scheduledAt);
  },

  /**
   * İstatistikleri al
   */
  getStatistics: (): EmailStatistics => {
    return EmailSender.getInstance().getStatistics();
  },

  /**
   * Kuyruktaki emailleri al
   */
  getQueuedEmails: (): QueuedEmail[] => {
    return EmailSender.getInstance().getQueuedEmails();
  },

  /**
   * Kuyruktaki emaili iptal et
   */
  cancelQueued: (id: string): boolean => {
    return EmailSender.getInstance().cancelQueuedEmail(id);
  },

  /**
   * Hoş geldin emaili gönder
   */
  sendWelcome: (to: string, data: { name: string; loginUrl: string }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.WELCOME,
      templateData: data
    });
  },

  /**
   * Şifre sıfırlama emaili gönder
   */
  sendPasswordReset: (to: string, data: { name: string; resetUrl: string }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.PASSWORD_RESET,
      templateData: data
    });
  },

  /**
   * Bağış makbuzu gönder
   */
  sendDonationReceipt: (to: string, data: {
    donorName: string;
    amount: string;
    donationId: string;
    date: string;
    category: string;
  }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.DONATION_RECEIPT,
      templateData: data
    });
  },

  /**
   * Gönüllü görev ataması gönder
   */
  sendVolunteerAssignment: (to: string, data: {
    volunteerName: string;
    taskName: string;
    startDate: string;
    location: string;
    description: string;
    taskUrl: string;
  }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.VOLUNTEER_ASSIGNMENT,
      templateData: data
    });
  },

  /**
   * Stok uyarısı gönder
   */
  sendInventoryAlert: (to: string, data: {
    itemName: string;
    currentStock: number;
    minStock: number;
    warehouse: string;
    inventoryUrl: string;
  }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.INVENTORY_ALERT,
      templateData: data,
      priority: EmailPriority.HIGH
    });
  },

  /**
   * Haftalık rapor gönder
   */
  sendWeeklyReport: (to: string, data: {
    weekStartDate: string;
    weekEndDate: string;
    totalDonations: string;
    totalVolunteers: number;
    totalHelped: number;
    reportUrl: string;
  }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.WEEKLY_REPORT,
      templateData: data
    });
  },

  /**
   * Aylık rapor gönder
   */
  sendMonthlyReport: (to: string, data: {
    month: string;
    year: number;
    totalDonations: string;
    activeVolunteers: number;
    newNeedyPersons: number;
    reportUrl: string;
  }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.MONTHLY_REPORT,
      templateData: data
    });
  },

  /**
   * Sistem bildirimi gönder
   */
  sendSystemNotification: (to: string, data: {
    subject: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<EmailResult> => {
    return email.send({
      to,
      template: EmailTemplate.SYSTEM_NOTIFICATION,
      templateData: data
    });
  }
};
