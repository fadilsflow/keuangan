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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton"

// Report types
const REPORT_TYPES = [
  { value: "monthly", label: "Laporan Bulanan" },
  { value: "yearly", label: "Laporan Tahunan" },
  { value: "category", label: "Laporan Kategori" },
  { value: "related-party", label: "Laporan Pihak Terkait" },
  { value: "items", label: "Laporan Item" },
  { value: "summary", label: "Laporan Ringkasan" },
];

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

  const renderReport = () => {
    if (!reportData || (Array.isArray(reportData) && reportData.length === 0)) return null;

    switch (reportType) {
      case "monthly":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Bulanan</CardTitle>
              <CardDescription>
                {date?.from && date?.to ? 
                  `${format(date.from, "d MMMM yyyy", { locale: id })} - ${format(date.to, "d MMMM yyyy", { locale: id })}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bulan</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">Pemasukan</TableHead>
                    <TableHead className="text-right">Pengeluaran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(2021, item.month - 1), "MMMM", { locale: id })}</TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.income)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.expense)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "yearly":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Tahunan</CardTitle>
              <CardDescription>
                {date?.from && date?.to ? 
                  `${format(date.from, "d MMMM yyyy", { locale: id })} - ${format(date.to, "d MMMM yyyy", { locale: id })}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="text-right">Pemasukan</TableHead>
                    <TableHead className="text-right">Pengeluaran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.year}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.income)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.expense)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "category":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Kategori</CardTitle>
              <CardDescription>
                {date?.from && date?.to ? 
                  `${format(date.from, "d MMMM yyyy", { locale: id })} - ${format(date.to, "d MMMM yyyy", { locale: id })}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionType !== "all" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">
                        {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(transactionType === "income" ? item.income : item.expense)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Pemasukan</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData
                          .filter((item: any) => item.income > 0)
                          .map((item: any, index: number) => (
                            <TableRow key={`income-${index}`}>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="text-right">
                                {formatRupiah(item.income)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {reportData.filter((item: any) => item.income > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              Tidak ada data pemasukan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Pengeluaran</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData
                          .filter((item: any) => item.expense > 0)
                          .map((item: any, index: number) => (
                            <TableRow key={`expense-${index}`}>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="text-right">
                                {formatRupiah(item.expense)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {reportData.filter((item: any) => item.expense > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              Tidak ada data pengeluaran
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "related-party":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Pihak Terkait</CardTitle>
              <CardDescription>
                {date?.from && date?.to ? 
                  `${format(date.from, "d MMMM yyyy", { locale: id })} - ${format(date.to, "d MMMM yyyy", { locale: id })}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionType !== "all" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pihak Terkait</TableHead>
                      <TableHead className="text-right">
                        {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.relatedParty}</TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(transactionType === "income" ? item.income : item.expense)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Pemasukan</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pihak Terkait</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData
                          .filter((item: any) => item.income > 0)
                          .map((item: any, index: number) => (
                            <TableRow key={`income-${index}`}>
                              <TableCell>{item.relatedParty}</TableCell>
                              <TableCell className="text-right">
                                {formatRupiah(item.income)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {reportData.filter((item: any) => item.income > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              Tidak ada data pemasukan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Pengeluaran</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pihak Terkait</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData
                          .filter((item: any) => item.expense > 0)
                          .map((item: any, index: number) => (
                            <TableRow key={`expense-${index}`}>
                              <TableCell>{item.relatedParty}</TableCell>
                              <TableCell className="text-right">
                                {formatRupiah(item.expense)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {reportData.filter((item: any) => item.expense > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              Tidak ada data pengeluaran
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "items":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Laporan Item</CardTitle>
              <CardDescription>
                {date?.from && date?.to ? 
                  `${format(date.from, "d MMMM yyyy", { locale: id })} - ${format(date.to, "d MMMM yyyy", { locale: id })}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionType !== "all" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatRupiah(item.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Pemasukan</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData
                          .filter((item: any) => item.type === "income")
                          .map((item: any, index: number) => (
                            <TableRow key={`income-${index}`}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatRupiah(item.totalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        {reportData.filter((item: any) => item.type === "income").length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Tidak ada data pemasukan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Pengeluaran</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData
                          .filter((item: any) => item.type === "expense")
                          .map((item: any, index: number) => (
                            <TableRow key={`expense-${index}`}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatRupiah(item.totalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        {reportData.filter((item: any) => item.type === "expense").length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Tidak ada data pengeluaran
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "summary":
        if (reportType === "summary" && reportData) {
          return (
            <div className="space-y-6">
              {transactionType !== "all" ? (
                // Single transaction type (income or expense)
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>
                      Total {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatRupiah(reportData.total || 0)}</p>
                    <p className="text-muted-foreground">Dari {reportData.transactionCount || 0} transaksi</p>
                  </CardContent>
                </Card>
              ) : (
                // Show both income and expense summaries
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Pemasukan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{formatRupiah(reportData.income?.total || 0)}</p>
                      <p className="text-muted-foreground">Dari {reportData.income?.transactionCount || 0} transaksi</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{formatRupiah(reportData.expense?.total || 0)}</p>
                      <p className="text-muted-foreground">Dari {reportData.expense?.transactionCount || 0} transaksi</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Categories Section */}
              {transactionType !== "all" ? (
                // Single transaction type categories
                reportData.categories && reportData.categories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Kategori Teratas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kategori</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.categories.slice(0, 5).map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              ) : (
                // Both income and expense categories
                <div className="space-y-6">
                  {reportData.income?.categories && reportData.income.categories.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Kategori Pemasukan Teratas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kategori</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.income.categories.slice(0, 5).map((item: any, index: number) => (
                              <TableRow key={`income-${index}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {reportData.expense?.categories && reportData.expense.categories.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Kategori Pengeluaran Teratas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kategori</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.expense.categories.slice(0, 5).map((item: any, index: number) => (
                              <TableRow key={`expense-${index}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Related Parties Section */}
              {transactionType !== "all" ? (
                // Single transaction type related parties
                reportData.relatedParties && reportData.relatedParties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pihak Terkait Teratas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pihak Terkait</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.relatedParties.slice(0, 5).map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              ) : (
                // Both income and expense related parties
                <div className="space-y-6">
                  {reportData.income?.relatedParties && reportData.income.relatedParties.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pihak Terkait Pemasukan Teratas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pihak Terkait</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.income.relatedParties.slice(0, 5).map((item: any, index: number) => (
                              <TableRow key={`income-${index}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {reportData.expense?.relatedParties && reportData.expense.relatedParties.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pihak Terkait Pengeluaran Teratas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pihak Terkait</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.expense.relatedParties.slice(0, 5).map((item: any, index: number) => (
                              <TableRow key={`expense-${index}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Items Section */}
              {transactionType !== "all" ? (
                // Single transaction type items
                reportData.items && reportData.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Item Teratas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.items.slice(0, 5).map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              ) : (
                // Both income and expense items
                <div className="space-y-6">
                  {reportData.income?.items && reportData.income.items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Item Pemasukan Teratas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Jumlah</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.income.items.slice(0, 5).map((item: any, index: number) => (
                              <TableRow key={`income-${index}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {reportData.expense?.items && reportData.expense.items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Item Pengeluaran Teratas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Jumlah</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.expense.items.slice(0, 5).map((item: any, index: number) => (
                              <TableRow key={`expense-${index}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatRupiah(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
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
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {shouldShowTransactionTypeTabs && (
        <Card>
          <CardContent className="pt-6">
            <Tabs 
              defaultValue={transactionType} 
              onValueChange={(value) => setTransactionType(value as "all" | "income" | "expense")}
            >
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="income">Pemasukan</TabsTrigger>
                <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-32" />
                  ))}
                </div>
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : reportData ? (
        renderReport()
      ) : (
        <Card>
          <CardContent className="flex justify-center items-center h-[400px] text-muted-foreground">
            Tidak ada data untuk ditampilkan
          </CardContent>
        </Card>
      )}
    </div>
  );
} 