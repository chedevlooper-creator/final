"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Mock data
const mockDonation = {
  id: "1",
  donation_number: "BG-2026-0001",
  donor_name: "Mehmet Yılmaz",
  donor_phone: "0532 123 45 67",
  donor_email: "mehmet@example.com",
  donation_type: "cash",
  amount: 5000,
  currency: "TRY",
  payment_method: "bank_transfer",
  payment_status: "completed",
  purpose: "genel",
  description: "Genel bağış",
  receipt_number: "MKB-2026-0001",
  created_at: "2026-01-15T10:30:00Z",
};

const DONATION_TYPES = [
  { value: "cash", label: "Nakit Bağış" },
  { value: "in_kind", label: "Ayni Bağış" },
  { value: "sacrifice", label: "Kurban" },
  { value: "zakat", label: "Zekat" },
  { value: "fitre", label: "Fitre" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Nakit" },
  { value: "bank_transfer", label: "Banka Havalesi" },
  { value: "credit_card", label: "Kredi Kartı" },
  { value: "online", label: "Online" },
];

const PAYMENT_STATUSES = [
  {
    value: "pending",
    label: "Beklemede",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "completed",
    label: "Tamamlandı",
    color: "bg-green-100 text-green-700",
  },
  { value: "cancelled", label: "İptal", color: "bg-red-100 text-red-700" },
];

export default function DonationDetailPage() {
  const params = useParams();
  const id = params["id"] as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [donation] = useState(mockDonation);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Bağış güncellendi");
    setIsSaving(false);
  };

  const statusConfig = PAYMENT_STATUSES.find(
    (s) => s.value === donation.payment_status,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/donations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Bağış #{donation.donation_number}
              </h1>
              <Badge className={statusConfig?.color}>
                {statusConfig?.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {format(new Date(donation.created_at), "dd MMMM yyyy HH:mm", {
                locale: tr,
              })}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bağış Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Bağış Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Bağış Türü</Label>
                <Select value={donation.donation_type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DONATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tutar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={donation.amount}
                    className="flex-1"
                  />
                  <span className="text-slate-500">₺</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Ödeme Yöntemi</Label>
                <Select value={donation.payment_method}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ödeme Durumu</Label>
                <Select value={donation.payment_status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Makbuz No</Label>
              <Input
                value={donation.receipt_number || ""}
                placeholder="Makbuz numarası"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea value={donation.description || ""} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Bağışçı Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Bağışçı Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ad Soyad</Label>
              <Input value={donation.donor_name} />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input value={donation.donor_phone || ""} />
            </div>
            <div>
              <Label>E-posta</Label>
              <Input value={donation.donor_email || ""} type="email" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
