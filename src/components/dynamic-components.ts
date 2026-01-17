/**
 * Dynamic Imports for Code Splitting
 * 
 * This file contains dynamically imported components to reduce initial bundle size
 * Components are loaded only when needed
 */

import dynamic from 'next/dynamic'

// Heavy chart components - load only when needed
export const ChartComponent = dynamic(
  () => import('@/components/charts/chart-component').then(mod => ({ default: mod.ChartComponent })),
  {
    loading: () => (
      <div className="animate-pulse bg-slate-100 rounded-lg h-64 w-full" />
    ),
    ssr: false, // Charts are client-only
  }
)

// Rich text editor - load only when editing
export const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor'),
  {
    loading: () => <div className="animate-pulse bg-slate-100 rounded-lg h-64" />,
    ssr: false,
  }
)

// Map component - load only when viewing map
export const MapView = dynamic(
  () => import('@/components/map/map-view'),
  {
    loading: () => (
      <div className="animate-pulse bg-slate-100 rounded-lg h-96 flex items-center justify-center">
        <span className="text-slate-400">Harita yükleniyor...</span>
      </div>
    ),
    ssr: false,
  }
)

// Data table with advanced features - load only when needed
export const AdvancedDataTable = dynamic(
  () => import('@/components/tables/advanced-data-table'),
  {
    loading: () => (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 rounded h-12" />
        ))}
      </div>
    ),
  }
)

// Report generator - load only when generating reports
export const ReportGenerator = dynamic(
  () => import('@/components/reports/report-generator'),
  {
    loading: () => (
      <div className="animate-pulse bg-slate-100 rounded-lg h-96 flex items-center justify-center">
        <span className="text-slate-400">Rapor yükleniyor...</span>
      </div>
    ),
  }
)

// File upload component with drag & drop
export const FileUpload = dynamic(
  () => import('@/components/upload/file-upload'),
  {
    loading: () => (
      <div className="animate-pulse bg-slate-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-slate-200">
        <span className="text-slate-400">Yükleme hazırlanıyor...</span>
      </div>
    ),
  }
)

// Calendar with advanced features
export const AdvancedCalendar = dynamic(
  () => import('@/components/calendar/advanced-calendar'),
  {
    loading: () => (
      <div className="animate-pulse bg-slate-100 rounded-lg h-96" />
    ),
    ssr: false,
  }
)

// PDF viewer
export const PDFViewer = dynamic(
  () => import('@/components/pdf/pdf-viewer'),
  {
    loading: () => (
      <div className="animate-pulse bg-slate-100 rounded-lg h-96 flex items-center justify-center">
        <span className="text-slate-400">PDF yükleniyor...</span>
      </div>
    ),
    ssr: false,
  }
)

// Export utilities - load only when exporting
export const ExportButton = dynamic(
  () => import('@/components/export/export-button').then(mod => ({ default: mod.ExportButton })),
  {
    loading: () => <div className="animate-pulse bg-slate-100 rounded h-10 w-24" />,
  }
)

// Import all components as a group for easier use
export const DynamicComponents = {
  ChartComponent,
  RichTextEditor,
  MapView,
  AdvancedDataTable,
  ReportGenerator,
  FileUpload,
  AdvancedCalendar,
  PDFViewer,
  ExportButton,
}
