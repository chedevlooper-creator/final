'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateSkillCategory, useUpdateSkillCategory } from '@/hooks/queries/use-skills'
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
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const skillCategorySchema = z.object({
  name: z.string().min(1, 'Kategori adı zorunlu'),
  description: z.string().optional(),
  color: z.string().min(1, 'Renk zorunlu'),
  icon: z.string().optional(),
  sort_order: z.number().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

type SkillCategoryFormValues = z.infer<typeof skillCategorySchema>

interface SkillCategoryFormProps {
  defaultValues?: Partial<SkillCategoryFormValues>
  onSuccess?: () => void
  editId?: string
}

const PRESET_COLORS = [
  { value: '#3B82F6', label: 'Mavi', class: 'bg-blue-500' },
  { value: '#10B981', label: 'Yeşil', class: 'bg-green-500' },
  { value: '#F59E0B', label: 'Sarı', class: 'bg-yellow-500' },
  { value: '#EF4444', label: 'Kırmızı', class: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Mor', class: 'bg-purple-500' },
  { value: '#EC4899', label: 'Pembe', class: 'bg-pink-500' },
  { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#F97316', label: 'Turuncu', class: 'bg-orange-500' },
]

const ICONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'globe', label: 'Küre' },
  { value: 'message-circle', label: 'Mesaj' },
  { value: 'heart', label: 'Kalp' },
  { value: 'truck', label: 'Kamyon' },
  { value: 'book-open', label: 'Kitap' },
  { value: 'users', label: 'Kullanıcılar' },
  { value: 'wrench', label: 'Anahtar' },
]

export function SkillCategoryForm({ defaultValues, onSuccess, editId }: SkillCategoryFormProps) {
  const createMutation = useCreateSkillCategory()
  const updateMutation = useUpdateSkillCategory()
  const isEdit = !!editId

  const form = useForm<SkillCategoryFormValues>({
    resolver: zodResolver(skillCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'laptop',
      sort_order: 0,
      status: 'active',
      ...defaultValues,
    },
  })

  const onSubmit = async (values: SkillCategoryFormValues) => {
    try {
      if (isEdit && editId) {
        await updateMutation.mutateAsync({ id: editId, values })
        toast.success('Kategori güncellendi')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Kategori oluşturuldu')
      }
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Adı *</FormLabel>
              <FormControl>
                <Input placeholder="Teknik Beceriler" {...field} />
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
                  placeholder="Bu kategori hakkında kısa bir açıklama..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renk *</FormLabel>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => field.onChange(color.value)}
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      field.value === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
              <FormControl>
                <Input type="color" {...field} className="w-full mt-2" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İkon</FormLabel>
              <FormControl>
                <Input placeholder="laptop" {...field} value={field.value || ''} />
              </FormControl>
              <p className="text-xs text-slate-500">Lucide ikon adlarından birini kullanın</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => field.onChange(icon.value)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      field.value === icon.value ? 'bg-slate-100 border-slate-400' : 'border-slate-200'
                    }`}
                  >
                    {icon.label}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sıralama</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  value={field.value || 0}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Güncelle' : 'Kategori Oluştur'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
