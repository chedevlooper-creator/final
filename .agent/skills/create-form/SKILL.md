---
name: create-form
description: shadcn/ui ve Zod validation ile standart form bileşeni oluşturur.
---

# 📝 Create Form Skill

Bu skill, YYP projesinde shadcn/ui komponetleri ve Zod validation kullanarak standartlaştırılmış form bileşeni oluşturur.

## Kullanım

Kullanıcıdan aşağıdaki bilgileri al:
1. **Form Adı** (örn: "CourseForm", "NeedyPersonForm")
2. **Form Alanları** (örn: "name:string, description:textarea, start_date:date, status:select")
3. **Validation Kuralları** (örn: "name: min 3 chars, email: valid email")

## Oluşturulan Form Yapısı

### Dosya: `src/components/forms/[form-name].tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// 1. Zod Schema
const formSchema = z.object({
  name: z.string().min(3, 'Ad en az 3 karakter olmalı'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
})

type FormValues = z.infer<typeof formSchema>

// 2. Props Interface
interface [FormName]Props {
  initialData?: Partial<FormValues>
  onSubmit: (values: FormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

// 3. Form Component
export function [FormName]({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: [FormName]Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      start_date: initialData?.start_date || '',
      status: initialData?.status || 'pending',
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values)
      toast.success('Kayıt başarıyla kaydedildi')
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Text Input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad</FormLabel>
              <FormControl>
                <Input placeholder="Kurs adı giriniz" {...field} />
              </FormControl>
              <FormDescription>
                Kursun tam adı
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kurs hakkında detaylı bilgi"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Input */}
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Başlangıç Tarihi</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select Dropdown */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durum</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

## Form Field Types

### 1. Text Input
```typescript
<FormField
  control={form.control}
  name="field_name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input placeholder="..." {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 2. Number Input
```typescript
<Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
```

### 3. Textarea
```typescript
<Textarea rows={4} {...field} />
```

### 4. Select Dropdown
```typescript
<Select onValueChange={field.onChange} defaultValue={field.value}>
  <SelectContent>
    <SelectItem value="option1">Seçenek 1</SelectItem>
  </SelectContent>
</Select>
```

### 5. Combobox (Searchable Select)
```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'

<Popover>
  <PopoverTrigger asChild>
    <FormControl>
      <Button variant="outline" role="combobox">
        {field.value || "Seçiniz..."}
      </Button>
    </FormControl>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput placeholder="Ara..." />
      <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
      <CommandGroup>
        {options.map((option) => (
          <CommandItem key={option.value} onSelect={() => field.onChange(option.value)}>
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  </PopoverContent>
</Popover>
```

### 6. Checkbox
```typescript
import { Checkbox } from '@/components/ui/checkbox'

<FormField
  control={form.control}
  name="is_active"
  render={({ field }) => (
    <FormItem className="flex items-center space-x-2">
      <FormControl>
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <FormLabel>Aktif mi?</FormLabel>
    </FormItem>
  )}
/>
```

### 7. Radio Group
```typescript
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

<RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
  <FormItem className="flex items-center space-x-2">
    <FormControl>
      <RadioGroupItem value="option1" />
    </FormControl>
    <FormLabel>Seçenek 1</FormLabel>
  </FormItem>
</RadioGroup>
```

### 8. Date Picker (react-day-picker)
```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

<Popover>
  <PopoverTrigger asChild>
    <FormControl>
      <Button variant="outline">
        {field.value ? format(new Date(field.value), 'PPP', { locale: tr }) : 'Tarih seçiniz'}
      </Button>
    </FormControl>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={field.value ? new Date(field.value) : undefined}
      onSelect={(date) => field.onChange(date?.toISOString())}
      locale={tr}
    />
  </PopoverContent>
</Popover>
```

### 9. Multi-Select
```typescript
import { MultiSelect } from '@/components/ui/multi-select'

<MultiSelect
  options={options}
  selected={field.value || []}
  onChange={field.onChange}
  placeholder="Seçiniz..."
/>
```

### 10. File Upload
```typescript
<Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle file upload
      field.onChange(file)
    }
  }}
/>
```

## Validation Patterns

### Common Validations
```typescript
const schema = z.object({
  // Required string
  name: z.string().min(1, 'Zorunlu alan'),

  // Min/Max length
  password: z.string().min(8, 'En az 8 karakter').max(100),

  // Email
  email: z.string().email('Geçersiz e-posta'),

  // Phone (TR format)
  phone: z.string().regex(/^5\d{9}$/, 'Geçersiz telefon'),

  // Number range
  age: z.number().min(0).max(150),

  // Optional field
  description: z.string().optional(),

  // Nullable field
  notes: z.string().nullable(),

  // Optional or empty string
  website: z.string().url().optional().or(z.literal('')),

  // Enum
  status: z.enum(['active', 'inactive', 'pending']),

  // Array
  tags: z.array(z.string()),

  // Object
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),

  // Conditional validation
  other_reason: z.string().optional(),
}).refine(
  (data) => data.reason !== 'other' || data.other_reason,
  { message: 'Diğer nedeni belirtiniz', path: ['other_reason'] }
)
```

## Advanced Features

### 1. Dependent Fields
```typescript
const watchReason = form.watch('reason')

{watchReason === 'other' && (
  <FormField name="other_reason" ... />
)}
```

### 2. Dynamic Arrays
```typescript
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'items',
})

{fields.map((field, index) => (
  <div key={field.id}>
    <FormField name={`items.${index}.name`} ... />
    <Button onClick={() => remove(index)}>Sil</Button>
  </div>
))}

<Button onClick={() => append({ name: '' })}>Ekle</Button>
```

### 3. Form State Management
```typescript
const isDirty = form.formState.isDirty
const errors = form.formState.errors
const isSubmitting = form.formState.isSubmitting

// Reset form
form.reset()

// Set specific value
form.setValue('name', 'New Value', { shouldDirty: true })

// Trigger validation
form.trigger('name')
```

## Usage Example

```typescript
import { CourseForm } from '@/components/forms/course-form'
import { useCreateCourse } from '@/hooks/queries/use-courses'

export function CreateCoursePage() {
  const createMutation = useCreateCourse()

  return (
    <CourseForm
      onSubmit={async (values) => {
        await createMutation.mutateAsync(values)
      }}
      isLoading={createMutation.isPending}
    />
  )
}
```

---
*Bu skill shadcn/ui standartlarını ve YYP form pattern'lerini takip eder.*
