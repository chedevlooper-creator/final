'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { pdf, TableColumn } from '@/lib/pdf/pdf-generator'

interface ExportButtonProps<T> {
  data: T[]
  columns: {
    title: string
    dataKey: keyof T
    width?: number
    align?: 'left' | 'center' | 'right'
  }[]
  filename: string
  title: string
  subtitle?: string
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title,
  subtitle,
  disabled = false,
  variant = 'outline',
  size = 'default',
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    if (data.length === 0) {
      toast.error('Dışa aktarılacak veri bulunamadı')
      return
    }

    setIsExporting(true)
    try {
      // Convert columns to PDF format
      const pdfColumns: TableColumn[] = columns.map((col) => ({
        title: col.title,
        dataKey: String(col.dataKey),
        width: col.width,
        align: col.align,
      }))

      // Format data for PDF
      const pdfData = data.map((item) => {
        const row: Record<string, unknown> = {}
        columns.forEach((col) => {
          const value = item[col.dataKey]
          // Format values for display
          if (value === null || value === undefined) {
            row[String(col.dataKey)] = '-'
          } else if (typeof value === 'number') {
            row[String(col.dataKey)] = value.toLocaleString('tr-TR')
          } else if (value instanceof Date) {
            row[String(col.dataKey)] = value.toLocaleDateString('tr-TR')
          } else {
            row[String(col.dataKey)] = String(value)
          }
        })
        return row
      })

      pdf.downloadTable(
        `${filename}.pdf`,
        title,
        pdfColumns,
        pdfData,
        { orientation: columns.length > 5 ? 'landscape' : 'portrait' }
      )

      toast.success('PDF başarıyla indirildi')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('PDF oluşturulurken hata oluştu')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    if (data.length === 0) {
      toast.error('Dışa aktarılacak veri bulunamadı')
      return
    }

    setIsExporting(true)
    try {
      // Create CSV header
      const headers = columns.map((col) => col.title).join(';')
      
      // Create CSV rows
      const rows = data.map((item) => {
        return columns.map((col) => {
          const value = item[col.dataKey]
          if (value === null || value === undefined) {
            return ''
          }
          // Escape quotes and handle special characters
          const strValue = String(value).replace(/"/g, '""')
          // Wrap in quotes if contains special characters
          if (strValue.includes(';') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue}"`
          }
          return strValue
        }).join(';')
      }).join('\n')

      const csv = `${headers}\n${rows}`
      
      // Create and download file
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('CSV başarıyla indirildi')
    } catch (error) {
      console.error('CSV export error:', error)
      toast.error('CSV oluşturulurken hata oluştu')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Dışa Aktar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          PDF Olarak İndir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV Olarak İndir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Report export function for detailed reports
export interface ReportExportProps {
  title: string
  subtitle?: string
  sections?: {
    title?: string
    content?: string
    bulletPoints?: string[]
  }[]
  tables?: {
    title: string
    columns: TableColumn[]
    data: unknown[]
  }[]
  filename: string
}

export function exportReport(props: ReportExportProps) {
  const { title, subtitle, sections, tables, filename } = props

  try {
    pdf.downloadReport(`${filename}.pdf`, {
      title,
      subtitle,
      headers: {
        title,
        subtitle,
        showDate: true,
      },
      content: sections?.map((section) => ({
        text: section.content,
        bulletPoints: section.bulletPoints,
      })),
      tables: tables?.map((table) => ({
        columns: table.columns,
        data: table.data,
      })),
      footers: {
        showPageNumbers: true,
        text: 'Yardım Yönetim Paneli',
      },
    })

    toast.success('Rapor başarıyla indirildi')
  } catch (error) {
    console.error('Report export error:', error)
    toast.error('Rapor oluşturulurken hata oluştu')
  }
}
