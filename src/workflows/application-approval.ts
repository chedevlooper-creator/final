/**
 * Yardım Başvurusu Onaylama Workflow
 * 
 * Bu workflow, bir yardım başvurusu onaylandığında çalışır:
 * 1. Başvuruyu günceller
 * 2. İhtiyaç sahibine bildirim gönderir
 * 3. Finans ekibine bilgi verir
 * 4. Yardım kaydı oluşturur
 */

import { sleep, FatalError } from 'workflow'

interface ApplicationData {
  id: string
  needyPersonId: string
  applicationType: string
  amount?: number
  approvedBy: string
}

export async function handleApplicationApproval(data: ApplicationData) {
  'use workflow'
  
  console.log(`Starting application approval workflow for: ${data.id}`)
  
  // Step 1: Başvuru durumunu güncelle
  const application = await updateApplicationStatus(data.id, 'approved', data.approvedBy)
  
  // Step 2: İhtiyaç sahibine SMS gönder
  await sendApprovalNotification(data.needyPersonId, data.applicationType)
  
  // Step 3: 1 dakika bekle (gerçek senaryoda bu daha uzun olabilir)
  await sleep('1m')
  
  // Step 4: Finans ekibine bildirim
  await notifyFinanceTeam(application)
  
  // Step 5: Yardım kaydı oluştur
  const aid = await createAidRecord(data)
  
  console.log('Application approval workflow completed!')
  
  return {
    applicationId: data.id,
    aidId: aid.id,
    status: 'completed'
  }
}

// ============================================
// WORKFLOW STEPS
// ============================================

async function updateApplicationStatus(
  applicationId: string, 
  status: string, 
  approvedBy: string
) {
  'use step'
  
  console.log(`Updating application ${applicationId} to ${status}`)
  
  // Burada Supabase'e bağlanarak başvuruyu güncelleyebilirsiniz
  // const supabase = createClient()
  // await supabase.from('applications').update({ status, approved_by: approvedBy }).eq('id', applicationId)
  
  return {
    id: applicationId,
    status,
    approvedBy,
    approvedAt: new Date().toISOString()
  }
}

async function sendApprovalNotification(needyPersonId: string, applicationType: string) {
  'use step'
  
  console.log(`Sending approval SMS to needy person: ${needyPersonId}`)
  
  // SMS gönderme mantığı burada olacak
  // Örnek: Netgsm, Twilio veya başka bir SMS servisi
  
  const message = `Sayın yetkili, ${applicationType} başvurunuz onaylanmıştır. Detaylı bilgi için lütfen derneğimizle iletişime geçiniz.`
  
  // await smsService.send(phoneNumber, message)
  
  return { sent: true, message }
}

async function notifyFinanceTeam(application: { id: string; status: string }) {
  'use step'
  
  console.log(`Notifying finance team about application: ${application.id}`)
  
  // Email veya internal bildirim sistemi
  // await emailService.send('finans@dernek.org', 'Yeni Onaylanan Başvuru', ...)
  
  return { notified: true }
}

async function createAidRecord(data: ApplicationData) {
  'use step'
  
  console.log(`Creating aid record for application: ${data.id}`)
  
  if (!data.needyPersonId) {
    throw new FatalError('Needy person ID is required')
  }
  
  // Yardım kaydı oluştur
  // const supabase = createClient()
  // const { data: aid } = await supabase.from('aids').insert({...}).select().single()
  
  const aid = {
    id: crypto.randomUUID(),
    applicationId: data.id,
    needyPersonId: data.needyPersonId,
    type: data.applicationType,
    amount: data.amount || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  return aid
}
