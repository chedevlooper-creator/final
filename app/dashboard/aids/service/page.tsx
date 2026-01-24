'use client'


import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Stethoscope,
    Plus,
    Search,
    Eye,
    Hospital,
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockServices = [
    {
        id: '1',
        referral_number: 'HZ-2026-0001',
        needy_person: { name: 'Ahmet Yılmaz', phone: '0532 123 45 67' },
        service_type: 'health',
        institution: 'Özel Hastane A',
        description: 'Kalp ameliyatı',
        status: 'completed',
        appointment_date: '2026-01-10T09:00:00Z',
    },
    {
        id: '2',
        referral_number: 'HZ-2026-0002',
        needy_person: { name: 'Fatma Kaya', phone: '0533 234 56 78' },
        service_type: 'education',
        institution: 'Özel Okul B',
        description: 'Öğrenim bursu',
        status: 'in_progress',
        appointment_date: '2026-01-20T10:00:00Z',
    },
    {
        id: '3',
        referral_number: 'HZ-2026-0003',
        needy_person: { name: 'Ali Demir', phone: '0534 345 67 89' },
        service_type: 'legal',
        institution: 'Hukuk Bürosu C',
        description: 'Hukuki danışmanlık',
        status: 'pending',
        appointment_date: null,
    },
]

const SERVICE_TYPE_CONFIG: Record<string, { label: string; icon: typeof Stethoscope }> = {
    health: { label: 'Sağlık', icon: Stethoscope },
    education: { label: 'Eğitim', icon: Hospital },
    legal: { label: 'Hukuki', icon: Hospital },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
}

export default function ServicePage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredServices = mockServices.filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false
        if (search && !s.needy_person.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Hizmet Sevk"
                description="Sağlık, eğitim ve diğer hizmet sevkleri"
                icon={Stethoscope}
                actions={
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Sevk
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Toplam Sevk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{mockServices.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Devam Eden</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {mockServices.filter((s) => s.status === 'in_progress').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Tamamlanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {mockServices.filter((s) => s.status === 'completed').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Kişi adı ile ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="pending">Beklemede</SelectItem>
                        <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Sevk No</TableHead>
                                <TableHead>Kişi</TableHead>
                                <TableHead>Tür</TableHead>
                                <TableHead>Kurum</TableHead>
                                <TableHead>Açıklama</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Randevu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                        Kayıt bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredServices.map((service) => {
                                    const statusConfig = STATUS_CONFIG[service.status] || { label: service.status, color: 'bg-gray-100 text-gray-700' }
                                    const serviceConfig = SERVICE_TYPE_CONFIG[service.service_type]
                                    return (
                                        <TableRow key={service.id}>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{service.referral_number}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{service.needy_person.name}</p>
                                                    <p className="text-xs text-slate-500">{service.needy_person.phone}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{serviceConfig?.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{service.institution}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{service.description}</TableCell>
                                            <TableCell>
                                                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {service.appointment_date
                                                    ? format(new Date(service.appointment_date), 'dd.MM.yyyy HH:mm', { locale: tr })
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
