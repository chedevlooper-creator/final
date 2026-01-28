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

const EVENT_TYPES = [
    { value: 'charity', label: 'Yardım Etkinliği' },
    { value: 'education', label: 'Eğitim' },
    { value: 'meeting', label: 'Toplantı' },
    { value: 'campaign', label: 'Kampanya' },
]

const eventFormSchema = z.object({
    title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
    event_type: z.string().min(1, 'Tür seçiniz'),
    description: z.string().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    start_date: z.string().min(1, 'Başlangıç tarihi seçiniz'),
    end_date: z.string().optional(),
    capacity: z.number().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
    defaultValues?: Partial<EventFormValues>
    onSuccess?: () => void
}

export function EventForm({ defaultValues, onSuccess }: EventFormProps) {
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            event_type: 'charity',
            start_date: '',
            ...defaultValues,
        },
    })

    const onSubmit = async (data: EventFormValues) => {
        try {
            toast.success('Etkinlik oluşturuldu')
            onSuccess?.()
        } catch {
            toast.error('Etkinlik oluşturulurken hata oluştu')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Başlık *</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Etkinlik başlığı" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tür *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {EVENT_TYPES.map((t) => (
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value || ''} placeholder="Etkinlik açıklaması" rows={3} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Başlangıç *</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bitiş</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} value={field.value || ''} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mekan</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ''} placeholder="Mekan adı" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kapasite</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="100"
                                    />
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
                                <Textarea {...field} value={field.value || ''} placeholder="Tam adres" rows={2} />
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
