'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import { TabLayout } from './TabLayout'
import { 
  BankAccount, 
  CURRENCY_OPTIONS, 
  TRANSACTION_TYPE_OPTIONS,
  StatusFilter,
  Currency,
  TransactionType 
} from '@/types/linked-records.types'
import { getMockBankAccounts } from '@/lib/mock-data/needy'
import { useEffect } from 'react'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true // Geçici olarak true

interface BankAccountsTabProps {
  needyPersonId: string
  onClose: () => void
}

export function BankAccountsTab({ needyPersonId, onClose }: BankAccountsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [searchValue, setSearchValue] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    account_holder_name: '',
    currency: 'TRY' as Currency,
    transaction_type: '' as TransactionType | '',
    iban: '',
    bank_name: '',
    branch_name: '',
    branch_code: '',
    account_number: '',
    swift_code: '',
    address: '',
  })

  // Mock data - gerçek uygulamada API'den gelecek
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load data
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setAccounts(getMockBankAccounts(needyPersonId))
      setIsLoading(false)
    } else {
      // TODO: Real API call
      setIsLoading(false)
    }
  }, [needyPersonId])

  const columns = [
    { key: 'account_holder_name', label: 'Alıcı Ünvanı' },
    { key: 'currency', label: 'Döviz', width: '80px' },
    { key: 'transaction_type', label: 'İşlem Tür', width: '100px' },
    { key: 'iban', label: 'IBAN' },
    { key: 'bank_name', label: 'Banka' },
    { key: 'branch_name', label: 'Şube' },
    { key: 'account_number', label: 'Hesap' },
    { key: 'swift_code', label: 'Swift', width: '100px' },
  ]

  const handleAdd = () => {
    setEditingAccount(null)
    setFormData({
      account_holder_name: '',
      currency: 'TRY',
      transaction_type: '',
      iban: '',
      bank_name: '',
      branch_name: '',
      branch_code: '',
      account_number: '',
      swift_code: '',
      address: '',
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      account_holder_name: account.account_holder_name || '',
      currency: account.currency,
      transaction_type: account.transaction_type || '',
      iban: account.iban || '',
      bank_name: account.bank_name || '',
      branch_name: account.branch_name || '',
      branch_code: account.branch_code || '',
      account_number: account.account_number || '',
      swift_code: account.swift_code || '',
      address: account.address || '',
    })
    setIsAddModalOpen(true)
  }

  const handleSave = async () => {
    // TODO: API call to save
    console.log('Saving:', formData)
    setIsAddModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu banka hesabını silmek istediğinizden emin misiniz?')) {
      // TODO: API call to delete
      console.log('Deleting:', id)
    }
  }

  return (
    <>
      <TabLayout
        showStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showSearch={true}
        searchPlaceholder="IBAN veya banka adı ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={accounts.length}
        currentPage={1}
        totalPages={1}
        isLoading={isLoading}
      >
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-[100px]">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-muted-foreground">
                    Kayıtlı banka hesabı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account, index) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>{account.account_holder_name}</TableCell>
                    <TableCell>{account.currency}</TableCell>
                    <TableCell>
                      {TRANSACTION_TYPE_OPTIONS.find(t => t.value === account.transaction_type)?.label}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{account.iban}</TableCell>
                    <TableCell>{account.bank_name}</TableCell>
                    <TableCell>{account.branch_name}</TableCell>
                    <TableCell>{account.account_number}</TableCell>
                    <TableCell>{account.swift_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabLayout>

      {/* Ekleme/Düzenleme Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Banka Hesabı Düzenle' : 'Yeni Banka Hesabı Ekle'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Alıcı Ünvanı</Label>
              <Input
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                placeholder="Hesap sahibinin adı"
              />
            </div>
            
            <div>
              <Label>Döviz</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => setFormData({ ...formData, currency: v as Currency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>İşlem Türü</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(v) => setFormData({ ...formData, transaction_type: v as TransactionType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label>IBAN</Label>
              <Input
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                className="font-mono"
              />
            </div>
            
            <div>
              <Label>Banka</Label>
              <Input
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Banka adı"
              />
            </div>
            
            <div>
              <Label>Şube</Label>
              <Input
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                placeholder="Şube adı"
              />
            </div>
            
            <div>
              <Label>Şube Kodu</Label>
              <Input
                value={formData.branch_code}
                onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                placeholder="Şube kodu"
              />
            </div>
            
            <div>
              <Label>Hesap Numarası</Label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Hesap numarası"
              />
            </div>
            
            <div>
              <Label>Swift Kodu</Label>
              <Input
                value={formData.swift_code}
                onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                placeholder="SWIFT kodu"
              />
            </div>
            
            <div className="col-span-2">
              <Label>Adres</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Banka şube adresi"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
