'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
    DollarSign,
    ArrowLeft,
    Save,
    User,
    Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useDonationDetail, useUpdateDonation } from '@/hooks/queries/use-donations'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DONATION_TYPES, PAYMENT_METHODS, CURRENCIES, donationSchema } from '@/lib/validations/donation'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/skeleton'

const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Beklemede', variant: 'warning' as const },
    { value: 'completed', label: 'Tamamlandı', variant: 'success' as const },
    { value: 'cancelled', label: 'İptal', variant: 'error' as const },
]

const donationUpdateSchema = donationSchema.extend({
    payment_status: z.enum(['pending', 'completed', 'cancelled']),
    receipt_number: z.string().nullable().optional(),
})

type DonationUpdateValues = z.infer<typeof donationUpdateSchema>

export default function DonationDetailPage() {
    const params = useParams()
    const id = params['id'] as string

    const { data: donation, isLoading, error } = useDonationDetail(id)
    const updateMutation = useUpdateDonation()

    const form = useForm<DonationUpdateValues>({
        resolver: zodResolver(donationUpdateSchema),
        defaultValues: {
            donation_type: 'cash',
            amount: 0,
            currency: 'TRY',
            payment_status: 'pending',
        },
    })

    // Reset form when donation data loads
    if (donation && !form.formState.isDirty) {
        form.reset({
            donor_name: donation.donor_name,
            donor_phone: donation.donor_phone,
            donor_email: donation.donor_email,
            donation_type: donation.donation_type as any,
            category_id: donation.category_id,
            amount: donation.amount || 0,
            currency: donation.currency as any,
            payment_method: donation.payment_method as any,
            payment_status: donation.payment_status as any,
            description: donation.description,
            notes: donation.notes,
            receipt_number: donation.receipt_number,
        })
    }

    const onSubmit = async (values: DonationUpdateValues) => {
        try {
            await updateMutation.mutateAsync({ id, values })
            toast.success('Bağış güncellendi')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu'
            toast.error(errorMessage)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <CardSkeleton />
                <div className="grid gap-6 md:grid-cols-2">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        )
    }

    if (error || !donation) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Bağış bulunamadı veya bir hata oluştu</p>
                <Link href="/dashboard/donations">
                    <Button>Bağış Listesine Dön</Button>
                </Link>
            </div>
        )
    }

    const statusConfig = PAYMENT_STATUSES.find((s) => s.value === donation.payment_status)
    const isSaving = updateMutation.isPending

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/donations">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Bağış #{donation.donation_number || donation.id?.slice(0, 8)}</h1>
                            {statusConfig && (
                                <Badge status={donation.payment_status}>
                                    {statusConfig.label}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(donation.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </p>
                    </div>
                </div>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving} className="bg-gradient-to-r from-primary to-primary/80">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Bağış Bilgileri */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-500" />
                                    Bağış Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="donation_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bağış Türü</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {DONATION_TYPES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tutar</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Para Birimi</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CURRENCIES.map((c) => (
                                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="payment_method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ödeme Yöntemi</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {PAYMENT_METHODS.map((m) => (
                                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="payment_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ödeme Durumu</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {PAYMENT_STATUSES.map((s) => (
                                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="receipt_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Makbuz No</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Makbuz numarası" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Açıklama</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Bağış açıklaması..."
                                                    rows={3}
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Bağışçı Bilgileri */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-info" />
                                    Bağışçı Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="donor_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ad Soyad</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ad Soyad" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="donor_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefon</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0500 000 00 00" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="donor_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-posta</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="ornek@email.com" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>
        </div>
    )
}
