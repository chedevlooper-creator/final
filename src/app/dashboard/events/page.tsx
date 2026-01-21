"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useEventsList } from "@/hooks/queries/use-calendar";
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
import {
  Calendar,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  MapPin,
  Clock,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  event_type: string;
  status: string;
  created_at: string;
};

export default function EventsPage() {
  const [page, setPage] = useState(0);
  const [eventType, setEventType] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const { data, isLoading } = useEventsList({
    page,
    event_type: eventType || undefined,
    status: status || undefined,
  });

  const getEventTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      meeting: "bg-blue-100 text-blue-700",
      task: "bg-green-100 text-green-700",
      event: "bg-purple-100 text-purple-700",
      reminder: "bg-orange-100 text-orange-700",
    };
    const typeLabels: Record<string, string> = {
      meeting: "Toplantı",
      task: "Görev",
      event: "Etkinlik",
      reminder: "Hatırlatıcı",
    };
    return (
      <Badge className={typeColors[type] || "bg-slate-100"}>
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const statusLabels: Record<string, string> = {
      upcoming: "Yaklaşan",
      ongoing: "Devam Ediyor",
      completed: "Tamamlandı",
      cancelled: "İptal",
    };
    return (
      <Badge className={statusColors[status] || "bg-slate-100"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "title",
      header: "Etkinlik",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "event_date",
      header: "Tarih & Saat",
      cell: ({ row }) => {
        try {
          const date = row.original.event_date
            ? new Date(row.original.event_date)
            : null;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3 text-slate-400" />
                {date && !isNaN(date.getTime())
                  ? format(date, "dd MMM yyyy", { locale: tr })
                  : "-"}
              </div>
              {row.original.event_time && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {row.original.event_time}
                </div>
              )}
            </div>
          );
        } catch (e) {
          return <span className="text-sm text-slate-500">-</span>;
        }
      },
    },
    {
      accessorKey: "location",
      header: "Konum",
      cell: ({ row }) =>
        row.original.location ? (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[200px]">
              {row.original.location}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        ),
    },
    {
      accessorKey: "event_type",
      header: "Tür",
      cell: ({ row }) => getEventTypeBadge(row.original.event_type),
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
        title="Etkinlikler"
        description="Etkinlikleri görüntüleyin ve yönetin"
        icon={Calendar}
        actions={
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Etkinlik
          </Button>
        }
      />

      {/* Filtreler */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select
          value={eventType || "all"}
          onValueChange={(v) => setEventType(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Etkinlik Türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="meeting">Toplantı</SelectItem>
            <SelectItem value="task">Görev</SelectItem>
            <SelectItem value="event">Etkinlik</SelectItem>
            <SelectItem value="reminder">Hatırlatıcı</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="upcoming">Yaklaşan</SelectItem>
            <SelectItem value="ongoing">Devam Ediyor</SelectItem>
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
