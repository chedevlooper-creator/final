/**
 * Excel Export Library
 *
 * Excel dosyası export işlemleri için utility fonksiyonlar
 *
 * Uses ExcelJS - a secure and actively maintained Excel library
 * https://github.com/exceljs/exceljs
 */

import ExcelJS from 'exceljs'

export interface ExcelExportOptions {
  filename: string
  sheetName?: string
  author?: string
  title?: string
  subject?: string
}

export interface ExcelColumn<T = unknown> {
  header: string
  key: string
  width?: number
  format?: (value: T) => string | number | boolean
}

/**
 * Basit veriyi Excel'e export eder
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelExportOptions
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook()

  // Metadata
  workbook.creator = options.author || 'Yardım Yönetim Paneli'
  workbook.created = new Date()
  if (options.title) {
    workbook.title = options.title
  }
  if (options.subject) {
    workbook.subject = options.subject
  }

  const sheetName = options.sheetName || 'Sheet1'
  const worksheet = workbook.addWorksheet(sheetName)

  // Get columns from first row
  if (data.length > 0) {
    const keys = Object.keys(data[0])
    worksheet.columns = keys.map(key => ({
      header: key,
      key: key,
      width: 15
    }))

    // Add rows
    data.forEach(row => {
      worksheet.addRow(row)
    })

    // Style header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

/**
 * Browser'da Excel dosyası indir
 */
export async function downloadExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelExportOptions
): Promise<void> {
  const buffer = await exportToExcel(data, options)

  // Create blob and download
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = options.filename + '.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Column mapping ile Excel export
 */
export async function exportToExcelWithColumns<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn<unknown>[],
  options: ExcelExportOptions
): Promise<void> {
  const workbook = new ExcelJS.Workbook()

  // Metadata
  workbook.creator = options.author || 'Yardım Yönetim Paneli'
  workbook.created = new Date()
  if (options.title) {
    workbook.title = options.title
  }

  const sheetName = options.sheetName || 'Sheet1'
  const worksheet = workbook.addWorksheet(sheetName)

  // Set columns
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 15
  }))

  // Add rows with formatting
  data.forEach(row => {
    const formattedRow: Record<string, unknown> = {}
    columns.forEach(col => {
      const value = row[col.key]
      formattedRow[col.key] = col.format ? col.format(value) : value
    })
    worksheet.addRow(formattedRow)
  })

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  }

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = options.filename + '.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Multiple sheets export
 */
export async function exportToExcelMultipleSheets(
  sheets: Array<{
    name: string
    data: Record<string, unknown>[]
  }>,
  options: ExcelExportOptions
): Promise<void> {
  const workbook = new ExcelJS.Workbook()

  // Metadata
  workbook.creator = options.author || 'Yardım Yönetim Paneli'
  workbook.created = new Date()
  if (options.title) {
    workbook.title = options.title
  }

  sheets.forEach(sheet => {
    const worksheet = workbook.addWorksheet(sheet.name)

    if (sheet.data.length > 0) {
      const keys = Object.keys(sheet.data[0])
      worksheet.columns = keys.map(key => ({
        header: key,
        key: key,
        width: 15
      }))

      sheet.data.forEach(row => {
        worksheet.addRow(row)
      })

      // Style header row
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      }
    }
  })

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = options.filename + '.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * İhtiyaç sahipleri için özel export
 */
export async function exportNeedyPersonsToExcel(data: Record<string, unknown>[]): Promise<void> {
  const columns: ExcelColumn[] = [
    { header: 'Dosya No', key: 'file_number', width: 15 },
    { header: 'Ad', key: 'first_name', width: 20 },
    { header: 'Soyad', key: 'last_name', width: 20 },
    { header: 'TC Kimlik', key: 'identity_number', width: 15 },
    { header: 'Telefon', key: 'phone', width: 15 },
    { header: 'Şehir', key: 'city_name', width: 15 },
    { header: 'Durum', key: 'status', width: 10 },
    {
      header: 'Aylık Gelir',
      key: 'monthly_income',
      width: 15,
      format: (val) => (val ? val + ' TL' : '-'),
    },
    {
      header: 'Kira',
      key: 'rent_amount',
      width: 15,
      format: (val) => (val ? val + ' TL' : '-'),
    },
    { header: 'Notlar', key: 'notes', width: 30 },
  ]

  const today = new Date().toISOString().split('T')[0]
  await exportToExcelWithColumns(data, columns, {
    filename: 'ihtiyac-sahipleri-' + today,
    sheetName: 'İhtiyaç Sahipleri',
    author: 'Yardım Yönetim Paneli',
    title: 'İhtiyaç Sahipleri Listesi',
  })
}

/**
 * Bağışlar için özel export
 */
export async function exportDonationsToExcel(data: Record<string, unknown>[]): Promise<void> {
  const columns: ExcelColumn[] = [
    { header: 'Bağış No', key: 'donation_number', width: 15 },
    { header: 'Bağışçı Adı', key: 'donor_name', width: 25 },
    { header: 'Bağış Tipi', key: 'donation_type', width: 15 },
    {
      header: 'Tutar',
      key: 'amount',
      width: 15,
      format: (val) => val + ' TL',
    },
    { header: 'Para Birimi', key: 'currency', width: 10 },
    { header: 'Ödeme Yöntemi', key: 'payment_method', width: 15 },
    { header: 'Ödeme Durumu', key: 'payment_status', width: 15 },
    {
      header: 'Tarih',
      key: 'created_at',
      width: 20,
      format: (val: unknown) => new Date(val as string | number | Date).toLocaleString('tr-TR'),
    },
  ]

  const today = new Date().toISOString().split('T')[0]
  await exportToExcelWithColumns(data, columns, {
    filename: 'bagislar-' + today,
    sheetName: 'Bağışlar',
    author: 'Yardım Yönetim Paneli',
    title: 'Bağış Listesi',
  })
}

/**
 * Rapor için multiple sheets export
 */
export async function exportReportToExcel(data: {
  donations: Record<string, unknown>[]
  aids: Record<string, unknown>[]
  needyPersons: Record<string, unknown>[]
}): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  await exportToExcelMultipleSheets(
    [
      { name: 'Bağışlar', data: data.donations },
      { name: 'Yardım İşlemleri', data: data.aids },
      { name: 'İhtiyaç Sahipleri', data: data.needyPersons },
    ],
    {
      filename: 'rapor-' + today,
      author: 'Yardım Yönetim Paneli',
      title: 'Genel Rapor',
    }
  )
}
