'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  Plus, 
  Search,
  ArrowLeft,
  CheckCircle,
  UserPlus,
  Loader2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function ProgramBeneficiariesPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params['id'] as string
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')

  // Program bilgisi
  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('name')
        .eq('id', programId)
        .single()
      if (error) throw error
      return data
    },
  })

  // Mevcut faydalanıcılar
  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ['program-beneficiaries', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_beneficiaries')
        .select(`
          *,
          needy_person:needy_persons(id, first_name, last_name, phone, email, address)
        `)
        .eq('program_id', programId)
        .order('enrollment_date', { ascending: false })
      if (error) throw error
      return data
    },
  })

  // Arama - ihtiyaç sahipleri
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['needy-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return []
      const { data, error } = await supabase
        .from('needy_persons')
        .select('id, first_name, last_name, phone, email, address')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(10)
      if (error) throw error
      return data
    },
    enabled: searchQuery.length >= 2,
  })

  // Faydalanıcı ekleme
  const addMutation = useMutation({
    mutationFn: async ({ personId, notes }: { personId: string; notes: string }) => {
      const res = await fetch(`/api/programs/${programId}/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needy_person_id: personId,
          notes,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Faydalanıcı eklenemedi')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Faydalanıcı eklendi')
      queryClient.invalidateQueries({ queryKey: ['program-beneficiaries', programId] })
      setIsDialogOpen(false)
      setSelectedPerson(null)
      setSearchQuery('')
      setNotes('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Faydalanıcı eklenirken hata oluştu')
    },
  })

  const handleAdd = () => {
    if (!selectedPerson) return
    addMutation.mutate({ personId: selectedPerson.id, notes })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'success' | 'warning' }> = {
      registered: { label: 'Kayıtlı', variant: 'default' },
      active: { label: 'Aktif', variant: 'success' },
      completed: { label: 'Tamamlandı', variant: 'default' },
      dropped: { label: 'Ayrıldı', variant: 'warning' },
    }
    const config = configs[status] || { label: status, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${program?.name || 'Program'} - Faydalanıcılar`}
        description="Program faydalanıcılarını yönetin"
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/programs/${programId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Programa Dön
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Faydalanıcı Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Faydalanıcı Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>İhtiyaç Sahibi Ara</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="İsim, soyisim veya telefon ile ara..."
                        value={searchQuery}
                        onChange={e => {
                          setSearchQuery(e.target.value)
                          setSelectedPerson(null)
                        }}
                      />
                    </div>
                  </div>

                  {isSearching && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {searchResults && searchResults.length > 0 && !selectedPerson && (
                    <div className="border rounded-lg max-h-60 overflow-auto">
                      {searchResults.map((person: any) => (
                        <button
                          key={person.id}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-0"
                          onClick={() => setSelectedPerson(person)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {person.first_name[0]}{person.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{person.first_name} {person.last_name}</p>
                            <p className="text-sm text-muted-foreground">{person.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPerson && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-success/10 text-success">
                            {selectedPerson.first_name[0]}{selectedPerson.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{selectedPerson.first_name} {selectedPerson.last_name}</p>
                          <p className="text-sm text-muted-foreground">{selectedPerson.phone}</p>
                          {selectedPerson.address && (
                            <p className="text-sm text-muted-foreground mt-1">{selectedPerson.address}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedPerson(null)}
                        >
                          Değiştir
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Notlar</Label>
                    <Input
                      placeholder="Faydalanıcı için notlar..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button 
                      onClick={handleAdd}
                      disabled={!selectedPerson || addMutation.isPending}
                    >
                      {addMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ekle
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : beneficiaries && beneficiaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beneficiaries.map((beneficiary: any) => (
              <div key={beneficiary.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {beneficiary.needy_person?.first_name?.[0]}
                    {beneficiary.needy_person?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">
                      {beneficiary.needy_person?.first_name} {beneficiary.needy_person?.last_name}
                    </p>
                    {getStatusBadge(beneficiary.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{beneficiary.needy_person?.phone}</p>
                  {beneficiary.needy_person?.address && (
                    <p className="text-sm text-muted-foreground truncate">
                      {beneficiary.needy_person.address}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Kayıt: {new Date(beneficiary.enrollment_date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {beneficiary.notes && (
                    <p className="text-sm mt-2 bg-muted p-2 rounded">{beneficiary.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Henüz faydalanıcı bulunmuyor</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Faydalanıcıyı Ekle
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
