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
    Search,
    Printer,
    ArrowUpRight,
    ArrowDownLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockTransactions = [
    {
        id: '1',
        transaction_number: 'VZ-2026-0001',
        type: 'out',
        recipient_name: 'Ahmet Yılmaz',
        amount: 1500,
        currency: 'TRY',
        description: 'Nakdi yardım ödemesi',
        payment_method: 'cash',
        created_at: '2026-01-15T10:30:00Z',
        created_by: 'Admin',
    },
    {
        id: '2',
        transaction_number: 'VZ-2026-0002',
        type: 'out',
        recipient_name: 'Fatma Kaya',
        amount: 2000,
        currency: 'TRY',
        description: 'Kira yardımı',
        payment_method: 'cash',
        created_at: '2026-01-15T11:00:00Z',
        created_by: 'Admin',
    },
    {
        id: '3',
        transaction_number: 'VZ-2026-0003',
        type: 'in',
        recipient_name: 'Bağış - Mehmet Demir',
        amount: 5000,
        currency: 'TRY',
        description: 'Nakdi bağış',
        payment_method: 'cash',
        created_at: '2026-01-15T14:00:00Z',
        created_by: 'Admin',
    },
]

export default function CashDeskPage() {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    const filteredTransactions = mockTransactions.filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false
        if (search && !t.recipient_name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const totalIn = mockTransactions.filter((t) => t.type === 'in').reduce((sum, t) => sum + t.amount, 0)
    const totalOut = mockTransactions.filter((t) => t.type === 'out').reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="space-y-6">
            <PageHeader
                title="Nakdi Yardım Veznesi"
                description="Nakdi yardım tahsilat ve ödeme işlemleri"
                icon={Banknote}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <ArrowDownLeft className="mr-2 h-4 w-4 text-success" />
                            Tahsilat
                        </Button>
                        <Button className="bg-gradient-to-r from-primary to-primary/80">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Ödeme
                        </Button>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Günlük Tahsilat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-success">
                            ₺{totalIn.toLocaleString('tr-TR')}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Günlük Ödeme</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-destructive">
                            ₺{totalOut.toLocaleString('tr-TR')}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Kasa Bakiyesi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            ₺{(totalIn - totalOut).toLocaleString('tr-TR')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Ad ile ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tür" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="in">Tahsilat</SelectItem>
                        <SelectItem value="out">Ödeme</SelectItem>
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
                                <TableHead>İşlem No</TableHead>
                                <TableHead>Tür</TableHead>
                                <TableHead>Kişi/Açıklama</TableHead>
                                <TableHead>Tutar</TableHead>
                                <TableHead>Tarih</TableHead>
                                <TableHead>İşlemi Yapan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        İşlem bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {transaction.transaction_number}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={transaction.type === 'in' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                                                {transaction.type === 'in' ? 'Tahsilat' : 'Ödeme'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{transaction.recipient_name}</p>
                                                <p className="text-xs text-muted-foreground">{transaction.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`font-medium ${transaction.type === 'in' ? 'text-success' : 'text-destructive'}`}>
                                            {transaction.type === 'in' ? '+' : '-'}₺{transaction.amount.toLocaleString('tr-TR')}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(transaction.created_at), 'dd.MM.yyyy HH:mm', { locale: tr })}
                                        </TableCell>
                                        <TableCell className="text-sm">{transaction.created_by}</TableCell>
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
