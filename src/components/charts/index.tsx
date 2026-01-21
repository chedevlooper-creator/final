"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface PieLabelProps {
  category: string;
  percent: number;
}

const CustomPieLabel = ({ category, percent }: PieLabelProps) => {
  return `${category}: ${(percent * 100).toFixed(0)}%`;
};

interface DonationChartProps {
  data: Array<{ date: string; amount: number }>;
}

/**
 * Aylık Bağış Grafiği
 */
export function DonationChart({ data }: DonationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "8px",
          }}
          formatter={(value?: number) =>
            value !== undefined ? `${value.toLocaleString("tr-TR")} TL` : ""
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={2}
          name="Bağış Tutarı"
          dot={{ fill: "#10b981" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface CategoryChartProps {
  data: Array<{ category: string; amount: number }>;
}

/**
 * Kategori Bazlı Bağış Dağılımı
 */
export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percent }: any) =>
            `${category}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value?: number) =>
            value !== undefined ? `${value.toLocaleString("tr-TR")} TL` : ""
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
}

/**
 * Yardım Dağılımı Bar Chart
 */
export function AidDistributionChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value?: number) =>
            value !== undefined ? `${value.toLocaleString("tr-TR")} TL` : ""
          }
        />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" name="Yardım Tutarı" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface StatsCardsProps {
  stats: {
    totalDonations: number;
    totalAids: number;
    activeNeedy: number;
    monthlyGrowth: number;
  };
}

/**
 * İstatistik Kartları
 */
export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Toplam Bağış",
      value: `${stats.totalDonations.toLocaleString("tr-TR")} TL`,
      icon: "💰",
      color: "bg-green-500",
    },
    {
      title: "Dağıtılan Yardım",
      value: `${stats.totalAids.toLocaleString("tr-TR")} TL`,
      icon: "🤝",
      color: "bg-blue-500",
    },
    {
      title: "Aktif İhtiyaç Sahibi",
      value: stats.activeNeedy.toLocaleString("tr-TR"),
      icon: "👥",
      color: "bg-purple-500",
    },
    {
      title: "Aylık Büyüme",
      value: `%${stats.monthlyGrowth}`,
      icon: "📈",
      color: stats.monthlyGrowth >= 0 ? "bg-emerald-500" : "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-6 border-l-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div
              className={`p-3 rounded-full ${card.color} text-white text-2xl`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  DonationChart,
  CategoryChart,
  AidDistributionChart,
  StatsCards,
};
