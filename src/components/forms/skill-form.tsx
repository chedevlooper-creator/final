'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateSkill, useUpdateSkill } from '@/hooks/queries/use-skills'
import { useSkillCategories } from '@/hooks/queries/use-skills'
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

const skillSchema = z.object({
  name: z.string().min(1, 'Yetenek adı zorunlu'),
  category_id: z.string().min(1, 'Kategori zorunlu'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

type SkillFormValues = z.infer<typeof skillSchema>

interface SkillFormProps {
  defaultValues?: Partial<SkillFormValues>
  onSuccess?: () => void
  editId?: string
}

export function SkillForm({ defaultValues, onSuccess, editId }: SkillFormProps) {
  const createMutation = useCreateSkill()
  const updateMutation = useUpdateSkill()
  const { data: categories, isLoading: categoriesLoading } = useSkillCategories()
  const isEdit = !!editId

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
      status: 'active',
      ...defaultValues,
    },
  })

  const onSubmit = async (values: SkillFormValues) => {
    try {
      if (isEdit && editId) {
        await updateMutation.mutateAsync({ id: editId, values })
        toast.success('Yetenek güncellendi')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Yetenek oluşturuldu')
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
              <FormLabel>Yetenek Adı *</FormLabel>
              <FormControl>
                <Input placeholder="Bilgisayar Kullanımı" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={categoriesLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
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
                <Textarea
                  placeholder="Bu yetenek hakkında kısa bir açıklama..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durum</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
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
            {isEdit ? 'Güncelle' : 'Yetenek Oluştur'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
