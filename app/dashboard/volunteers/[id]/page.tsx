'use client'

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
    UserCheck,
    ArrowLeft,
    Save,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    Award,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockVolunteer = {
    id: '1',
    volunteer_number: 'GN-2026-0001',
    first_name: 'Ali',
    last_name: 'Yılmaz',
    phone: '0532 123 45 67',
    email: 'ali@example.com',
    address: 'Başakşehir, İstanbul',
    profession: 'Mühendis',
    skills: ['Bilgisayar', 'İngilizce', 'Araç Kullanma'],
    availability: 'weekends',
    status: 'active',
    join_date: '2025-06-15',
    total_missions: 12,
    total_hours: 48,
    created_at: '2025-06-15T10:00:00Z',
}

const AVAILABILITY_OPTIONS = [
    { value: 'weekdays', label: 'Hafta İçi' },
    { value: 'weekends', label: 'Hafta Sonu' },
    { value: 'evenings', label: 'Akşamları' },
    { value: 'flexible', label: 'Esnek' },
]

const STATUS_OPTIONS = [
    { value: 'active', label: 'Aktif', color: 'bg-green-100 text-green-700' },
    { value: 'inactive', label: 'Pasif', color: 'bg-slate-100 text-slate-700' },
    { value: 'pending', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
]

export default function VolunteerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params['id'] as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [volunteer, setVolunteer] = useState(mockVolunteer)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500)
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 500))
        toast.success('Gönüllü bilgileri güncellendi')
        setIsSaving(false)
    }

    const statusConfig = STATUS_OPTIONS.find((s) => s.value === volunteer.status)

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
                    <Link href="/volunteers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{volunteer.first_name} {volunteer.last_name}</h1>
                            <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">#{volunteer.volunteer_number}</p>
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
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Toplam Görev</p>
                                <p className="text-2xl font-bold">{volunteer.total_missions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Toplam Saat</p>
                                <p className="text-2xl font-bold">{volunteer.total_hours}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Üyelik</p>
                                <p className="text-lg font-medium">{format(new Date(volunteer.join_date), 'MMM yyyy', { locale: tr })}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Form */}
            <Card>
                <CardContent className="pt-6">
                    <Tabs defaultValue="personal">
                        <TabsList>
                            <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
                            <TabsTrigger value="skills">Yetenekler</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="mt-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Ad</Label>
                                    <Input value={volunteer.first_name} />
                                </div>
                                <div>
                                    <Label>Soyad</Label>
                                    <Input value={volunteer.last_name} />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Telefon</Label>
                                    <Input value={volunteer.phone} />
                                </div>
                                <div>
                                    <Label>E-posta</Label>
                                    <Input value={volunteer.email} type="email" />
                                </div>
                            </div>
                            <div>
                                <Label>Adres</Label>
                                <Textarea value={volunteer.address} rows={2} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Meslek</Label>
                                    <Input value={volunteer.profession} />
                                </div>
                                <div>
                                    <Label>Müsaitlik</Label>
                                    <Select value={volunteer.availability}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {AVAILABILITY_OPTIONS.map((o) => (
                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="skills" className="mt-6">
                            <div className="space-y-4">
                                <Label>Yetenekler</Label>
                                <div className="flex flex-wrap gap-2">
                                    {volunteer.skills.map((skill, idx) => (
                                        <Badge key={idx} variant="outline" className="px-3 py-1">{skill}</Badge>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm">Yetenek Ekle</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
