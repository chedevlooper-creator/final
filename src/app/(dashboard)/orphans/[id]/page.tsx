'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
    GraduationCap,
    ArrowLeft,
    Save,
    User,
    Calendar,
    Heart,
    School,
    FileText,
    Image,
    MapPin,
    Phone,
    Camera,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Mock data flag
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true

const ORPHAN_TYPES = [
    { value: 'ihh_orphan', label: 'İHH Yetimi' },
    { value: 'orphan', label: 'Yetim' },
    { value: 'family', label: 'Aile' },
    { value: 'education_scholarship', label: 'Eğitim Bursu' },
]

const ORPHAN_STATUSES = [
    { value: 'preparing', label: 'Hazırlanıyor', color: 'yellow' },
    { value: 'assigned', label: 'Atandı', color: 'blue' },
    { value: 'active', label: 'Aktif', color: 'green' },
    { value: 'paused', label: 'Duraklatıldı', color: 'orange' },
    { value: 'completed', label: 'Tamamlandı', color: 'gray' },
]

const GENDERS = [
    { value: 'male', label: 'Erkek' },
    { value: 'female', label: 'Kız' },
]

const EDUCATION_GRADES = [
    { value: '1', label: '1. Sınıf' },
    { value: '2', label: '2. Sınıf' },
    { value: '3', label: '3. Sınıf' },
    { value: '4', label: '4. Sınıf' },
    { value: '5', label: '5. Sınıf' },
    { value: '6', label: '6. Sınıf' },
    { value: '7', label: '7. Sınıf' },
    { value: '8', label: '8. Sınıf' },
    { value: '9', label: '9. Sınıf' },
    { value: '10', label: '10. Sınıf' },
    { value: '11', label: '11. Sınıf' },
    { value: '12', label: '12. Sınıf' },
    { value: 'university', label: 'Üniversite' },
]

// Form Schema
const orphanFormSchema = z.object({
    file_number: z.string().optional().nullable(),
    type: z.string().default('orphan'),
    first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    first_name_original: z.string().optional().nullable(),
    last_name_original: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    identity_number: z.string().optional().nullable(),
    nationality_id: z.string().optional().nullable(),
    country_id: z.string().optional().nullable(),
    status: z.string().optional().default('preparing'),
    guardian_name: z.string().optional().nullable(),
    guardian_relation: z.string().optional().nullable(),
    guardian_phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    school_id: z.string().optional().nullable(),
    grade: z.string().optional().nullable(),
    education_status: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

type OrphanFormValues = z.infer<typeof orphanFormSchema>

interface Orphan extends OrphanFormValues {
    id: string
    photo_url: string | null
    partner_id: string | null
    field_name: string | null
    sponsor_id: string | null
    last_assignment_date: string | null
    assignment_status: string | null
    created_at: string
    updated_at: string
    sponsor?: {
        first_name: string
        last_name: string
        phone: string | null
    } | null
}

// Mock data
const mockOrphan: Orphan = {
    id: '1',
    file_number: 'YTM-2026-0001',
    type: 'orphan',
    first_name: 'Muhammed',
    last_name: 'Yılmaz',
    first_name_original: 'محمد',
    last_name_original: 'يلماز',
    gender: 'male',
    date_of_birth: '2015-05-15',
    identity_number: '12345678901',
    nationality_id: '1',
    country_id: '1',
    status: 'active',
    guardian_name: 'Ayşe Yılmaz',
    guardian_relation: 'Anne',
    guardian_phone: '0532 123 45 67',
    address: 'İstanbul, Türkiye',
    school_id: null,
    grade: '4',
    education_status: 'continuing',
    notes: 'Yetim, babası 2020 yılında vefat etti.',
    photo_url: null,
    partner_id: null,
    field_name: 'Türkiye',
    sponsor_id: null,
    last_assignment_date: null,
    assignment_status: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    sponsor: null,
}

export default function OrphanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [orphan, setOrphan] = useState<Orphan | null>(null)

    const form = useForm<OrphanFormValues>({
        resolver: zodResolver(orphanFormSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            type: 'orphan',
            status: 'preparing',
        },
    })

    useEffect(() => {
        async function fetchData() {
            try {
                if (id === 'new') {
                    setIsLoading(false)
                    return
                }

                if (USE_MOCK_DATA) {
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    setOrphan(mockOrphan)
                    form.reset({
                        file_number: mockOrphan.file_number,
                        type: mockOrphan.type,
                        first_name: mockOrphan.first_name,
                        last_name: mockOrphan.last_name,
                        first_name_original: mockOrphan.first_name_original,
                        last_name_original: mockOrphan.last_name_original,
                        gender: mockOrphan.gender,
                        date_of_birth: mockOrphan.date_of_birth,
                        identity_number: mockOrphan.identity_number,
                        nationality_id: mockOrphan.nationality_id,
                        country_id: mockOrphan.country_id,
                        status: mockOrphan.status,
                        guardian_name: mockOrphan.guardian_name,
                        guardian_relation: mockOrphan.guardian_relation,
                        guardian_phone: mockOrphan.guardian_phone,
                        address: mockOrphan.address,
                        school_id: mockOrphan.school_id,
                        grade: mockOrphan.grade,
                        education_status: mockOrphan.education_status,
                        notes: mockOrphan.notes,
                    })
                } else {
                    // TODO: Real API call
                }
            } catch (error) {
                console.error('Error:', error)
                toast.error('Veri yüklenirken hata oluştu')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [id, form])

    const handleSave = async () => {
        const isValid = await form.trigger()
        if (!isValid) {
            toast.error('Lütfen zorunlu alanları doldurun')
            return
        }

        setIsSaving(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 500))
            toast.success(id === 'new' ? 'Kayıt oluşturuldu' : 'Kayıt güncellendi')
            if (id === 'new') {
                router.push('/orphans')
            }
        } catch (error) {
            toast.error('Kayıt sırasında hata oluştu')
        } finally {
            setIsSaving(false)
        }
    }

    const getStatusBadge = (statusValue: string) => {
        const statusConfig = ORPHAN_STATUSES.find((s) => s.value === statusValue)
        const colorClasses: Record<string, string> = {
            yellow: 'bg-yellow-100 text-yellow-700',
            blue: 'bg-blue-100 text-blue-700',
            green: 'bg-green-100 text-green-700',
            orange: 'bg-orange-100 text-orange-700',
            gray: 'bg-slate-100 text-slate-700',
        }
        return (
            <Badge className={colorClasses[statusConfig?.color || 'gray']}>
                {statusConfig?.label || statusValue}
            </Badge>
        )
    }

    const calculateAge = (dateOfBirth: string | null | undefined) => {
        if (!dateOfBirth) return '-'
        const today = new Date()
        const birthDate = new Date(dateOfBirth)
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64 md:col-span-2" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/orphans">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">
                                {id === 'new' ? 'Yeni Yetim/Öğrenci' : `${orphan?.first_name} ${orphan?.last_name}`}
                            </h1>
                            {orphan && getStatusBadge(form.watch('status') || 'preparing')}
                        </div>
                        {orphan && (
                            <p className="text-sm text-slate-500">
                                Dosya No: {orphan.file_number} • {calculateAge(orphan.date_of_birth)} yaş
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </div>

            {/* Main Content */}
            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Photo & Quick Info */}
                        <div className="space-y-6">
                            {/* Photo Card */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center">
                                        <Avatar className="h-32 w-32 mb-4">
                                            <AvatarImage src={orphan?.photo_url || undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-700 text-3xl">
                                                {form.watch('first_name')?.[0]}{form.watch('last_name')?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline" size="sm">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Fotoğraf Yükle
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Type */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Durum Bilgileri</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tür</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {ORPHAN_TYPES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Durum</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || 'preparing'}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {ORPHAN_STATUSES.map((s) => (
                                                            <SelectItem key={s.value} value={s.value}>
                                                                {s.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="file_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dosya No</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} placeholder="YTM-2026-0001" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Sponsor Info */}
                            {orphan?.sponsor && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            Sponsor
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">
                                            {orphan.sponsor.first_name} {orphan.sponsor.last_name}
                                        </p>
                                        {orphan.sponsor.phone && (
                                            <p className="text-sm text-slate-500">{orphan.sponsor.phone}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <Tabs defaultValue="personal" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="personal">
                                                <User className="h-4 w-4 mr-1" />
                                                Kişisel
                                            </TabsTrigger>
                                            <TabsTrigger value="guardian">
                                                <Phone className="h-4 w-4 mr-1" />
                                                Veli
                                            </TabsTrigger>
                                            <TabsTrigger value="education">
                                                <School className="h-4 w-4 mr-1" />
                                                Eğitim
                                            </TabsTrigger>
                                            <TabsTrigger value="documents">
                                                <FileText className="h-4 w-4 mr-1" />
                                                Dokümanlar
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Personal Info Tab */}
                                        <TabsContent value="personal" className="mt-6 space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="first_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ad *</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Ad" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="last_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Soyad *</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Soyad" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="first_name_original"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ad (Orijinal)</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ''} placeholder="محمد" dir="rtl" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="last_name_original"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Soyad (Orijinal)</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ''} placeholder="يلماز" dir="rtl" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <FormField
                                                    control={form.control}
                                                    name="gender"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Cinsiyet</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seçin" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {GENDERS.map((g) => (
                                                                        <SelectItem key={g.value} value={g.value}>
                                                                            {g.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="date_of_birth"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Doğum Tarihi</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} value={field.value || ''} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="identity_number"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Kimlik No</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ''} placeholder="12345678901" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Adres</FormLabel>
                                                        <FormControl>
                                                            <Textarea {...field} value={field.value || ''} placeholder="Adres bilgisi" rows={2} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>

                                        {/* Guardian Tab */}
                                        <TabsContent value="guardian" className="mt-6 space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="guardian_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Veli Adı Soyadı</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ''} placeholder="Veli adı" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="guardian_relation"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Yakınlık Derecesi</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ''} placeholder="Anne, Baba, Amca vb." />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="guardian_phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Veli Telefonu</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} value={field.value || ''} placeholder="0532 123 45 67" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>

                                        {/* Education Tab */}
                                        <TabsContent value="education" className="mt-6 space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="grade"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Sınıf</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Sınıf seçin" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {EDUCATION_GRADES.map((g) => (
                                                                        <SelectItem key={g.value} value={g.value}>
                                                                            {g.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="education_status"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Eğitim Durumu</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seçin" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="continuing">Devam Ediyor</SelectItem>
                                                                    <SelectItem value="paused">Durduruldu</SelectItem>
                                                                    <SelectItem value="graduated">Mezun Oldu</SelectItem>
                                                                    <SelectItem value="dropout">Terk Etti</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Notlar</FormLabel>
                                                        <FormControl>
                                                            <Textarea {...field} value={field.value || ''} placeholder="Eğitim ile ilgili notlar..." rows={4} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>

                                        {/* Documents Tab */}
                                        <TabsContent value="documents" className="mt-6">
                                            <div className="text-center py-12 text-slate-500">
                                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Henüz doküman yüklenmemiş</p>
                                                <Button variant="outline" size="sm" className="mt-4">
                                                    Doküman Yükle
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
