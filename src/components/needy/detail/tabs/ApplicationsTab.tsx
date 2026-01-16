'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Eye, ExternalLink, Check, X } from 'lucide-react'
import { TabLayout } from './TabLayout'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true // Geçici olarak true

interface Application {
  id: string
  created_at: string
  needy_person_name: string
  responsible_unit: string
  is_one_time: boolean
  is_regular_cash: boolean
  is_regular_food: boolean
  is_in_kind: boolean
  is_service_referral: boolean
  stage: string
}

// Mock application data (aid_applications tablosundan gelecek)
const mockApplicationsData: Record<string, Application[]> = {
  '1': [
    {
      id: 'app-1',
      created_at: '2024-01-20T14:30:00Z',
      needy_person_name: 'Ahmet Yılmaz',
      responsible_unit: 'Başkan',
      is_one_time: true,
      is_regular_cash: false,
      is_regular_food: false,
      is_in_kind: false,
      is_service_referral: false,
      stage: 'pending',
    },
  ],
  '2': [
    {
      id: 'app-2',
      created_at: '2024-02-05T10:00:00Z',
      needy_person_name: 'Fatma Demir',
      responsible_unit: 'Yardım Birimi',
      is_one_time: false,
      is_regular_cash: true,
      is_regular_food: true,
      is_in_kind: false,
      is_service_referral: false,
      stage: 'approved',
    },
  ],
}

interface ApplicationsTabProps {
  needyPersonId: string
  onClose: () => void
}

export function ApplicationsTab({ needyPersonId, onClose }: ApplicationsTabProps) {
  const [searchValue, setSearchValue] = useState('')
  const [applications, setApplications] = useState<Application[]>([])

  // Load data
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setApplications(mockApplicationsData[needyPersonId] || [])
    } else {
      // TODO: Real API call to aid_applications table
    }
  }, [needyPersonId])

  const columns = [
    { key: 'date', label: 'Başvuru Zamanı', width: '140px' },
    { key: 'person', label: 'Yardım Yapılacak Kişi' },
    { key: 'unit', label: 'Sorumlu Birim', width: '120px' },
    { key: 'one_time', label: 'Tek Seferlik', width: '90px' },
    { key: 'regular_cash', label: 'Düzenli Nakdi', width: '90px' },
    { key: 'regular_food', label: 'Düzenli Gıda', width: '90px' },
    { key: 'in_kind', label: 'Ayni Yardım', width: '90px' },
    { key: 'service', label: 'Hizmet Sevk', width: '90px' },
    { key: 'stage', label: 'Aşama', width: '100px' },
  ]

  const handleAdd = () => {
    // Yardım talebi ekleme sayfasına yönlendir
    window.location.href = `/applications/new?needy_id=${needyPersonId}`
  }

  const CheckIcon = ({ checked }: { checked: boolean }) => (
    checked ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-300" />
  )

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'approved': return 'Onaylandı'
      case 'rejected': return 'Reddedildi'
      case 'pending': return 'Beklemede'
      case 'draft': return 'Taslak'
      default: return stage
    }
  }

  return (
    <TabLayout
      showStatusFilter={false}
      showSearch={false}
      showAddButton={true}
      addButtonLabel="Ekle"
      onAdd={handleAdd}
      totalRecords={applications.length}
    >
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              {columns.map((col) => (<TableHead key={col.key} style={{ width: col.width }}>{col.label}</TableHead>))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  Yardım talebi bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Link href={`/applications/${app.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell>{format(new Date(app.created_at), 'dd.MM.yyyy HH:mm', { locale: tr })}</TableCell>
                  <TableCell>{app.needy_person_name}</TableCell>
                  <TableCell>{app.responsible_unit}</TableCell>
                  <TableCell><CheckIcon checked={app.is_one_time} /></TableCell>
                  <TableCell><CheckIcon checked={app.is_regular_cash} /></TableCell>
                  <TableCell><CheckIcon checked={app.is_regular_food} /></TableCell>
                  <TableCell><CheckIcon checked={app.is_in_kind} /></TableCell>
                  <TableCell><CheckIcon checked={app.is_service_referral} /></TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${getStageColor(app.stage)}`}>
                      {getStageLabel(app.stage)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TabLayout>
  )
}
