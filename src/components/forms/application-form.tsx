'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationSchema, ApplicationFormValues, APPLICATION_TYPES, PRIORITY_LEVELS } from '@/lib/validations/application'
import { useCreateApplication } from '@/hooks/queries/use-applications'
import { useNeedyList } from '@/hooks/queries/use-needy'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ApplicationFormProps {
  onSuccess?: () => void
}

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const createMutation = useCreateApplication()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const { data: needyData } = useNeedyList({ search: searchValue, limit: 50 }) as { data: { data: Array<{ id: string; first_name: string; last_name: string; identity_number: string | null; phone: string | null }>; count: number } | undefined }

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      priority: 'medium',
    },
  })

  const onSubmit = async (values: ApplicationFormValues) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success('Başvuru oluşturuldu')
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu'
      toast.error(errorMessage)
    }
  }

  const isLoading = createMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* İhtiyaç Sahibi Seçimi */}
        <FormField
          control={form.control}
          name="needy_person_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>İhtiyaç Sahibi *</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                      data-testid="application-needy-select"
                    >
                      {field.value
                        ? needyData?.data?.find((person) => person.id === field.value)
                            ? `${needyData.data.find((person) => person.id === field.value)?.first_name} ${needyData.data.find((person) => person.id === field.value)?.last_name}`
                            : 'Seçiniz...'
                        : 'İhtiyaç sahibi seçin...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Ad veya TC ile ara..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                      data-testid="application-needy-search"
                    />
                    <CommandList>
                      <CommandEmpty>Kayıt bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {needyData?.data?.map((person) => (
                          <CommandItem
                            key={person.id}
                            value={person.id}
                            onSelect={() => {
                              form.setValue('needy_person_id', person.id)
                              setOpen(false)
                            }}
                            data-testid="application-needy-option"
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === person.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div>
                              <p className="font-medium">{person.first_name} {person.last_name}</p>
                              <p className="text-xs text-muted-foreground">{person.identity_number || person.phone || '-'}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {/* Başvuru Türü */}
          <FormField
            control={form.control}
            name="application_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başvuru Türü *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="application-type-select">
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {APPLICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Öncelik */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Öncelik</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="application-priority-select">
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Talep Tutarı */}
        <FormField
          control={form.control}
          name="requested_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Talep Tutarı (₺)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    data-testid="application-requested-amount"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Açıklama */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Başvuru hakkında detaylı bilgi..."
                  {...field}
                  value={field.value || ''}
                    data-testid="application-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notlar */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ek notlar..."
                  {...field}
                  value={field.value || ''}
                    data-testid="application-notes"
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
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
            data-testid="application-save-button"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Başvuru Oluştur
          </Button>
        </div>
      </form>
    </Form>
  )
}
