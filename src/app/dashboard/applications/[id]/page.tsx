"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileText,
  ArrowLeft,
  Save,
  User,
  Calendar,
  AlertCircle,
  Package,
  FileCheck,
  ShoppingCart,
  Gift,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  APPLICATION_TYPES,
  APPLICATION_STATUSES,
  PRIORITY_LEVELS,
} from "@/lib/validations/application";
import {
  useApplicationDetail,
  useUpdateApplication,
} from "@/hooks/queries/use-applications";

interface Application {
  id: string;
  application_number: string | null;
  needy_person_id: string;
  application_type: string;
  status: string;
  priority: string | null;
  assigned_user_id: string | null;
  description: string | null;
  requested_amount: number | null;
  approved_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  needy_person?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    identity_number: string | null;
    address: string | null;
  };
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params["id"] as string;

  const { data: application, isLoading, error } = useApplicationDetail(id);
  const updateMutation = useUpdateApplication();

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<string>("");

  // Sync local state with fetched data
  useEffect(() => {
    if (application) {
      setStatus(application.status || "");
      setPriority(application.priority || "");
      setNotes(application.notes || "");
      setApprovedAmount(application.approved_amount?.toString() || "");
    }
  }, [application]);

  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast.error("Başvuru yüklenirken hata oluştu");
    }
  }, [error]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        values: {
          status,
          priority: (priority || undefined) as
            | "low"
            | "medium"
            | "high"
            | "urgent"
            | undefined,
          notes: notes || null,
          approved_amount: approvedAmount ? parseFloat(approvedAmount) : null,
        } as any,
      });
      toast.success("Başvuru güncellendi");
    } catch (err) {
      toast.error("Kayıt sırasında hata oluştu");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
  };

  const getStatusBadge = (statusValue: string) => {
    const statusConfig = APPLICATION_STATUSES.find(
      (s) => s.value === statusValue,
    );
    const colorClasses: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700",
      yellow: "bg-yellow-100 text-yellow-700",
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
      orange: "bg-orange-100 text-orange-700",
      gray: "bg-slate-100 text-slate-700",
    };
    return (
      <Badge className={colorClasses[statusConfig?.color || "gray"]}>
        {statusConfig?.label || statusValue}
      </Badge>
    );
  };

  const getPriorityBadge = (priorityValue: string | null) => {
    if (!priorityValue) return null;
    const priorityConfig = PRIORITY_LEVELS.find(
      (p) => p.value === priorityValue,
    );
    const colorClasses: Record<string, string> = {
      gray: "bg-slate-100 text-slate-600",
      blue: "bg-blue-100 text-blue-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
    };
    return (
      <Badge
        variant="outline"
        className={colorClasses[priorityConfig?.color || "gray"]}
      >
        {priorityConfig?.label || priorityValue}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Başvuru bulunamadı</p>
        <Link href="/applications">
          <Button variant="link">Listeye Dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Başvuru #{application.application_number || id}
              </h1>
              {getStatusBadge(status)}
              {getPriorityBadge(priority)}
            </div>
            <p className="text-sm text-slate-500">
              {format(new Date(application.created_at), "dd MMMM yyyy HH:mm", {
                locale: tr,
              })}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Başvuru Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Başvuru Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-slate-500">Başvuru Türü</Label>
                  <p className="font-medium">
                    {APPLICATION_TYPES.find(
                      (t) => t.value === application.application_type,
                    )?.label || application.application_type}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">
                    Talep Edilen Tutar
                  </Label>
                  <p className="font-medium text-lg">
                    {application.requested_amount
                      ? `₺${application.requested_amount.toLocaleString("tr-TR")}`
                      : "-"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-500">Açıklama</Label>
                <p className="mt-1">
                  {application.description || "Açıklama girilmemiş"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="approvedAmount">Onaylanan Tutar</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500">₺</span>
                  <input
                    type="number"
                    id="approvedAmount"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notlarınızı buraya yazın..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Related Records */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="products" className="text-xs">
                    <Package className="h-4 w-4 mr-1" />
                    Ürünler
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">
                    <FileCheck className="h-4 w-4 mr-1" />
                    Dokümanlar
                  </TabsTrigger>
                  <TabsTrigger value="purchases" className="text-xs">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Satın Alma
                  </TabsTrigger>
                  <TabsTrigger value="aids" className="text-xs">
                    <Gift className="h-4 w-4 mr-1" />
                    Yardımlar
                  </TabsTrigger>
                  <TabsTrigger value="stages" className="text-xs">
                    <Clock className="h-4 w-4 mr-1" />
                    Aşamalar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="mt-4">
                  <div className="text-center py-8 text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz ürün/hizmet eklenmemiş</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Ürün Ekle
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="text-center py-8 text-slate-500">
                    <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz doküman yüklenmemiş</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Doküman Yükle
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="purchases" className="mt-4">
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Satın alma talebi bulunmuyor</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Talep Oluştur
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="aids" className="mt-4">
                  <div className="text-center py-8 text-slate-500">
                    <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Yardım kaydı bulunmuyor</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Yardım Ekle
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="stages" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800">
                          Başvuru Alındı
                        </p>
                        <p className="text-xs text-green-600">
                          {format(
                            new Date(application.created_at),
                            "dd.MM.yyyy HH:mm",
                            { locale: tr },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800">
                          İnceleniyor
                        </p>
                        <p className="text-xs text-yellow-600">Devam ediyor</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg opacity-50">
                      <AlertCircle className="h-5 w-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-500">
                          Onay Bekliyor
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* İhtiyaç Sahibi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                İhtiyaç Sahibi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Link
                  href={`/needy/${application.needy_person?.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {application.needy_person?.first_name}{" "}
                  {application.needy_person?.last_name}
                </Link>
              </div>
              {application.needy_person?.identity_number && (
                <div>
                  <Label className="text-xs text-slate-500">Kimlik No</Label>
                  <p className="font-mono">
                    {application.needy_person.identity_number}
                  </p>
                </div>
              )}
              {application.needy_person?.phone && (
                <div>
                  <Label className="text-xs text-slate-500">Telefon</Label>
                  <p>{application.needy_person.phone}</p>
                </div>
              )}
              {application.needy_person?.address && (
                <div>
                  <Label className="text-xs text-slate-500">Adres</Label>
                  <p className="text-sm">{application.needy_person.address}</p>
                </div>
              )}
              <Link href={`/needy/${application.needy_person?.id}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Kişi Detayını Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Hızlı İşlemler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleStatusChange("approved")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Onayla
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleStatusChange("rejected")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reddet
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Truck className="mr-2 h-4 w-4" />
                Teslimat Oluştur
              </Button>
            </CardContent>
          </Card>

          {/* Tarih Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Tarih Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Oluşturulma:</span>
                <span>
                  {format(
                    new Date(application.created_at),
                    "dd.MM.yyyy HH:mm",
                    { locale: tr },
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Güncelleme:</span>
                <span>
                  {format(
                    new Date(application.updated_at),
                    "dd.MM.yyyy HH:mm",
                    { locale: tr },
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
