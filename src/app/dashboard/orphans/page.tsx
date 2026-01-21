"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  UserPlus,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ORPHAN_TYPES = [
  { value: "ihh_orphan", label: "İHH Yetimi" },
  { value: "orphan", label: "Yetim" },
  { value: "family", label: "Aile" },
  { value: "education_scholarship", label: "Eğitim Bursu" },
];

const ORPHAN_STATUSES = [
  { value: "preparing", label: "Hazırlanıyor", color: "yellow" },
  { value: "assigned", label: "Atandı", color: "blue" },
  { value: "active", label: "Aktif", color: "green" },
  { value: "paused", label: "Duraklatıldı", color: "orange" },
  { value: "completed", label: "Tamamlandı", color: "gray" },
];

type Orphan = {
  id: string;
  file_number: string | null;
  type: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  date_of_birth: string | null;
  status: string;
  photo_url: string | null;
  guardian_name: string | null;
  created_at: string;
  country?: { name: string } | null;
  sponsor?: { first_name: string; last_name: string } | null;
  school?: { name: string } | null;
};

function useOrphansList(filters?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
}) {
  const supabase = createClient();
  const page = filters?.page || 0;
  const limit = 20;

  return useQuery({
    queryKey: ["orphans", filters],
    queryFn: async () => {
      let query = supabase
        .from("orphans")
        .select(
          `
          *,
          country:countries!country_id(name),
          sponsor:sponsors(first_name, last_name),
          school:schools(name)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false });

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`,
        );
      }

      const { data, error, count } = await query.range(
        page * limit,
        (page + 1) * limit - 1,
      );

      if (error) throw error;
      return { data: data || [], count: count || 0, page, limit };
    },
  });
}

export default function OrphansListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useOrphansList({
    page,
    type: type || undefined,
    status: status || undefined,
    search: search || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = ORPHAN_STATUSES.find((s) => s.value === status);
    const colorClasses: Record<string, string> = {
      yellow: "bg-yellow-100 text-yellow-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      orange: "bg-orange-100 text-orange-700",
      gray: "bg-slate-100 text-slate-700",
    };
    return (
      <Badge className={colorClasses[statusConfig?.color || "gray"]}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "-";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const columns: ColumnDef<Orphan>[] = [
    {
      accessorKey: "photo",
      header: "",
      cell: ({ row }) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.photo_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-700">
            {row.original.first_name?.[0]}
            {row.original.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "file_number",
      header: "Dosya No",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.file_number || "-"}
        </span>
      ),
    },
    {
      accessorKey: "first_name",
      header: "Ad Soyad",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-slate-500">
            {row.original.gender === "male" ? "Erkek" : "Kız"} •{" "}
            {calculateAge(row.original.date_of_birth)} yaş
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tür",
      cell: ({ row }) => {
        const typeConfig = ORPHAN_TYPES.find(
          (t) => t.value === row.original.type,
        );
        return (
          <span className="text-sm">
            {typeConfig?.label || row.original.type}
          </span>
        );
      },
    },
    {
      accessorKey: "country",
      header: "Ülke",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.country?.name || "-"}</span>
      ),
    },
    {
      accessorKey: "sponsor",
      header: "Sponsor",
      cell: ({ row }) =>
        row.original.sponsor ? (
          <span className="text-sm">
            {row.original.sponsor.first_name} {row.original.sponsor.last_name}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Atanmamış</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/orphans/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Görüntüle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/orphans/${row.original.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-blue-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Sponsor Ata
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yetimler & Öğrenciler"
        description="Yetim ve öğrenci kayıtlarını yönetin"
        icon={GraduationCap}
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Kayıt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Yetim/Öğrenci Kaydı</DialogTitle>
                <DialogDescription>
                  Yeni yetim veya öğrenci kaydı oluşturun
                </DialogDescription>
              </DialogHeader>
              {/* OrphanForm component buraya eklenecek */}
              <div className="py-8 text-center text-slate-500">
                Form bileşeni yükleniyor...
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Ad veya soyad ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={type || "all"}
          onValueChange={(v) => setType(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {ORPHAN_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {ORPHAN_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tablo */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pageCount={Math.ceil((data?.count || 0) / 20)}
        pageIndex={page}
        onPageChange={setPage}
      />
    </div>
  );
}
