'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  UserX, 
  UserCheck,
  Mail,
  Key,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const roles = [
  { value: 'owner', label: 'Sahip', description: 'Tam erişim', color: 'bg-purple-100 text-purple-800' },
  { value: 'admin', label: 'Yönetici', description: 'Yönetim erişimi', color: 'bg-blue-100 text-blue-800' },
  { value: 'moderator', label: 'Moderatör', description: 'Sınırlı yönetim', color: 'bg-green-100 text-green-800' },
  { value: 'user', label: 'Kullanıcı', description: 'Standart erişim', color: 'bg-gray-100 text-gray-800' },
  { value: 'viewer', label: 'Görüntüleyici', description: 'Sadece görüntüleme', color: 'bg-yellow-100 text-yellow-800' },
]

const permissions = [
  { id: 'needy_manage', label: 'İhtiyaç Sahibi Yönetimi', description: 'Kayıt ekleme, düzenleme, silme' },
  { id: 'donation_manage', label: 'Bağış Yönetimi', description: 'Bağış kayıtları yönetimi' },
  { id: 'finance_manage', label: 'Finans Yönetimi', description: 'Kasa ve banka işlemleri' },
  { id: 'program_manage', label: 'Program Yönetimi', description: 'Proje ve program yönetimi' },
  { id: 'member_manage', label: 'Üye Yönetimi', description: 'Dernek üyeliği yönetimi' },
  { id: 'user_manage', label: 'Kullanıcı Yönetimi', description: 'Kullanıcı ve rol yönetimi' },
  { id: 'settings_manage', label: 'Ayar Yönetimi', description: 'Sistem ayarları' },
  { id: 'reports_view', label: 'Rapor Görüntüleme', description: 'Tüm raporlara erişim' },
  { id: 'export_data', label: 'Veri Dışa Aktarma', description: 'Excel/PDF export' },
]

export default function UsersSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('user')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .single()

      if (!member) return

      const { data: members, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:profiles(id, name, email, avatar_url, created_at)
        `)
        .eq('organization_id', member.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(members || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Kullanıcılar yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('E-posta adresi gerekli')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      if (!response.ok) throw new Error('Davet gönderilemedi')

      toast.success('Davet bağlantısı gönderildi')
      setIsInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('user')
    } catch (error) {
      toast.error('Davet gönderilirken hata oluştu')
    } finally {
      setIsSending(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast.success('Rol güncellendi')
      loadUsers()
      setIsRoleDialogOpen(false)
    } catch (error) {
      toast.error('Rol güncellenirken hata oluştu')
    }
  }

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı pasifleştirmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error

      toast.success('Kullanıcı pasifleştirildi')
      loadUsers()
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu')
    }
  }

  const filteredUsers = users.filter((user: any) =>
    user.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const roleConfig = roles.find(r => r.value === role)
    return (
      <Badge className={roleConfig?.color || 'bg-gray-100'}>
        {roleConfig?.label || role}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kullanıcı ve Rol Yönetimi</h2>
          <p className="text-muted-foreground">
            Ekip üyelerinizi ve erişim yetkilerini yönetin
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Kullanıcı Davet Et
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Davet Et</DialogTitle>
              <DialogDescription>
                Ekibinize yeni bir üye davet etmek için e-posta adresini girin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleInvite} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Davet Gönder
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="roles">Roller ve İzinler</TabsTrigger>
          <TabsTrigger value="invitations">Bekleyen Davetler</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organizasyon Üyeleri</CardTitle>
                  <CardDescription>
                    Toplam {users.length} aktif kullanıcı
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kullanıcı ara..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Katılım Tarihi</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.user?.avatar_url} />
                              <AvatarFallback>
                                {member.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user?.name || 'İsimsiz'}</p>
                              <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm">{member.is_active ? 'Aktif' : 'Pasif'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(member.joined_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setSelectedUser(member); setIsRoleDialogOpen(true); }}>
                                <Shield className="mr-2 h-4 w-4" />
                                Rol Değiştir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeactivate(member.id)} className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Pasifleştir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.value}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={role.color}>{role.label}</Badge>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {permissions.slice(0, 4).map((perm) => (
                      <div key={perm.id} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {perm.label}
                      </div>
                    ))}
                    {permissions.length > 4 && (
                      <p className="text-sm text-muted-foreground">
                        +{permissions.length - 4} daha...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Davetler</CardTitle>
              <CardDescription>
                Henüz kabul edilmemiş davetler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bekleyen davet bulunmuyor</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rol Değiştir</DialogTitle>
            <DialogDescription>
              {selectedUser?.user?.name} kullanıcısının rolünü değiştirin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={selectedUser?.role}
              onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Yeni rol seçin" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
