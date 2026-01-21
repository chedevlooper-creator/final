import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const USE_MOCK_DATA = process.env["NEXT_PUBLIC_USE_MOCK_DATA"] === "true";

// Types
interface ReportData {
  label: string;
  value: number;
}

interface ReportSummary {
  period: string;
  totalAids: number;
  totalDonations: number;
  totalBeneficiaries: number;
  aidsByType: ReportData[];
  donationsByType: ReportData[];
  monthlyTrend: ReportData[];
}

// Mock data
const mockReportSummary: ReportSummary = {
  period: "2026-01",
  totalAids: 1250,
  totalDonations: 892500,
  totalBeneficiaries: 3456,
  aidsByType: [
    { label: "Nakdi Yardım", value: 450 },
    { label: "Gıda Yardımı", value: 380 },
    { label: "Kira Yardımı", value: 220 },
    { label: "Sağlık Yardımı", value: 120 },
    { label: "Diğer", value: 80 },
  ],
  donationsByType: [
    { label: "Genel Bağış", value: 320000 },
    { label: "Zekat", value: 280000 },
    { label: "Kurban", value: 180000 },
    { label: "Fitre", value: 62500 },
    { label: "Diğer", value: 50000 },
  ],
  monthlyTrend: [
    { label: "Oca", value: 125000 },
    { label: "Şub", value: 98000 },
    { label: "Mar", value: 145000 },
    { label: "Nis", value: 112000 },
    { label: "May", value: 89000 },
    { label: "Haz", value: 78000 },
  ],
};

export function useReportSummary(period?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["report-summary", period],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockReportSummary;
      }

      // In real implementation, these would be aggregated queries
      const [{ count: aidsCount }, { count: beneficiariesCount }] =
        await Promise.all([
          supabase.from("aids").select("*", { count: "exact", head: true }),
          supabase
            .from("needy_persons")
            .select("*", { count: "exact", head: true }),
        ]);

      return {
        ...mockReportSummary,
        totalAids: aidsCount || 0,
        totalBeneficiaries: beneficiariesCount || 0,
      };
    },
  });
}

export function useAidsByTypeReport() {
  return useQuery({
    queryKey: ["report-aids-by-type"],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockReportSummary.aidsByType;
      }
      // Real implementation would group by aid type
      return mockReportSummary.aidsByType;
    },
  });
}

export function useDonationsByTypeReport() {
  return useQuery({
    queryKey: ["report-donations-by-type"],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockReportSummary.donationsByType;
      }
      // Real implementation would group by donation type
      return mockReportSummary.donationsByType;
    },
  });
}

export function useMonthlyTrendReport() {
  return useQuery({
    queryKey: ["report-monthly-trend"],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockReportSummary.monthlyTrend;
      }
      // Real implementation would aggregate by month
      return mockReportSummary.monthlyTrend;
    },
  });
}
