"use client";

import { CardSummary } from "@/types/linked-records.types";
import {
  CreditCard,
  FileText,
  Image,
  Baby,
  Users,
  Heart,
  UserCheck,
  MessageSquare,
  Calendar,
  ClipboardList,
  Gift,
  FileCheck,
  Wallet,
  TrendingUp,
} from "lucide-react";

interface CardSummaryTabProps {
  needyPersonId: string;
  onClose: () => void;
  cardSummary?: CardSummary;
}

interface SummaryItem {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subLabel?: string;
  color?: string;
}

export function CardSummaryTab({
  needyPersonId,
  onClose,
  cardSummary,
}: CardSummaryTabProps) {
  // Mock data for demo - gerçek uygulamada cardSummary'den gelecek
  const summary = cardSummary || {
    needy_person_id: needyPersonId,
    first_name: "-",
    last_name: "-",
    identity_number: null,
    category: null,
    status: null,
    active_bank_accounts: 0,
    total_documents: 0,
    total_photos: 0,
    active_orphan_relations: 0,
    active_dependents: 0,
    active_sponsors: 0,
    total_references: 0,
    total_interviews: 0,
    total_sessions: 0,
    total_applications: 0,
    pending_applications: 0,
    total_aids_received: 0,
    total_aid_amount_try: 0,
    given_consents: 0,
    active_social_cards: 0,
  };

  const items: SummaryItem[] = [
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Banka Hesapları",
      value: summary.active_bank_accounts,
      subLabel: "Aktif hesap",
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Dokümanlar",
      value: summary.total_documents,
      subLabel: "Toplam belge",
      color: "text-orange-600 bg-orange-50",
    },
    {
      icon: <Image className="h-5 w-5" />,
      label: "Fotoğraflar",
      value: summary.total_photos,
      subLabel: "Toplam fotoğraf",
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: <Baby className="h-5 w-5" />,
      label: "Baktığı Yetimler",
      value: summary.active_orphan_relations,
      subLabel: "Aktif ilişki",
      color: "text-pink-600 bg-pink-50",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Baktığı Kişiler",
      value: summary.active_dependents,
      subLabel: "Bağımlı kişi",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Sponsorlar",
      value: summary.active_sponsors,
      subLabel: "Aktif sponsor",
      color: "text-red-600 bg-red-50",
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      label: "Referanslar",
      value: summary.total_references,
      subLabel: "Toplam referans",
      color: "text-teal-600 bg-teal-50",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Görüşme Kayıtları",
      value: summary.total_interviews,
      subLabel: "Toplam görüşme",
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Seanslar",
      value: summary.total_sessions,
      subLabel: "Toplam seans",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Yardım Talepleri",
      value: summary.total_applications,
      subLabel: `${summary.pending_applications} beklemede`,
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: <Gift className="h-5 w-5" />,
      label: "Yapılan Yardımlar",
      value: summary.total_aids_received,
      subLabel: "Toplam yardım",
      color: "text-green-600 bg-green-50",
    },
    {
      icon: <FileCheck className="h-5 w-5" />,
      label: "Rıza Beyanları",
      value: summary.given_consents,
      subLabel: "Alınan rıza",
      color: "text-violet-600 bg-violet-50",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Sosyal Kartlar",
      value: summary.active_social_cards,
      subLabel: "Aktif kart",
      color: "text-lime-600 bg-lime-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Kişi Bilgisi */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-1">
          {summary.first_name} {summary.last_name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {summary.identity_number && (
            <span>TC: {summary.identity_number}</span>
          )}
          {summary.category && <span>Kategori: {summary.category}</span>}
          {summary.status && (
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                summary.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : summary.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {summary.status}
            </span>
          )}
        </div>
      </div>

      {/* Toplam Yardım Tutarı - Öne Çıkan */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Toplam Yardım Tutarı</p>
            <p className="text-3xl font-bold">
              {summary.total_aid_amount_try.toLocaleString("tr-TR")} ₺
            </p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${item.color}`}>{item.icon}</div>
              <span className="text-2xl font-bold">{item.value}</span>
            </div>
            <h4 className="font-medium text-sm">{item.label}</h4>
            <p className="text-xs text-muted-foreground">{item.subLabel}</p>
          </div>
        ))}
      </div>

      {/* Bilgi Notu */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          Bu özet, ihtiyaç sahibi kişiye ait tüm bağlantılı kayıtların genel
          görünümünü sunar. Detaylı bilgi için ilgili sekmeleri ziyaret
          edebilirsiniz.
        </p>
      </div>
    </div>
  );
}
