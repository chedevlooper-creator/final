'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInventoryTransactions } from '@/hooks/queries/use-inventory'
import { TransactionDialog } from '@/components/inventory/transaction-dialog'
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Plus, Calendar } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

const transactionTypeLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  in: { label: 'Giriş', color: 'bg-green-100 text-green-800', icon: <ArrowDownLeft className="h-4 w-4" /> },
  out: { label: 'Çıkış', color: 'bg-red-100 text-red-800', icon: <ArrowUpRight className="h-4 w-4" /> },
  transfer: { label: 'Transfer', color: 'bg-blue-100 text-blue-800', icon: <RefreshCw className="h-4 w-4" /> },
  adjustment: { label: 'Düzeltme', color: 'bg-yellow-100 text-yellow-800', icon: <RefreshCw className="h-4 w-4" /> },
  count: { label: 'Sayım', color: 'bg-purple-100 text-purple-800', icon: <RefreshCw className="h-4 w-4" /> },
}

export default function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  const { data: transactions, isLoading } = useInventoryTransactions({
    type: typeFilter === 'all' ? undefined : typeFilter,
    limit: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok Hareketleri</h1>
          <p className="text-muted-foreground mt-1">Giriş, çıkış ve transfer kayıtları</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Hareket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hareket Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="in">Giriş</SelectItem>
                <SelectItem value="out">Çıkış</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="adjustment">Düzeltme</SelectItem>
                <SelectItem value="count">Sayım</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Hareket kaydı bulunamadı
            </div>
          ) : (
            <div className="space-y-2">
              {transactions?.map((transaction) => {
                const typeInfo = transactionTypeLabels[transaction.type]
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.item?.name}</span>
                          <Badge variant="outline">{transaction.transaction_number}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{transaction.warehouse?.name}</span>
                          {transaction.destination_warehouse && (
                            <>
                              <span>→</span>
                              <span>{transaction.destination_warehouse.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {transaction.type === 'out' ? '-' : '+'}{formatNumber(transaction.quantity)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {transaction.item?.unit}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.transaction_date)}
                        {transaction.performer && (
                          <span>• {transaction.performer.full_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
