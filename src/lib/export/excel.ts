/**
 * Excel Export Library
 *
 * Excel dosyası export işlemleri için utility fonksiyonlar
 *
 * SECURITY NOTE: xlsx package has known vulnerabilities (Prototype Pollution & ReDoS).
 * However, it's only used for exporting trusted internal data (not parsing user uploads).
 * Risk is minimal as we control all input data. Monitor for updates: https://github.com/SheetJS/sheetjs
 */

import * as XLSX from 'xlsx'

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
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelExportOptions
): void {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Sheet ismi
  const sheetName = options.sheetName || 'Sheet1'
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  // Metadata
  if (options.author || options.title || options.subject) {
    const props: Partial<{ Author: string; Title: string; Subject: string }> = {}
    if (options.author) props.Author = options.author
    if (options.title) props.Title = options.title
    if (options.subject) props.Subject = options.subject
    workbook.Props = props
  }
  
  // Export
  XLSX.writeFile(workbook, `${options.filename}.xlsx`)
}

/**
 * Column mapping ile Excel export
 */
export function exportToExcelWithColumns<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn<unknown>[],
  options: ExcelExportOptions
): void {
  // Transform data
  const transformedData = data.map((row) => {
    const transformed: Record<string, unknown> = {}
    columns.forEach((col) => {
      const value = row[col.key]
      transformed[col.header] = col.format ? col.format(value) : value
    })
    return transformed
  })
  
  exportToExcel(transformedData, options)
}

/**
 * Multiple sheets export
 */
export function exportToExcelMultipleSheets(
  sheets: Array<{
    name: string
    data: Record<string, unknown>[]
  }>,
  options: ExcelExportOptions
): void {
  const workbook = XLSX.utils.book_new()
  
  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })
  
  // Metadata
  if (options.author || options.title) {
    workbook.Props = {
      Author: options.author || 'Yardım Yönetim Paneli',
      Title: options.title || options.filename,
    }
  }
  
  XLSX.writeFile(workbook, `${options.filename}.xlsx`)
}

/**
 * İhtiyaç sahipleri için özel export
 */
export function exportNeedyPersonsToExcel(data: Record<string, unknown>[]): void {
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
      format: (val) => (val ? `${val} TL` : '-'),
    },
    {
      header: 'Kira',
      key: 'rent_amount',
      width: 15,
      format: (val) => (val ? `${val} TL` : '-'),
    },
    { header: 'Notlar', key: 'notes', width: 30 },
  ]
  
  exportToExcelWithColumns(data, columns, {
    filename: `ihtiyac-sahipleri-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'İhtiyaç Sahipleri',
    author: 'Yardım Yönetim Paneli',
    title: 'İhtiyaç Sahipleri Listesi',
  })
}

/**
 * Bağışlar için özel export
 */
export function exportDonationsToExcel(data: Record<string, unknown>[]): void {
  const columns: ExcelColumn[] = [
    { header: 'Bağış No', key: 'donation_number', width: 15 },
    { header: 'Bağışçı Adı', key: 'donor_name', width: 25 },
    { header: 'Bağış Tipi', key: 'donation_type', width: 15 },
    {
      header: 'Tutar',
      key: 'amount',
      width: 15,
      format: (val) => `${val} TL`,
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
  
  exportToExcelWithColumns(data, columns, {
    filename: `bagislar-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Bağışlar',
    author: 'Yardım Yönetim Paneli',
    title: 'Bağış Listesi',
  })
}

/**
 * Rapor için multiple sheets export
 */
export function exportReportToExcel(data: {
  donations: Record<string, unknown>[]
  aids: Record<string, unknown>[]
  needyPersons: Record<string, unknown>[]
}): void {
  exportToExcelMultipleSheets(
    [
      { name: 'Bağışlar', data: data.donations },
      { name: 'Yardım İşlemleri', data: data.aids },
      { name: 'İhtiyaç Sahipleri', data: data.needyPersons },
    ],
    {
      filename: `rapor-${new Date().toISOString().split('T')[0]}`,
      author: 'Yardım Yönetim Paneli',
      title: 'Genel Rapor',
    }
  )
}
