"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Phone, CheckCircle2 } from "lucide-react";
import { TabLayout } from "./TabLayout";
import {
  Reference,
  REFERENCE_TYPE_OPTIONS,
  ReferenceType,
} from "@/types/linked-records.types";

interface ReferencesTabProps {
  needyPersonId: string;
  onClose: () => void;
}

export function ReferencesTab({ needyPersonId, onClose }: ReferencesTabProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);
  const [formData, setFormData] = useState({
    reference_name: "",
    reference_type: "" as ReferenceType | "",
    relation: "",
    phone: "",
    email: "",
  });

  const columns = [
    { key: "name", label: "Referans Kişi" },
    { key: "type", label: "Tür", width: "100px" },
    { key: "relation", label: "Yakınlık", width: "100px" },
    { key: "phone", label: "Telefon", width: "140px" },
    { key: "verified", label: "Doğrulandı", width: "80px" },
  ];

  const handleAdd = () => {
    setFormData({
      reference_name: "",
      reference_type: "",
      relation: "",
      phone: "",
      email: "",
    });
    setIsAddModalOpen(true);
  };
  const handleSave = async () => setIsAddModalOpen(false);

  return (
    <>
      <TabLayout
        showStatusFilter={false}
        showSearch={true}
        searchPlaceholder="Referans ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={references.length}
      >
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-[80px]">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {references.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Referans kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                references.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>{ref.reference_name}</TableCell>
                    <TableCell>
                      {
                        REFERENCE_TYPE_OPTIONS.find(
                          (t) => t.value === ref.reference_type,
                        )?.label
                      }
                    </TableCell>
                    <TableCell>{ref.relation}</TableCell>
                    <TableCell>{ref.phone}</TableCell>
                    <TableCell>
                      {ref.is_verified && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabLayout>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Referans Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>İsim *</Label>
              <Input
                value={formData.reference_name}
                onChange={(e) =>
                  setFormData({ ...formData, reference_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tür</Label>
                <Select
                  value={formData.reference_type}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      reference_type: v as ReferenceType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERENCE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Yakınlık</Label>
                <Input
                  value={formData.relation}
                  onChange={(e) =>
                    setFormData({ ...formData, relation: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefon</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>E-posta</Label>
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
