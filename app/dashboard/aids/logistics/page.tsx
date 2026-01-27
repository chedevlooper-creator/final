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
    Package,
    Plus,
    Search,
    Eye,
    MapPin,
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockLogistics = [
    {
        id: '1',
        aid_number: 'AY-2026-0001',
        needy_person: { name: 'Ahmet Yılmaz', address: 'Başakşehir, İstanbul' },
        items: ['Gıda Paketi', 'Temizlik Malzemesi'],
        status: 'delivered',
        delivery_date: '2026-01-15T10:30:00Z',
        delivered_by: 'Mehmet Kaya',
    },
    {
        id: '2',
        aid_number: 'AY-2026-0002',
        needy_person: { name: 'Fatma Demir', address: 'Esenyurt, İstanbul' },
        items: ['Giyim', 'Ev Eşyası'],
        status: 'in_transit',
        delivery_date: null,
        delivered_by: null,
    },
    {
        id: '3',
        aid_number: 'AY-2026-0003',
        needy_person: { name: 'Ali Öztürk', address: 'Beylikdüzü, İstanbul' },
        items: ['Gıda Paketi'],
        status: 'pending',
        delivery_date: null,
        delivered_by: null,
    },
]

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Hazırlanıyor', color: 'bg-warning/10 text-warning' },
    in_transit: { label: 'Yolda', color: 'bg-info/10 text-info' },
    delivered: { label: 'Teslim Edildi', color: 'bg-success/10 text-success' },
}

export default function LogisticsPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredItems = mockLogistics.filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (search && !item.needy_person.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ayni Yardım İşlemleri"
                description="Gıda, giyim ve diğer ayni yardım teslimatları"
                icon={Package}
                actions={
                    <Button className="bg-gradient-to-r from-primary to-primary/80">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Ayni Yardım
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Toplam Teslimat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{mockLogistics.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Teslim Edildi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-success">
                            {mockLogistics.filter((l) => l.status === 'delivered').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Yolda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-info">
                            {mockLogistics.filter((l) => l.status === 'in_transit').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Hazırlanıyor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-warning">
                            {mockLogistics.filter((l) => l.status === 'pending').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                        <SelectItem value="pending">Hazırlanıyor</SelectItem>
                        <SelectItem value="in_transit">Yolda</SelectItem>
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
                                <TableHead>Adres</TableHead>
                                <TableHead>İçerik</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Teslim Tarihi</TableHead>
                                <TableHead>Teslim Eden</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Kayıt bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item) => {
                                    const statusConfig = STATUS_CONFIG[item.status] || { label: item.status, color: 'bg-gray-100 text-gray-700' }
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{item.aid_number}</TableCell>
                                            <TableCell className="font-medium">{item.needy_person.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {item.needy_person.address}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.items.map((i, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {i}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.delivery_date
                                                    ? format(new Date(item.delivery_date), 'dd.MM.yyyy', { locale: tr })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm">{item.delivered_by || '-'}</TableCell>
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
