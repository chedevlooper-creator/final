'use client'

import { Control } from 'react-hook-form'
import Link from 'next/link'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { CATEGORIES, FUND_REGIONS } from '@/types/needy.types'

interface FileInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  partners?: { id: string; name: string }[]
  categories?: { id: string; name: string }[]
  linkedOrphanId?: string
  linkedCardId?: string
}

export function FileInfoSection({
  control,
  partners = [],
  categories = [],
  linkedOrphanId,
  linkedCardId,
}: FileInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-1.5 px-3 pt-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Dosya Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="file_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosya No</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} placeholder="Otomatik atanır" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="partner_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partner</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Partner seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fund_region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fon</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Fon seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUND_REGIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bağlı Yetim ve Bağlı Kart */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Bağlı Yetim */}
          <div className="space-y-2">
            <Label>Bağlı Yetim</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={linkedOrphanId ? `Yetim #${linkedOrphanId.slice(0, 8)}` : '-'} 
                disabled 
                className="bg-muted"
              />
              {linkedOrphanId && (
                <Link href={`/orphans/${linkedOrphanId}`}>
                  <Button variant="outline" size="sm">Görüntüle</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Bağlı Kart */}
          <div className="space-y-2">
            <Label>Bağlı Kart</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={linkedCardId ? `Kart #${linkedCardId.slice(0, 8)}` : '-'} 
                disabled 
                className="bg-muted"
              />
              {linkedCardId && (
                <Link href={`/needy/${linkedCardId}`}>
                  <Button variant="outline" size="sm">Görüntüle</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
