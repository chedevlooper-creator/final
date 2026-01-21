"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DetailHeader } from "@/components/needy/detail/DetailHeader";
import { PhotoSection } from "@/components/needy/detail/PhotoSection";
import { FileInfoSection } from "@/components/needy/detail/FileInfoSection";
import { BasicInfoForm } from "@/components/needy/detail/BasicInfoForm";
import { LinkedRecordsTabs } from "@/components/needy/detail/LinkedRecordsTabs";
import { SystemInfoPanel } from "@/components/needy/detail/SystemInfoPanel";
import {
  TagsSection,
  SpecialConditionsSection,
} from "@/components/needy/detail/MultiSelectSection";
import { NeedyPerson } from "@/types/needy.types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Form Schema - Genişletilmiş
const needyFormSchema = z.object({
  file_number: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  partner_id: z.string().optional().nullable(),
  field_id: z.string().optional().nullable(),
  sponsorship_type_id: z.string().optional().nullable(),
  fund_region: z.enum(["europe", "free"]).optional().nullable(),

  // Kişisel Bilgiler
  first_name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  last_name: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  nationality_id: z.string().optional().nullable(),
  country_id: z.string().optional().nullable(),
  city_id: z.string().optional().nullable(),
  district_id: z.string().optional().nullable(),
  neighborhood_id: z.string().optional().nullable(),

  // Kimlik Bilgileri
  identity_type: z.enum(["tc", "passport", "other"]).optional().nullable(),
  identity_number: z.string().optional().nullable(),
  passport_number: z.string().optional().nullable(),
  passport_type: z
    .enum(["none", "diplomatic", "temp", "service", "special", "regular"])
    .optional()
    .nullable(),
  passport_expiry: z.string().optional().nullable(),
  visa_type: z
    .enum([
      "work",
      "student",
      "temp_residence",
      "dual_citizen",
      "refugee",
      "asylum",
      "tourist",
    ])
    .optional()
    .nullable(),
  visa_expiry: z.string().optional().nullable(),
  return_status: z
    .enum([
      "impossible",
      "no_means",
      "not_planning",
      "will_return",
      "transit",
      "visa_expiry",
    ])
    .optional()
    .nullable(),
  father_name: z.string().optional().nullable(),
  mother_name: z.string().optional().nullable(),
  id_document_type: z
    .enum(["none", "id_card", "tc_card", "temp_residence", "foreign_id"])
    .optional()
    .nullable(),
  id_document_serial: z.string().optional().nullable(),
  id_validity_date: z.string().optional().nullable(),

  // Kişisel Detaylar
  gender: z.enum(["male", "female"]).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  birth_place: z.string().optional().nullable(),
  marital_status: z
    .enum(["single", "married", "divorced", "widowed"])
    .optional()
    .nullable(),
  education_status: z
    .enum(["never", "graduated", "dropout", "student"])
    .optional()
    .nullable(),
  education_level: z
    .enum([
      "primary",
      "middle",
      "high",
      "associate",
      "bachelor",
      "master",
      "literate",
    ])
    .optional()
    .nullable(),
  religion: z
    .enum(["muslim", "christian", "jewish", "buddhist", "other"])
    .optional()
    .nullable(),
  criminal_record: z.boolean().optional().nullable(),

  // İletişim
  phone: z.string().optional().nullable(),
  mobile_phone: z.string().optional().nullable(),
  mobile_operator: z.string().optional().nullable(),
  landline_phone: z.string().optional().nullable(),
  foreign_phone: z.string().optional().nullable(),
  email: z
    .string()
    .email("Geçersiz e-posta")
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z.string().optional().nullable(),

  // Aile
  family_size: z.number().optional().nullable(),
  linked_orphan_id: z.string().optional().nullable(),
  linked_card_id: z.string().optional().nullable(),

  // İş ve Gelir
  living_situation: z
    .enum([
      "own_house",
      "rental",
      "with_relatives",
      "shelter",
      "homeless",
      "other",
    ])
    .optional()
    .nullable(),
  income_source: z.string().optional().nullable(),
  monthly_income: z.number().optional().nullable(),
  monthly_expense: z.number().optional().nullable(),
  rent_amount: z.number().optional().nullable(),
  debt_amount: z.number().optional().nullable(),
  social_security: z
    .enum(["state", "private", "green_card", "none"])
    .optional()
    .nullable(),
  employment_status: z
    .enum(["employed", "unemployed", "retired", "disabled"])
    .optional()
    .nullable(),
  sector_id: z.string().optional().nullable(),
  profession_id: z.string().optional().nullable(),
  profession_description: z.string().optional().nullable(),
  additional_notes_tr: z.string().optional().nullable(),
  additional_notes_en: z.string().optional().nullable(),
  additional_notes_ar: z.string().optional().nullable(),

  // Sağlık
  health_status: z.string().optional().nullable(),
  disability_status: z.string().optional().nullable(),
  blood_type: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"])
    .optional()
    .nullable(),
  is_smoker: z
    .enum(["never", "quit", "occasional", "regular"])
    .optional()
    .nullable(),
  health_issue: z
    .enum([
      "none",
      "needs_treatment",
      "in_treatment",
      "untreatable",
      "abroad_treatment",
    ])
    .optional()
    .nullable(),
  disability_rate: z.number().min(0).max(100).optional().nullable(),
  prosthetics: z.string().optional().nullable(),
  regular_medications: z.string().optional().nullable(),
  surgeries: z.string().optional().nullable(),
  health_notes: z.string().optional().nullable(),

  // Acil Durum
  emergency_contact1_name: z.string().optional().nullable(),
  emergency_contact1_relation: z.string().optional().nullable(),
  emergency_contact1_phone: z.string().optional().nullable(),
  emergency_contact2_name: z.string().optional().nullable(),
  emergency_contact2_relation: z.string().optional().nullable(),
  emergency_contact2_phone: z.string().optional().nullable(),

  // Fotoğraf ve Rıza
  photo_url: z.string().optional().nullable(),
  consent_status: z
    .enum(["pending", "received", "rejected"])
    .optional()
    .nullable(),
  consent_date: z.string().optional().nullable(),

  // Meta
  notes: z.string().optional().nullable(),
  status: z
    .enum(["active", "inactive", "pending", "rejected"])
    .optional()
    .default("pending"),
  is_active: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional().nullable(),
});

type NeedyFormValues = z.input<typeof needyFormSchema>;

export default function NeedyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast: toastHook } = useToast();
  const id = params["id"] as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [needyData, setNeedyData] = useState<NeedyPerson | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Çoklu seçim state'leri
  const [selectedIncomeSources, setSelectedIncomeSources] = useState<string[]>(
    [],
  );
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSpecialConditions, setSelectedSpecialConditions] = useState<
    string[]
  >([]);

  // Lookup Data
  const [countries, setCountries] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [neighborhoods, setNeighborhoods] = useState<
    { id: string; name: string }[]
  >([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<NeedyFormValues>({
    resolver: zodResolver(needyFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      status: "pending",
      is_active: true,
    },
  });

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        // Check if it's a new record
        if (id === "new") {
          setIsLoading(false);
          return;
        }

        // Gerçek Supabase sorgusu
        const supabase = createClient();

        // Fetch needy person
        // Fetch needy person with explicit foreign key relations
        const { data: person, error } = await supabase
          .from("needy_persons")
          .select(
            `
            *,
            category:categories!category_id(id, name),
            nationality:countries!nationality_id(id, name),
            country:countries!country_id(id, name),
            city:cities!city_id(id, name),
            district:districts!district_id(id, name),
            neighborhood:neighborhoods!neighborhood_id(id, name),
            partner:partners!partner_id(id, name)
          `,
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Detailed error fetching needy person:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          toast.error(`Kayıt yüklenemedi: ${error.message}`);
          setFetchError(error.message);
          setIsLoading(false);
          return;
        }

        setNeedyData(person);
        form.reset(person as NeedyFormValues);

        // Set criminal_record to tags if exists
        if (person.criminal_record) {
          setSelectedTags((prev) => [...prev, "criminal_record"]);
        }

        // Fetch related multi-select data from junction tables
        const [diseasesRes, incomeSourcesRes] = await Promise.all([
          supabase
            .from("needy_diseases")
            .select("disease_id")
            .eq("needy_person_id", id),
          supabase
            .from("needy_income_sources")
            .select("income_source_id")
            .eq("needy_person_id", id),
        ]);

        if (diseasesRes.data) {
          setSelectedDiseases(
            diseasesRes.data.map((d: { disease_id: string }) => d.disease_id),
          );
        }
        if (incomeSourcesRes.data) {
          setSelectedIncomeSources(
            incomeSourcesRes.data.map(
              (i: { income_source_id: string }) => i.income_source_id,
            ),
          );
        }

        // Fetch lookup data
        const [countriesRes, citiesRes, categoriesRes, partnersRes] =
          await Promise.all([
            supabase.from("countries").select("id, name").eq("is_active", true),
            supabase.from("cities").select("id, name").eq("is_active", true),
            supabase
              .from("categories")
              .select("id, name")
              .eq("is_active", true)
              .eq("type", "needy"),
            supabase.from("partners").select("id, name").eq("is_active", true),
          ]);

        setCountries(countriesRes.data || []);
        setCities(citiesRes.data || []);
        setCategories(categoriesRes.data || []);
        setPartners(partnersRes.data || []);

        // Fetch districts if city is selected
        if (person.city_id) {
          const { data: districtsData } = await supabase
            .from("districts")
            .select("id, name")
            .eq("city_id", person.city_id)
            .eq("is_active", true);
          setDistricts(districtsData || []);
        }

        // Fetch neighborhoods if district is selected
        if (person.district_id) {
          const { data: neighborhoodsData } = await supabase
            .from("neighborhoods")
            .select("id, name")
            .eq("district_id", person.district_id)
            .eq("is_active", true);
          setNeighborhoods(neighborhoodsData || []);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Veri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, form, router]);

  // Handle save
  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const values = form.getValues();

      // Clean up empty strings
      const cleanValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ]),
      );

      if (id === "new") {
        // Create new record
        const { data, error } = await supabase
          .from("needy_persons")
          .insert(cleanValues)
          .select()
          .single();

        if (error) throw error;

        // Handle junction tables for new record
        await handleJunctionTables(data.id, supabase);

        toast.success("Yeni kayıt oluşturuldu.");
        router.push(`/dashboard/needy/${data.id}`);
      } else {
        // Update existing record
        const { error } = await supabase
          .from("needy_persons")
          .update(cleanValues)
          .eq("id", id);

        if (error) throw error;

        // Handle junction tables for existing record
        await handleJunctionTables(id, supabase);

        toast.success("Kayıt güncellendi.");
      }

      form.reset(form.getValues());
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleJunctionTables = async (personId: string, supabase: any) => {
    // Sync Diseases
    await supabase
      .from("needy_diseases")
      .delete()
      .eq("needy_person_id", personId);
    if (selectedDiseases.length > 0) {
      await supabase.from("needy_diseases").insert(
        selectedDiseases.map((diseaseId) => ({
          needy_person_id: personId,
          disease_id: diseaseId,
        })),
      );
    }

    // Sync Income Sources
    await supabase
      .from("needy_income_sources")
      .delete()
      .eq("needy_person_id", personId);
    if (selectedIncomeSources.length > 0) {
      await supabase.from("needy_income_sources").insert(
        selectedIncomeSources.map((sourceId) => ({
          needy_person_id: personId,
          income_source_id: sourceId,
        })),
      );
    }
  };

  const handleClose = () => {
    if (form.formState.isDirty) {
      if (
        window.confirm(
          "Kaydedilmemiş değişiklikler var. Çıkmak istediğinizden emin misiniz?",
        )
      ) {
        router.push("/dashboard/needy");
      }
    } else {
      router.push("/dashboard/needy");
    }
  };

  const handlePhotoChange = (url: string | null, path: string | null) => {
    form.setValue("photo_url", url, { shouldDirty: true });
  };

  const handlePhotoUpload = async (url: string, path: string) => {
    // Save photo URL to database immediately after upload
    const supabase = createClient();
    const { error } = await supabase
      .from("needy_persons")
      .update({ photo_url: url })
      .eq("id", id);

    if (error) {
      throw new Error("Fotoğraf kaydedilemedi");
    }

    // Update local state
    setNeedyData((prev) => (prev ? { ...prev, photo_url: url } : null));
  };

  const handleStatusChange = (
    newStatus: "pending" | "active" | "inactive" | "rejected",
  ) => {
    form.setValue("status", newStatus, { shouldDirty: true });
  };

  const handleDeleteRequest = async () => {
    if (
      window.confirm(
        "Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      )
    ) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("needy_persons")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast.success("Kayıt başarıyla silindi.");
        router.push("/dashboard/needy");
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error("Kayıt silinirken bir hata oluştu.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b px-6 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="flex gap-6">
            <Skeleton className="w-48 h-64" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Veri Yüklenemedi</h2>
        <p className="text-gray-600 max-w-md">{fetchError}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tekrar Dene
        </Button>
        <Button onClick={() => router.push("/dashboard/needy")} variant="ghost">
          Listeye Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <DetailHeader
        id={id}
        isLoading={isSaving}
        isDirty={form.formState.isDirty}
        onSave={handleSave}
        onClose={handleClose}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Layout: Sol Kolon (Ana Form), Sağ Kolon (Özet + Bağlantılı Kayıtlar) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Sol Kolon - Ana İçerik */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                  {/* Üst Bölüm: Fotoğraf + Dosya Bilgileri + Temel Bilgiler */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Fotoğraf & Dosya Bilgileri - Sol taraf */}
                    <div className="md:col-span-3 space-y-4">
                      <PhotoSection
                        photoUrl={needyData?.photo_url}
                        needyPersonId={id}
                        onPhotoChange={handlePhotoChange}
                        onPhotoUpload={
                          id !== "new" ? handlePhotoUpload : undefined
                        }
                      />

                      <FileInfoSection
                        control={form.control}
                        partners={partners}
                        categories={categories}
                        linkedOrphanId={needyData?.linked_orphan_id}
                        linkedCardId={needyData?.linked_card_id}
                      />
                    </div>

                    {/* Form Alanları - Sağ taraf */}
                    <div className="md:col-span-9">
                      <BasicInfoForm
                        control={form.control}
                        countries={countries}
                        cities={cities}
                        districts={districts}
                        neighborhoods={neighborhoods}
                        selectedDiseases={selectedDiseases}
                        onDiseasesChange={setSelectedDiseases}
                        selectedIncomeSources={selectedIncomeSources}
                        onIncomeSourcesChange={setSelectedIncomeSources}
                      />
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon - Özet Bilgiler */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                  {/* Durum */}
                  <SystemInfoPanel
                    createdAt={needyData?.created_at}
                    createdIp={needyData?.created_ip}
                    createdBy="Admin / Yardım Birimi"
                    totalAidAmount={needyData?.total_aid_amount || 0}
                    status={
                      form.watch("status") as
                        | "pending"
                        | "active"
                        | "inactive"
                        | "rejected"
                    }
                    onStatusChange={handleStatusChange}
                    showSystemInfo={false}
                  />

                  {/* Bağlantılı Kayıtlar */}
                  {id !== "new" && <LinkedRecordsTabs needyPersonId={id} />}

                  {/* Etiketler */}
                  <TagsSection
                    selectedItems={selectedTags}
                    onChange={(tags) => {
                      setSelectedTags(tags);
                      // Sabıka kaydı durumunu form'a senkronize et
                      form.setValue(
                        "criminal_record",
                        tags.includes("criminal_record"),
                      );
                    }}
                  />

                  {/* Özel Durumlar */}
                  <SpecialConditionsSection
                    selectedItems={selectedSpecialConditions}
                    onChange={setSelectedSpecialConditions}
                  />

                  {/* Sistem Bilgileri */}
                  <SystemInfoPanel
                    createdAt={needyData?.created_at}
                    createdIp={needyData?.created_ip}
                    createdBy="Admin / Yardım Birimi"
                    totalAidAmount={needyData?.total_aid_amount || 0}
                    status={
                      form.watch("status") as
                        | "pending"
                        | "active"
                        | "inactive"
                        | "rejected"
                    }
                    onStatusChange={handleStatusChange}
                    showStatus={false}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
