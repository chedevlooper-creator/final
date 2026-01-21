"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useMerchantsList } from "@/hooks/queries/use-purchase";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Merchant = {
  id: string;
  name: string;
  tax_number: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  contact_person: string | null;
  status: string;
  created_at: string;
};

export default function MerchantsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useMerchantsList({
    page,
    search: search || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-slate-100 text-slate-700",
    };
    const statusLabels: Record<string, string> = {
      active: "Aktif",
      inactive: "Pasif",
    };
    return (
      <Badge className={statusColors[status] || "bg-slate-100"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const columns: ColumnDef<Merchant>[] = [
    {
      accessorKey: "name",
      header: "Firma Adı",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.tax_number && (
            <p className="text-xs text-slate-500">
              Vergi No: {row.original.tax_number}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "contact_person",
      header: "İletişim",
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.contact_person && (
            <p className="text-sm font-medium">{row.original.contact_person}</p>
          )}
          <div className="flex flex-col gap-1">
            {row.original.phone && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {row.original.phone}
              </span>
            )}
            {row.original.email && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Adres",
      cell: ({ row }) => (
        <div className="flex items-start gap-1 max-w-xs">
          {row.original.address && (
            <>
              <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 truncate">
                {row.original.address}
              </p>
            </>
          )}
        </div>
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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Düzenle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cari Hesaplar"
        description="Tedarikçi ve cari hesapları görüntüleyin ve yönetin"
        icon={Users}
        actions={
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Cari Hesap
          </Button>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari hesap ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
