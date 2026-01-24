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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
    Calendar,
    ArrowLeft,
    Save,
    MapPin,
    Clock,
    Users,
    Image,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data
const mockEvent = {
    id: '1',
    title: 'Ramazan İftar Organizasyonu',
    description: 'Muhtaç ailelere iftar yemeği dağıtımı',
    event_type: 'charity',
    location: 'Başakşehir Meydan',
    address: 'Başakşehir Meydanı, İstanbul',
    start_date: '2026-03-15T18:00:00Z',
    end_date: '2026-03-15T21:00:00Z',
    capacity: 500,
    registered: 350,
    status: 'upcoming',
    organizer: 'Yardım Birimi',
    created_at: '2026-01-10T10:00:00Z',
}

const EVENT_TYPES = [
    { value: 'charity', label: 'Yardım Etkinliği' },
    { value: 'education', label: 'Eğitim' },
    { value: 'meeting', label: 'Toplantı' },
    { value: 'campaign', label: 'Kampanya' },
]

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Taslak', color: 'bg-slate-100 text-slate-700' },
    { value: 'upcoming', label: 'Yaklaşan', color: 'bg-blue-100 text-blue-700' },
    { value: 'ongoing', label: 'Devam Ediyor', color: 'bg-green-100 text-green-700' },
    { value: 'completed', label: 'Tamamlandı', color: 'bg-slate-100 text-slate-700' },
    { value: 'cancelled', label: 'İptal', color: 'bg-red-100 text-red-700' },
]

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params['id'] as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [event, setEvent] = useState(mockEvent)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500)
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 500))
        toast.success('Etkinlik güncellendi')
        setIsSaving(false)
    }

    const statusConfig = STATUS_OPTIONS.find((s) => s.value === event.status)

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
                    <Link href="/events">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{event.title}</h1>
                            <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                            {format(new Date(event.start_date), 'dd MMMM yyyy', { locale: tr })}
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Etkinlik Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Başlık</Label>
                                <Input value={event.title} />
                            </div>
                            <div>
                                <Label>Açıklama</Label>
                                <Textarea value={event.description} rows={4} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Tür</Label>
                                    <Select value={event.event_type}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {EVENT_TYPES.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Durum</Label>
                                    <Select value={event.status}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Başlangıç</Label>
                                    <Input type="datetime-local" value={event.start_date.slice(0, 16)} />
                                </div>
                                <div>
                                    <Label>Bitiş</Label>
                                    <Input type="datetime-local" value={event.end_date.slice(0, 16)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Konum
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Mekan Adı</Label>
                                <Input value={event.location} />
                            </div>
                            <div>
                                <Label>Adres</Label>
                                <Textarea value={event.address} rows={2} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4" />
                                Katılım
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-slate-500">Kayıtlı</span>
                                        <span className="font-medium">{event.registered} / {event.capacity}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Kapasite</Label>
                                    <Input type="number" value={event.capacity} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Organizatör</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{event.organizer}</p>
                            <p className="text-sm text-slate-500">
                                Oluşturulma: {format(new Date(event.created_at), 'dd.MM.yyyy', { locale: tr })}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
