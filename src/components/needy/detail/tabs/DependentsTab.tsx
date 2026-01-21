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
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { TabLayout } from "./TabLayout";
import {
  Dependent,
  DEPENDENT_RELATION_TYPE_OPTIONS,
  DependentRelationType,
  StatusFilter,
} from "@/types/linked-records.types";
import {
  useLinkedRecords,
  useCreateLinkedRecord,
  useUpdateLinkedRecord,
  useDeleteLinkedRecord,
  NeedyDependent,
} from "@/hooks/queries/use-linked-records";
import { toast } from "sonner";

interface DependentsTabProps {
  needyPersonId: string;
  onClose: () => void;
}

export function DependentsTab({ needyPersonId, onClose }: DependentsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [searchValue, setSearchValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: dependents = [], isLoading } = useLinkedRecords<NeedyDependent>(
    "needy_dependents",
    needyPersonId,
  );
  const createMutation =
    useCreateLinkedRecord<NeedyDependent>("needy_dependents");
  const updateMutation =
    useUpdateLinkedRecord<NeedyDependent>("needy_dependents");
  const deleteMutation = useDeleteLinkedRecord("needy_dependents");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    identity_number: "",
    birth_date: "",
    gender: "",
    relation_type: "" as DependentRelationType | "",
  });

  const columns = [
    { key: "name", label: "Ad Soyad" },
    { key: "identity", label: "Kimlik No", width: "120px" },
    { key: "relation", label: "Yakınlık", width: "100px" },
    { key: "age", label: "Yaş", width: "60px" },
    { key: "status", label: "Durum", width: "80px" },
  ];

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      first_name: "",
      last_name: "",
      identity_number: "",
      birth_date: "",
      gender: "",
      relation_type: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (dep: NeedyDependent) => {
    setEditingId(dep.id);
    setFormData({
      first_name: dep.first_name || "",
      last_name: dep.last_name || "",
      identity_number: dep.identity_number || "",
      birth_date: dep.birth_date || "",
      gender: dep.gender || "",
      relation_type: dep.relation_type as DependentRelationType,
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          values: formData,
          needyPersonId,
        });
        toast.success("Bağımlı kişi güncellendi");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          needy_person_id: needyPersonId,
          is_active: true,
        });
        toast.success("Bağımlı kişi eklendi");
      }
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu bağımlı kişiyi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteMutation.mutateAsync({ id, needyPersonId });
        toast.success("Kayıt silindi");
      } catch (error) {
        toast.error("Silme işlemi başarısız oldu");
      }
    }
  };

  // Filter logic
  const filteredDependents = dependents.filter((dep) => {
    const matchesSearch =
      !searchValue ||
      `${dep.first_name} ${dep.last_name}`
        .toLowerCase()
        .includes(searchValue.toLowerCase()) ||
      dep.identity_number?.includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && dep.is_active) ||
      (statusFilter === "inactive" && !dep.is_active);

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <TabLayout
        showStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showSearch={true}
        searchPlaceholder="İsim veya kimlik no ara..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showAddButton={true}
        addButtonLabel="Ekle"
        onAdd={handleAdd}
        totalRecords={filteredDependents.length}
        currentPage={1}
        totalPages={1}
        isLoading={isLoading}
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
                <TableHead className="w-[100px]">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDependents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Bağımlı kişi kaydı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredDependents.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell></TableCell>
                    <TableCell>
                      {dep.first_name} {dep.last_name}
                    </TableCell>
                    <TableCell>{dep.identity_number}</TableCell>
                    <TableCell>
                      {
                        DEPENDENT_RELATION_TYPE_OPTIONS.find(
                          (t) => t.value === dep.relation_type,
                        )?.label
                      }
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded ${dep.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {dep.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(dep)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(dep.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <DialogTitle>
              Bağımlı Kişi {editingId ? "Güncelle" : "Ekle"}
            </DialogTitle>
            <DialogDescription>
              Bağımlı kişinin bilgilerini buradan{" "}
              {editingId ? "güncelleyebilirsiniz" : "ekleyebilirsiniz"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Ad *</Label>
              <Input
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Soyad *</Label>
              <Input
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Kimlik No</Label>
              <Input
                value={formData.identity_number}
                onChange={(e) =>
                  setFormData({ ...formData, identity_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Yakınlık *</Label>
              <Select
                value={formData.relation_type}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    relation_type: v as DependentRelationType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DEPENDENT_RELATION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doğum Tarihi</Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Cinsiyet</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Erkek</SelectItem>
                  <SelectItem value="female">Kadın</SelectItem>
                </SelectContent>
              </Select>
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
