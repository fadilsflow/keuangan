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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  { value: "items", label: "Laporan Item" },
  { value: "summary", label: "Laporan Ringkasan" },
];

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ReportPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [reportType, setReportType] = useState("monthly");
  const [transactionType, setTransactionType] = useState<"all" | "income" | "expense">("all");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["report", reportType, transactionType, date],
    queryFn: async () => {
      if (!date?.from || !date?.to) return null;
      const params = new URLSearchParams({
        type: reportType,
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        transactionType: transactionType,
      });
      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch report data");
      return response.json();
    },
    enabled: !!date?.from && !!date?.to,
  });

  const handleExportPDF = async () => {
    if (!date?.from || !date?.to) return;
    const params = new URLSearchParams({
      type: reportType,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
      transactionType: transactionType,
      format: "pdf",
    });
    
    try {
      const response = await fetch(`/api/reports/export?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to export report");
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-${transactionType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF. Please try again or use Excel export.");
    }
  };

  const handleExportExcel = async () => {
    if (!date?.from || !date?.to) return;
    const params = new URLSearchParams({
      type: reportType,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
      transactionType: transactionType,
      format: "excel",
    });
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  };

  const renderChart = () => {
    if (!reportData || (Array.isArray(reportData) && reportData.length === 0)) return null;

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
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData}
                dataKey={transactionType === "income" ? "income" : "expense"}
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={(entry) => `${entry.category}: ${formatRupiah(transactionType === "income" ? entry.income : entry.expense)}`}
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

      case "related-party":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={reportData}
                dataKey={transactionType === "income" ? "income" : "expense"}
                nameKey="relatedParty"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={(entry) => `${entry.relatedParty}: ${formatRupiah(transactionType === "income" ? entry.income : entry.expense)}`}
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

      case "items":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemName" />
              <YAxis tickFormatter={(value) => formatRupiah(value)} />
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Legend />
              <Bar dataKey="totalAmount" name="Total" fill="#0088FE" />
              <Bar dataKey="quantity" name="Jumlah" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "summary":
        if (reportType === "summary" && reportData) {
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatRupiah(reportData.total || 0)}</p>
                    <p className="text-muted-foreground">Dari {reportData.transactionCount || 0} transaksi</p>
                  </CardContent>
                </Card>
              </div>

              {reportData.categories && reportData.categories.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Kategori Teratas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.categories.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatRupiah(value)} />
                      <Tooltip formatter={(value: number) => formatRupiah(value)} />
                      <Bar dataKey="total" name="Total" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground text-center">Tidak ada data kategori tersedia</p>
                </div>
              )}

              {reportData.relatedParties && reportData.relatedParties.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pihak Terkait Teratas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.relatedParties.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatRupiah(value)} />
                      <Tooltip formatter={(value: number) => formatRupiah(value)} />
                      <Bar dataKey="total" name="Total" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground text-center">Tidak ada data pihak terkait tersedia</p>
                </div>
              )}

              {reportData.items && reportData.items.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Item Teratas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.items.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatRupiah(value)} />
                      <Tooltip formatter={(value: number) => formatRupiah(value)} />
                      <Bar dataKey="total" name="Total" fill="#FFBB28" />
                      <Bar dataKey="quantity" name="Jumlah" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground text-center">Tidak ada data item tersedia</p>
                </div>
              )}
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const shouldShowTransactionTypeTabs = ["category", "related-party", "items", "summary"].includes(reportType);

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
              setDate={setDate}
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
            Periode: {date?.from ? format(date.from, "d MMMM yyyy", { locale: id }) : ""} -{" "}
            {date?.to ? format(date.to, "d MMMM yyyy", { locale: id }) : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shouldShowTransactionTypeTabs && (
            <Tabs 
              defaultValue={transactionType} 
              className="mb-6"
              onValueChange={(value) => setTransactionType(value as "all" | "income" | "expense")}
            >
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="income">Pemasukan</TabsTrigger>
                <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : reportData ? (
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