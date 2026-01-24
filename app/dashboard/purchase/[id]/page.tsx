'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
    ShoppingCart,
    ArrowLeft,
    Save,
    Package,
    Calendar,
    User,
    CheckCircle,
    Clock,
    Plus,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockPurchaseRequest = {
    id: '1',
    request_number: 'ST-2026-0001',
    title: 'Gıda Paketi Malzemeleri',
    description: 'Ramazan yardımı için gıda paketi malzemeleri',
    requester: 'Yardım Birimi',
    status: 'pending',
    priority: 'high',
    total_amount: 25000,
    currency: 'TRY',
    created_at: '2026-01-15T10:30:00Z',
    items: [
        { id: '1', name: 'Pirinç (25kg)', quantity: 100, unit: 'Adet', unit_price: 150, total: 15000 },
        { id: '2', name: 'Bulgur (5kg)', quantity: 100, unit: 'Adet', unit_price: 50, total: 5000 },
        { id: '3', name: 'Mercimek (2kg)', quantity: 100, unit: 'Adet', unit_price: 50, total: 5000 },
    ],
}

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Taslak', color: 'bg-slate-100 text-slate-700' },
    { value: 'pending', label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'approved', label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
    { value: 'rejected', label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
    { value: 'ordered', label: 'Sipariş Verildi', color: 'bg-blue-100 text-blue-700' },
    { value: 'delivered', label: 'Teslim Alındı', color: 'bg-green-100 text-green-700' },
]

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Normal' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' },
]

export default function PurchaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params['id'] as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [request, setRequest] = useState(mockPurchaseRequest)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500)
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 500))
        toast.success('Talep güncellendi')
        setIsSaving(false)
    }

    const statusConfig = STATUS_OPTIONS.find((s) => s.value === request.status)

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
                    <Link href="/purchase">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{request.title}</h1>
                            <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">#{request.request_number}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {request.status === 'pending' && (
                        <>
                            <Button variant="outline" className="text-red-600">Reddet</Button>
                            <Button className="bg-green-600 hover:bg-green-700">Onayla</Button>
                        </>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Talep Bilgileri */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Talep Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Başlık</Label>
                                <Input value={request.title} />
                            </div>
                            <div>
                                <Label>Açıklama</Label>
                                <Textarea value={request.description} rows={3} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Öncelik</Label>
                                    <Select value={request.priority}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {PRIORITY_OPTIONS.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Durum</Label>
                                    <Select value={request.status}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ürünler */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Ürünler</CardTitle>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Ürün Ekle
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ürün</TableHead>
                                        <TableHead>Miktar</TableHead>
                                        <TableHead>Birim</TableHead>
                                        <TableHead>Birim Fiyat</TableHead>
                                        <TableHead>Toplam</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell>₺{item.unit_price.toLocaleString('tr-TR')}</TableCell>
                                            <TableCell className="font-medium">₺{item.total.toLocaleString('tr-TR')}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-right font-medium">Genel Toplam:</TableCell>
                                        <TableCell className="font-bold text-lg">₺{request.total_amount.toLocaleString('tr-TR')}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Özet</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Talep Eden:</span>
                                <span>{request.requester}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tarih:</span>
                                <span>{format(new Date(request.created_at), 'dd.MM.yyyy', { locale: tr })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ürün Sayısı:</span>
                                <span>{request.items.length}</span>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <span className="font-medium">Toplam:</span>
                                <span className="font-bold text-lg">₺{request.total_amount.toLocaleString('tr-TR')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
