/**
 * PDF Export System (PDF Dışa Aktarma Sistemi)
 * 
 * Bu sistem, farklı veri tiplerinden PDF oluşturmak için kullanılır.
 * jsPDF kütüphanesi kullanır.
 * Tüm çıktılar Türkçe dilindedir.
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'

// TypeScript extensions for jsPDF-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

// PDF tipleri
export type PDFType = 'table' | 'report' | 'invoice' | 'certificate' | 'list'

// Sayfa formatları
export type PageFormat = 'a4' | 'letter' | 'legal' | 'a3' | 'a5'

// Sayfa yönlendirmesi
export type PageOrientation = 'portrait' | 'landscape'

// Font stilleri
export type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic'

// Hizalama tipleri
export type Align = 'left' | 'center' | 'right' | 'justify'

// PDF seçenekleri
export interface PDFOptions {
  filename?: string
  format?: PageFormat
  orientation?: PageOrientation
  unit?: 'pt' | 'mm' | 'cm' | 'in'
  compress?: boolean
}

// Tablo sütunu
export interface TableColumn {
  title: string
  dataKey: string
  width?: number
  align?: Align
  styles?: Partial<CellStyles>
  headerStyles?: Partial<CellStyles>
}

// Hücre stilleri
export interface CellStyles {
  fillColor?: number[] // RGB color: [255, 255, 255]
  textColor?: number[]
  fontStyle?: FontStyle
  overflow?: 'linebreak' | 'visible' | 'hidden' | 'ellipsize' | 'visible'
  halign?: Align
  valign?: 'top' | 'middle' | 'bottom'
  fontSize?: number
  cellWidth?: 'auto' | 'wrap' | number
  minCellWidth?: number
  maxCellWidth?: number
  cellPadding?: number | number[]
  lineColor?: number[]
  lineWidth?: number
}

// Başlık seçenekleri
export interface HeaderOptions {
  title?: string
  subtitle?: string
  logo?: string // Base64 encoded image
  showDate?: boolean
  showPageNumbers?: boolean
  backgroundColor?: number[]
  textColor?: number[]
  fontSize?: number
  padding?: number
}

// Alt bilgi seçenekleri
export interface FooterOptions {
  text?: string
  showPageNumbers?: boolean
  textAlign?: Align
  fontSize?: number
  padding?: number
}

// Tablo seçenekleri
export interface TableOptions {
  columns: TableColumn[]
  data: any[]
  showHeader?: boolean
  headerBackgroundColor?: number[]
  headerTextColor?: number[]
  alternateRowColors?: boolean[]
  startY?: number
  styles?: Partial<CellStyles>
  columnStyles?: { [key: string]: Partial<CellStyles> }
  headStyles?: Partial<CellStyles>
  bodyStyles?: Partial<CellStyles>
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
}

// Rapor seçenekleri
export interface ReportOptions {
  title: string
  subtitle?: string
  content?: {
    text?: string
    html?: string
    bulletPoints?: string[]
  }[]
  tables?: TableOptions[]
  images?: { data: string; width?: number; height?: number; caption?: string }[]
  headers?: HeaderOptions
  footers?: FooterOptions
}

// Fatura seçenekleri
export interface InvoiceOptions {
  invoiceNumber: string
  date: string
  dueDate?: string
  from: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
  to: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
  items: {
    description: string
    quantity: number
    unitPrice: number
    total?: number
  }[]
  notes?: string
  taxRate?: number
  currency?: string
  language?: 'tr' | 'en'
}

// Sertifika seçenekleri
export interface CertificateOptions {
  title: string
  recipientName: string
  description: string
  date: string
  signature?: string
  logo?: string
  template?: 'classic' | 'modern' | 'elegant'
  language?: 'tr' | 'en'
}

// PDF Generator Class
export class PDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin = { top: 20, right: 20, bottom: 20, left: 20 }

  constructor(options: PDFOptions = {}) {
    this.doc = new jsPDF({
      format: options.format || 'a4',
      orientation: options.orientation || 'portrait',
      unit: options.unit || 'mm',
      compress: options.compress !== false,
    })

    const pageSize = this.doc.internal.pageSize
    this.pageWidth = pageSize.getWidth()
    this.pageHeight = pageSize.getHeight()
  }

  /**
   * Başlık ekle
   */
  addHeader(options: HeaderOptions = {}): number {
    const {
      title = '',
      subtitle = '',
      logo,
      showDate = true,
      backgroundColor = [66, 139, 202], // Bootstrap primary blue
      textColor = [255, 255, 255],
      fontSize = 18,
      padding = 15,
    } = options

    // Arka plan
    this.doc.setFillColor(...backgroundColor)
    this.doc.rect(0, 0, this.pageWidth, padding + (subtitle ? 25 : 20), 'F')

    // Logo
    let yOffset = padding
    if (logo) {
      this.doc.addImage(logo, 'PNG', this.margin.left, yOffset, 20, 20)
      yOffset += 25
    }

    // Başlık
    this.doc.setTextColor(...textColor)
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, logo ? this.margin.left + 25 : this.margin.left, yOffset, {
      align: 'left',
      maxWidth: this.pageWidth - 2 * this.margin.left,
    })

    // Alt başlık
    if (subtitle) {
      this.doc.setFontSize(fontSize - 4)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(subtitle, this.margin.left, yOffset + 8, {
        align: 'left',
        maxWidth: this.pageWidth - 2 * this.margin.left,
      })
      yOffset += 8
    }

    // Tarih
    if (showDate) {
      const date = new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(date, this.pageWidth - this.margin.right, yOffset, { align: 'right' })
    }

    return padding + (subtitle ? 33 : 28)
  }

  /**
   * Alt bilgi ekle
   */
  addFooter(options: FooterOptions = {}): void {
    const {
      text = '',
      showPageNumbers = true,
      textAlign = 'center',
      fontSize = 9,
      padding = 10,
    } = options

    const pages = this.doc.internal.getNumberOfPages()

    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(fontSize)
      this.doc.setTextColor(128, 128, 128)
      this.doc.setFont('helvetica', 'normal')

      const yPos = this.pageHeight - padding

      // Sayfa numarası
      if (showPageNumbers) {
        const pageText = `${i} / ${pages}`
        this.doc.text(
          pageText,
          this.pageWidth / 2,
          yPos,
          { align: 'center' }
        )
      }

      // Metin
      if (text) {
        this.doc.text(
          text,
          textAlign === 'center' ? this.pageWidth / 2 : this.margin.left,
          yPos + 5,
          { align: textAlign }
        )
      }
    }
  }

  /**
   * Tablo ekle
   */
  addTable(options: TableOptions): number {
    const {
      columns,
      data,
      showHeader = true,
      headerBackgroundColor = [66, 139, 202],
      headerTextColor = [255, 255, 255],
      alternateRowColors = [[245, 245, 245], [255, 255, 255]],
      startY,
      styles = {},
      columnStyles = {},
      headStyles = {},
      bodyStyles = {},
      margin = {},
    } = options

    // Column'ları jsPDF formatına çevir
    const tableColumns = columns.map((col) => ({
      header: col.title,
      dataKey: col.dataKey,
      width: col.width || 'auto',
      styles: {
        halign: col.align || 'left',
        ...col.styles,
      },
      headerStyles: col.headerStyles || {},
    }))

    // Varsayılan stiller
    const defaultStyles: CellStyles = {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak',
      ...styles,
    }

    // Başlık stilleri
    const defaultHeadStyles: CellStyles = {
      fillColor: headerBackgroundColor,
      textColor: headerTextColor,
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'center',
      ...headStyles,
    }

    // Gövde stilleri
    const defaultBodyStyles: CellStyles = {
      fillColor: alternateRowColors ? alternateRowColors[1] : undefined,
      fontSize: 10,
      ...bodyStyles,
    }

    // Tabloyu ekle
    this.doc.autoTable({
      columns: tableColumns,
      body: data,
      startY: startY || this.doc.lastAutoTable.finalY + 10 || 20,
      showHead: showHeader,
      styles: defaultStyles,
      headStyles: defaultHeadStyles,
      bodyStyles: defaultBodyStyles,
      columnStyles,
      alternateRowStyles: {
        fillColor: alternateRowColors ? alternateRowColors[0] : undefined,
      },
      margin: {
        top: margin.top || this.margin.top,
        right: margin.right || this.margin.right,
        bottom: margin.bottom || this.margin.bottom,
        left: margin.left || this.margin.left,
      },
      theme: 'grid',
    })

    return (this.doc.lastAutoTable.finalY || 0) + 10
  }

  /**
   * Metin ekle
   */
  addText(
    text: string,
    options: {
      fontSize?: number
      color?: number[]
      align?: Align
      maxWidth?: number
      fontStyle?: FontStyle
      lineHeight?: number
    } = {}
  ): number {
    const {
      fontSize = 11,
      color = [0, 0, 0],
      align = 'left',
      maxWidth = this.pageWidth - 2 * this.margin.left,
      fontStyle = 'normal',
      lineHeight = 1.5,
    } = options

    this.doc.setFontSize(fontSize)
    this.doc.setTextColor(...color)
    this.doc.setFont('helvetica', fontStyle)

    const lines = this.doc.splitTextToSize(text, maxWidth)
    const yPos = this.doc.lastAutoTable.finalY
      ? this.doc.lastAutoTable.finalY + 10
      : this.doc.getY() || 20

    this.doc.text(lines, this.margin.left, yPos, { align, maxWidth })

    return yPos + lines.length * fontSize * 0.352 * lineHeight
  }

  /**
   * Resim ekle
   */
  addImage(
    imageData: string,
    options: {
      x?: number
      y?: number
      width?: number
      height?: number
      alignment?: 'left' | 'center' | 'right'
      caption?: string
    } = {}
  ): number {
    const {
      x,
      y,
      width = 100,
      height,
      alignment = 'center',
      caption,
    } = options

    let xPos = x
    let yPos = y

    if (xPos === undefined) {
      xPos = this.margin.left
      if (alignment === 'center') {
        xPos = (this.pageWidth - width) / 2
      } else if (alignment === 'right') {
        xPos = this.pageWidth - this.margin.right - width
      }
    }

    if (yPos === undefined) {
      yPos = this.doc.lastAutoTable.finalY
        ? this.doc.lastAutoTable.finalY + 10
        : this.doc.getY() || 20
    }

    this.doc.addImage(imageData, 'PNG', xPos, yPos, width, height)

    let finalY = yPos + (height || width * 0.75)

    // Başlık
    if (caption) {
      this.doc.setFontSize(10)
      this.doc.setTextColor(100, 100, 100)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text(caption, this.pageWidth / 2, finalY + 5, { align: 'center' })
      finalY += 10
    }

    return finalY
  }

  /**
   * Yeni sayfa ekle
   */
  addPage(): void {
    this.doc.addPage()
  }

  /**
   * PDF'i indir
   */
  download(filename: string): void {
    this.doc.save(filename)
  }

  /**
   * PDF'i blob olarak al
   */
  getBlob(): Blob {
    return this.doc.output('blob')
  }

  /**
   * PDF'i base64 olarak al
   */
  getBase64(): string {
    return this.doc.output('datauristring')
  }

  /**
   * Rapor oluştur
   */
  static createReport(options: ReportOptions, pdfOptions?: PDFOptions): PDFGenerator {
    const generator = new PDFGenerator(pdfOptions)

    let currentY = 0

    // Başlık
    if (options.headers) {
      currentY = generator.addHeader({
        title: options.title,
        subtitle: options.subtitle,
        ...options.headers,
      })
    }

    // İçerik
    if (options.content) {
      for (const item of options.content) {
        if (item.text) {
          currentY = generator.addText(item.text) + 5
        }
        if (item.bulletPoints) {
          generator.doc.setFontSize(11)
          generator.doc.setTextColor(0, 0, 0)
          generator.doc.setFont('helvetica', 'normal')

          for (const point of item.bulletPoints) {
            generator.doc.text(`• ${point}`, generator.margin.left, currentY, {
              maxWidth: generator.pageWidth - 2 * generator.margin.left,
            })
            currentY += 7
          }
          currentY += 5
        }
      }
    }

    // Tablolar
    if (options.tables) {
      for (const table of options.tables) {
        currentY = generator.addTable({ ...table, startY: currentY })
      }
    }

    // Resimler
    if (options.images) {
      for (const image of options.images) {
        currentY = generator.addImage({
          data: image.data,
          caption: image.caption,
          ...image,
        })
      }
    }

    // Alt bilgi
    if (options.footers) {
      generator.addFooter(options.footers)
    }

    return generator
  }

  /**
   * Fatura oluştur
   */
  static createInvoice(options: InvoiceOptions, pdfOptions?: PDFOptions): PDFGenerator {
    const generator = new PDFGenerator(pdfOptions)
    const lang = options.language || 'tr'

    // Başlık
    const titleText = lang === 'tr' ? 'FATURA' : 'INVOICE'
    generator.addHeader({
      title: titleText,
      showDate: false,
    })

    let currentY = 50

    // Fatura numarası ve tarih
    generator.doc.setFontSize(10)
    generator.doc.setTextColor(100, 100, 100)
    generator.doc.setFont('helvetica', 'normal')

    const invoiceLabel = lang === 'tr' ? 'Fatura No:' : 'Invoice No:'
    const dateLabel = lang === 'tr' ? 'Tarih:' : 'Date:'
    const dueDateLabel = lang === 'tr' ? 'Vade Tarihi:' : 'Due Date:'

    generator.doc.text(`${invoiceLabel} ${options.invoiceNumber}`, generator.margin.left, currentY)
    generator.doc.text(`${dateLabel} ${options.date}`, generator.pageWidth - generator.margin.right, currentY, {
      align: 'right',
    })
    currentY += 8

    if (options.dueDate) {
      generator.doc.text(`${dueDateLabel} ${options.dueDate}`, generator.pageWidth - generator.margin.right, currentY, {
        align: 'right',
      })
      currentY += 10
    }

    // Satıcı ve alıcı bilgileri
    const fromLabel = lang === 'tr' ? 'Satıcı:' : 'From:'
    const toLabel = lang === 'tr' ? 'Alıcı:' : 'To:'

    generator.doc.setFontSize(11)
    generator.doc.setTextColor(0, 0, 0)
    generator.doc.setFont('helvetica', 'bold')
    generator.doc.text(fromLabel, generator.margin.left, currentY)
    currentY += 7

    generator.doc.setFont('helvetica', 'normal')
    generator.doc.setFontSize(10)
    generator.doc.text(options.from.name, generator.margin.left, currentY)
    currentY += 6

    if (options.from.address) {
      generator.doc.text(options.from.address, generator.margin.left, currentY)
      currentY += 6
    }
    if (options.from.phone) {
      generator.doc.text(options.from.phone, generator.margin.left, currentY)
      currentY += 6
    }
    if (options.from.email) {
      generator.doc.text(options.from.email, generator.margin.left, currentY)
      currentY += 10
    }

    // Alıcı
    generator.doc.setFont('helvetica', 'bold')
    generator.doc.setFontSize(11)
    generator.doc.text(toLabel, generator.pageWidth / 2, currentY - (currentY - 50) * 1)
    currentY = 50 + (options.from.address ? 30 : 20)

    generator.doc.setFont('helvetica', 'normal')
    generator.doc.setFontSize(10)
    generator.doc.text(options.to.name, generator.pageWidth / 2, currentY)
    currentY += 6

    if (options.to.address) {
      generator.doc.text(options.to.address, generator.pageWidth / 2, currentY)
      currentY += 6
    }
    if (options.to.phone) {
      generator.doc.text(options.to.phone, generator.pageWidth / 2, currentY)
      currentY += 6
    }
    if (options.to.email) {
      generator.doc.text(options.to.email, generator.pageWidth / 2, currentY)
      currentY += 10
    }

    // Kalemler tablosu
    const currency = options.currency || (lang === 'tr' ? '₺' : '$')
    const descLabel = lang === 'tr' ? 'Açıklama' : 'Description'
    const qtyLabel = lang === 'tr' ? 'Miktar' : 'Quantity'
    const priceLabel = lang === 'tr' ? 'Birim Fiyat' : 'Unit Price'
    const totalLabel = lang === 'tr' ? 'Toplam' : 'Total'

    generator.addTable({
      columns: [
        { title: descLabel, dataKey: 'description', width: 80 },
        { title: qtyLabel, dataKey: 'quantity', width: 30, align: 'right' },
        { title: priceLabel, dataKey: 'unitPrice', width: 40, align: 'right' },
        { title: totalLabel, dataKey: 'total', width: 40, align: 'right' },
      ],
      data: options.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: `${currency} ${item.unitPrice.toFixed(2)}`,
        total: `${currency} ${(item.total || item.quantity * item.unitPrice).toFixed(2)}`,
      })),
      startY: currentY,
    })

    // Toplam
    const subtotal = options.items.reduce((sum, item) => sum + (item.total || item.quantity * item.unitPrice), 0)
    const tax = options.taxRate ? subtotal * (options.taxRate / 100) : 0
    const total = subtotal + tax

    currentY = generator.doc.lastAutoTable.finalY + 10

    const subtotalText = lang === 'tr' ? 'Ara Toplam:' : 'Subtotal:'
    const taxText = lang === 'tr' ? `KDV (%${options.taxRate || 0}):` : `Tax (%${options.taxRate || 0}):`
    const totalText = lang === 'tr' ? 'GENEL TOPLAM:' : 'GRAND TOTAL:'

    generator.doc.setFontSize(10)
    generator.doc.text(`${subtotalText} ${currency} ${subtotal.toFixed(2)}`, generator.pageWidth - generator.margin.right, currentY, {
      align: 'right',
    })
    currentY += 7

    if (options.taxRate) {
      generator.doc.text(`${taxText} ${currency} ${tax.toFixed(2)}`, generator.pageWidth - generator.margin.right, currentY, {
        align: 'right',
      })
      currentY += 7
    }

    generator.doc.setFont('helvetica', 'bold')
    generator.doc.setFontSize(12)
    generator.doc.text(`${totalText} ${currency} ${total.toFixed(2)}`, generator.pageWidth - generator.margin.right, currentY, {
      align: 'right',
    })

    // Notlar
    if (options.notes) {
      currentY += 15
      generator.doc.setFont('helvetica', 'bold')
      generator.doc.setFontSize(10)
      const notesLabel = lang === 'tr' ? 'Notlar:' : 'Notes:'
      generator.doc.text(notesLabel, generator.margin.left, currentY)
      currentY += 6

      generator.doc.setFont('helvetica', 'normal')
      const lines = generator.doc.splitTextToSize(options.notes, generator.pageWidth - 2 * generator.margin.left)
      generator.doc.text(lines, generator.margin.left, currentY)
    }

    return generator
  }

  /**
   * Sertifika oluştur
   */
  static createCertificate(options: CertificateOptions, pdfOptions?: PDFOptions): PDFGenerator {
    const generator = new PDFGenerator(pdfOptions)
    const template = options.template || 'classic'
    const lang = options.language || 'tr'

    // Kenarlık
    generator.doc.setDrawColor(200, 150, 50) // Altın rengi
    generator.doc.setLineWidth(2)
    generator.doc.rect(10, 10, generator.pageWidth - 20, generator.pageHeight - 20)

    generator.doc.setLineWidth(0.5)
    generator.doc.setDrawColor(150, 100, 50)
    generator.doc.rect(15, 15, generator.pageWidth - 30, generator.pageHeight - 30)

    // Başlık
    const titleText = lang === 'tr' ? 'SERTİİKA' : 'CERTIFICATE'
    generator.doc.setFontSize(36)
    generator.doc.setTextColor(50, 50, 50)
    generator.doc.setFont('helvetica', 'bold')
    generator.doc.text(titleText, generator.pageWidth / 2, 50, { align: 'center' })

    // Alt başlık
    generator.doc.setFontSize(14)
    generator.doc.setTextColor(100, 100, 100)
    generator.doc.setFont('helvetica', 'italic')
    const ofExcellence = lang === 'tr' ? 'Başarı Belgesi' : 'of Achievement'
    generator.doc.text(ofExcellence, generator.pageWidth / 2, 65, { align: 'center' })

    // Logo
    if (options.logo) {
      generator.doc.addImage(options.logo, 'PNG', generator.pageWidth / 2 - 25, 75, 50, 50)
    }

    // Alıcı adı
    const presentedTo = lang === 'tr' ? 'Bu belge, aşağıdaki kişiye sunulmuştur:' : 'This certificate is proudly presented to:'
    generator.doc.setFontSize(12)
    generator.doc.setTextColor(80, 80, 80)
    generator.doc.setFont('helvetica', 'normal')
    generator.doc.text(presentedTo, generator.pageWidth / 2, 135, { align: 'center' })

    generator.doc.setFontSize(28)
    generator.doc.setTextColor(0, 0, 0)
    generator.doc.setFont('helvetica', 'bold')
    generator.doc.text(options.recipientName, generator.pageWidth / 2, 155, { align: 'center' })

    // Açıklama
    generator.doc.setFontSize(14)
    generator.doc.setTextColor(80, 80, 80)
    generator.doc.setFont('helvetica', 'normal')
    generator.doc.text(options.description, generator.pageWidth / 2, 180, {
      align: 'center',
      maxWidth: generator.pageWidth - 60,
    })

    // Tarih
    const dateText = lang === 'tr' ? 'Tarih' : 'Date'
    generator.doc.setFontSize(12)
    generator.doc.setFont('helvetica', 'bold')
    generator.doc.text(`${dateText}: ${options.date}`, generator.pageWidth / 2, 220, { align: 'center' })

    // İmza
    if (options.signature) {
      generator.doc.setFontSize(10)
      generator.doc.setTextColor(100, 100, 100)
      generator.doc.setFont('helvetica', 'italic')
      generator.doc.text(options.signature, generator.pageWidth / 2, 250, { align: 'center' })
    }

    return generator
  }
}

// Convenience fonksiyonlar
export const pdf = {
  /**
   * Basit tablo PDF'i oluştur ve indir
   */
  downloadTable: (
    filename: string,
    title: string,
    columns: TableColumn[],
    data: any[],
    options?: PDFOptions
  ) => {
    const generator = new PDFGenerator(options)
    generator.addHeader({ title })
    generator.addTable({ columns, data })
    generator.addFooter({ showPageNumbers: true })
    generator.download(filename)
  },

  /**
   * Rapor PDF'i oluştur ve indir
   */
  downloadReport: (filename: string, options: ReportOptions, pdfOptions?: PDFOptions) => {
    const generator = PDFGenerator.createReport(options, pdfOptions)
    generator.download(filename)
  },

  /**
   * Fatura PDF'i oluştur ve indir
   */
  downloadInvoice: (filename: string, options: InvoiceOptions, pdfOptions?: PDFOptions) => {
    const generator = PDFGenerator.createInvoice(options, pdfOptions)
    generator.download(filename)
  },

  /**
   * Sertifika PDF'i oluştur ve indir
   */
  downloadCertificate: (filename: string, options: CertificateOptions, pdfOptions?: PDFOptions) => {
    const generator = PDFGenerator.createCertificate(options, pdfOptions)
    generator.download(filename)
  },
}

/**
 * Kullanım örnekleri:
 * 
 * // Basit tablo PDF'i
 * pdf.downloadTable(
 *   'rapor.pdf',
 *   'Satış Raporu',
 *   [
 *     { title: 'Ürün', dataKey: 'product' },
 *     { title: 'Adet', dataKey: 'quantity' },
 *     { title: 'Fiyat', dataKey: 'price' },
 *   ],
 *   [
 *     { product: 'Laptop', quantity: 10, price: 15000 },
 *     { product: 'Mouse', quantity: 50, price: 150 },
 *   ]
 * )
 * 
 * // Fatura
 * pdf.downloadInvoice('fatura-001.pdf', {
 *   invoiceNumber: 'INV-001',
 *   date: '18.01.2026',
 *   from: { name: 'ABC Şirketi', address: 'İstanbul, Türkiye' },
 *   to: { name: 'Müşteri A', address: 'Ankara, Türkiye' },
 *   items: [
 *     { description: 'Hizmet', quantity: 1, unitPrice: 5000 },
 *   ],
 *   taxRate: 20,
 *   language: 'tr',
 * })
 * 
 * // Sertifika
 * pdf.downloadCertificate('sertifika.pdf', {
 *   recipientName: 'Ahmet Yılmaz',
 *   description: 'Baarılı bir şekilde eğitim programını tamamlamıştır.',
 *   date: '18 Ocak 2026',
 *   template: 'elegant',
 *   language: 'tr',
 * })
 */
