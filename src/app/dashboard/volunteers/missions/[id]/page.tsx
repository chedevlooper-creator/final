"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ClipboardList,
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Mock data
const mockMission = {
  id: "1",
  mission_number: "GRV-2026-0001",
  title: "Ramazan Gıda Dağıtımı",
  description: "Başakşehir bölgesinde muhtaç ailelere gıda paketi dağıtımı",
  mission_type: "distribution",
  location: "Başakşehir Meydanı",
  address: "Başakşehir Meydanı, İstanbul",
  date: "2026-03-15",
  start_time: "09:00",
  end_time: "17:00",
  required_volunteers: 20,
  status: "scheduled",
  coordinator: "Ahmet Kaya",
  created_at: "2026-01-10T10:00:00Z",
  volunteers: [
    { id: "1", name: "Ali Yılmaz", phone: "0532 111 22 33", confirmed: true },
    { id: "2", name: "Fatma Demir", phone: "0533 222 33 44", confirmed: true },
    { id: "3", name: "Mehmet Öz", phone: "0534 333 44 55", confirmed: false },
  ],
};

const MISSION_TYPES = [
  { value: "distribution", label: "Dağıtım" },
  { value: "collection", label: "Toplama" },
  { value: "event", label: "Etkinlik" },
  { value: "visit", label: "Ziyaret" },
  { value: "other", label: "Diğer" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Taslak", color: "bg-slate-100 text-slate-700" },
  {
    value: "scheduled",
    label: "Planlandı",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "ongoing",
    label: "Devam Ediyor",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "completed",
    label: "Tamamlandı",
    color: "bg-green-100 text-green-700",
  },
  { value: "cancelled", label: "İptal", color: "bg-red-100 text-red-700" },
];

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params["id"] as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mission, setMission] = useState(mockMission);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Görev güncellendi");
    setIsSaving(false);
  };

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === mission.status);
  const confirmedCount = mission.volunteers.filter((v) => v.confirmed).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/volunteers/missions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{mission.title}</h1>
              <Badge className={statusConfig?.color}>
                {statusConfig?.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">#{mission.mission_number}</p>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tarih</p>
                <p className="font-medium">
                  {format(new Date(mission.date), "dd MMMM yyyy", {
                    locale: tr,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Saat</p>
                <p className="font-medium">
                  {mission.start_time} - {mission.end_time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Gönüllü</p>
                <p className="font-medium">
                  {confirmedCount} / {mission.required_volunteers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Konum</p>
                <p className="font-medium truncate">{mission.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Görev Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Görev Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Başlık</Label>
                <Input value={mission.title} />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea value={mission.description} rows={3} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tür</Label>
                  <Select value={mission.mission_type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MISSION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Durum</Label>
                  <Select value={mission.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Tarih</Label>
                  <Input type="date" value={mission.date} />
                </div>
                <div>
                  <Label>Başlangıç</Label>
                  <Input type="time" value={mission.start_time} />
                </div>
                <div>
                  <Label>Bitiş</Label>
                  <Input type="time" value={mission.end_time} />
                </div>
              </div>
              <div>
                <Label>Adres</Label>
                <Textarea value={mission.address} rows={2} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Gerekli Gönüllü Sayısı</Label>
                  <Input type="number" value={mission.required_volunteers} />
                </div>
                <div>
                  <Label>Koordinatör</Label>
                  <Input value={mission.coordinator} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Volunteers List */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Atanan Gönüllüler</CardTitle>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mission.volunteers.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-slate-500">{v.phone}</p>
                    </div>
                    <Badge
                      className={
                        v.confirmed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {v.confirmed ? "Onayladı" : "Bekliyor"}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Doluluk</span>
                  <span className="font-medium">
                    {confirmedCount}/{mission.required_volunteers}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(confirmedCount / mission.required_volunteers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
