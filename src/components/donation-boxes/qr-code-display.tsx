'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, QrCode, Printer } from 'lucide-react'
import Image from 'next/image'

interface QRCodeDisplayProps {
  qrCodeUrl: string | null | undefined
  boxCode: string
  boxName: string
  size?: 'sm' | 'md' | 'lg'
}

export function QRCodeDisplay({ 
  qrCodeUrl, 
  boxCode, 
  boxName,
  size = 'md' 
}: QRCodeDisplayProps) {
  const [showModal, setShowModal] = useState(false)
  
  if (!qrCodeUrl) {
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-lg text-muted-foreground text-xs">
        QR Yok
      </div>
    )
  }
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-32'
  }
  
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `kumbara-qr-${boxCode}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kumbara QR Kod - ${boxCode}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column;
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 40px;
                border: 2px solid #333;
                border-radius: 8px;
              }
              img { 
                width: 40mm; 
                height: 40mm;
                image-rendering: pixelated;
              }
              .code { 
                font-size: 24px; 
                font-weight: bold; 
                margin-top: 20px;
                letter-spacing: 2px;
              }
              .name {
                font-size: 16px;
                color: #666;
                margin-top: 8px;
              }
              .info {
                font-size: 12px;
                color: #999;
                margin-top: 16px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Kod" />
              <div class="code">${boxCode}</div>
              <div class="name">${boxName}</div>
              <div class="info">Bu kumbarayı okutarak bilgilerine ulaşabilirsiniz</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <>
      <div 
        className={`${sizeClasses[size]} relative cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => setShowModal(true)}
      >
        <Image
          src={qrCodeUrl}
          alt={`QR Kod - ${boxCode}`}
          fill
          className="object-contain"
        />
      </div>
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Kumbara QR Kodu</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            {/* QR Kod - 40x40 mm boyutunda (151x151 px @ 96 DPI) */}
            <div className="relative w-[151px] h-[151px] border-2 border-gray-200 rounded-lg p-2">
              <Image
                src={qrCodeUrl}
                alt={`QR Kod - ${boxCode}`}
                fill
                className="object-contain p-2"
              />
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold tracking-wider">{boxCode}</p>
              <p className="text-muted-foreground">{boxName}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Boyut: 40 x 40 mm
              </p>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// QR kod ile hızlı kumbara arama bileşeni
export function QRScannerButton() {
  const [scanning, setScanning] = useState(false)
  
  return (
    <Button 
      variant="outline" 
      onClick={() => setScanning(true)}
      className="gap-2"
    >
      <QrCode className="h-4 w-4" />
      QR Tara
    </Button>
  )
}
