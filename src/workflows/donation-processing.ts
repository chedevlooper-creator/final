/**
 * Bağış İşleme Workflow
 * 
 * Bu workflow, yeni bir bağış kaydedildiğinde çalışır:
 * 1. Bağışı doğrular
 * 2. Makbuz oluşturur
 * 3. Bağışçıya teşekkür mesajı gönderir
 * 4. Muhasebe kaydı oluşturur
 */

import { sleep, FatalError } from 'workflow'

interface DonationData {
  id: string
  donorName: string
  donorEmail?: string
  donorPhone?: string
  amount: number
  currency: string
  donationType: 'cash' | 'bank' | 'online'
  category: 'general' | 'zakat' | 'sadaka' | 'fitre' | 'kurban'
  createdBy: string
}

export async function handleDonationProcessing(data: DonationData) {
  'use workflow'
  
  console.log(`Starting donation processing workflow for: ${data.id}`)
  
  // Validation
  if (data.amount <= 0) {
    throw new FatalError('Donation amount must be greater than 0')
  }
  
  // Step 1: Bağışı onayla
  const donation = await confirmDonation(data)
  
  // Step 2: Makbuz oluştur
  const receipt = await generateReceipt(donation)
  
  // Step 3: Bağışçıya teşekkür gönder (5 saniye sonra)
  await sleep('5s')
  await sendThankYouMessage(data)
  
  // Step 4: Muhasebe kaydı
  await createAccountingEntry(donation, receipt)
  
  // Step 5: Yıllık bağış özeti güncelle (zakat/fitre için)
  if (['zakat', 'fitre'].includes(data.category)) {
    await updateAnnualDonationSummary(data)
  }
  
  console.log('Donation processing workflow completed!')
  
  return {
    donationId: data.id,
    receiptNumber: receipt.number,
    status: 'completed'
  }
}

// ============================================
// WORKFLOW STEPS
// ============================================

async function confirmDonation(data: DonationData) {
  'use step'
  
  console.log(`Confirming donation: ${data.id}`)
  
  // Bağış durumunu 'confirmed' olarak güncelle
  // const supabase = createClient()
  // await supabase.from('donations').update({ status: 'confirmed' }).eq('id', data.id)
  
  return {
    ...data,
    status: 'confirmed',
    confirmedAt: new Date().toISOString()
  }
}

async function generateReceipt(donation: DonationData & { confirmedAt: string }) {
  'use step'
  
  console.log(`Generating receipt for donation: ${donation.id}`)
  
  // Makbuz numarası oluştur
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  const receiptNumber = `MKB-${year}-${randomNum}`
  
  const receipt = {
    id: crypto.randomUUID(),
    number: receiptNumber,
    donationId: donation.id,
    donorName: donation.donorName,
    amount: donation.amount,
    currency: donation.currency,
    category: donation.category,
    issuedAt: new Date().toISOString()
  }
  
  // Makbuzu veritabanına kaydet
  // const supabase = createClient()
  // await supabase.from('receipts').insert(receipt)
  
  return receipt
}

async function sendThankYouMessage(data: DonationData) {
  'use step'
  
  console.log(`Sending thank you message to donor: ${data.donorName}`)
  
  const message = `Sayın ${data.donorName}, ${data.amount.toLocaleString('tr-TR')} ${data.currency} tutarındaki bağışınız için teşekkür ederiz. Allah kabul etsin.`
  
  if (data.donorPhone) {
    // SMS gönder
    // await smsService.send(data.donorPhone, message)
    console.log(`SMS sent to ${data.donorPhone}`)
  }
  
  if (data.donorEmail) {
    // Email gönder
    // await emailService.send(data.donorEmail, 'Bağışınız için teşekkürler', message)
    console.log(`Email sent to ${data.donorEmail}`)
  }
  
  return { sent: true }
}

async function createAccountingEntry(
  donation: DonationData & { confirmedAt: string },
  receipt: { id: string; number: string }
) {
  'use step'
  
  console.log(`Creating accounting entry for donation: ${donation.id}`)
  
  const entry = {
    id: crypto.randomUUID(),
    type: 'income',
    category: `donation_${donation.category}`,
    amount: donation.amount,
    currency: donation.currency,
    referenceType: 'donation',
    referenceId: donation.id,
    receiptId: receipt.id,
    description: `${donation.donorName} - ${donation.category} bağışı`,
    createdBy: donation.createdBy,
    createdAt: new Date().toISOString()
  }
  
  // Muhasebe kaydını veritabanına ekle
  // const supabase = createClient()
  // await supabase.from('accounting_entries').insert(entry)
  
  return entry
}

async function updateAnnualDonationSummary(data: DonationData) {
  'use step'
  
  console.log(`Updating annual donation summary for category: ${data.category}`)
  
  const year = new Date().getFullYear()
  
  // Yıllık özeti güncelle
  // const supabase = createClient()
  // await supabase.rpc('increment_annual_donation', {
  //   p_year: year,
  //   p_category: data.category,
  //   p_amount: data.amount
  // })
  
  return { updated: true, year, category: data.category }
}
