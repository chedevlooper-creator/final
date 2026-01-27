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
import { Loader2 } from 'lucide-react'
import { useCreateEvent } from '@/hooks/queries/use-calendar'
import { formatDateForInput } from '@/lib/utils'

const EVENT_TYPES = [
    { value: 'meeting', label: 'Toplantı' },
    { value: 'event', label: 'Etkinlik' },
    { value: 'reminder', label: 'Hatırlatıcı' },
    { value: 'other', label: 'Diğer' },
]

const eventFormSchema = z.object({
    title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
    event_type: z.enum(['meeting', 'event', 'reminder', 'other']),
    description: z.string().optional(),
    location: z.string().optional(),
    start_date: z.string().min(1, 'Başlangıç tarihi seçiniz'),
    end_date: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
    defaultValues?: Partial<EventFormValues>
    onSuccess?: () => void
}

export function EventForm({ defaultValues, onSuccess }: EventFormProps) {
    const createMutation = useCreateEvent()

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            event_type: 'event',
            start_date: '',
            ...defaultValues,
        },
    })

    const onSubmit = async (data: EventFormValues) => {
        try {
            await createMutation.mutateAsync({
                title: data.title,
                description: data.description,
                event_type: data.event_type,
                location: data.location,
                start_date: new Date(data.start_date).toISOString(),
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
                status: 'planned',
            })
            toast.success('Etkinlik oluşturuldu')
            form.reset()
            onSuccess?.()
        } catch (_error) {
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
                            <FormLabel htmlFor="event_title">Başlık *</FormLabel>
                            <FormControl>
                                <Input id="event_title" {...field} placeholder="Etkinlik başlığı" />
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
                            <FormLabel htmlFor="event_type">Tür *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger id="event_type">
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

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="event_start_date">Başlangıç Tarihi *</FormLabel>
                                <FormControl>
                                    <Input id="event_start_date" type="date" {...field} value={formatDateForInput(field.value)} />
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
                                <FormLabel htmlFor="event_end_date">Bitiş Tarihi</FormLabel>
                                <FormControl>
                                    <Input id="event_end_date" type="date" {...field} value={formatDateForInput(field.value)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="event_location">Mekan</FormLabel>
                            <FormControl>
                                <Input id="event_location" {...field} value={field.value || ''} placeholder="Mekan adı" />
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
                            <FormLabel htmlFor="event_description">Açıklama</FormLabel>
                            <FormControl>
                                <Textarea
                                    id="event_description"
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Etkinlik açıklaması"
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Kaydet
                    </Button>
                </div>
            </form>
        </Form>
    )
}
