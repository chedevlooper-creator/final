"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useDonationsList } from "@/hooks/queries/use-donations";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Gift, MoreHorizontal, Eye, Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAYMENT_METHODS, CURRENCIES } from "@/lib/validations/donation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Donation = {
  id: string;
  donation_number: string | null;
  donor_name: string | null;
  donor_phone: string | null;
  donation_type: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
};

export default function SacrificeDonationsPage() {
  const [page, setPage] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  const { data, isLoading } = useDonationsList({
    page,
    donation_type: "sacrifice",
    payment_status: paymentStatus || undefined,
  });

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const statusLabels: Record<string, string> = {
      pending: "Bekliyor",
      completed: "Tamamlandı",
      cancelled: "İptal",
    };
    return (
      <Badge className={statusColors[status] || "bg-slate-100"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatAmount = (
    amount: number | null | undefined,
    currency: string,
  ) => {
    if (amount === null || amount === undefined) return "-";
    const currencyConfig = CURRENCIES.find((c) => c.value === currency);
    try {
      return `${currencyConfig?.symbol || ""}${amount.toLocaleString("tr-TR")}`;
    } catch (e) {
      return `${currencyConfig?.symbol || ""}${amount}`;
    }
  };

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: "donation_number",
      header: "Bağış No",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600">
          {row.original.donation_number || "-"}
        </span>
      ),
    },
    {
      accessorKey: "donor_name",
      header: "Bağışçı",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.donor_name || "Anonim"}</p>
          {row.original.donor_phone && (
            <p className="text-xs text-slate-500">{row.original.donor_phone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Tutar",
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600">
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Ödeme Yöntemi",
      cell: ({ row }) => {
        const methodConfig = PAYMENT_METHODS?.find(
          (m) => m.value === row.original.payment_method,
        );
        return <span className="text-sm">{methodConfig?.label || "-"}</span>;
      },
    },
    {
      accessorKey: "payment_status",
      header: "Durum",
      cell: ({ row }) => getPaymentStatusBadge(row.original.payment_status),
    },
    {
      accessorKey: "created_at",
      header: "Tarih",
      cell: ({ row }) => {
        try {
          const date = row.original.created_at
            ? new Date(row.original.created_at)
            : null;
          const isValidDate = date && !isNaN(date.getTime());
          return (
            <span className="text-sm text-slate-500">
              {isValidDate ? format(date!, "dd MMM yyyy", { locale: tr }) : "-"}
            </span>
          );
        } catch (e) {
          return <span className="text-sm text-slate-500">-</span>;
        }
      },
    },
    {
      id: "actions",
      cell: () => (
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
        title="Kurban Bağışları"
        description="Kurban bağışlarını görüntüleyin ve yönetin"
        icon={Gift}
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select
          value={paymentStatus || "all"}
          onValueChange={(v) => setPaymentStatus(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
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
