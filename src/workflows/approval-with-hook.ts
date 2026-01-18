/**
 * Çift Onaylı Yardım Başvurusu Workflow
 * 
 * Bu workflow, yardım başvurularının çift onay sürecini yönetir:
 * 1. Başvuru kaydedilir
 * 2. İlk onay için bekler (moderator)
 * 3. İkinci onay için bekler (admin)
 * 4. Onaylandığında işlemi tamamlar
 */

import { createHook, sleep, FatalError } from 'workflow'

interface ApplicationRequest {
  id: string
  needyPersonId: string
  applicationType: 'cash' | 'food' | 'clothing' | 'education' | 'health'
  requestedAmount: number
  description: string
  submittedBy: string
}

interface ApprovalPayload {
  approved: boolean
  comment?: string
  approvedBy: string
  approvedAt: string
}

export async function handleDualApprovalApplication(data: ApplicationRequest) {
  'use workflow'
  
  console.log(`Starting dual approval workflow for application: ${data.id}`)
  
  // Step 1: Başvuruyu kaydet ve durumu "pending_first_approval" yap
  await saveApplication(data)
  
  // Step 2: İlk onay için hook oluştur (Moderator onayı)
  const firstApprovalHook = createHook<ApprovalPayload>({
    token: `approval:first:${data.id}`,
    metadata: {
      applicationId: data.id,
      stage: 'first_approval',
      requiredRole: 'moderator'
    }
  })
  
  console.log(`Waiting for first approval. Token: ${firstApprovalHook.token}`)
  
  // Bildirimi gönder
  await notifyApprovers('moderator', data)
  
  // İlk onayı bekle
  const firstApproval = await firstApprovalHook
  
  if (!firstApproval.approved) {
    // Reddedildi
    await updateApplicationStatus(data.id, 'rejected', firstApproval)
    return {
      applicationId: data.id,
      status: 'rejected',
      stage: 'first_approval',
      reason: firstApproval.comment
    }
  }
  
  // Step 3: Durumu güncelle
  await updateApplicationStatus(data.id, 'pending_second_approval', firstApproval)
  
  // Step 4: İkinci onay için hook oluştur (Admin onayı)
  const secondApprovalHook = createHook<ApprovalPayload>({
    token: `approval:second:${data.id}`,
    metadata: {
      applicationId: data.id,
      stage: 'second_approval',
      requiredRole: 'admin',
      firstApproval: firstApproval
    }
  })
  
  console.log(`Waiting for second approval. Token: ${secondApprovalHook.token}`)
  
  // Admin'lere bildirim
  await notifyApprovers('admin', data)
  
  // İkinci onayı bekle
  const secondApproval = await secondApprovalHook
  
  if (!secondApproval.approved) {
    await updateApplicationStatus(data.id, 'rejected', secondApproval)
    return {
      applicationId: data.id,
      status: 'rejected',
      stage: 'second_approval',
      reason: secondApproval.comment
    }
  }
  
  // Step 5: Tamamen onaylandı - yardımı işle
  await updateApplicationStatus(data.id, 'approved', secondApproval)
  
  // 5 saniye bekle (simülasyon)
  await sleep('5s')
  
  // Yardım kaydı oluştur
  const aid = await createAidFromApplication(data, firstApproval, secondApproval)
  
  // Başvuru sahibine bildirim
  await notifyApplicant(data.needyPersonId, 'approved')
  
  console.log('Dual approval workflow completed successfully!')
  
  return {
    applicationId: data.id,
    aidId: aid.id,
    status: 'approved',
    approvals: {
      first: firstApproval,
      second: secondApproval
    }
  }
}

// ============================================
// WORKFLOW STEPS
// ============================================

async function saveApplication(data: ApplicationRequest) {
  'use step'
  
  console.log(`Saving application: ${data.id}`)
  
  // Supabase'e kaydet
  // const supabase = createClient()
  // await supabase.from('applications').insert({
  //   id: data.id,
  //   needy_person_id: data.needyPersonId,
  //   type: data.applicationType,
  //   requested_amount: data.requestedAmount,
  //   description: data.description,
  //   submitted_by: data.submittedBy,
  //   status: 'pending_first_approval',
  //   created_at: new Date().toISOString()
  // })
  
  return { saved: true }
}

async function notifyApprovers(role: 'moderator' | 'admin', data: ApplicationRequest) {
  'use step'
  
  console.log(`Notifying ${role}s about application: ${data.id}`)
  
  // Role göre kullanıcıları bul ve bildirim gönder
  // const supabase = createClient()
  // const { data: users } = await supabase
  //   .from('profiles')
  //   .select('id, email, name')
  //   .eq('role', role)
  
  // for (const user of users) {
  //   await emailService.send(user.email, 'Yeni Onay Bekleyen Başvuru', ...)
  // }
  
  return { notified: true, role }
}

async function updateApplicationStatus(
  applicationId: string,
  status: string,
  approval: ApprovalPayload
) {
  'use step'
  
  console.log(`Updating application ${applicationId} to ${status}`)
  
  // const supabase = createClient()
  // await supabase.from('applications').update({
  //   status,
  //   [`${status}_by`]: approval.approvedBy,
  //   [`${status}_at`]: approval.approvedAt,
  //   [`${status}_comment`]: approval.comment
  // }).eq('id', applicationId)
  
  return { updated: true, status }
}

async function createAidFromApplication(
  data: ApplicationRequest,
  firstApproval: ApprovalPayload,
  secondApproval: ApprovalPayload
) {
  'use step'
  
  console.log(`Creating aid record from application: ${data.id}`)
  
  const aid = {
    id: crypto.randomUUID(),
    applicationId: data.id,
    needyPersonId: data.needyPersonId,
    type: data.applicationType,
    amount: data.requestedAmount,
    status: 'pending_delivery',
    firstApprovedBy: firstApproval.approvedBy,
    secondApprovedBy: secondApproval.approvedBy,
    createdAt: new Date().toISOString()
  }
  
  // const supabase = createClient()
  // await supabase.from('aids').insert(aid)
  
  return aid
}

async function notifyApplicant(needyPersonId: string, status: 'approved' | 'rejected') {
  'use step'
  
  console.log(`Notifying applicant ${needyPersonId} about ${status}`)
  
  const message = status === 'approved'
    ? 'Başvurunuz onaylanmıştır. En kısa sürede sizinle iletişime geçilecektir.'
    : 'Başvurunuz ne yazık ki uygun bulunmamıştır.'
  
  // SMS gönder
  // await smsService.send(phone, message)
  
  return { notified: true, status }
}
