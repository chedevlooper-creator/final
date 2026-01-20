'use client'

import { useForm, useFieldArray } from 'react-hook-form'
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
import { Plus, Trash2 } from 'lucide-react'

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Normal' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' },
]

const purchaseFormSchema = z.object({
    title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
    priority: z.string().default('medium'),
    description: z.string().optional(),
    items: z.array(z.object({
        name: z.string().min(1, 'Ürün adı gerekli'),
        quantity: z.number().min(1, 'Miktar en az 1 olmalı'),
        unit: z.string().default('Adet'),
        unit_price: z.number().min(0, 'Fiyat geçerli olmalı'),
    })).min(1, 'En az 1 ürün ekleyiniz'),
})

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>

interface PurchaseFormProps {
    defaultValues?: Partial<PurchaseFormValues>
    onSuccess?: () => void
}

export function PurchaseForm({ defaultValues, onSuccess }: PurchaseFormProps) {
    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
        defaultValues: {
            title: '',
            priority: 'medium',
            items: [{ name: '', quantity: 1, unit: 'Adet', unit_price: 0 }],
            ...defaultValues,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    const onSubmit = async (data: PurchaseFormValues) => {
        try {
            console.log('Form data:', data)
            toast.success('Satın alma talebi oluşturuldu')
            onSuccess?.()
        } catch (error) {
            toast.error('Talep oluşturulurken hata oluştu')
        }
    }

    const items = form.watch('items')
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

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
                                <Input {...field} placeholder="Talep başlığı" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Öncelik</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PRIORITY_OPTIONS.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value || ''} placeholder="Talep açıklaması" rows={2} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Items */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <FormLabel>Ürünler *</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ name: '', quantity: 1, unit: 'Adet', unit_price: 0 })}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Ürün Ekle
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="grid gap-2 md:grid-cols-5 items-end p-3 border rounded-lg">
                            <FormField
                                control={form.control}
                                name={`items.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="text-xs">Ürün Adı</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ürün adı" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Miktar</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.unit_price`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Birim Fiyat</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fields.length > 1 && remove(index)}
                                disabled={fields.length === 1}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}

                    <div className="flex justify-end pt-2 border-t">
                        <p className="font-medium">
                            Toplam: <span className="text-lg">₺{totalAmount.toLocaleString('tr-TR')}</span>
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit">Talebi Oluştur</Button>
                </div>
            </form>
        </Form>
    )
}
