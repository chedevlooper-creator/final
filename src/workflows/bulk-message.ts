/**
 * Toplu Mesaj Gönderme Workflow
 * 
 * Bu workflow, toplu SMS veya email göndermek için kullanılır:
 * 1. Alıcı listesini hazırlar
 * 2. Mesajları batch halinde gönderir
 * 3. Gönderim raporunu oluşturur
 */

import { sleep, FatalError } from 'workflow'

interface BulkMessageData {
  messageType: 'sms' | 'email'
  content: string
  subject?: string
  recipientFilter: {
    status?: string
    category?: string
    city?: string
  }
  senderId: string
}

interface Recipient {
  id: string
  name: string
  phone?: string
  email?: string
}

export async function handleBulkMessage(data: BulkMessageData) {
  'use workflow'
  
  console.log(`Starting bulk ${data.messageType} workflow`)
  
  // Step 1: Alıcı listesini al
  const recipients = await fetchRecipients(data.recipientFilter)
  
  if (recipients.length === 0) {
    throw new FatalError('No recipients found matching the filter criteria')
  }
  
  console.log(`Found ${recipients.length} recipients`)
  
  // Step 2: Batch'ler halinde gönder (her batch 50 alıcı)
  const batchSize = 50
  const batches = Math.ceil(recipients.length / batchSize)
  const results: { success: number; failed: number } = { success: 0, failed: 0 }
  
  for (let i = 0; i < batches; i++) {
    const batchRecipients = recipients.slice(i * batchSize, (i + 1) * batchSize)
    
    const batchResult = await sendMessageBatch(
      data.messageType,
      data.content,
      data.subject,
      batchRecipients
    )
    
    results.success += batchResult.success
    results.failed += batchResult.failed
    
    // Rate limiting - her batch arasında 2 saniye bekle
    if (i < batches - 1) {
      await sleep('2s')
    }
  }
  
  // Step 3: Rapor oluştur
  const report = await createMessageReport(data, recipients.length, results)
  
  console.log(`Bulk message workflow completed! Success: ${results.success}, Failed: ${results.failed}`)
  
  return {
    reportId: report.id,
    totalRecipients: recipients.length,
    ...results
  }
}

// ============================================
// WORKFLOW STEPS
// ============================================

async function fetchRecipients(filter: BulkMessageData['recipientFilter']): Promise<Recipient[]> {
  'use step'
  
  console.log('Fetching recipients with filter:', filter)
  
  // Supabase'den alıcıları çek
  // const supabase = createClient()
  // let query = supabase.from('needy_persons').select('id, first_name, last_name, phone, email')
  // if (filter.status) query = query.eq('status', filter.status)
  // if (filter.category) query = query.eq('category_id', filter.category)
  // if (filter.city) query = query.eq('city_id', filter.city)
  // const { data } = await query
  
  // Mock data
  return [
    { id: '1', name: 'Ahmet Yılmaz', phone: '+905551234567', email: 'ahmet@example.com' },
    { id: '2', name: 'Fatma Kaya', phone: '+905559876543', email: 'fatma@example.com' },
    // ... daha fazla alıcı
  ]
}

async function sendMessageBatch(
  type: 'sms' | 'email',
  content: string,
  subject: string | undefined,
  recipients: Recipient[]
): Promise<{ success: number; failed: number }> {
  'use step'
  
  console.log(`Sending ${type} to ${recipients.length} recipients`)
  
  let success = 0
  let failed = 0
  
  for (const recipient of recipients) {
    try {
      if (type === 'sms' && recipient.phone) {
        // SMS gönder
        // await smsService.send(recipient.phone, content)
        console.log(`SMS sent to ${recipient.phone}`)
        success++
      } else if (type === 'email' && recipient.email) {
        // Email gönder
        // await emailService.send(recipient.email, subject, content)
        console.log(`Email sent to ${recipient.email}`)
        success++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`Failed to send to ${recipient.id}:`, error)
      failed++
    }
  }
  
  return { success, failed }
}

async function createMessageReport(
  data: BulkMessageData,
  totalRecipients: number,
  results: { success: number; failed: number }
) {
  'use step'
  
  console.log('Creating message report')
  
  const report = {
    id: crypto.randomUUID(),
    type: data.messageType,
    content: data.content.substring(0, 100) + '...',
    totalRecipients,
    successCount: results.success,
    failedCount: results.failed,
    sentBy: data.senderId,
    createdAt: new Date().toISOString()
  }
  
  // Raporu veritabanına kaydet
  // const supabase = createClient()
  // await supabase.from('message_reports').insert(report)
  
  return report
}
