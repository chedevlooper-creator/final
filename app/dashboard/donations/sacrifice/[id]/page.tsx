'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'
import {
    Gift,
    ArrowLeft,
    Save,
    User,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockSacrifice = {
    id: '1',
    sacrifice_number: 'KRB-2026-0001',
    donor_name: 'Mehmet Yılmaz',
    donor_phone: '0532 123 45 67',
    donor_email: 'mehmet@example.com',
    donor_address: 'Başakşehir, İstanbul',
    sacrifice_type: 'buyuk',
    share_count: 7,
    amount: 35000,
    currency: 'TRY',
    payment_status: 'completed',
    sacrifice_status: 'pending',
    distribution_type: 'domestic',
    distribution_region: 'İstanbul',
    notes: 'Vekalet kurban',
    created_at: '2026-01-10T10:00:00Z',
    shares: [
        { id: '1', name: 'Ahmet Yılmaz', type: 'vekaletçi', status: 'assigned' },
        { id: '2', name: 'Fatma Demir', type: 'vekaletçi', status: 'assigned' },
        { id: '3', name: 'Yoksul Aile 1', type: 'ihtiyaç sahibi', status: 'assigned' },
        { id: '4', name: 'Yoksul Aile 2', type: 'ihtiyaç sahibi', status: 'assigned' },
        { id: '5', name: 'Boş', type: '-', status: 'available' },
        { id: '6', name: 'Boş', type: '-', status: 'available' },
        { id: '7', name: 'Boş', type: '-', status: 'available' },
    ],
}

const SACRIFICE_TYPES = [
    { value: 'buyuk', label: 'Büyükbaş', shares: 7 },
    { value: 'kucuk', label: 'Küçükbaş', shares: 1 },
]

const SACRIFICE_STATUSES = [
    { value: 'pending', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'purchased', label: 'Satın Alındı', color: 'bg-blue-100 text-blue-700' },
    { value: 'slaughtered', label: 'Kesildi', color: 'bg-orange-100 text-orange-700' },
    { value: 'distributed', label: 'Dağıtıldı', color: 'bg-green-100 text-green-700' },
]

const DISTRIBUTION_TYPES = [
    { value: 'domestic', label: 'Yurt İçi' },
    { value: 'abroad', label: 'Yurt Dışı' },
]

export default function SacrificeDetailPage() {
    const params = useParams()
    const id = params['id'] as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [sacrifice, _setSacrifice] = useState(mockSacrifice)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500)
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 500))
        toast.success('Kurban kaydı güncellendi')
        setIsSaving(false)
    }

    const statusConfig = SACRIFICE_STATUSES.find((s) => s.value === sacrifice.sacrifice_status)
    const assignedShares = sacrifice.shares.filter((s) => s.status === 'assigned').length

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/donations/sacrifice">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Kurban #{sacrifice.sacrifice_number}</h1>
                            <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                            {SACRIFICE_TYPES.find((t) => t.value === sacrifice.sacrifice_type)?.label} - {sacrifice.share_count} Hisse
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-slate-500">Tutar</p>
                            <p className="text-2xl font-bold text-green-600">₺{sacrifice.amount.toLocaleString('tr-TR')}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-slate-500">Atanan Hisse</p>
                            <p className="text-2xl font-bold text-blue-600">{assignedShares}/{sacrifice.share_count}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-slate-500">Dağıtım</p>
                            <p className="text-lg font-medium">{sacrifice.distribution_region}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-slate-500">Kayıt Tarihi</p>
                            <p className="text-lg font-medium">{format(new Date(sacrifice.created_at), 'dd.MM.yyyy', { locale: tr })}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Bağışçı Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Bağışçı Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Ad Soyad</Label>
                                <Input value={sacrifice.donor_name} />
                            </div>
                            <div>
                                <Label>Telefon</Label>
                                <Input value={sacrifice.donor_phone} />
                            </div>
                        </div>
                        <div>
                            <Label>E-posta</Label>
                            <Input value={sacrifice.donor_email} type="email" />
                        </div>
                        <div>
                            <Label>Adres</Label>
                            <Textarea value={sacrifice.donor_address} rows={2} />
                        </div>
                    </CardContent>
                </Card>

                {/* Kurban Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Kurban Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Tür</Label>
                                <Select value={sacrifice.sacrifice_type}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {SACRIFICE_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Durum</Label>
                                <Select value={sacrifice.sacrifice_status}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {SACRIFICE_STATUSES.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Dağıtım Türü</Label>
                                <Select value={sacrifice.distribution_type}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {DISTRIBUTION_TYPES.map((d) => (
                                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Dağıtım Bölgesi</Label>
                                <Input value={sacrifice.distribution_region} />
                            </div>
                        </div>
                        <div>
                            <Label>Notlar</Label>
                            <Textarea value={sacrifice.notes} rows={2} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hisseler */}
            <Card>
                <CardHeader>
                    <CardTitle>Hisseler ({assignedShares}/{sacrifice.share_count})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hisse No</TableHead>
                                <TableHead>İsim</TableHead>
                                <TableHead>Tür</TableHead>
                                <TableHead>Durum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sacrifice.shares.map((share, idx) => (
                                <TableRow key={share.id}>
                                    <TableCell className="font-mono">{idx + 1}</TableCell>
                                    <TableCell className="font-medium">{share.name}</TableCell>
                                    <TableCell>{share.type}</TableCell>
                                    <TableCell>
                                        <Badge className={share.status === 'assigned' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                                            {share.status === 'assigned' ? 'Atandı' : 'Boş'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
