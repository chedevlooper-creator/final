/**
 * Slack Entegrasyon Workflow
 * 
 * Bu workflow, Slack'ten gelen mesajları dinler ve işler:
 * - Yardım talepleri
 * - Durum sorgulamaları
 * - Komutlar (/help, /status, /stop)
 */

import { createHook, FatalError } from 'workflow'

interface SlackMessage {
  channelId: string
  userId: string
  userName: string
  text: string
  timestamp: string
  threadTs?: string
}

interface SlackCommand {
  command: 'help' | 'status' | 'request' | 'stop'
  args?: string[]
}

export async function handleSlackChannel(channelId: string) {
  'use workflow'
  
  console.log(`Starting Slack listener for channel: ${channelId}`)
  
  // Hook oluştur - bu kanal için gelen tüm mesajları dinle
  const slackHook = createHook<SlackMessage>({
    token: `slack:channel:${channelId}`,
    metadata: {
      channelId,
      startedAt: new Date().toISOString()
    }
  })
  
  console.log(`Slack hook created. Token: ${slackHook.token}`)
  
  const processedMessages: string[] = []
  
  // Mesajları sürekli dinle
  for await (const message of slackHook) {
    console.log(`Received message from ${message.userName}: ${message.text}`)
    
    // Komutu parse et
    const command = parseCommand(message.text)
    
    if (command) {
      switch (command.command) {
        case 'stop':
          // Workflow'u durdur
          await sendSlackMessage(channelId, 'Dinleme durduruldu. Hoşçakalın! 👋')
          return {
            channelId,
            processedMessages: processedMessages.length,
            stoppedBy: message.userName,
            stoppedAt: new Date().toISOString()
          }
        
        case 'help':
          await sendSlackMessage(channelId, getHelpMessage())
          break
        
        case 'status':
          const status = await getSystemStatus()
          await sendSlackMessage(channelId, formatStatus(status))
          break
        
        case 'request':
          if (command.args && command.args.length > 0) {
            await createHelpRequest(message, command.args.join(' '))
            await sendSlackMessage(channelId, `✅ Yardım talebiniz kaydedildi. Referans: REQ-${Date.now()}`)
          } else {
            await sendSlackMessage(channelId, '❌ Lütfen talep detayını belirtin: /request <detay>')
          }
          break
      }
    }
    
    processedMessages.push(message.timestamp)
  }
  
  return {
    channelId,
    processedMessages: processedMessages.length
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseCommand(text: string): SlackCommand | null {
  const trimmed = text.trim().toLowerCase()
  
  if (trimmed.startsWith('/help') || trimmed === 'yardım') {
    return { command: 'help' }
  }
  
  if (trimmed.startsWith('/status') || trimmed === 'durum') {
    return { command: 'status' }
  }
  
  if (trimmed.startsWith('/stop') || trimmed === 'dur') {
    return { command: 'stop' }
  }
  
  if (trimmed.startsWith('/request') || trimmed.startsWith('talep')) {
    const args = text.replace(/^(\/request|talep)\s*/i, '').split(' ').filter(Boolean)
    return { command: 'request', args }
  }
  
  return null
}

function getHelpMessage(): string {
  return `
📋 *Kullanılabilir Komutlar*

• \`/help\` veya \`yardım\` - Bu mesajı gösterir
• \`/status\` veya \`durum\` - Sistem durumunu gösterir
• \`/request <detay>\` veya \`talep <detay>\` - Yeni yardım talebi oluşturur
• \`/stop\` veya \`dur\` - Dinlemeyi durdurur
  `.trim()
}

function formatStatus(status: SystemStatus): string {
  return `
📊 *Sistem Durumu*

• Aktif Başvurular: ${status.activeApplications}
• Bekleyen Onaylar: ${status.pendingApprovals}
• Bu Ay Dağıtılan Yardım: ${status.monthlyAidAmount.toLocaleString('tr-TR')} TL
• Aktif Gönüllüler: ${status.activeVolunteers}

_Son güncelleme: ${new Date().toLocaleString('tr-TR')}_
  `.trim()
}

// ============================================
// WORKFLOW STEPS
// ============================================

interface SystemStatus {
  activeApplications: number
  pendingApprovals: number
  monthlyAidAmount: number
  activeVolunteers: number
}

async function getSystemStatus(): Promise<SystemStatus> {
  'use step'
  
  console.log('Fetching system status')
  
  // Supabase'den verileri çek
  // const supabase = createClient()
  // const [applications, approvals, aids, volunteers] = await Promise.all([
  //   supabase.from('applications').select('id', { count: 'exact' }).eq('status', 'active'),
  //   supabase.from('applications').select('id', { count: 'exact' }).in('status', ['pending_first_approval', 'pending_second_approval']),
  //   supabase.from('aids').select('amount').gte('created_at', startOfMonth),
  //   supabase.from('volunteers').select('id', { count: 'exact' }).eq('status', 'active')
  // ])
  
  // Mock data
  return {
    activeApplications: 42,
    pendingApprovals: 7,
    monthlyAidAmount: 125000,
    activeVolunteers: 23
  }
}

async function sendSlackMessage(channelId: string, message: string) {
  'use step'
  
  console.log(`Sending message to channel ${channelId}: ${message.substring(0, 50)}...`)
  
  // Slack API ile mesaj gönder
  // await fetch('https://slack.com/api/chat.postMessage', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     channel: channelId,
  //     text: message,
  //     mrkdwn: true
  //   })
  // })
  
  return { sent: true }
}

async function createHelpRequest(message: SlackMessage, details: string) {
  'use step'
  
  console.log(`Creating help request from ${message.userName}: ${details}`)
  
  const request = {
    id: crypto.randomUUID(),
    source: 'slack',
    channelId: message.channelId,
    userId: message.userId,
    userName: message.userName,
    details,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  // Veritabanına kaydet
  // const supabase = createClient()
  // await supabase.from('help_requests').insert(request)
  
  return request
}
