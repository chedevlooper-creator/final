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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  User,
  ArrowLeft,
  Save,
  Shield,
  Mail,
  Phone,
  Key,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Mock data
const mockUser = {
  id: "1",
  username: "ahmet.yilmaz",
  first_name: "Ahmet",
  last_name: "Yılmaz",
  email: "ahmet@yardimdernegi.org",
  phone: "0532 123 45 67",
  role: "admin",
  department: "Yardım Birimi",
  status: "active",
  permissions: ["needy", "applications", "aids", "donations", "reports"],
  last_login: "2026-01-15T14:30:00Z",
  created_at: "2025-01-10T10:00:00Z",
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Yönetici", color: "bg-purple-100 text-purple-700" },
  { value: "manager", label: "Müdür", color: "bg-blue-100 text-blue-700" },
  { value: "user", label: "Kullanıcı", color: "bg-slate-100 text-slate-700" },
  {
    value: "viewer",
    label: "Görüntüleyici",
    color: "bg-green-100 text-green-700",
  },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Pasif", color: "bg-slate-100 text-slate-700" },
  { value: "blocked", label: "Bloke", color: "bg-red-100 text-red-700" },
];

const PERMISSION_MODULES = [
  { key: "needy", label: "İhtiyaç Sahipleri" },
  { key: "applications", label: "Başvurular" },
  { key: "aids", label: "Yardımlar" },
  { key: "donations", label: "Bağışlar" },
  { key: "orphans", label: "Yetimler" },
  { key: "finance", label: "Finans" },
  { key: "volunteers", label: "Gönüllüler" },
  { key: "purchase", label: "Satın Alma" },
  { key: "reports", label: "Raporlar" },
  { key: "settings", label: "Ayarlar" },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params["id"] as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(mockUser);
  const [permissions, setPermissions] = useState<string[]>(
    mockUser.permissions,
  );

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Kullanıcı güncellendi");
    setIsSaving(false);
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const roleConfig = ROLE_OPTIONS.find((r) => r.value === user.role);
  const statusConfig = STATUS_OPTIONS.find((s) => s.value === user.status);

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
          <Link href="/settings/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <Badge className={roleConfig?.color}>{roleConfig?.label}</Badge>
              <Badge className={statusConfig?.color}>
                {statusConfig?.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">@{user.username}</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kişisel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Ad</Label>
                  <Input value={user.first_name} />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <Input value={user.last_name} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Kullanıcı Adı</Label>
                  <Input value={user.username} />
                </div>
                <div>
                  <Label>Departman</Label>
                  <Input value={user.department} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>E-posta</Label>
                  <Input value={user.email} type="email" />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={user.phone} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yetkiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Modül Yetkileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {PERMISSION_MODULES.map((module) => (
                  <div
                    key={module.key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <Label htmlFor={module.key} className="cursor-pointer">
                      {module.label}
                    </Label>
                    <Switch
                      id={module.key}
                      checked={permissions.includes(module.key)}
                      onCheckedChange={() => togglePermission(module.key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hesap Durumu */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hesap Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rol</Label>
                <Select value={user.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durum</Label>
                <Select value={user.status}>
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
            </CardContent>
          </Card>

          {/* Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sistem Bilgisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Son Giriş</span>
                <span>
                  {format(new Date(user.last_login), "dd.MM.yyyy HH:mm", {
                    locale: tr,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Oluşturulma</span>
                <span>
                  {format(new Date(user.created_at), "dd.MM.yyyy", {
                    locale: tr,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Şifre Sıfırlama */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Şifre Sıfırla
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
