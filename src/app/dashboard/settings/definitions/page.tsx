"use client";

export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Users,
  Building2,
  MapPin,
  Tag,
  FileText,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default function DefinitionsPage() {
  const definitionCategories = [
    {
      title: "Kategoriler",
      description: "İhtiyaç sahipleri ve bağış kategorilerini yönetin",
      icon: Tag,
      href: "/settings/definitions/categories",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ülkeler & Şehirler",
      description: "Ülke, şehir, ilçe ve mahalle tanımlamaları",
      icon: MapPin,
      href: "/settings/definitions/locations",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Ortaklar",
      description: "Ortak kuruluş ve partner tanımlamaları",
      icon: Building2,
      href: "/settings/definitions/partners",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Meslekler",
      description: "Meslek ve sektör tanımlamaları",
      icon: Users,
      href: "/settings/definitions/professions",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Hastalıklar",
      description: "Hastalık ve sağlık durumu tanımlamaları",
      icon: Heart,
      href: "/settings/definitions/diseases",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Gelir Kaynakları",
      description: "Gelir kaynağı tanımlamaları",
      icon: FileText,
      href: "/settings/definitions/income-sources",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tanımlamalar"
        description="Sistem tanımlamalarını yönetin"
        icon={Settings}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {definitionCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.href} href={category.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}
                  >
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Yönet
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
