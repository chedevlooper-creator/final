/**
 * Mernis API Client
 * TC Kimlik Doğrulama servisi
 * 
 * Bu client, Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü'nün
 * TC Kimlik Doğrulama web servisini kullanır.
 * 
 * Servis URL: https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx
 */

import {
  MernisVerifyRequest,
  MernisVerifyResponse,
  MernisError,
  isValidTCKimlikFormat,
  sanitizeName,
  isValidBirthYear,
} from './types'

const MERNIS_WSDL_URL = 'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx'

/**
 * SOAP envelope template for TC Kimlik verification
 */
function createSoapEnvelope(request: MernisVerifyRequest): string {
  const { tcKimlikNo, ad, soyad, dogumYili } = request
  
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${tcKimlikNo}</TCKimlikNo>
      <Ad>${sanitizeName(ad)}</Ad>
      <Soyad>${sanitizeName(soyad)}</Soyad>
      <DogumYili>${dogumYili}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`
}

/**
 * Parse SOAP response
 */
function parseSoapResponse(xml: string): boolean {
  // Extract the result from SOAP response
  const match = xml.match(/<TCKimlikNoDogrulaResult>(.*?)<\/TCKimlikNoDogrulaResult>/i)
  if (match && match[1]) {
    return match[1].toLowerCase() === 'true'
  }
  return false
}

/**
 * Validate input before making API call
 */
function validateInput(request: MernisVerifyRequest): void {
  // TC Kimlik numarası kontrolü
  if (!isValidTCKimlikFormat(request.tcKimlikNo)) {
    throw new MernisError(
      'Geçersiz TC Kimlik numarası formatı',
      'INVALID_TC_NUMBER',
      400
    )
  }
  
  // İsim kontrolü
  if (!request.ad || request.ad.trim().length < 2) {
    throw new MernisError(
      'İsim en az 2 karakter olmalıdır',
      'INVALID_NAME',
      400
    )
  }
  
  // Soyisim kontrolü
  if (!request.soyad || request.soyad.trim().length < 2) {
    throw new MernisError(
      'Soyisim en az 2 karakter olmalıdır',
      'INVALID_SURNAME',
      400
    )
  }
  
  // Doğum yılı kontrolü
  if (!isValidBirthYear(request.dogumYili)) {
    throw new MernisError(
      'Geçersiz doğum yılı',
      'INVALID_BIRTH_YEAR',
      400
    )
  }
}

/**
 * TC Kimlik numarası doğrulama
 */
export async function verifyTCKimlik(
  request: MernisVerifyRequest
): Promise<MernisVerifyResponse> {
  try {
    // Input validation
    validateInput(request)
    
    const soapEnvelope = createSoapEnvelope(request)
    
    const response = await fetch(MERNIS_WSDL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula',
      },
      body: soapEnvelope,
    })
    
    if (!response.ok) {
      throw new MernisError(
        'Mernis servisi yanıt vermedi',
        'SERVICE_ERROR',
        response.status
      )
    }
    
    const xml = await response.text()
    const verified = parseSoapResponse(xml)
    
    return {
      success: true,
      verified,
      message: verified 
        ? 'TC Kimlik doğrulaması başarılı' 
        : 'TC Kimlik bilgileri eşleşmiyor',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    if (error instanceof MernisError) {
      return {
        success: false,
        verified: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      }
    }
    
    console.error('Mernis verification error:', error)
    
    return {
      success: false,
      verified: false,
      message: 'TC Kimlik doğrulama sırasında bir hata oluştu',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Sadece TC Kimlik algoritması ile doğrulama (API çağrısı yapmadan)
 * Test ve offline kontrol için kullanılabilir
 */
export function verifyTCKimlikOffline(tcKimlikNo: string): boolean {
  return isValidTCKimlikFormat(tcKimlikNo)
}
