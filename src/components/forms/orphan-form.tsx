'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const ORPHAN_TYPES = [
    { value: 'ihh_orphan', label: 'İHH Yetimi' },
    { value: 'orphan', label: 'Yetim' },
    { value: 'family', label: 'Aile' },
    { value: 'education_scholarship', label: 'Eğitim Bursu' },
]

const GENDERS = [
    { value: 'male', label: 'Erkek' },
    { value: 'female', label: 'Kız' },
]

const orphanFormSchema = z.object({
    type: z.string().min(1, 'Tür seçiniz'),
    first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    gender: z.string().optional(),
    date_of_birth: z.string().optional(),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
})

type OrphanFormValues = z.infer<typeof orphanFormSchema>

interface OrphanFormProps {
    defaultValues?: Partial<OrphanFormValues>
    onSuccess?: () => void
}

export function OrphanForm({ defaultValues, onSuccess }: OrphanFormProps) {
    const form = useForm<OrphanFormValues>({
        resolver: zodResolver(orphanFormSchema),
        defaultValues: {
            type: 'orphan',
            first_name: '',
            last_name: '',
            ...defaultValues,
        },
    })

    const onSubmit = async (data: OrphanFormValues) => {
        try {
            // TODO: API call
            console.log('Form data:', data)
            toast.success('Kayıt başarıyla oluşturuldu')
            onSuccess?.()
        } catch (error) {
            toast.error('Kayıt oluşturulurken hata oluştu')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tür *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tür seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ORPHAN_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
                                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="guardian_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Veli Adı</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ''} placeholder="Veli adı soyadı" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
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
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adres</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value || ''} placeholder="Adres" rows={2} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notlar</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value || ''} placeholder="Ek notlar..." rows={3} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit">Kaydet</Button>
                </div>
            </form>
        </Form>
    )
}
