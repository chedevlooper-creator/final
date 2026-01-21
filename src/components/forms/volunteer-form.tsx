"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Hafta İçi" },
  { value: "weekends", label: "Hafta Sonu" },
  { value: "evenings", label: "Akşamları" },
  { value: "flexible", label: "Esnek" },
];

const volunteerFormSchema = z.object({
  first_name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  last_name: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  phone: z.string().min(10, "Geçerli telefon numarası giriniz"),
  email: z
    .string()
    .email("Geçerli e-posta giriniz")
    .optional()
    .or(z.literal("")),
  profession: z.string().optional(),
  availability: z.string().optional(),
  skills: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

interface VolunteerFormProps {
  defaultValues?: Partial<VolunteerFormValues>;
  onSuccess?: () => void;
}

export function VolunteerForm({
  defaultValues,
  onSuccess,
}: VolunteerFormProps) {
  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      availability: "flexible",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: VolunteerFormValues) => {
    try {
      console.log("Form data:", data);
      toast.success("Gönüllü kaydı oluşturuldu");
      onSuccess?.();
    } catch (error) {
      toast.error("Kayıt oluşturulurken hata oluştu");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0532 123 45 67" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    placeholder="ornek@email.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meslek</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Meslek"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müsaitlik</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "flexible"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yetenekler</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Araç kullanma, İngilizce, Bilgisayar..."
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Adres"
                  rows={2}
                />
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
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Ek notlar..."
                  rows={3}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </Form>
  );
}
