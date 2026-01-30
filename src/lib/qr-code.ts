// ============================================
// QR KOD OLUŞTURMA UTILITIES
// ============================================

import QRCode from 'qrcode'

export interface QROptions {
  width?: number
  height?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

// 40x40 mm ≈ 151x151 px (96 DPI için)
// Yüksek kalite için 200x200 px kullanıyoruz
const DEFAULT_SIZE = 200

/**
 * QR kod içeriği oluştur
 * Format: KUMBARA|KOD|UUID
 */
export function generateBoxQRContent(boxCode: string, boxId: string): string {
  return `KUMBARA|${boxCode}|${boxId}`
}

/**
 * QR kodu Data URL olarak oluştur (PNG)
 * 40x40 mm = yaklaşık 151x151 px @ 96 DPI
 * Yüksek kalite için 200x200 px
 */
export async function generateQRCodeDataURL(
  content: string,
  options: QROptions = {}
): Promise<string> {
  const {
    width = DEFAULT_SIZE,
    height = DEFAULT_SIZE,
    margin = 2,
    color = { dark: '#000000', light: '#FFFFFF' }
  } = options

  try {
    const dataUrl = await QRCode.toDataURL(content, {
      width,
      height,
      margin,
      color,
      type: 'image/png',
      errorCorrectionLevel: 'H', // Yüksek hata düzeltme (hasarlı okunabilir)
    })
    
    return dataUrl
  } catch (error) {
    console.error('QR kod oluşturma hatası:', error)
    throw new Error('QR kod oluşturulamadı')
  }
}

/**
 * QR kodu Buffer olarak oluştur (Storage için)
 */
export async function generateQRCodeBuffer(
  content: string,
  options: QROptions = {}
): Promise<Buffer> {
  const {
    width = DEFAULT_SIZE,
    height = DEFAULT_SIZE,
    margin = 2,
    color = { dark: '#000000', light: '#FFFFFF' }
  } = options

  try {
    const buffer = await QRCode.toBuffer(content, {
      width,
      height,
      margin,
      color,
      type: 'png',
      errorCorrectionLevel: 'H',
    })
    
    return buffer
  } catch (error) {
    console.error('QR kod buffer oluşturma hatası:', error)
    throw new Error('QR kod oluşturulamadı')
  }
}

/**
 * QR kod içeriğini parse et
 */
export function parseQRContent(qrContent: string): {
  type: string
  code: string
  id: string
} | null {
  const parts = qrContent.split('|')
  
  if (parts.length !== 3 || parts[0] !== 'KUMBARA') {
    return null
  }
  
  return {
    type: parts[0],
    code: parts[1],
    id: parts[2]
  }
}

/**
 * Kumbara için özel QR kod oluştur ve Storage'a kaydet
 */
export async function generateAndUploadBoxQR(
  boxId: string,
  boxCode: string,
  supabase: any
): Promise<string> {
  const content = generateBoxQRContent(boxCode, boxId)
  
  // QR kod buffer oluştur
  const buffer = await generateQRCodeBuffer(content, {
    width: 400, // Yüksek kalite için büyük boyut
    height: 400,
    margin: 4,
  })
  
  // Storage'a kaydet
  const fileName = `boxes/${boxId}/qr-code-${Date.now()}.png`
  
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('donation-boxes')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    })
  
  if (uploadError) {
    console.error('QR kod yükleme hatası:', uploadError)
    throw new Error('QR kod kaydedilemedi')
  }
  
  // Public URL al
  const { data: { publicUrl } } = supabase
    .storage
    .from('donation-boxes')
    .getPublicUrl(fileName)
  
  return publicUrl
}
