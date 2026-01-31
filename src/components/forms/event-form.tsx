'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { eventSchema, EventFormValues, EVENT_TYPES } from '@/lib/validations/event'
import { useCreateEvent } from '@/hooks/queries/use-events'

interface EventFormProps {
    defaultValues?: Partial<EventFormValues>
    onSuccess?: () => void
}

export function EventForm({ defaultValues, onSuccess }: EventFormProps) {
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: '',
            event_type: 'charity',
            start_date: '',
            ...defaultValues,
        },
    })

    const createMutation = useCreateEvent()

    const onSubmit = async (data: EventFormValues) => {
        try {
            await createMutation.mutateAsync(data)
            toast.success('Etkinlik oluşturuldu')
            onSuccess?.()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Etkinlik oluşturulurken hata oluştu'
            toast.error(message)
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
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
