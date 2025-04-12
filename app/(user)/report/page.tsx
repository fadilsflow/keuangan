"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Report types
const REPORT_TYPES = [
  { value: "monthly", label: "Laporan Bulanan" },
  { value: "yearly", label: "Laporan Tahunan" },
  { value: "category", label: "Laporan Kategori" },
  { value: "related-party", label: "Laporan Pihak Terkait" },
];

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ReportPage() {
  const [date, setDate] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [reportType, setReportType] = useState("monthly");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["report", reportType, date],
    queryFn: async () => {
      if (!date.from || !date.to) return null;
      const params = new URLSearchParams({
        type: reportType,
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
      });
      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch report data");
      return response.json();
    },
    enabled: !!date.from && !!date.to,
  });

  const handleExportPDF = async () => {
    if (!date.from || !date.to) return;
    const params = new URLSearchParams({
      type: reportType,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
      format: "pdf",
    });
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  };

  const handleExportExcel = async () => {
    if (!date.from || !date.to) return;
    const params = new URLSearchParams({
      type: reportType,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
      format: "excel",
    });
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  };

  const renderChart = () => {
    if (!reportData || reportData.length === 0) return null;

    switch (reportType) {
      case "monthly":
      case "yearly":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={reportType === "monthly" ? "month" : "year"} 
                tickFormatter={(value) => 
                  reportType === "monthly" 
                    ? format(new Date(2021, value - 1), "MMMM", { locale: id })
                    : value.toString()
                }
              />
              <YAxis tickFormatter={(value) => formatRupiah(value)} />
              <Tooltip 
                formatter={(value: number) => formatRupiah(value)}
                labelFormatter={(label) => 
                  reportType === "monthly"
                    ? format(new Date(2021, label - 1), "MMMM", { locale: id })
                    : label.toString()
                }
              />
              <Legend />
              <Bar dataKey="income" name="Pemasukan" fill="#0088FE" />
              <Bar dataKey="expense" name="Pengeluaran" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "category":
      case "related-party":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData}
                dataKey="expense"
                nameKey={reportType === "category" ? "category" : "relatedParty"}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={(entry) => `${entry.name}: ${formatRupiah(entry.value)}`}
              >
                {reportData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">
          Lihat dan analisa laporan keuangan berdasarkan periode dan jenis laporan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih jenis laporan dan periode yang ingin ditampilkan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Pilih jenis laporan" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePickerWithRange
              date={date}
              onDateChange={setDate}
              className="w-full sm:w-[300px]"
            />

            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {REPORT_TYPES.find((t) => t.value === reportType)?.label}
          </CardTitle>
          <CardDescription>
            Periode: {date.from ? format(date.from, "d MMMM yyyy", { locale: id }) : ""} -{" "}
            {date.to ? format(date.to, "d MMMM yyyy", { locale: id }) : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : reportData && reportData.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex justify-center items-center h-[400px] text-muted-foreground">
              Tidak ada data untuk ditampilkan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 