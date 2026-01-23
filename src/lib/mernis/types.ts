/**
 * Mernis (Merkezi Nüfus İdare Sistemi) API Types
 * TC Kimlik Doğrulama servisi için tip tanımlamaları
 */

/**
 * TC Kimlik doğrulama isteği
 */
export interface MernisVerifyRequest {
  tcKimlikNo: string
  ad: string
  soyad: string
  dogumYili: number
}

/**
 * TC Kimlik doğrulama yanıtı
 */
export interface MernisVerifyResponse {
  success: boolean
  verified: boolean
  message: string
  timestamp: string
}

/**
 * Mernis API hata tipleri
 */
export type MernisErrorCode = 
  | 'INVALID_TC_NUMBER'    // Geçersiz TC Kimlik numarası formatı
  | 'INVALID_NAME'          // Geçersiz isim
  | 'INVALID_SURNAME'       // Geçersiz soyisim
  | 'INVALID_BIRTH_YEAR'    // Geçersiz doğum yılı
  | 'SERVICE_ERROR'         // Servis hatası
  | 'VERIFICATION_FAILED'   // Doğrulama başarısız
  | 'RATE_LIMIT_EXCEEDED'   // İstek limiti aşıldı
  | 'UNAUTHORIZED'          // Yetkilendirme hatası

/**
 * Mernis API hata sınıfı
 */
export class MernisError extends Error {
  constructor(
    message: string,
    public code: MernisErrorCode,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'MernisError'
  }
}

/**
 * TC Kimlik numarası formatı
 * 11 haneli, ilk hane 0 olamaz
 */
export function isValidTCKimlikFormat(tcKimlikNo: string): boolean {
  // 11 haneli olmalı
  if (!/^\d{11}$/.test(tcKimlikNo)) return false
  
  // İlk hane 0 olamaz
  if (tcKimlikNo[0] === '0') return false
  
  // Algoritma kontrolü
  const digits = tcKimlikNo.split('').map(Number)
  
  // 10. hane kontrolü
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7]
  const digit10 = ((sumOdd * 7) - sumEven) % 10
  if (digits[9] !== digit10) return false
  
  // 11. hane kontrolü
  const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  const digit11 = sum10 % 10
  if (digits[10] !== digit11) return false
  
  return true
}

/**
 * İsim/soyisim formatını temizle (Türkçe karakterlere uygun)
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
}

/**
 * Doğum yılı geçerlilik kontrolü
 */
export function isValidBirthYear(year: number): boolean {
  const currentYear = new Date().getFullYear()
  return year >= 1900 && year <= currentYear
}
