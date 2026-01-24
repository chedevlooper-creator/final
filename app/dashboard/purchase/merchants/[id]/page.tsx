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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    Building2,
    ArrowLeft,
    Save,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    FileText,
    TrendingUp,
    TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockMerchant = {
    id: '1',
    merchant_code: 'CRH-001',
    company_name: 'ABC Gıda Ltd. Şti.',
    contact_name: 'Mehmet Yılmaz',
    phone: '0212 123 45 67',
    mobile: '0532 123 45 67',
    email: 'info@abcgida.com',
    address: 'Güneşli Sanayi Sitesi No:15, Bağcılar/İstanbul',
    tax_number: '1234567890',
    tax_office: 'Bağcılar',
    iban: 'TR12 3456 7890 1234 5678 9012 34',
    category: 'food',
    status: 'active',
    balance: 15000,
    total_purchases: 85000,
    created_at: '2025-03-10T10:00:00Z',
    transactions: [
        { id: '1', date: '2026-01-10', type: 'purchase', description: 'Gıda alımı', amount: 5000 },
        { id: '2', date: '2026-01-05', type: 'payment', description: 'Ödeme', amount: -3000 },
        { id: '3', date: '2025-12-20', type: 'purchase', description: 'Gıda alımı', amount: 8000 },
    ],
}

const CATEGORY_OPTIONS = [
    { value: 'food', label: 'Gıda' },
    { value: 'clothing', label: 'Giyim' },
    { value: 'household', label: 'Ev Eşyası' },
    { value: 'fuel', label: 'Yakacak' },
    { value: 'other', label: 'Diğer' },
]

const STATUS_OPTIONS = [
    { value: 'active', label: 'Aktif', color: 'bg-green-100 text-green-700' },
    { value: 'inactive', label: 'Pasif', color: 'bg-slate-100 text-slate-700' },
    { value: 'blocked', label: 'Bloke', color: 'bg-red-100 text-red-700' },
]

export default function MerchantDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params['id'] as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [merchant, setMerchant] = useState(mockMerchant)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500)
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 500))
        toast.success('Cari hesap güncellendi')
        setIsSaving(false)
    }

    const statusConfig = STATUS_OPTIONS.find((s) => s.value === merchant.status)

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
                    <Link href="/purchase/merchants">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{merchant.company_name}</h1>
                            <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">#{merchant.merchant_code}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Bakiye</p>
                                <p className={`text-2xl font-bold ${merchant.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ₺{Math.abs(merchant.balance).toLocaleString('tr-TR')}
                                </p>
                                <p className="text-xs text-slate-400">{merchant.balance >= 0 ? 'Borç' : 'Alacak'}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Toplam Alım</p>
                                <p className="text-2xl font-bold">₺{merchant.total_purchases.toLocaleString('tr-TR')}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">İşlem Sayısı</p>
                                <p className="text-2xl font-bold">{merchant.transactions.length}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardContent className="pt-6">
                    <Tabs defaultValue="info">
                        <TabsList>
                            <TabsTrigger value="info">Firma Bilgileri</TabsTrigger>
                            <TabsTrigger value="transactions">Hesap Hareketleri</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="mt-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Firma Adı</Label>
                                    <Input value={merchant.company_name} />
                                </div>
                                <div>
                                    <Label>Yetkili Kişi</Label>
                                    <Input value={merchant.contact_name} />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label>Telefon</Label>
                                    <Input value={merchant.phone} />
                                </div>
                                <div>
                                    <Label>Mobil</Label>
                                    <Input value={merchant.mobile} />
                                </div>
                                <div>
                                    <Label>E-posta</Label>
                                    <Input value={merchant.email} type="email" />
                                </div>
                            </div>
                            <div>
                                <Label>Adres</Label>
                                <Textarea value={merchant.address} rows={2} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label>Vergi No</Label>
                                    <Input value={merchant.tax_number} />
                                </div>
                                <div>
                                    <Label>Vergi Dairesi</Label>
                                    <Input value={merchant.tax_office} />
                                </div>
                                <div>
                                    <Label>Kategori</Label>
                                    <Select value={merchant.category}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORY_OPTIONS.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>IBAN</Label>
                                <Input value={merchant.iban} className="font-mono" />
                            </div>
                        </TabsContent>

                        <TabsContent value="transactions" className="mt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>İşlem</TableHead>
                                        <TableHead>Açıklama</TableHead>
                                        <TableHead className="text-right">Tutar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {merchant.transactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.date), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {t.type === 'purchase' ? 'Alım' : 'Ödeme'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell className={`text-right font-medium ${t.amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {t.amount >= 0 ? '+' : ''}₺{Math.abs(t.amount).toLocaleString('tr-TR')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
