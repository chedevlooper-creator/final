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
    Banknote,
    Plus,
    Search,
    Eye,
    User,
    Calendar,
    CheckCircle,
    Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

// Mock data
const mockCashAids = [
    {
        id: '1',
        aid_number: 'NK-2026-0001',
        needy_person: { name: 'Ahmet Yılmaz', phone: '0532 123 45 67' },
        aid_type: 'monthly',
        amount: 2500,
        currency: 'TRY',
        status: 'delivered',
        delivery_date: '2026-01-15T10:30:00Z',
        next_date: '2026-02-15',
    },
    {
        id: '2',
        aid_number: 'NK-2026-0002',
        needy_person: { name: 'Fatma Kaya', phone: '0533 234 56 78' },
        aid_type: 'one_time',
        amount: 5000,
        currency: 'TRY',
        status: 'pending',
        delivery_date: null,
        next_date: null,
    },
    {
        id: '3',
        aid_number: 'NK-2026-0003',
        needy_person: { name: 'Ali Demir', phone: '0534 345 67 89' },
        aid_type: 'monthly',
        amount: 1500,
        currency: 'TRY',
        status: 'delivered',
        delivery_date: '2026-01-14T14:00:00Z',
        next_date: '2026-02-14',
    },
]

const AID_TYPE_CONFIG: Record<string, string> = {
    monthly: 'Aylık Düzenli',
    one_time: 'Tek Seferlik',
    quarterly: 'Üç Aylık',
}

export default function CashAidsPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredAids = mockCashAids.filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false
        if (search && !a.needy_person.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const totalAmount = mockCashAids.reduce((sum, a) => sum + a.amount, 0)
    const deliveredCount = mockCashAids.filter((a) => a.status === 'delivered').length

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nakdi Yardım İşlemleri"
                description="Nakdi yardım kayıtları ve takibi"
                icon={Banknote}
                actions={
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Nakdi Yardım
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Toplam Kayıt</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{mockCashAids.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Toplam Tutar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">₺{totalAmount.toLocaleString('tr-TR')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Teslim Edilen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Bekleyen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">
                            {mockCashAids.filter((a) => a.status === 'pending').length}
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
                        <SelectItem value="delivered">Teslim Edildi</SelectItem>
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
                                <TableHead>Yardım No</TableHead>
                                <TableHead>Kişi</TableHead>
                                <TableHead>Tür</TableHead>
                                <TableHead>Tutar</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Teslim Tarihi</TableHead>
                                <TableHead>Sonraki Tarih</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAids.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                        Kayıt bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAids.map((aid) => (
                                    <TableRow key={aid.id}>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{aid.aid_number}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{aid.needy_person.name}</p>
                                                <p className="text-xs text-slate-500">{aid.needy_person.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{AID_TYPE_CONFIG[aid.aid_type]}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ₺{aid.amount.toLocaleString('tr-TR')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={aid.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                {aid.status === 'delivered' ? 'Teslim Edildi' : 'Beklemede'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {aid.delivery_date
                                                ? format(new Date(aid.delivery_date), 'dd.MM.yyyy', { locale: tr })
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {aid.next_date || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
