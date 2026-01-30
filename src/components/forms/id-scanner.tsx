'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Camera, X, SwitchCamera, Loader2, ScanLine, Upload, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Tesseract from 'tesseract.js'

export interface ScannedIdData {
  firstName?: string
  lastName?: string
  identityNumber?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
  fatherName?: string
  motherName?: string
  birthPlace?: string
  passportNumber?: string
  passportExpiry?: string
  nationality?: string
  documentType?: 'tc_kimlik' | 'passport' | 'other'
}

interface IdScannerProps {
  onScanComplete: (data: ScannedIdData) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IdScanner({ onScanComplete, open, onOpenChange }: IdScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [scanProgress, setScanProgress] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(isMobileDevice)
    }
    checkMobile()
  }, [])

  // iOS Safari için webkit-playsinline attribute ekle
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setAttribute('webkit-playsinline', 'true')
    }
  }, [])

  // Kamerayı başlat
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      setCameraReady(false)
      
      // Önce mevcut stream'i durdur
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      // Mobil için optimize edilmiş ayarlar
      const constraints: MediaStreamConstraints = {
        video: isMobile ? {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        } : {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Video yüklenene kadar bekle
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setCameraReady(true)
          }).catch((err) => {
            console.error('Video play error:', err)
            // iOS Safari için otomatik play engellenmişse sessizce devam et
            setCameraReady(true)
          })
        }
      }
    } catch (error) {
      console.error('Kamera erişim hatası:', error)
      
      // Daha detaylı hata mesajları
      let errorMessage = 'Kamera erişimi sağlanamadı.'
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Kamera izni reddedildi. Tarayıcı ayarlarından kamera iznini verin.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Kamera başka bir uygulama tarafından kullanılıyor olabilir.'
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Kamera ayarları desteklenmiyor. Lütfen dosya yüklemeyi deneyin.'
        }
      }
      
      setCameraError(errorMessage)
      toast.error(errorMessage)
    }
  }, [facingMode, isMobile, stream])

  // Kamerayı durdur
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  // Dialog açıldığında kamerayı başlat
  useEffect(() => {
    if (open) {
      startCamera()
    } else {
      stopCamera()
      setCapturedImage(null)
      setScanProgress(0)
    }
    return () => {
      stopCamera()
    }
  }, [open, startCamera, stopCamera])

  // Kamera değiştir (mobil için düzeltilmiş)
  const switchCamera = useCallback(async () => {
    // Önce mevcut stream'i durdur
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraReady(false)
    
    // FacingMode'u değiştir
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newFacingMode)
    
    // Yeni kamerayı başlat
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { exact: newFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setCameraReady(true)
          }).catch(() => {
            setCameraReady(true)
          })
        }
      }
    } catch (error) {
      console.error('Kamera değiştirme hatası:', error)
      // Exact constraint başarısız olursa ideal ile dene
      try {
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: newFacingMode },
          },
          audio: false,
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          setCameraReady(true)
        }
      } catch (_fallbackError) {
        toast.error('Kamera değiştirilemedi')
        // Orijinal kamerayı yeniden aç
        startCamera()
      }
    }
  }, [facingMode, stream, startCamera])

  // Fotoğraf çek
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.95)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  // Dosya yükle
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCapturedImage(imageData)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  // Tekrar çek
  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  // TC Kimlik parse et
  const parseTCKimlik = (text: string): ScannedIdData => {
    const data: ScannedIdData = { documentType: 'tc_kimlik' }
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    
    // TC Kimlik No (11 haneli)
    const tcMatch = text.match(/\b(\d{11})\b/)
    if (tcMatch) {
      data.identityNumber = tcMatch[1]
    }

    // Ad Soyad arama - Türkçe karakterli büyük harfler
    const namePattern = /(?:ADI|SOYADI|AD|SOYAD)[:\s]*([A-ZÇĞİÖŞÜ\s]+)/gi
    const names: string[] = []
    let nameMatch
    while ((nameMatch = namePattern.exec(text)) !== null) {
      names.push(nameMatch[1].trim())
    }
    
    if (names.length >= 2) {
      data.firstName = names[0]
      data.lastName = names[1]
    } else if (names.length === 1) {
      // Tek isim bulunduysa, split dene
      const parts = names[0].split(/\s+/)
      if (parts.length >= 2) {
        data.firstName = parts[0]
        data.lastName = parts.slice(1).join(' ')
      }
    }

    // Alternatif isim arama
    if (!data.firstName) {
      for (const line of lines) {
        // Tamamen büyük harfli satırları isim olarak değerlendir
        if (/^[A-ZÇĞİÖŞÜ\s]{3,}$/.test(line) && !line.includes('TÜRKİYE') && !line.includes('KİMLİK')) {
          const parts = line.split(/\s+/)
          if (parts.length >= 2 && !data.firstName) {
            data.firstName = parts[0]
            data.lastName = parts.slice(1).join(' ')
          }
        }
      }
    }

    // Doğum tarihi
    const datePatterns = [
      /(?:DOĞUM TARİHİ|D\.?T\.?)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i,
      /\b(\d{2}[./-]\d{2}[./-]\d{4})\b/,
    ]
    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern)
      if (dateMatch) {
        const [day, month, year] = dateMatch[1].split(/[./-]/)
        data.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        break
      }
    }

    // Cinsiyet
    if (/\b(ERKEK|E)\b/i.test(text)) {
      data.gender = 'male'
    } else if (/\b(KADIN|K)\b/i.test(text)) {
      data.gender = 'female'
    }

    // Baba adı
    const fatherMatch = text.match(/(?:BABA ADI|BABA)[:\s]*([A-ZÇĞİÖŞÜ\s]+)/i)
    if (fatherMatch) {
      data.fatherName = fatherMatch[1].trim()
    }

    // Anne adı
    const motherMatch = text.match(/(?:ANNE ADI|ANNE|ANA ADI)[:\s]*([A-ZÇĞİÖŞÜ\s]+)/i)
    if (motherMatch) {
      data.motherName = motherMatch[1].trim()
    }

    // Doğum yeri
    const birthPlaceMatch = text.match(/(?:DOĞUM YERİ|D\.?Y\.?)[:\s]*([A-ZÇĞİÖŞÜa-zçğıöşü\s]+)/i)
    if (birthPlaceMatch) {
      data.birthPlace = birthPlaceMatch[1].trim()
    }

    return data
  }

  // Pasaport parse et
  const parsePassport = (text: string): ScannedIdData => {
    const data: ScannedIdData = { documentType: 'passport' }

    // MRZ satırlarını bul (genellikle < karakterleri içerir)
    const mrzLines = text.split('\n').filter((line) => line.includes('<'))
    
    if (mrzLines.length >= 2) {
      // MRZ parsing
      const mrzLine1 = mrzLines[0].replace(/\s/g, '')
      const mrzLine2 = mrzLines[1].replace(/\s/g, '')
      
      // Pasaport numarası
      const passportMatch = mrzLine2.match(/^([A-Z0-9]{9})/)
      if (passportMatch) {
        data.passportNumber = passportMatch[1].replace(/</g, '')
      }

      // İsim parsing (< karakterleri ile ayrılmış)
      const namePart = mrzLine1.substring(5)
      const [lastName, ...firstNames] = namePart.split('<<').filter(Boolean)
      if (lastName) {
        data.lastName = lastName.replace(/</g, ' ').trim()
      }
      if (firstNames.length > 0) {
        data.firstName = firstNames.join(' ').replace(/</g, ' ').trim()
      }

      // Doğum tarihi (YYMMDD formatında)
      const birthMatch = mrzLine2.match(/(\d{6})/)
      if (birthMatch) {
        const dobStr = birthMatch[1]
        const year = parseInt(dobStr.substring(0, 2))
        const month = dobStr.substring(2, 4)
        const day = dobStr.substring(4, 6)
        const fullYear = year > 30 ? 1900 + year : 2000 + year
        data.dateOfBirth = `${fullYear}-${month}-${day}`
      }

      // Cinsiyet
      if (mrzLine2.includes('M')) {
        data.gender = 'male'
      } else if (mrzLine2.includes('F')) {
        data.gender = 'female'
      }
    } else {
      // MRZ bulunamadı, normal text parsing
      const passportNumMatch = text.match(/(?:PASSPORT NO|NO)[:\s]*([A-Z0-9]+)/i)
      if (passportNumMatch) {
        data.passportNumber = passportNumMatch[1]
      }

      // İsim arama
      const surnameMatch = text.match(/(?:SURNAME|SOYADI?)[:\s]*([A-ZÇĞİÖŞÜ\s]+)/i)
      if (surnameMatch) {
        data.lastName = surnameMatch[1].trim()
      }

      const givenNameMatch = text.match(/(?:GIVEN NAMES?|ADI?)[:\s]*([A-ZÇĞİÖŞÜ\s]+)/i)
      if (givenNameMatch) {
        data.firstName = givenNameMatch[1].trim()
      }
    }

    return data
  }

  // OCR tarama yap
  const performOCR = async () => {
    if (!capturedImage) return

    setIsScanning(true)
    setScanProgress(0)

    try {
      const result = await Tesseract.recognize(capturedImage, 'tur+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100))
          }
        },
      })

      const text = result.data.text

      // Belge türünü tespit et
      let parsedData: ScannedIdData
      
      if (text.includes('PASSPORT') || text.includes('PASAPORT') || text.includes('<<')) {
        parsedData = parsePassport(text)
      } else {
        parsedData = parseTCKimlik(text)
      }

      // En az bir bilgi çıkarılabildiyse başarılı say
      const hasData = parsedData.firstName || parsedData.lastName || parsedData.identityNumber || parsedData.passportNumber

      if (hasData) {
        toast.success('Kimlik bilgileri okundu')
        onScanComplete(parsedData)
        onOpenChange(false)
      } else {
        toast.warning('Kimlik bilgileri okunamadı. Lütfen daha net bir fotoğraf çekin.')
      }
    } catch (error) {
      console.error('OCR hatası:', error)
      toast.error('Tarama sırasında bir hata oluştu')
    } finally {
      setIsScanning(false)
      setScanProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Kimlik / Pasaport Tara
          </DialogTitle>
          <DialogDescription>
            Kimlik kartını veya pasaportu kameraya gösterin ya da fotoğraf yükleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Kamera / Fotoğraf alanı */}
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            {cameraError && !capturedImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Dosyadan Yükle
                </Button>
              </div>
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
                {/* Kamera hazır değilse loading göster */}
                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-sm">Kamera açılıyor...</span>
                  </div>
                )}
                {/* Tarama çerçevesi */}
                <div className="absolute inset-4 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </>
            )}

            {/* Tarama progress */}
            {isScanning && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium">Taranıyor... %{scanProgress}</p>
                <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Canvas (görünmez) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Dosya input (görünmez) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Kontrol butonları */}
          <div className="flex items-center justify-center gap-2">
            {!capturedImage ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Dosyadan yükle"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={capturePhoto}
                  disabled={!stream || !cameraReady}
                  className="rounded-full w-16 h-16"
                >
                  <Camera className="h-6 w-6" />
                </Button>
                {isMobile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={switchCamera}
                    disabled={!cameraReady}
                    title="Kamera değiştir"
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={retakePhoto} disabled={isScanning}>
                  <X className="h-4 w-4 mr-2" />
                  Tekrar Çek
                </Button>
                <Button type="button" onClick={performOCR} disabled={isScanning}>
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Taranıyor...
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4 mr-2" />
                      Tara ve Oku
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Bilgi notu */}
          <p className="text-xs text-muted-foreground text-center">
            En iyi sonuç için kimliği düz bir zemine koyun ve iyi aydınlatılmış ortamda çekin
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
