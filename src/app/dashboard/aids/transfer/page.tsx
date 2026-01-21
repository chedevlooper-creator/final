"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Mock data
const mockTransfers = [
  {
    id: "1",
    transfer_number: "HVL-2026-0001",
    recipient_name: "Ahmet Yılmaz",
    iban: "TR12 3456 7890 1234 5678 9012 34",
    amount: 2500,
    currency: "TRY",
    description: "Aylık nakdi yardım",
    status: "pending",
    created_at: "2026-01-15T10:30:00Z",
  },
  {
    id: "2",
    transfer_number: "HVL-2026-0002",
    recipient_name: "Fatma Kaya",
    iban: "TR98 7654 3210 9876 5432 1098 76",
    amount: 3000,
    currency: "TRY",
    description: "Kira yardımı",
    status: "completed",
    created_at: "2026-01-14T14:00:00Z",
  },
  {
    id: "3",
    transfer_number: "HVL-2026-0003",
    recipient_name: "Ali Demir",
    iban: "TR55 1234 5678 9012 3456 7890 12",
    amount: 1500,
    currency: "TRY",
    description: "Tedavi masrafı",
    status: "failed",
    created_at: "2026-01-14T11:00:00Z",
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: {
    label: "Beklemede",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  completed: {
    label: "Tamamlandı",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  failed: {
    label: "Başarısız",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function BankTransferPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransfers = mockTransfers.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (
      search &&
      !t.recipient_name.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const pendingCount = mockTransfers.filter(
    (t) => t.status === "pending",
  ).length;
  const pendingAmount = mockTransfers
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banka Ödeme Emirleri"
        description="Banka havalesi ile yapılacak yardım ödemeleri"
        icon={CreditCard}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Toplu Liste
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ödeme Emri
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Bekleyen Emirler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Bekleyen Tutar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₺{pendingAmount.toLocaleString("tr-TR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Bugün Tamamlanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {mockTransfers.filter((t) => t.status === "completed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Alıcı adı ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Beklemede</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="failed">Başarısız</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Emir No</TableHead>
                <TableHead>Alıcı</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-500"
                  >
                    Ödeme emri bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((transfer) => {
                  const statusConfig = STATUS_CONFIG[transfer.status] || {
                    label: transfer.status,
                    color: "bg-gray-100 text-gray-700",
                    icon: Clock,
                  };
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transfer.transfer_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {transfer.recipient_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {transfer.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transfer.iban}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₺{transfer.amount.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {format(
                          new Date(transfer.created_at),
                          "dd.MM.yyyy HH:mm",
                          { locale: tr },
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
